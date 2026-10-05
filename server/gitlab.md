# GitLab Omnibus (Reiwa Sakura)

**Host**: `sakuraCTO@187.127.110.32`  
**GitLab URL**: `https://gitlab.reiwasakura.tech`  
Upstream: `127.0.0.1:6969` via host nginx (`sites-available/sakura`).

Application repos on this GitLab instance:

| Project | Remote |
|---|---|
| Chat | `git@gitlab.reiwasakura.tech:Stephan_Filip/chat.git` |
| Meet | `git@gitlab.reiwasakura.tech:Stephan_Filip/meet.git` |

KYVON / CTO-AI / vLLM code and `ctoai.reiwasakura.tech` were removed from this workspace and the `ctoai` nginx site was disabled.

## DNS

| Record | Host | Target |
|---|---|---|
| A | `gitlab` | `187.127.110.32` |

## Nginx isolation

Do **not** put `server_name reiwasakura.tech` in `sakura`. Canonical GitLab-only vhost: `nginx-gitlab.conf`.

```bash
sudo nginx -t && sudo systemctl reload nginx
echo | openssl s_client -servername gitlab.reiwasakura.tech -connect gitlab.reiwasakura.tech:443 2>/dev/null | openssl x509 -noout -subject
```
