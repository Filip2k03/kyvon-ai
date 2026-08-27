#!/usr/bin/env bash
# =============================================================================
# GitLab Webhook Simulation Script for KYVON CTO Bot
# Simulates /KyvonCTOreview and /KyvonCTOtrain slash commands
# =============================================================================

WEBHOOK_URL="${1:-https://ctoai.reiwasakura.tech/api/gitlab/webhook}"
SECRET_TOKEN="${2:-sakura_kyvon_webhook_secret_2026}"
COMMAND="${3:-/KyvonCTOreview}"

echo "=========================================================="
echo " Sending simulated GitLab Note Hook: $COMMAND to $WEBHOOK_URL"
echo "=========================================================="

curl -i -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Gitlab-Token: $SECRET_TOKEN" \
  -H "X-Gitlab-Event: Note Hook" \
  -d "{
    \"object_kind\": \"note\",
    \"user\": {
      \"name\": \"Sakura CTO\",
      \"username\": \"sakuraCTO\"
    },
    \"project\": {
      \"id\": 1,
      \"name\": \"yamato-core\",
      \"web_url\": \"https://gitlab.reiwasakura.tech/root/yamato-core\"
    },
    \"merge_request\": {
      \"id\": 10,
      \"iid\": 1,
      \"title\": \"Add high-throughput search and async batch API\",
      \"description\": \"Implements memory-optimized Go and TypeScript endpoints.\"
    },
    \"object_attributes\": {
      \"id\": 99,
      \"note\": \"$COMMAND\",
      \"noteable_type\": \"MergeRequest\",
      \"url\": \"https://gitlab.reiwasakura.tech/root/yamato-core/-/merge_requests/1#note_99\"
    }
  }"

echo ""
echo "=========================================================="
