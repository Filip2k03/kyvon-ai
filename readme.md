# KYVON 0xPlus — Unified Systems Ecosystem

**Operator**: Thu Ya Kyaw (TechyyFilip / stephanfilip) — [thuyakyaw.com](https://thuyakyaw.com)  
**Ecosystem**: `ctoai.reiwasakura.tech` | `gitlab.reiwasakura.tech` | `yamato-ac.jp`  
**Compliance Standard**: 1,200-Condition Master Directive & 50-Vector CTO Matrix  

---

## 🌟 Modules & Topology

```
~/Yamato_project/gitlabserver/
├── chat/                   # High-throughput uWebSockets.js & Prisma Chat Engine
├── meet/                   # Mediasoup SFU WebRTC Video Conferencing & Stage Compositor
├── kyvon-care-ui/          # Lit-HTML & Tailwind 320px–425px Mobile PWA
├── kyvon-cto-engine/       # Autonomous DPO Training Pipeline (kyvontrain.py) & vLLM Serving
├── kyvon-chrome-extension/ # Manifest V3 Real-Time Code Auditing Side Panel
├── server/                 # Nginx Reverse Proxy, Docker, Poste.io & SSL Setup Guides
├── .agents/                # Antigravity Subagent Directives & Master Rules
├── .kyvon/                 # Live Project Baseline Audits & Telemetry Records
└── kyvon-build.sh          # 5-Tier Master Build, Test & CTO Gatekeeper Pipeline
```

---

## 🚀 Quick Start & Verification

Run the master verification pipeline to build all modules, execute tests, and evaluate uncommitted diffs against the 1,200-condition rubric:

```bash
bash kyvon-build.sh
```

---

## 🧪 Testing Suites

```bash
# Run Chat unit tests
pnpm --prefix chat test

# Run Meet SFU tests
pnpm --prefix meet test

# Run AI Dataset Integrity tests
python3 -m unittest kyvon-cto-engine/tests/test_dataset_integrity.py
```