# Deployment & Server Infrastructure

**Host Target**: Debian 12 (187.127.110.32)  
**Domains**: `reiwasakura.tech`, `gitlab.reiwasakura.tech`, `mail.reiwasakura.tech`, `yamato-ac.jp`  

## 1. Nginx Reverse Proxy Routing

- `https://gitlab.reiwasakura.tech` -> `http://127.0.0.1:8929` (GitLab Omnibus)
- `https://mail.reiwasakura.tech` -> `http://127.0.0.1:8953` (Poste.io Admin & Webmail)
- `https://ctoai.reiwasakura.tech` -> `http://127.0.0.1:8000` (vLLM / FastAPI Engine)
- `https://meet.reiwasakura.tech` -> `http://127.0.0.1:3000` (Mediasoup SFU)

## 2. SSL / HTTPS Issuance (Certbot)

```bash
sudo certbot --nginx \
  -d reiwasakura.tech \
  -d www.reiwasakura.tech \
  -d gitlab.reiwasakura.tech \
  -d db.reiwasakura.tech \
  -d mail.reiwasakura.tech
```
