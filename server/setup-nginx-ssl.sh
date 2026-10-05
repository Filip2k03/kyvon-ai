#!/usr/bin/env bash
# ==============================================================================
# Complete Nginx & SSL Configuration with Yamato Docker Proxy (Port 8088)
# VPS Path: /home/sakuraCTO/apps/yamato-ac.jp
# ==============================================================================

set -euo pipefail

echo "[1/4] Writing complete Nginx configuration..."
sudo bash -c 'cat << "NGINX_CONF" > /etc/nginx/sites-available/sakura
# 1. GitLab Omnibus (Port 6969, 500M body limit)
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

# 5. nicely.yamato-ac.jp only — NEVER reiwasakura.tech (that is reiwasakura-app)
server {
    listen 80;
    server_name nicely.yamato-ac.jp;
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
NGINX_CONF'

echo "[2/4] Testing Nginx configuration (keep other sites-enabled entries)..."
sudo ln -sf /etc/nginx/sites-available/sakura /etc/nginx/sites-enabled/sakura
sudo nginx -t
sudo systemctl reload nginx

echo "[3/4] Issuing / Expanding SSL via Certbot..."
sudo certbot --nginx \
  --agree-tos \
  --redirect \
  --expand \
  -m admin@reiwasakura.tech \
  -d gitlab.reiwasakura.tech \
  -d mail.reiwasakura.tech \
  -d mail.yamato-ac.jp \
  -d yamato-ac.jp \
  -d www.yamato-ac.jp \
  -d office.yamato-ac.jp \
  -d nicely.yamato-ac.jp

echo "[4/4] Nginx and SSL setup complete!"
