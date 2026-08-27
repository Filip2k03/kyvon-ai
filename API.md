# API Specification

## 1. Real-Time Chat WebSocket API (`ws://` / `wss://`)

- **Handshake**: Bearer token via `Sec-WebSocket-Protocol` or query parameter.
- **Payloads**: JSON framed message protocol:
  - `JOIN_CHANNEL`: `{ "type": "JOIN_CHANNEL", "channelId": string }`
  - `SEND_MESSAGE`: `{ "type": "SEND_MESSAGE", "channelId": string, "content": string }`
  - `TYPING_INDICATOR`: `{ "type": "TYPING", "channelId": string }`

## 2. KYVON CTO Engine API (`https://ctoai.reiwasakura.tech/v1`)

- `POST /v1/chat/completions`: OpenAI-compatible SSE streaming endpoint for code auditing and 50-condition architecture evaluation.
- `POST /api/ci/gatekeeper`: CI/CD webhook gatekeeper evaluating uncommitted git diffs.
- `GET /healthz`: System health check endpoint.
