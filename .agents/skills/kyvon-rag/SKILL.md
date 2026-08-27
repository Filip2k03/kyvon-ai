---
name: kyvon-rag
description: Searches the 600-Method AI Engineering & LLM Training Taxonomy in sub-millisecond in-memory BM25 retrieval.
---

# KYVON 600-Method Taxonomy Retrieval Skill

Use this skill when retrieving mathematical formulations, training algorithms, DPO triplet structures, RingAttention formulas, or formal verification papers from the local taxonomy.

## Commands

1. **Direct Hybrid Search**:
   ```bash
   kyvon brain "<query>"
   ```

2. **Native Go Binary Direct Query**:
   ```bash
   kyvon-rag -q "<query>"
   ```

3. **In-Memory HTTP Daemon**:
   ```bash
   curl -s "http://127.0.0.1:8095/query?q=<query>"
   ```
