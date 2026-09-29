#!/usr/bin/env bash
# Read-only health and readiness checks for the live Poste.io host used by Tapmi.
# Run on the mail VPS. It never reads Compose environment values or sends mail.
set -uo pipefail

MAIL_CONTAINER="${MAIL_CONTAINER:-mail-mailserver-1}"
MAIL_HOST="${MAIL_HOST:-mail.reiwasakura.tech}"
MAIL_DOMAIN="${MAIL_DOMAIN:-tapmi.net}"
EXPECTED_IP="${EXPECTED_IP:-187.127.110.32}"
DKIM_SELECTOR="${DKIM_SELECTOR:-}"
BOOTSTRAP_URL="${BOOTSTRAP_URL:-https://app.tapmi.net/api/public/bootstrap}"

failures=0
warnings=0

pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1"; failures=$((failures + 1)); }
warn() { printf 'WARN  %s\n' "$1"; warnings=$((warnings + 1)); }

if ! command -v docker >/dev/null 2>&1; then
  fail 'Docker is not installed.'
elif ! docker inspect "$MAIL_CONTAINER" >/dev/null 2>&1; then
  fail "Poste.io container $MAIL_CONTAINER was not found."
else
  health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$MAIL_CONTAINER")"
  restarts="$(docker inspect --format '{{.RestartCount}}' "$MAIL_CONTAINER")"
  restart_policy="$(docker inspect --format '{{.HostConfig.RestartPolicy.Name}}' "$MAIL_CONTAINER")"
  memory_limit="$(docker inspect --format '{{.HostConfig.Memory}}' "$MAIL_CONTAINER")"
  cpu_limit="$(docker inspect --format '{{.HostConfig.NanoCpus}}' "$MAIL_CONTAINER")"
  log_driver="$(docker inspect --format '{{.HostConfig.LogConfig.Type}}' "$MAIL_CONTAINER")"
  log_size="$(docker inspect --format '{{index .HostConfig.LogConfig.Config "max-size"}}' "$MAIL_CONTAINER")"
  log_files="$(docker inspect --format '{{index .HostConfig.LogConfig.Config "max-file"}}' "$MAIL_CONTAINER")"

  if [ "$health" = 'healthy' ]; then pass 'Poste.io container health is healthy.'; else fail "Poste.io health is $health."; fi
  if [ "$restarts" = '0' ]; then pass 'Poste.io has no recorded container restarts.'; else warn "Poste.io restart count is $restarts."; fi
  if [ "$restart_policy" = 'unless-stopped' ] || [ "$restart_policy" = 'always' ]; then
    pass "Restart policy is $restart_policy."
  else
    warn "Restart policy is '${restart_policy:-none}'; a host reboot can leave mail offline."
  fi
  if [ "$memory_limit" -gt 0 ] && [ "$cpu_limit" -gt 0 ]; then
    pass 'CPU and memory limits are configured.'
  else
    warn 'CPU and/or memory limits are not configured.'
  fi
  if [ "$log_driver" = 'json-file' ] && [ -n "$log_size" ] && [ -n "$log_files" ]; then
    pass "Docker log rotation is configured ($log_size x $log_files)."
  else
    warn "Docker log rotation is not bounded (driver: $log_driver)."
  fi
fi

for port in 25 587 993; do
  if ss -ltn 2>/dev/null | grep -Eq "[:.]${port}[[:space:]]"; then
    pass "Required mail port $port is listening."
  else
    fail "Required mail port $port is not listening."
  fi
done

if command -v dig >/dev/null 2>&1; then
  if dig +short A "$MAIL_HOST" | grep -Fxq "$EXPECTED_IP"; then pass "$MAIL_HOST resolves to the expected VPS."; else fail "$MAIL_HOST does not resolve to $EXPECTED_IP."; fi
  if dig +short MX "$MAIL_DOMAIN" | grep -Eiq "[[:space:]]${MAIL_HOST}\.?$"; then pass "$MAIL_DOMAIN MX points to $MAIL_HOST."; else fail "$MAIL_DOMAIN MX does not point to $MAIL_HOST."; fi
  spf_count="$(dig +short TXT "$MAIL_DOMAIN" | grep -Eic 'v=spf1' || true)"
  if [ "$spf_count" = '1' ]; then pass "$MAIL_DOMAIN publishes exactly one SPF policy."; else fail "$MAIL_DOMAIN publishes $spf_count SPF policies; expected one."; fi
  if dig +short TXT "_dmarc.${MAIL_DOMAIN}" | grep -Eiq 'v=DMARC1'; then pass "$MAIL_DOMAIN publishes DMARC."; else fail "$MAIL_DOMAIN does not publish DMARC."; fi
  if [ -n "$DKIM_SELECTOR" ]; then
    if dig +short TXT "${DKIM_SELECTOR}._domainkey.${MAIL_DOMAIN}" | grep -Eiq 'v=DKIM1|k=rsa|p='; then
      pass "$MAIL_DOMAIN publishes DKIM selector $DKIM_SELECTOR."
    else
      fail "$MAIL_DOMAIN DKIM selector $DKIM_SELECTOR is missing."
    fi
  else
    warn 'DKIM was not checked; set DKIM_SELECTOR to the selector shown by Poste.io.'
  fi
  if dig +short -x "$EXPECTED_IP" | grep -Eiq "^${MAIL_HOST//./\\.}\\.?$"; then pass 'Reverse DNS matches the mail hostname.'; else fail 'Reverse DNS does not match the mail hostname.'; fi
else
  warn 'dig is unavailable; DNS checks were skipped.'
fi

if command -v timeout >/dev/null 2>&1 && command -v openssl >/dev/null 2>&1; then
  cert="$(timeout 12 openssl s_client -starttls smtp -connect "127.0.0.1:587" -servername "$MAIL_HOST" </dev/null 2>/dev/null | openssl x509 -noout -subject -enddate 2>/dev/null || true)"
  if printf '%s' "$cert" | grep -Fq "CN = $MAIL_HOST"; then pass 'SMTP STARTTLS presents the mail-host certificate.'; else fail 'SMTP STARTTLS certificate could not be verified locally.'; fi
else
  warn 'timeout or openssl is unavailable; STARTTLS certificate check was skipped.'
fi

if command -v curl >/dev/null 2>&1; then
  bootstrap="$(curl -fsS --max-time 10 "$BOOTSTRAP_URL" 2>/dev/null || true)"
  if printf '%s' "$bootstrap" | grep -Eq '"emailDelivery"[[:space:]]*:[[:space:]]*true'; then
    pass 'Tapmi production reports email delivery enabled.'
  else
    warn 'Tapmi production reports email delivery disabled or could not be reached.'
  fi
fi

printf '\nRESULT failures=%d warnings=%d\n' "$failures" "$warnings"
if [ "$failures" -ne 0 ]; then exit 1; fi
