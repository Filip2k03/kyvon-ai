# Nginx & SSL — GitLab / mail / Yamato (not the marketing site)

This guide is for **GitLab, mail, and yamato-ac.jp** on `187.127.110.32`.  
The public company site (`reiwasakura.tech` and portal subdomains) is **`reiwasakura-app`**, not `sakura`.

---

## 1. Root causes we have already hit

### AAAA parking (Certbot 404 on IPv6)
Hostinger sometimes publishes an AAAA to a parking host. Let's Encrypt checks IPv6 first. **Delete AAAA** for names that should only live on this VPS; keep A → `187.127.110.32`.

### GitLab vhost stealing the apex (Chrome `ERR_CERT_COMMON_NAME_INVALID`)
If `sites-available/sakura` contains:

```nginx
server_name reiwasakura.tech www.reiwasakura.tech ...;
ssl_certificate /etc/letsencrypt/live/yamato-ac.jp/fullchain.pem;
```

then HTTPS for the company site presents the **GitLab/Yamato** certificate. HSTS blocks click-through.

**Fix:** `server_name` on that block must be **only** `nicely.yamato-ac.jp` (or other Yamato names). Enable `sites-enabled/reiwasakura-app` for the apex. See `nginx-gitlab.conf`.

### Wiping `sites-enabled`
**Do not** `rm -f /etc/nginx/sites-enabled/*`. That unhooks `reiwasakura-app`, `chat`, and `meet`.

---

## 2. Safe GitLab / Yamato nginx edit

Edit `/etc/nginx/sites-available/sakura` in place. Keep these `server_name` values **only**:

- `gitlab.reiwasakura.tech` → `http://127.0.0.1:6969` (500M body, long timeouts, WebSocket upgrade)
- `mail.reiwasakura.tech` `mail.yamato-ac.jp` → Poste.io
- `yamato-ac.jp` `www.yamato-ac.jp` `office.yamato-ac.jp` → Yamato app
- `nicely.yamato-ac.jp` → static/Yamato landing if needed
- `db.reiwasakura.tech` — prefer `reiwasakura-app` + Docker pgAdmin `:5050`; if left in `sakura`, you get a duplicate-name warning

Then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Ensure the app site is enabled:

```bash
sudo ln -sf /etc/nginx/sites-available/reiwasakura-app /etc/nginx/sites-enabled/reiwasakura-app
```

---

## 3. Certbot for GitLab / mail / Yamato (not the apex)

Use an existing lineage or issue **without** `-d reiwasakura.tech`:

```bash
sudo certbot --nginx --agree-tos --redirect -m admin@reiwasakura.tech \
  -d gitlab.reiwasakura.tech \
  -d mail.reiwasakura.tech \
  -d mail.yamato-ac.jp \
  -d yamato-ac.jp \
  -d www.yamato-ac.jp \
  -d office.yamato-ac.jp \
  -d nicely.yamato-ac.jp
```

Apex + portals already have `/etc/letsencrypt/live/reiwasakura.tech` (SAN includes auth/admin/career/docs). Reload those vhosts with the **app** deploy script: `./deploy.sh --nginx` in `/home/sakuraCTO/reiwasakura`.

---

## 4. Verification

```bash
echo | openssl s_client -servername reiwasakura.tech -connect reiwasakura.tech:443 2>/dev/null | openssl x509 -noout -subject
# expect: CN=reiwasakura.tech

echo | openssl s_client -servername gitlab.reiwasakura.tech -connect gitlab.reiwasakura.tech:443 2>/dev/null | openssl x509 -noout -subject
# expect: CN=gitlab.reiwasakura.tech (or a SAN that includes it)

curl -sI https://gitlab.reiwasakura.tech | head -8
curl -sI https://reiwasakura.tech | head -8
```
