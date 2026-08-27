# GitLab Omnibus & KYVON CTO AI Integration
**Host**: `sakuraCTO@srv1760725` (`187.127.110.32`)  
**GitLab URL**: `https://gitlab.reiwasakura.tech`  
**CTO AI Bot URL**: `https://ctoai.reiwasakura.tech`  
**vLLM Inference URL**: `https://kyvon.reiwasakura.tech`  

---

## 1. Architecture Overview

- **GitLab Omnibus**: Hosted directly on VPS port `6969`, proxied by Nginx.
- **KYVON CTO Bot (`ctoai.reiwasakura.tech`)**: FastAPI webhook and slash command controller on port `8090`.
- **vLLM Engine (`kyvon.reiwasakura.tech`)**: GPU-accelerated inference container (`kyvon_vllm_engine`) serving `kyvon-core` on port `8000`.
- **DPO Training Pipeline (`kyvontrain.py`)**: Direct Preference Optimization on `Qwen/Qwen2.5-Coder-7B-Instruct` with LoRA adapter merging.

---

## 2. Slash Commands in Merge Requests & Issues

When reviewing Merge Requests or Issues on `https://gitlab.reiwasakura.tech`, comments starting with `/Kyvon` automatically trigger the autonomous engine:

| Slash Command | Action |
|---|---|
| `/KyvonCTOreview` | Extracts MR code diffs, evaluates across 50 CTO conditions (zero allocations, time complexity, security, concurrency), and posts an executive audit report. |
| `/KyvonCTOtrain` | Triggers background DPO fine-tuning using `kyvontrain.py`, merges LoRA weights, and prepares the model for vLLM reload. |
| `/KyvonCTOaudit` | Deep latency, architectural, and security analysis. |
| `/KyvonCTOstatus` | Returns GPU memory utilization, active model version, and training status. |

---

## 3. GitLab Webhook Setup

1. In GitLab, open your project or group -> **Settings** -> **Webhooks**.
2. **URL**: `https://ctoai.reiwasakura.tech/api/gitlab/webhook`
3. **Secret Token**: Defined in `kyvon-cto-engine/.env` (`GITLAB_WEBHOOK_SECRET`)
4. **Triggers**:
   - Comments (Note events)
   - Merge request events
   - Push events
5. Enable **SSL verification** and click **Add webhook**.

---

## 4. DNS Mapping (Hostinger / MuuMuu)

| Record | Host | Value | Target |
|---|---|---|---|
| A | `gitlab` | `187.127.110.32` | GitLab Omnibus |
| A | `ctoai` | `187.127.110.32` | KYVON CTO Bot & Webhook Hub |
| A | `kyvon` | `187.127.110.32` | vLLM OpenAI API Endpoint |

---

## 5. Quick Service Commands

```bash
# Start/reload KYVON engine & bot
cd /home/sakuraCTO/apps/gitlabserver/kyvon-cto-engine
docker compose up -d

# Check live GPU tokens/sec telemetry
docker logs -f kyvon_vllm_engine --tail 50

# Restart vLLM after new DPO checkpoint training
docker compose restart kyvon-inference
```
