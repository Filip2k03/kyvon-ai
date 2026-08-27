#!/usr/bin/env python3
"""
KYVON Dataset Generator & Augmenter
Generates enterprise-grade DPO preference pairs covering 50 CTO architectural conditions.
"""

import json
import os

EXTRA_SAMPLES = [
    {
        "prompt": "Optimize this Go string concatenation inside a 100k iteration loop:\ns := \"\"\nfor i := 0; i < 100000; i++ {\n    s += strconv.Itoa(i) + \",\"\n}",
        "chosen": "// Pre-allocated strings.Builder avoiding 100k heap allocations\nvar sb strings.Builder\nsb.Grow(100000 * 8) // Pre-allocate estimation\nfor i := 0; i < 100000; i++ {\n    sb.WriteString(strconv.Itoa(i))\n    sb.WriteByte(',')\n}\ns := sb.String()",
        "rejected": "// Inefficient string reallocation O(N^2) memory copies\ns := \"\"\nfor i := 0; i < 100000; i++ {\n    s += strconv.Itoa(i) + \",\"\n}"
    },
    {
        "prompt": "Refactor this Express route to handle unhandled async promise rejections properly:\napp.get('/users/:id', async (req, res) => {\n    const user = await findUser(req.params.id);\n    res.json(user);\n});",
        "chosen": "// Express async error forwarding to centralized middleware\napp.get('/users/:id', async (req, res, next) => {\n    try {\n        const user = await findUser(req.params.id);\n        if (!user) {\n            return res.status(404).json({ error: 'User not found' });\n        }\n        res.json({ status: 'success', data: user });\n    } catch (err) {\n        next(err); // Pass to global error boundary\n    }\n});",
        "rejected": "// Uncaught async exception crashing node process\napp.get('/users/:id', async (req, res) => {\n    const user = await findUser(req.params.id);\n    res.json(user);\n});"
    },
    {
        "prompt": "Optimize this Python list comprehension filtering and mapping a 5M item list:\nresult = [x * 2 for x in huge_list if x % 2 == 0]",
        "chosen": "# Memory efficient generator / iterator processing item by item\nresult_iter = (x * 2 for x in huge_list if x % 2 == 0)\n# Or vectorized using numpy for numeric workloads:\n# arr = np.array(huge_list, dtype=np.int64)\n# result = arr[arr % 2 == 0] * 2",
        "rejected": "# Allocating another 5M element list immediately on RAM\nresult = [x * 2 for x in huge_list if x % 2 == 0]"
    },
    {
        "prompt": "Audit this Dockerfile for production security and image size:\nFROM node:latest\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"server.js\"]",
        "chosen": "# Multi-stage build, pinned Alpine LTS, non-root user, clean cache\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine AS runner\nWORKDIR /app\nENV NODE_ENV=production\nUSER node\nCOPY --chown=node:node --from=builder /app/dist ./dist\nCOPY --chown=node:node --from=builder /app/node_modules ./node_modules\nCOPY --chown=node:node --from=builder /app/package.json ./\nEXPOSE 3000\nCMD [\"node\", \"dist/server.js\"]",
        "rejected": "# Bloated full OS image, running as root, devDependencies included\nFROM node:latest\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"server.js\"]"
    },
    {
        "prompt": "Optimize this Redis cache read-through pattern to prevent cache stampede:\nval = redis.get(key)\nif not val:\n    val = db.fetch(key)\n    redis.set(key, val)",
        "chosen": "# Mutex locking / probabilistic early expiration (XFetch / singleflight)\nval = redis.get(key)\nif not val:\n    with redis_distributed_lock(f\"lock:{key}\", timeout=3):\n        val = redis.get(key) # Double check inside lock\n        if not val:\n            val = db.fetch(key)\n            redis.setex(key, 3600, val)\nreturn val",
        "rejected": "# Cache stampede thundering herd hitting database on TTL expiration\nval = redis.get(key)\nif not val:\n    val = db.fetch(key)\n    redis.set(key, val)"
    }
]


def main():
    target_path = os.path.join(os.path.dirname(__file__), "training_dataset.jsonl")
    existing = []
    if os.path.exists(target_path):
        with open(target_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    existing.append(json.loads(line.strip()))

    combined = existing + EXTRA_SAMPLES
    # Deduplicate by prompt
    seen = set()
    deduped = []
    for item in combined:
        if item["prompt"] not in seen:
            seen.add(item["prompt"])
            deduped.append(item)

    with open(target_path, "w", encoding="utf-8") as f:
        for item in deduped:
            f.write(json.dumps(item) + "\n")

    print(f"[SUCCESS] Dataset updated with {len(deduped)} high quality DPO pairs at {target_path}")


if __name__ == "__main__":
    main()
