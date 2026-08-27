# KYVON CTO Engine & vLLM Production Deployment Guide
**Server**: `sakuraCTO@187.127.110.32`  
**Host Paths**:  
- Service Directory: `/home/sakuraCTO/apps/gitlabserver/kyvon-cto-engine`  
- Checkpoints & Models: `/mnt/data/kyvon-training/`  
**Domains**: `ctoai.reiwasakura.tech` · `kyvon.reiwasakura.tech`

---

## 1. Directory Structure

```text
kyvon-cto-engine/
├── kyvontrain.py             # Perfected DPO training pipeline (Qwen2.5-Coder LoRA/QLoRA)
├── docker-compose.yml        # vLLM inference engine + FastAPI Bot controller
├── .env.example              # Environment variable template
├── datasets/
│   ├── training_dataset.jsonl # 50-condition DPO optimization dataset
│   └── generate_dataset.py   # Dataset builder & augmenter
├── bot/
│   ├── main.py               # FastAPI webhook & OpenAI chat proxy
│   ├── gitlab_client.py      # GitLab REST API v4 integration
│   ├── evaluator.py          # 50-condition CTO AI code evaluator
│   ├── trainer_bridge.py     # Background training management
│   ├── Dockerfile
│   └── requirements.txt
├── nginx/
│   └── ctoai-kyvon.conf      # Nginx proxy for ctoai and kyvon subdomains
└── scripts/
    ├── deploy.sh             # Automated VPS deployment script
    ├── run_training.sh       # Direct training runner
    ├── merge_lora.py         # LoRA adapter to standalone model merger
    ├── test_inference.sh     # vLLM OpenAI endpoint tester
    └── test_webhook.sh       # GitLab webhook simulator
```

---

## 2. Step-by-Step Server Setup

### Step 2.1: DNS Configuration
Add the following A records in your DNS provider (Hostinger / MuuMuu DNS):
- `A` `ctoai` -> `187.127.110.32`
- `A` `kyvon` -> `187.127.110.32`

### Step 2.2: Setup Environment & Launch
On the VPS:
```bash
# 1. Navigate to the project directory
cd /home/sakuraCTO/apps/gitlabserver/kyvon-cto-engine

# 2. Configure .env
cp .env.example .env
nano .env

# Set:
# HF_TOKEN=hf_...
# KYVON_API_KEY=YOUR_SECURE_KYVON_KEY
# GITLAB_TOKEN=glpat-...
# GITLAB_WEBHOOK_SECRET=sakura_kyvon_webhook_secret_2026

# 3. Run automated deployment script
chmod +x scripts/*.sh
./scripts/deploy.sh
```

### Step 2.3: SSL Provisioning with Certbot
```bash
sudo certbot --nginx --agree-tos --redirect --expand -m admin@reiwasakura.tech \
  -d ctoai.reiwasakura.tech \
  -d kyvon.reiwasakura.tech
```

---

## 3. GitLab Slash Command Integration

Once the webhook `https://ctoai.reiwasakura.tech/api/gitlab/webhook` is configured in GitLab:
- Comment `/KyvonCTOreview` on any Merge Request to trigger an instant code review report evaluated against 50 architecture conditions.
- Comment `/KyvonCTOtrain` on any MR or Issue to trigger DPO training on GPU, re-merging weights into vLLM format.
- Reload the vLLM container seamlessly when new models are saved:
  ```bash
  docker compose restart kyvon-inference
  ```

---

## 4. Verification Commands

```bash
# Test vLLM OpenAI completions directly:
./scripts/test_inference.sh "https://kyvon.reiwasakura.tech/v1/chat/completions" "YOUR_SECURE_KYVON_KEY"

# Test GitLab webhook:
./scripts/test_webhook.sh "https://ctoai.reiwasakura.tech/api/gitlab/webhook" "sakura_kyvon_webhook_secret_2026" "/KyvonCTOreview"
```
