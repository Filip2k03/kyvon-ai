# Tapmi transactional mail on Poste.io

This runbook covers the existing Poste.io container on the GitLab VPS. It does
not contain mailbox passwords, API tokens, private DKIM material, or resolved
Compose environment values.

## Verified condition — 29 September 2026

- Host: `srv1760725`, up for more than 14 weeks.
- Root disk: 197 GB total, 142 GB available (25% used).
- Memory: 15 GiB total, approximately 4.8 GiB available during inspection.
- Poste.io: `analogic/poste.io`, healthy for three months, zero container
  restarts, approximately 1.65 GiB RAM and less than 1% CPU during inspection.
- SMTP 25, submission 587, and IMAPS 993 listen on the host.
- `mail.reiwasakura.tech` has a valid Let's Encrypt certificate through
  21 December 2026; local SMTP STARTTLS presents that certificate.
- `tapmi.net` publishes MX, one SPF policy, DMARC, and aligned reverse DNS.
- Tapmi still reports `emailDelivery: false`. DNS and a healthy mail container
  do not prove that SMTP authentication or inbox delivery works.

## Current hardening gaps

The running container reports no restart policy, no CPU/memory limit, and the
default unbounded `json-file` logger. The host fail2ban unit is inactive.
Poste.io does run ClamAV and Rspamd internally, but those are malware/spam
controls, not proof of brute-force protection for every exposed service.

`docker-compose.poste-hardening.yml` provides a conservative restart policy,
4 GiB memory ceiling, two-CPU ceiling, and bounded Docker logs. Validate the
merged configuration before applying it:

```bash
cd /home/sakuraCTO/mail
docker compose -f docker-compose.yml \
  -f /path/to/docker-compose.poste-hardening.yml config -q
```

Applying the override recreates the mail container and briefly interrupts mail.
Schedule it, preserve `/data`, record the current image ID, then verify SMTP,
IMAP, webmail, and queue health after recreation. Do not use `down -v`.

## Tapmi cutover gate

1. Rotate the VPS credential that was previously written into a setup document;
   deleting the line does not remove it from Git history.
2. In Poste.io, confirm `tapmi.net`, `no-reply@tapmi.net`, and the active DKIM
   selector. Never copy the mailbox password or DKIM private key into Git.
3. Publish and verify the selector with:

   ```bash
   DKIM_SELECTOR=<public-selector> ./server/verify-tapmi-mail-production.sh
   ```

4. Store the mailbox password in Tapmi's production secret configuration and
   configure both API and auth with SMTP host `mail.reiwasakura.tech`, port 587,
   STARTTLS, `no-reply@tapmi.net`, and the mailbox username.
5. Redeploy Tapmi by pinned SHA. Confirm production reports
   `emailDelivery: true`.
6. Request one sign-in code to a controlled inbox and verify receipt, sender
   alignment, expiry, one-use behavior, and secret-free logs. A TLS handshake
   alone is not delivery proof.
