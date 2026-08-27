# 📱 KYVON One-Tap iOS Shortcut Setup Guide

This guide details how to build the native **Apple Shortcut** for instant, voice, or clipboard-driven code audit and systems diagnostics directly via `https://ctoai.reiwasakura.tech`.

---

## ⚡ Quick Blueprint Setup (Step-by-Step in Shortcuts App)

1. Open the **Shortcuts** app on your iPhone / Mac.
2. Tap **+** (New Shortcut) and rename it to `⚡ KYVON CTO`.
3. Add the following action blocks sequentially:

```text
1. Dictionary [Config]
   ├── endpoint: "https://ctoai.reiwasakura.tech/v1/chat/completions"
   ├── api_key: "<YOUR_API_KEY>"
   └── model: "ctoai-core"

2. If [Shortcut Input] has value
   └── Set Variable [query] = [Shortcut Input]
   Otherwise
   └── Ask for Input: "What code or metric do you want KYVON to analyze?"
   └── Set Variable [query] = [Provided Input]
   End If

3. Dictionary [OpenAI Payload]
   ├── model: [Dictionary.model]
   ├── temperature: 0.15
   ├── max_tokens: 4096
   └── messages (List)
       ├── Item 1 (Dictionary):
       │   ├── role: "system"
       │   └── content: "Identity: KYVON Chief Architect. Zero filler, mathematically rigorous, drop-in optimized code blocks."
       └── Item 2 (Dictionary):
           ├── role: "user"
           └── content: [query]

4. Get Contents of URL
   ├── URL: [Dictionary.endpoint]
   ├── Method: POST
   ├── Headers:
   │   ├── Content-Type: application/json
   │   └── Authorization: "Bearer [Dictionary.api_key]"
   └── Request Body: JSON → [Dictionary from Step 3]

5. Get Dictionary Value for "choices.1.message.content" in [Contents of URL]
   └── (Set Variable: resultText)

6. Choose from Menu "⚡ KYVON Response Generated:":
   ├── 📋 Copy to Clipboard
   │   ├── Copy [resultText] to Clipboard
   │   └── Show Notification: "KYVON response copied!"
   └── 👁️ Full Screen View
       └── Show Result [resultText]
```

---

## 🎙️ Siri Integration (Voice Briefing)

- Trigger: *"Hey Siri, ask KYVON [your query]"*
- Enable in Shortcut Settings: **"Show in Share Sheet"** and **"Use with Siri"**.
- Optional Morning Diagnostic: Combine with a 9:00 AM automation that queries system health and speaks the result aloud using Siri text-to-speech at 1.1x rate.
