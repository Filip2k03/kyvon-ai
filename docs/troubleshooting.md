# Troubleshooting

Audience: engineers/operators. Last inspected: 2026-09-13.

| Problem | Likely cause | Diagnostic / expected result | Resolution |
|---|---|---|---|
| Root install/build fails | Root application removed | Inspect readme.md and app manifests; no root package.json | Run commands inside Chat or Meet |
| Fresh clone lacks apps | Gitlinks without .gitmodules | git ls-files --stage chat meet shows 160000 | Resolve clone/remotes policy; do not assume submodule init works |
| Lockfile install fails | Package-manager mismatch or malformed lockfile | pnpm --version; inspect lockfileVersion | Use reviewed compatible version; do not casually regenerate |
| tsx test EPERM pipe | Sandbox IPC denied | Error names tsx pipe, not assertion | Authorized retry or documented node --import tsx equivalent |
| Prisma client missing | Generation not run | Inspect generated client import and Prisma config | Generate with a non-production configured DB URL; generation does not migrate |
| Chat startup fails | Missing env/bootstrap or DB/Redis unavailable | Bounded app logs and Compose service health | Supply required variables privately; verify dependencies |
| Meet HTTP works, media fails | ANNOUNCED_IP/firewall/NAT | Two-client deployment-URL media check | Verify public ICE candidates and UDP/TCP range; investigate TURN |
| Meet deploy WS check fails | Missing PUBLIC_ORIGIN or signaling unavailable | Inspect sanitized failure and container configuration presence | Set the exact production Origin; retain server protection |
| Meet users logged out after restart | In-memory session store | Compare restart with auth.ts | Expected current behavior; decide durable sessions separately |
| Browser calls wrong API in Vite | Only /ws proxy exists | Inspect web/vite.config.ts | Use authorized deployment URL or implement intentional API proxy |
| sudo requires password | Operator lacks noninteractive privilege | sudo -n nginx -t fails | Authorized operator handles host operation; do not bypass using Docker |
| Nginx routes apex to GitLab | Overlapping server_name | Authorized nginx -T review, redacted | Preserve TLS and isolate GitLab hostname |

Do not paste full service logs or resolved container environments into reports. Escalate with timestamp, revision, sanitized error and scope.

Related: [operations](../.agent/runbooks/operations.md), [security](security.md).
