Infrastructure Setup: Reiwa Sakura Tech

Server Specs: Debian 12 | 4 vCPU | 16GB RAM | 200GB NVMe
IP Address: 187.127.110.32
Core Tech: Docker, Nginx (Reverse Proxy), GitLab Omnibus, Poste.io, PostgreSQL

1. System Initialization & Security

First, we create the sakuraCTO user, set the exact password requested (FilipsakuraCTO7feb2k03), grant sudo privileges, and secure the account.

# 1. Login as root first
ssh root@187.127.110.32

# 2. Create the user and set the exact password
useradd -m -s /bin/bash sakuraCTO
echo "sakuraCTO:FilipsakuraCTO7feb2k03" | chpasswd

# 3. Grant sudo privileges
usermod -aG sudo sakuraCTO

# 4. Copy SSH keys (Recommended)
rsync --archive --chown=sakuraCTO:sakuraCTO ~/.ssh /home/sakuraCTO

# 5. Exit root and login as sakuraCTO
exit


Login to your new environment:

ssh sakuraCTO@187.127.110.32
# Password: FilipsakuraCTO7feb2k03


(Run all subsequent commands as sakuraCTO)

2. Docker & Nginx Preparation

Install Docker (for Mail/DB) and Nginx (for routing subdomains).

# Install Docker, Nginx, and Certbot (for SSL)
sudo apt update && sudo apt install -y ca-certificates curl gnupg nginx certbot python3-certbot-nginx
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group and refresh permissions immediately (Fixes permission denied error)
sudo usermod -aG docker sakuraCTO
newgrp docker


3. Database & Admin Panel Deployment (db.reiwasakura.tech)

Run these commands to automatically create the folder, generate the docker-compose.yml file, and deploy the database securely. (Note: The obsolete version tag has been removed).

mkdir -p /home/sakuraCTO/database
cd /home/sakuraCTO/database

cat << 'EOF' > docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: sakura_admin
      POSTGRES_PASSWORD: SakuraStrongPassword123! # Change if desired
      POSTGRES_DB: sakura_db
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432" # Locked to localhost for security

  pgadmin:
    image: dpage/pgadmin4
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: cto@reiwasakura.tech
      PGADMIN_DEFAULT_PASSWORD: SakuraStrongPassword123! # Change if desired
    ports:
      - "127.0.0.1:8082:80" # Locked to localhost, Nginx will route to this

volumes:
  pgdata:
EOF

docker compose up -d


4. Poste.io Mail Server Deployment (mail.reiwasakura.tech)

Run these commands to generate the mail server configuration and launch it:

mkdir -p /home/sakuraCTO/mail
cd /home/sakuraCTO/mail

cat << 'EOF' > docker-compose.yml
services:
  mailserver:
    image: analogic/poste.io
    hostname: mail.reiwasakura.tech
    ports:
      - "25:25"
      - "110:110"
      - "143:143"
      - "587:587"
      - "993:993"
      - "4190:4190"
      - "127.0.0.1:8953:80"     # WebAdmin routed through Nginx
    environment:
      - TZ=Asia/Yangon
      - HTTPS=OFF     # Nginx handles SSL
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - ./mail-data:/data
EOF

docker compose up -d


5. GitLab Installation (gitlab.reiwasakura.tech)

Install Omnibus GitLab directly on the host machine (not Docker), binding it to internal port 6969 so Nginx can proxy to it safely.

# 1. Install dependencies
sudo apt-get install -y curl openssh-server ca-certificates tzdata perl

# 2. Add GitLab repository
curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ee/script.deb.sh | sudo bash

# 3. Install GitLab
sudo apt-get install gitlab-ee

# 4. Configure GitLab for Reverse Proxy dynamically
sudo bash -c "cat << 'EOF' >> /etc/gitlab/gitlab.rb
external_url 'https://gitlab.reiwasakura.tech'
nginx['listen_port'] = 6969
nginx['listen_https'] = false
EOF"

# 5. Apply changes (This takes a few minutes)
sudo gitlab-ctl reconfigure


6. Main Website (React Landing Page)

We will compile your React site and serve the static files from /var/www/html/sakura.

sudo mkdir -p /var/www/html/sakura
# Upload your compiled React 'dist' or 'build' folder contents into /var/www/html/sakura
sudo chown -R www-data:www-data /var/www/html/sakura


7. Nginx Reverse Proxy Configuration

Run this command to automatically write the complete Nginx configuration file directly to your system:

sudo bash -c "cat << 'EOF' > /etc/nginx/sites-available/sakura
# 1. Main Landing Page
server {
    listen 80;
    server_name reiwasakura.tech www.reiwasakura.tech;
    root /var/www/html/sakura;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}

# 2. GitLab
server {
    listen 80;
    server_name gitlab.reiwasakura.tech;

    location / {
        proxy_pass http://127.0.0.1:6969;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# 3. pgAdmin (Database)
server {
    listen 80;
    server_name db.reiwasakura.tech;

    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# 4. Poste.io (Mail Web UI)
server {
    listen 80;
    server_name mail.reiwasakura.tech;

    location / {
        proxy_pass http://127.0.0.1:8953;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF"


Enable the configuration and restart Nginx:

sudo ln -s /etc/nginx/sites-available/sakura /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx


8. SSL / HTTPS Setup (Certbot)

Once your DNS records have propagated to Hostinger, run this single command to automatically issue SSL certificates and configure HTTPS for all your subdomains securely:

sudo certbot --nginx -d reiwasakura.tech -d www.reiwasakura.tech -d gitlab.reiwasakura.tech -d db.reiwasakura.tech -d mail.reiwasakura.tech


9. DNS Record Summary (Hostinger)

Ensure these are set in your Hostinger panel:

A record @ -> 187.127.110.32

A record www -> 187.127.110.32

A record gitlab -> 187.127.110.32

A record db -> 187.127.110.32

A record mail -> 187.127.110.32

MX record @ -> mail.reiwasakura.tech (Priority 10)


10. Secondary Domain Setup: yamato-ac.jp (MuuMuu Domain)

For adding and routing emails for yamato-ac.jp on the same Poste.io server:
- See detailed guide: [yamato-ac-mail-setup.md](file:///Users/stephanfilip/Yamato_project/gitlabserver/server/yamato-ac-mail-setup.md)
- Poste.io Admin: Add Virtual Domain `yamato-ac.jp` at `https://mail.reiwasakura.tech/admin`
- MuuMuu DNS (設定2): Set MX -> `mail.reiwasakura.tech` (Priority 10), SPF TXT, DKIM TXT, DMARC TXT, and A record `mail` -> `187.127.110.32`