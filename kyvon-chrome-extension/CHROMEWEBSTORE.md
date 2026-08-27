# Chrome Web Store Listing — KYVON 0xPlus: Systems & Care Intelligence

> Single source of truth for Chrome Web Store listing metadata, permissions justifications, privacy disclosures, and publishing readiness.

---

## 1. Extension Details

| Field | Value |
|---|---|
| **Name** | KYVON 0xPlus: Systems & Care Intelligence |
| **Short Name** | KYVON |
| **Version** | 1.0.0 |
| **Primary Category** | Developer Tools |
| **Secondary Category** | Productivity |
| **Language** | English |
| **Website** | https://reiwasakura.tech |
| **Support URL** | https://thuyakyaw.com |
| **Privacy Policy URL** | https://reiwasakura.tech/privacy |

---

## 2. Store Listing Copy

### Summary (132 characters max)
Autonomous code auditing, 50-condition architecture verification, and real-time streaming AI diagnostics.

### Detailed Description
**KYVON 0xPlus** is an autonomous Chief Systems Architect and Real-Time Telemetry companion that operates directly within Google Chrome via Manifest V3.

#### 🚀 Key Features:
- **50-Condition Architecture Audit**: Instantly analyze code blocks on GitHub, GitLab, StackOverflow, or any web surface against strict complexity, security, and concurrency metrics.
- **Persistent Side Panel**: Access a dedicated streaming AI side panel with KaTeX mathematical rendering and zero-latency SSE token delivery.
- **One-Click Page Inspection**: Audit the active web page or selected text block directly with right-click context menu shortcuts.
- **Zero-Allocation Telemetry**: Built on high-performance infrastructure hosted on `ctoai.reiwasakura.tech`.

---

## 3. Permissions Justification

| Permission | Purpose & Review Justification |
|---|---|
| `sidePanel` | Required to provide a persistent, multi-turn AI chat and architecture review panel alongside the user's active browsing tab. |
| `storage` | Required to persist user configuration (API keys, active preferences) locally in `chrome.storage.local`. |
| `contextMenus` | Required to add right-click context shortcuts ("Audit Selection with KYVON", "Explain Architecture") for quick code analysis. |
| `tabs` | Required to identify the active window ID to open the side panel on the corresponding window upon user gesture. |
| `scripting` | Required to extract user-selected code snippets from the active tab when the user explicitly clicks "Inspect Page Context". |
| `activeTab` | Required to access the active tab's metadata upon direct user action. |
| `host_permissions` (`https://ctoai.reiwasakura.tech/*`) | Required to communicate with the KYVON inference and audit backend gateway over HTTPS/TLSv1.3. |

---

## 4. Privacy & Data Use Disclosure

- **Data Collection**: No personal data or browsing history is collected or sold.
- **Code Snippets**: Snippets submitted by user action are securely transmitted over TLSv1.3 to `https://ctoai.reiwasakura.tech` solely for generating the requested architecture audit.
- **Storage**: Authentication tokens and local preferences are stored securely in browser local storage and never synchronized to external ad networks.

---

## 5. Pre-Publish Checklist

- [x] `manifest_version: 3` strictly enforced
- [x] Valid PNG icons (16x16, 48x48, 128x128) generated in `icons/`
- [x] Side panel explicit open triggers implemented in Popup and Context Menus
- [x] Ephemeral service worker uses `chrome.storage.local`
- [x] Zero `eval()` or unsandboxed dynamic scripts
- [x] All permissions justified in plain English
