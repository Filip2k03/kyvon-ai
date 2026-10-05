#!/usr/bin/env bash
# ==============================================================================
# Yamato AC & Poste.io Mail Server Verification Script
# Validates DNS, TLS, Ports, DKIM, SPF, DMARC, and Deliverability Health
# ==============================================================================
set -euo pipefail

DOMAIN="yamato-ac.jp"
MAIL_HOST="mail.reiwasakura.tech"
SERVER_IP="187.127.110.32"
DKIM_SELECTOR="s20260825401"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}  ⚡ VERIFYING MAIL SERVER DELIVERABILITY STACK: ${DOMAIN} ${NC}"
echo -e "${BLUE}==============================================================================${NC}"

pass() { echo -e "  [${GREEN}PASS${NC}] $1"; }
fail() { echo -e "  [${RED}FAIL${NC}] $1"; }
warn() { echo -e "  [${YELLOW}WARN${NC}] $1"; }
info() { echo -e "  [${BLUE}INFO${NC}] $1"; }

# 1. MX Record Check
echo -e "\n${BLUE}1. INCOMING MAIL ROUTING (MX RECORD)${NC}"
MX_OUT=$(dig +short MX "${DOMAIN}" 2>/dev/null || true)
if [[ "${MX_OUT}" =~ ${MAIL_HOST} ]] || [[ "${MX_OUT}" =~ mail\.yamato-ac\.jp ]]; then
    pass "MX points to ${MX_OUT}"
else
    fail "MX record missing or incorrect: '${MX_OUT}' (Expected: 10 ${MAIL_HOST})"
fi

# 2. SPF Record Check
echo -e "\n${BLUE}2. SENDER POLICY FRAMEWORK (SPF RECORD)${NC}"
SPF_OUT=$(dig +short TXT "${DOMAIN}" 2>/dev/null | grep -i "v=spf1" || true)
if [[ "${SPF_OUT}" =~ "v=spf1" ]]; then
    pass "Found SPF: ${SPF_OUT}"
    if [[ "${SPF_OUT}" =~ "187.127.110.32" ]]; then
        pass "Server IP 187.127.110.32 is authorized in SPF"
    else
        warn "Server IP 187.127.110.32 not explicitly in SPF"
    fi
    if [[ "${SPF_OUT}" =~ "_spf.google.com" ]]; then
        pass "Google relay (include:_spf.google.com) is authorized for Gmail sends"
    else
        warn "Google relay missing from SPF. Add 'include:_spf.google.com' to prevent Gmail relay SPF fails."
    fi
else
    fail "No SPF TXT record found for ${DOMAIN}"
fi

# 3. DKIM Signature Key Check
echo -e "\n${BLUE}3. DOMAINKEYS IDENTIFIED MAIL (DKIM RECORD)${NC}"
DKIM_RECORD="${DKIM_SELECTOR}._domainkey.${DOMAIN}"
DKIM_OUT=$(dig +short TXT "${DKIM_RECORD}" 2>/dev/null || true)
if [[ "${DKIM_OUT}" =~ "v=DKIM1" ]] || [[ "${DKIM_OUT}" =~ "k=rsa" ]]; then
    pass "DKIM Key found on ${DKIM_RECORD}"
    pass "Key verified with selector '${DKIM_SELECTOR}'"
else
    fail "DKIM TXT record not resolved on ${DKIM_RECORD}"
fi

# 4. DMARC Policy Check
echo -e "\n${BLUE}4. DMARC POLICY RECORD${NC}"
DMARC_OUT=$(dig +short TXT "_dmarc.${DOMAIN}" 2>/dev/null || true)
if [[ "${DMARC_OUT}" =~ "v=DMARC1" ]]; then
    pass "DMARC policy found: ${DMARC_OUT}"
    if [[ "${DMARC_OUT}" =~ "p=quarantine" ]] || [[ "${DMARC_OUT}" =~ "p=reject" ]]; then
        pass "DMARC protection is active (quarantine/reject)"
    else
        warn "DMARC policy is currently in monitoring mode (p=none)"
    fi
else
    fail "No DMARC record found on _dmarc.${DOMAIN}"
fi

# 5. Reverse DNS (PTR) Check
echo -e "\n${BLUE}5. REVERSE DNS (PTR) ALIGNMENT${NC}"
PTR_OUT=$(dig +short -x "${SERVER_IP}" 2>/dev/null || true)
if [[ -n "${PTR_OUT}" ]]; then
    info "PTR for ${SERVER_IP}: ${PTR_OUT}"
    if [[ "${PTR_OUT}" =~ "reiwasakura.tech" ]] || [[ "${PTR_OUT}" =~ "yamato-ac.jp" ]]; then
        pass "rDNS matches mail domain host"
    else
        warn "rDNS resolves to ${PTR_OUT}. Set VPS rDNS to ${MAIL_HOST} for 100% spam immunity."
    fi
else
    warn "No PTR record found for ${SERVER_IP}. Check VPS control panel."
fi

# 6. Port Connectivity & TLS Check (if netcat or openssl is available)
echo -e "\n${BLUE}6. MAIL SERVICE PORT STATUS & TLS${NC}"
check_port() {
    local port=$1
    local name=$2
    if command -v nc >/dev/null 2>&1; then
        if nc -z -w 3 "${MAIL_HOST}" "${port}" 2>/dev/null; then
            pass "Port ${port} (${name}) is OPEN on ${MAIL_HOST}"
        else
            warn "Port ${port} (${name}) could not be reached on ${MAIL_HOST}"
        fi
    fi
}

check_port 25  "SMTP (Incoming)"
check_port 465 "SMTPS (Outgoing SSL)"
check_port 587 "Submission (Outgoing STARTTLS)"
check_port 993 "IMAPS (Incoming SSL)"
check_port 995 "POP3S (Incoming SSL)"

# 7. Certificate Check
if command -v openssl >/dev/null 2>&1; then
    echo -e "\n${BLUE}7. TLS / SSL CERTIFICATE EXPIRY${NC}"
    CERT_DATES=$(echo | openssl s_client -servername "${MAIL_HOST}" -connect "${MAIL_HOST}:993" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || true)
    if [[ -n "${CERT_DATES}" ]]; then
        pass "TLS Certificate active on ${MAIL_HOST}:993"
        info "${CERT_DATES}"
    else
        warn "Could not read TLS certificate directly from ${MAIL_HOST}:993"
    fi
fi

echo -e "\n${BLUE}==============================================================================${NC}"
echo -e "${GREEN}  ✓ Verification checks completed for ${DOMAIN}${NC}"
echo -e "${BLUE}==============================================================================${NC}"
