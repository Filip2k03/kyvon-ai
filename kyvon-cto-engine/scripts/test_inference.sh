#!/usr/bin/env bash
# =============================================================================
# KYVON vLLM & CTO Engine Inference Test Script
# =============================================================================

ENDPOINT="${1:-https://kyvon.reiwasakura.tech/v1/chat/completions}"
API_KEY="${2:-YOUR_SECURE_KYVON_KEY}"

echo "=========================================================="
echo " Testing KYVON Inference at: $ENDPOINT"
echo "=========================================================="

curl -i -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "model": "kyvon-core",
    "messages": [
      {
        "role": "system",
        "content": "Identity: KYVON Autonomous Engine. Evaluate code against 50 conditions. Return strict JSON."
      },
      {
        "role": "user",
        "content": "Optimize this Go loop searching an unindexed slice:\nfor _, v := range list { if v.ID == target { return v } }"
      }
    ],
    "temperature": 0.2,
    "max_tokens": 1024
  }'

echo ""
echo "=========================================================="
