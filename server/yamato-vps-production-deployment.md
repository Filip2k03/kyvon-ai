# Yamato Academy: VPS Production Deployment & Nginx Mail Integration

**VPS Host**: `sakuraCTO@srv1760725` (`187.127.110.32`)  
**Yamato VPS Path**: `/home/sakuraCTO/apps/yamato-ac.jp`  
**Domains**: `yamato-ac.jp` · `www.yamato-ac.jp` · `office.yamato-ac.jp` · `mail.yamato-ac.jp`

---

## 1. Production `.env.production` Configuration

On your VPS, write the complete `.env.production` file at `/home/sakuraCTO/apps/yamato-ac.jp/.env.production`:

```bash
cat << 'EOF_ENV' > /home/sakuraCTO/apps/yamato-ac.jp/.env.production
APP_NAME="Yamato Academy"
APP_ENV=production
APP_URL=https://yamato-ac.jp
APP_PUBLIC_URL=https://www.yamato-ac.jp
APP_OFFICE_URL=https://office.yamato-ac.jp
APP_TIMEZONE=Asia/Yangon
APP_CURRENCY=MMK

DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=yamato_academy
DB_USERNAME=yamato_app
DB_PASSWORD=01141a8456f2840444e4a59074cce1e8e6df9229249119d50dcfaea7afefdc70
MYSQL_ROOT_PASSWORD=f619e496fcac1dc3c7608f1e957420c85c80dd2ad89148af049a332fd61e2e20

# SMTP Mail Server (Poste.io)
MAIL_ENABLED=true
MAIL_HOST=mail.reiwasakura.tech
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=contact@yamato-ac.jp
MAIL_PASSWORD=HzawH2783##
MAIL_FROM_ADDRESS=contact@yamato-ac.jp
MAIL_FROM_NAME="Yamato Academy"
MAIL_ADMISSIONS_ADDRESS=admissions@yamato-ac.jp
MAIL_OFFICE_ADDRESS=office@yamato-ac.jp
EOF_ENV
```
> *(Replace `YourPostePasswordHere` with the actual password set for `contact@yamato-ac.jp` in Poste.io admin).*

---

## 2. Build & Launch Yamato Docker Containers

Build and run the Yamato Apache/PHP application and MySQL container on internal port `8088`:

```bash
cd /home/sakuraCTO/apps/yamato-ac.jp
docker compose -f docker-compose.production.yml up -d --build
```

---

## 3. Configure Nginx Reverse Proxy (Port 8088, 6969, 8953, 8082)

Run this command block on the VPS to update `/etc/nginx/sites-available/sakura`:

```bash
sudo rm -f /etc/nginx/sites-enabled/*
sudo bash -c 'cat << "EOF_NGINX" > /etc/nginx/sites-available/sakura
# 1. GitLab Omnibus (Port 6969, 500M upload limit)
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

# 2. Poste.io Mail Server Webmail & Admin (Port 8953)
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

# 3. Yamato Academy Public Website (Port 8088)
server {
    listen 80;
    server_name yamato-ac.jp www.yamato-ac.jp;
    client_max_body_size 16M;
    add_header X-Yamato-Proxy "public" always;

    location ^~ /office/ {
        return 301 https://office.yamato-ac.jp$request_uri;
    }

    location = /office {
        return 301 https://office.yamato-ac.jp/dashboard;
    }

    location / {
        proxy_pass http://127.0.0.1:8088;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 4. Yamato Academy Office Suite (Port 8088)
server {
    listen 80;
    server_name office.yamato-ac.jp;
    client_max_body_size 16M;
    add_header X-Yamato-Proxy "office" always;

    location = / {
        return 302 /login;
    }

    location ^~ /frontend/ {
        return 301 https://www.yamato-ac.jp$request_uri;
    }

    location / {
        proxy_pass http://127.0.0.1:8088;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 5. Reiwa Sakura Website
server {
    listen 80;
    server_name reiwasakura.tech www.reiwasakura.tech nicely.yamato-ac.jp;
    root /var/www/html/sakura;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# 6. Database Admin (pgAdmin / Port 8082)
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
EOF_NGINX' && \
sudo ln -sf /etc/nginx/sites-available/sakura /etc/nginx/sites-enabled/sakura && \
sudo nginx -t && \
sudo systemctl reload nginx
```

---

## 4. Issue / Expand SSL Certificates with Certbot

```bash
sudo certbot --nginx --agree-tos --redirect --expand -m admin@reiwasakura.tech \
  -d gitlab.reiwasakura.tech \
  -d mail.reiwasakura.tech \
  -d mail.yamato-ac.jp \
  -d yamato-ac.jp \
  -d www.yamato-ac.jp \
  -d office.yamato-ac.jp \
  -d nicely.yamato-ac.jp
```

---

## 5. Live Service Verification

| Service | Live URL | Backend / Container |
|---|---|---|
| **Public Admissions Site** | `https://yamato-ac.jp` & `https://www.yamato-ac.jp` | Docker `yamato_app` (`127.0.0.1:8088`) |
| **Private Office Suite** | `https://office.yamato-ac.jp` | Docker `yamato_app` (`127.0.0.1:8088`) |
| **Poste.io Webmail** | `https://mail.yamato-ac.jp` / `https://mail.reiwasakura.tech` | Docker `poste.io` (`127.0.0.1:8953`) |
| **GitLab Omnibus** | `https://gitlab.reiwasakura.tech` | Host Omnibus (`127.0.0.1:6969`) |
| **Database Panel** | `https://db.reiwasakura.tech` | Docker `pgadmin` (`127.0.0.1:8082`) |
