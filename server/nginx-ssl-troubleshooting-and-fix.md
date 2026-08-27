# Nginx & SSL Troubleshooting & Complete Fix Guide

This guide documents the root causes of the Certbot and Nginx conflict errors, along with the step-by-step resolution commands to deploy on your Debian VPS (`187.127.110.32`).

---

## 1. Root Cause Analysis

### Issue 1: Hostinger IPv6 (AAAA) Parking Record Conflict
- **Symptom**: Certbot failed with:
  ```text
  Domain: reiwasakura.tech
  Detail: 2a02:4780:5e:23b6::1: Invalid response from http://reiwasakura.tech/.well-known/acme-challenge/...: 404
  ```
- **Cause**: Let's Encrypt (ACME standard) always tests **IPv6 (AAAA records)** before IPv4 (A records). Hostinger sets a default parking IPv6 record (`2a02:4780:5e:23b6::1`). Because this IPv6 points to Hostinger's parking servers instead of your VPS (`187.127.110.32`), Certbot receives a 404.
- **Fix**: In your **Hostinger DNS Zone** for `reiwasakura.tech`, **DELETE** all **AAAA** records (`2a02:4780:...`). Only keep **A** records pointing to `187.127.110.32`.

### Issue 2: Duplicate / Conflicting Server Blocks in Nginx
- **Symptom**: Nginx warned: `conflicting server name ... on 0.0.0.0:80, ignored`.
- **Cause**: Duplicate or backup configuration files were present inside `/etc/nginx/sites-enabled/`.
- **Fix**: Clear `/etc/nginx/sites-enabled/*` and recreate a clean symlink to `/etc/nginx/sites-available/sakura`.

---

## 2. Step-by-Step Clean Fix (Run on VPS)

Log in to your VPS terminal:
```bash
ssh sakuraCTO@187.127.110.32
# Password: FilipsakuraCTO7feb2k03
```

### Step 1: Clean duplicate configs & write clean Nginx file
```bash
sudo rm -f /etc/nginx/sites-enabled/*
sudo bash -c 'cat << "EOF" > /etc/nginx/sites-available/sakura
# 1. GitLab (with 500M file upload limit)
server {
    listen 80;
    server_name gitlab.reiwasakura.tech;
    client_max_body_size 500M;

    location / {
        proxy_pass http://127.0.0.1:6969;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 2. Poste.io Mail (Webmail & Admin for both domains)
server {
    listen 80;
    server_name mail.reiwasakura.tech mail.yamato-ac.jp;
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8953;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 3. Yamato AC Website & Subdomains
server {
    listen 80;
    server_name yamato-ac.jp www.yamato-ac.jp office.yamato-ac.jp nicely.yamato-ac.jp;
    root /var/www/html/sakura;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# 4. Reiwa Sakura Website
server {
    listen 80;
    server_name reiwasakura.tech www.reiwasakura.tech;
    root /var/www/html/sakura;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF'
```

### Step 2: Enable site and reload Nginx
```bash
sudo ln -sf /etc/nginx/sites-available/sakura /etc/nginx/sites-enabled/sakura
sudo nginx -t && sudo systemctl reload nginx
```
*(Expected output: `nginx: configuration file /etc/nginx/nginx.conf test is successful` without any conflicting warnings).*

### Step 3: Run Certbot for your Mail, GitLab, and Yamato AC domains
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

---

## 3. Step 4: After deleting the AAAA record in Hostinger

Once you delete the `AAAA` record in Hostinger for `reiwasakura.tech`, issue SSL for `reiwasakura.tech` and `www.reiwasakura.tech` with:

```bash
sudo certbot --nginx --agree-tos --redirect -m admin@reiwasakura.tech \
  -d reiwasakura.tech -d www.reiwasakura.tech
```

---

## 4. Verification

1. **Test HTTPS access**:
   - `https://mail.reiwasakura.tech`
   - `https://mail.yamato-ac.jp`
   - `https://gitlab.reiwasakura.tech`
   - `https://yamato-ac.jp`
2. **Test Nginx status**:
   ```bash
   sudo systemctl status nginx
   ```
