# Reiwa Sakura — GitLab companion workspace

Kept modules (nothing KYVON / CTO-AI / vLLM):

```
gitlabserver/
├── chat/     # chat.reiwasakura.tech  (GitLab: Stephan_Filip/chat)
├── meet/     # meet.reiwasakura.tech  (GitLab: Stephan_Filip/meet)
└── server/   # Nginx, mail (Poste.io), DB notes, GitLab Omnibus docs
```

| Service | URL | Where it runs |
|---|---|---|
| GitLab | https://gitlab.reiwasakura.tech | Omnibus on VPS `:6969` |
| Chat | https://chat.reiwasakura.tech | `chat/` Docker |
| Meet | https://meet.reiwasakura.tech | `meet/` Docker |
| Mail | https://mail.reiwasakura.tech | Poste.io |
| DB | https://db.reiwasakura.tech | pgAdmin + Postgres |

## Engineering documentation

Agents start with [AGENTS.md](AGENTS.md), then [SKILLS.md](SKILLS.md).
Humans can browse the [engineering documentation index](docs/README.md),
[development guide](docs/development.md), and [release procedure](docs/release.md).
Claude and Codex have concise [Claude](CLAUDE.md) and [Codex](CODEX.md) bootstraps.
The documentation describes the current working tree; see [verification and known drift](docs/verification.md).

## Working with Chat / Meet

Each app has its own git remote and compose file. Do not use a root KYVON compose.

```bash
# Chat
cd chat && git remote -v
# Meet
cd meet && git remote -v
```

## GitLab nginx

GitLab vhost must **never** list `reiwasakura.tech`. See `server/nginx-gitlab.conf` and `server/gitlab.md`.
