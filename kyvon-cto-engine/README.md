# KYVON CTO Autonomous Engine & vLLM Inference Hub
> **Autonomous CTO Code Audit, DPO Alignment Pipeline, and GitLab CI/CD Bot**  
> Serving `ctoai.reiwasakura.tech` & `kyvon.reiwasakura.tech` on VPS `187.127.110.32`

---

## 🏛️ System Architecture

```text
  ┌─────────────────────────────────────────────────────────────┐
  │                 GitLab (gitlab.reiwasakura.tech)            │
  │     Developer comments: "/KyvonCTOreview" or "/KyvonCTOtrain"│
  └──────────────────────────────┬──────────────────────────────┘
                                 │ Webhook (POST /api/gitlab/webhook)
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │         KYVON CTO Bot Service (ctoai.reiwasakura.tech)       │
  │               FastAPI Async Controller (Port 8090)          │
  ├──────────────────────────────┬──────────────────────────────┤
  │  • MR Diff Aggregator        │  • Slash Command Parser      │
  │  • 50-Condition Evaluator    │  • Training Process Manager  │
  └──────────────┬───────────────┴──────────────┬───────────────┘
                 │                              │
     vLLM Chat   │                              │ Spawns & Monitored by
     Completions │                              │ kyvontrain.py
                 ▼                              ▼
  ┌──────────────────────────────┐ ┌────────────────────────────┐
  │  vLLM OpenAI Server Engine   │ │ DPO Alignment & Merge      │
  │  (kyvon.reiwasakura.tech)    │ │ kyvontrain.py              │
  │  - Model: kyvon-core         │ │ - Base: Qwen2.5-Coder-7B   │
  │  - FlashAttention + Caching  │ │ - LoRA / QLoRA 4-bit       │
  │  - GPU Memory: 92% (Port 8000│ │ - Auto-export to vLLM dir  │
  └──────────────────────────────┘ └────────────────────────────┘
```

---

## 🌐 1. DNS Configuration (Hostinger / MuuMuu DNS)

Add these `A` records to your DNS zone before running Certbot:

| Type | Name / Host | Target IP Address | Purpose |
|---|---|---|---|
| **A** | `ctoai` | `187.127.110.32` | KYVON CTO Bot, Webhooks & OpenAI Proxy |
| **A** | `kyvon` | `187.127.110.32` | vLLM OpenAI Direct High-Performance Endpoint |

---

## ⚙️ 2. Environment Setup

Copy `.env.example` to `.env` and fill in your tokens:

```bash
cd /home/sakuraCTO/apps/gitlabserver/kyvon-cto-engine
cp .env.example .env
nano .env
```

```ini
# Hugging Face Token for downloading Qwen/Qwen2.5-Coder-7B-Instruct
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx

# Secure API Key protecting the vLLM API
KYVON_API_KEY=YOUR_SECURE_KYVON_KEY

# GitLab Bot Credentials
GITLAB_URL=https://gitlab.reiwasakura.tech
GITLAB_TOKEN=glpat-xxxxxxxxxxxxxxxxxxxx
GITLAB_WEBHOOK_SECRET=sakura_kyvon_webhook_secret_2026

# Model Paths
KYVON_MODEL_PATH=/mnt/data/kyvon-training/checkpoints/dpo_merged_vllm
KYVON_TRAINING_DIR=/mnt/data/kyvon-training
```

---

## 🚀 3. One-Click Automated Deployment

Run the automated deploy script:

```bash
cd /home/sakuraCTO/apps/gitlabserver/kyvon-cto-engine
./scripts/deploy.sh
```

Or deploy manually:

```bash
# 1. Update Nginx
sudo cp nginx/ctoai-kyvon.conf /etc/nginx/sites-available/ctoai-kyvon
sudo ln -sf /etc/nginx/sites-available/ctoai-kyvon /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 2. Launch Containers
docker compose up -d --build

# 3. SSL with Certbot
sudo certbot --nginx -d ctoai.reiwasakura.tech -d kyvon.reiwasakura.tech
```

---

## 🤖 4. GitLab Webhook Configuration

In your GitLab instance (`https://gitlab.reiwasakura.tech`):
1. Navigate to your Project or Group -> **Settings** -> **Webhooks**.
2. **URL**: `https://ctoai.reiwasakura.tech/api/gitlab/webhook`
3. **Secret Token**: `sakura_kyvon_webhook_secret_2026` (matching `.env`)
4. **Trigger Events**:
   - ✅ **Comments** (Note events)
   - ✅ **Merge request events**
   - ✅ **Push events**
5. Enable **SSL verification** and click **Add webhook**.

---

## 💬 5. Slash Commands in GitLab MRs & Issues

Developers and tech leads can trigger KYVON directly in GitLab discussions:

| Slash Command | Description | Example |
|---|---|---|
| `/KyvonCTOreview` | Runs 50-condition architecture, security, and zero-allocation audit on the MR diff and posts the report. | `/KyvonCTOreview` |
| `/KyvonCTOtrain` | Triggers background DPO fine-tuning using `kyvontrain.py`, merges LoRA weights, and notifies on completion. | `/KyvonCTOtrain epochs=3 lr=5e-5` |
| `/KyvonCTOaudit` | Deep latency & security scan of the branch changes. | `/KyvonCTOaudit` |
| `/KyvonCTOstatus` | Displays vLLM engine status, GPU telemetry, active model, and training status. | `/KyvonCTOstatus` |

---

## 🧠 6. Running DPO Training Manually (`kyvontrain.py`)

To fine-tune `Qwen2.5-Coder-7B-Instruct` on your GPU server:

```bash
python3 kyvontrain.py \
  --model_id "Qwen/Qwen2.5-Coder-7B-Instruct" \
  --dataset_path "datasets/training_dataset.jsonl" \
  --output_dir "/mnt/data/kyvon-training/checkpoints/dpo_final" \
  --merged_dir "/mnt/data/kyvon-training/checkpoints/dpo_merged_vllm" \
  --epochs 3 \
  --batch_size 2 \
  --grad_accum 4 \
  --lr 5e-5 \
  --lora_r 16 \
  --lora_alpha 32 \
  --merge_vllm
```

### Rolling Reload After Training
When new model weights are merged:
```bash
docker compose restart kyvon-inference
```

---

## 📡 7. API Verification (OpenAI Compatible)

### Curl Test to `kyvon.reiwasakura.tech`:
```bash
curl -X POST "https://kyvon.reiwasakura.tech/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECURE_KYVON_KEY" \
  -d '{
    "model": "kyvon-core",
    "messages": [
      {"role": "system", "content": "Identity: KYVON."},
      {"role": "user", "content": "Run latency and architecture audit test."}
    ],
    "temperature": 0.2
  }'
```

### Telemetry & Log Monitoring
```bash
# Real-time token generation & GPU telemetry
docker logs -f kyvon_vllm_engine --tail 50

# Webhook & Slash command execution logs
docker logs -f kyvon_gitlab_bot --tail 50
```
