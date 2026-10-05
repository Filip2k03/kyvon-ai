# Mail Server Setup Guide: Adding `yamato-ac.jp` to Poste.io

This guide details the complete configuration to add the domain **`yamato-ac.jp`** (purchased from **MuuMuu Domain / ムームードメイン**) to your existing **Poste.io** mail server running on `mail.reiwasakura.tech` (`187.127.110.32`), including the active DKIM selector, DMARC policy, MuuMuu DNS settings, Nginx reverse proxy configuration, SSL certificates, and `contact@yamato-ac.jp` mailbox setup.

---

## 1. System Overview

| Item | Value |
|---|---|
| **Mail Server Engine** | Poste.io (Docker) |
| **Primary Hostname** | `mail.reiwasakura.tech` |
| **Server IP** | `187.127.110.32` |
| **Admin Account** | `admin@reiwasakura.tech` |
| **New Domain** | `yamato-ac.jp` |
| **Domain Registrar** | MuuMuu Domain (`muumuu-domain.com`) |
| **Admin Panel URL** | `https://mail.reiwasakura.tech/admin` |
| **Webmail URL** | `https://mail.reiwasakura.tech` or `https://mail.yamato-ac.jp` |
| **DKIM Selector** | `s20260825401` |
| **Primary Mailbox** | `contact@yamato-ac.jp` |

---

## 2. ⚠️ Critical MuuMuu DNS Note

In **MuuMuu Domain (ムームーDNS)**, the system automatically appends `.yamato-ac.jp` to any string you enter into the **サブドメイン (Subdomain)** field.

- ❌ **Wrong Subdomain**: `s20260825401._domainkey.yamato-ac.jp` *(Becomes `s20260825401._domainkey.yamato-ac.jp.yamato-ac.jp` -> DKIM fails)*
- ✅ **Correct Subdomain**: `s20260825401._domainkey`

---

## 3. Complete MuuMuu DNS Records Table (ムームーDNS 設定2)

Go to **MuuMuu Domain Control Panel** -> **ドメイン管理** -> **ムームーDNS** -> `yamato-ac.jp` **変更** -> **カスタム設定** -> **設定2**:

| サブドメイン (Subdomain) | 種別 (Type) | 内容 (Content / Destination) | 優先度 (Priority) | Purpose / Notes |
|---|---|---|---|---|
| *(leave blank)* | **A** | `187.127.110.32` | *(leave blank)* | Root apex A record for `yamato-ac.jp` |
| *(leave blank)* | **MX** | `mail.reiwasakura.tech` | `10` | Directs incoming mail to Poste.io mail server |
| *(leave blank)* | **TXT** | `v=spf1 mx a:mail.reiwasakura.tech ip4:187.127.110.32 include:_spf.google.com ~all` | *(leave blank)* | **SPF**: Authorizes server IP and Google relay to send mail for `@yamato-ac.jp` |
| `www` | **A** | `187.127.110.32` | *(leave blank)* | Web subdomain `www.yamato-ac.jp` |
| `mail` | **A** | `187.127.110.32` | *(leave blank)* | Mail subdomain `mail.yamato-ac.jp` |
| `office` | **A** | `187.127.110.32` | *(leave blank)* | Office subdomain `office.yamato-ac.jp` |
| `nicely` | **A** | `187.127.110.32` | *(leave blank)* | Nicely subdomain `nicely.yamato-ac.jp` |
| **`s20260825401._domainkey`** | **TXT** | `k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvkO2xXob3TjRAWRxMVrx3xcL2ONP6/06nwv47/wREQO8eiuEzLkvGaTBVHfwY6CMvnO9bXlyQT9cbS3ZX+KWYqAouplu225RIMNiOItQvu81p3tG3Wc9k3akpKOZg/r2wvhRVMMeKNze2TmtwDgX+Fay6CU4T7OX0lvdlLHfPA6YoD1j+ICxyIjKgiIoFOXefEmDa/M5vQN193DSvxHY9UFtFKSeSU+fMaw+8GHjxyzsGImvwOgYF6wPRPCyrMj11pLUCmWFG9gDKBhhmHPvvLgDjTep2WbNEeD59xYbyl7TKb89Oql3m9cdhWoE1LgN3OTvww6lkCnc4u4tn+CHEwIDAQAB` | *(leave blank)* | **DKIM**: Active 2048-bit cryptographic signature key |
| **`_dmarc`** | **TXT** | `v=DMARC1; p=quarantine; rua=mailto:admin@reiwasakura.tech; ruf=mailto:admin@reiwasakura.tech; sp=quarantine; fo=1` | *(leave blank)* | **DMARC**: Strict anti-phishing policy for Gmail/Yahoo/Outlook |

Click **セットアップ情報変更** (Save Setup Information) at the bottom to save the configuration.

---

## 4. VPS Terminal Setup: Nginx & SSL (Ready-to-Use Bash)

Log in to your VPS terminal:
```bash
ssh sakuraCTO@187.127.110.32
# Password: enter interactively from the operator secret store; never place it in Git or shell history.
```

### Complete Copy-Paste Command

Run this command block directly in your terminal to automatically backup existing settings, configure Nginx with GitLab 500M body size limit, enable both mail domains, and issue SSL certificates:

```bash
sudo cp /etc/nginx/sites-available/sakura /etc/nginx/sites-available/sakura.backup.$(date +%F_%T) 2>/dev/null || true && \
sudo mkdir -p /var/www/html/sakura && \
echo "<h1>Reiwa Sakura & Yamato AC</h1>" | sudo tee /var/www/html/sakura/index.html > /dev/null && \
sudo chown -R www-data:www-data /var/www/html/sakura && \
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

# 2. Poste.io Mail (Webmail & Admin - Supports both domains)
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

# 5. Database Admin (pgAdmin / Adminer)
server {
    listen 80;
    server_name db.reiwasakura.tech;

    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF' && \
sudo ln -sf /etc/nginx/sites-available/sakura /etc/nginx/sites-enabled/sakura && \
sudo rm -f /etc/nginx/sites-enabled/default && \
sudo nginx -t && \
sudo systemctl reload nginx && \
sudo certbot --nginx --agree-tos --redirect --expand -m admin@reiwasakura.tech \
  -d gitlab.reiwasakura.tech \
  -d mail.reiwasakura.tech \
  -d mail.yamato-ac.jp \
  -d yamato-ac.jp \
  -d www.yamato-ac.jp \
  -d office.yamato-ac.jp \
  -d nicely.yamato-ac.jp \
  -d reiwasakura.tech \
  -d www.reiwasakura.tech \
  -d db.reiwasakura.tech
```

---

## 5. How to Create `contact@yamato-ac.jp` in Poste.io

1. Log in to the Poste.io Admin Panel:
   ```text
   https://mail.reiwasakura.tech/admin
   ```
2. In the left navigation menu, click **Mailboxes** (or **Users**).
3. Click **Create user** (or the **+** button).
4. Fill in the user details:
   - **Domain**: Select `yamato-ac.jp` from dropdown
   - **Username**: `contact` *(Creates `contact@yamato-ac.jp`)*
   - **Name (display name)**: `Yamato Contact`
   - **Password**: Enter your strong password
5. Click **Create user** / **Save**.

---

## 6. How to Log in & Use `contact@yamato-ac.jp`

### A. Via Webmail (Browser)
- **URL**: `https://mail.reiwasakura.tech` or `https://mail.yamato-ac.jp`
- **Email**: `contact@yamato-ac.jp`
- **Password**: *(Password set in Poste.io)*

### B. Via Email Apps (Outlook, iPhone Mail, Thunderbird, Mac Mail)

| Setting | Value |
|---|---|
| **Account Type** | IMAP |
| **Email / Username** | `contact@yamato-ac.jp` |
| **Password** | *(Your mailbox password)* |
| **Incoming Mail Server (IMAP)** | `mail.reiwasakura.tech` (or `mail.yamato-ac.jp`) |
| **IMAP Port / Security** | `993` (SSL/TLS) |
| **Outgoing Mail Server (SMTP)** | `mail.reiwasakura.tech` (or `mail.yamato-ac.jp`) |
| **SMTP Port / Security** | `587` (STARTTLS) or `465` (SSL/TLS) |
| **SMTP Authentication** | Enabled (Same username & password as IMAP) |

---

## 7. Deliverability Check (10/10 Score)

1. **Poste.io Admin Verification**:
   - Go to **Virtual domains** -> **`yamato-ac.jp`**.
   - Confirm all DNS indicators (MX, SPF, DKIM, DMARC) show **green**.
2. **Mail-Tester Deliverability Test**:
   - Open [https://www.mail-tester.com/](https://www.mail-tester.com/).
   - Send an email from `contact@yamato-ac.jp` to the test address provided.
   - Click **Check your score** to confirm a **10/10 deliverability score**.
