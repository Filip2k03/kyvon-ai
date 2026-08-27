#!/usr/bin/env bash
# =============================================================================
# KYVON CTO Engine & vLLM Production Deployment Script
# VPS: 187.127.110.32
# Domains: ctoai.reiwasakura.tech, kyvon.reiwasakura.tech
# =============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=========================================================="
echo " KYVON CTO Engine - Automated Production Deployment"
echo "=========================================================="

# 1. Create Model Checkpoint Directories
echo "[1/5] Creating directory structure at /mnt/data/kyvon-training..."
sudo mkdir -p /mnt/data/kyvon-training/checkpoints/dpo_final
sudo mkdir -p /mnt/data/kyvon-training/checkpoints/dpo_merged_vllm
sudo chown -R $USER:$USER /mnt/data/kyvon-training || true

# 2. Check Environment Variables
if [ ! -f "$ROOT_DIR/.env" ]; then
    echo "[!] .env file not found. Copying from .env.example..."
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
    echo "[!] Please edit $ROOT_DIR/.env with your HF_TOKEN, KYVON_API_KEY, and GITLAB_TOKEN!"
fi

# 3. Configure Nginx Reverse Proxy
echo "[2/5] Updating Nginx configuration..."
NGINX_CONF_PATH="/etc/nginx/sites-available/ctoai-kyvon"
sudo cp "$ROOT_DIR/nginx/ctoai-kyvon.conf" "$NGINX_CONF_PATH"
sudo ln -sf "$NGINX_CONF_PATH" /etc/nginx/sites-enabled/

sudo nginx -t
sudo systemctl reload nginx
echo "[*] Nginx reloaded successfully."

# 4. Launch Docker Services
echo "[3/5] Starting vLLM Engine and KYVON Bot..."
cd "$ROOT_DIR"
docker compose up -d --build

# 5. Issue SSL Certificates with Certbot
echo "[4/5] Provisioning SSL Certificates via Let's Encrypt Certbot..."
sudo certbot --nginx --agree-tos --redirect --expand -m admin@reiwasakura.tech \
  -d ctoai.reiwasakura.tech \
  -d kyvon.reiwasakura.tech || echo "[!] Notice: If DNS has not propagated yet, rerun Certbot once DNS A records are live."

# 6. Status and Verification
echo "[5/5] Checking service status..."
docker ps --filter "name=kyvon"

echo "=========================================================="
echo " KYVON Deployment Completed!"
echo " - vLLM Inference: https://kyvon.reiwasakura.tech/v1/chat/completions"
echo " - CTO AI Bot & Webhook: https://ctoai.reiwasakura.tech/api/gitlab/webhook"
echo "=========================================================="
