// ==============================================================================
// ⚡ KYVON Side Panel Controller (SSE Streaming & Active Tab Ingestion)
// ==============================================================================

const ENDPOINT = "https://ctoai.reiwasakura.tech/v1/chat/completions";
const DEFAULT_KEY = "";

let conversationHistory = [
  {
    role: "system",
    content: "Identity: KYVON 0xPlus Autonomous Architecture & Side Panel Agent. Analyze code diffs, evaluate 50-condition security matrices, and output drop-in implementations."
  }
];

function formatMessage(text) {
  // Replace Math patterns ($$..$$ and $..$) with KaTeX
  let formatted = text;
  if (window.katex) {
    formatted = formatted.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      try { return window.katex.renderToString(math, { displayMode: true, throwOnError: false }); }
      catch (e) { return math; }
    });
    formatted = formatted.replace(/\$([^$]+)\$/g, (_, math) => {
      try { return window.katex.renderToString(math, { displayMode: false, throwOnError: false }); }
      catch (e) { return math; }
    });
  }

  if (window.marked) {
    return window.marked.parse(formatted);
  }
  return formatted;
}

function appendMessage(role, initialContent = "") {
  const stream = document.getElementById("chat-stream");
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}`;

  const meta = document.createElement("div");
  meta.className = "msg-meta";
  meta.textContent = role === "user" ? "YOU" : "KYVON CORE";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = formatMessage(initialContent);

  msgDiv.appendChild(meta);
  msgDiv.appendChild(bubble);
  stream.appendChild(msgDiv);
  stream.scrollTop = stream.scrollHeight;

  return {
    update(content) {
      bubble.innerHTML = formatMessage(content);
      stream.scrollTop = stream.scrollHeight;
    }
  };
}

async function streamPrompt(userText, systemDirective = null) {
  appendMessage("user", userText);
  conversationHistory.push({ role: "user", content: userText });

  const aiMsg = appendMessage("ai", "⚡ Processing query against ctoai engine...");
  let accumulated = "";

  try {
    const { apiKey = DEFAULT_KEY, endpoint = ENDPOINT } = await chrome.storage.local.get(["apiKey", "endpoint"]);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "ctoai-core",
        messages: conversationHistory,
        stream: true,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        const clean = line.trim();
        if (!clean || clean.startsWith(":")) continue;

        if (clean.startsWith("data: ")) {
          const payload = clean.slice(6);
          if (payload === "[DONE]") break;

          try {
            const parsed = JSON.parse(payload);
            const token = parsed.choices?.[0]?.delta?.content || "";
            accumulated += token;
            aiMsg.update(accumulated);
          } catch (e) {
            // Buffer partial json
          }
        }
      }
    }

    if (accumulated) {
      conversationHistory.push({ role: "assistant", content: accumulated });
    }
  } catch (err) {
    aiMsg.update(`⚠️ **Connection Error**: ${err.message}`);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const sideInput = document.getElementById("side-input");
  const sideSend = document.getElementById("side-send");
  const chipInspect = document.getElementById("chip-inspect");
  const chipAudit = document.getElementById("chip-audit");
  const chipClear = document.getElementById("chip-clear");

  // Check for pending queries from Context Menu / Popup
  const { pendingQuery } = await chrome.storage.local.get("pendingQuery");
  if (pendingQuery && pendingQuery.text) {
    await chrome.storage.local.remove("pendingQuery");
    streamPrompt(`Audit/Evaluate this context:\n\n${pendingQuery.text}`);
  }

  sideSend.addEventListener("click", () => {
    const text = sideInput.value.trim();
    if (!text) return;
    sideInput.value = "";
    streamPrompt(text);
  });

  sideInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const text = sideInput.value.trim();
      if (!text) return;
      sideInput.value = "";
      streamPrompt(text);
    }
  });

  chipInspect.addEventListener("click", async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;

      const [res] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => ({
          title: document.title,
          url: window.location.href,
          selection: window.getSelection()?.toString() || "",
          textSample: document.body.innerText.slice(0, 2000)
        })
      });

      if (res?.result) {
        const info = res.result;
        const query = info.selection
          ? `Selected code on ${info.title}:\n\n${info.selection}`
          : `Active page (${info.url}):\n\n${info.textSample}`;
        streamPrompt(`Analyze this page context against the 50-condition architecture matrix:\n\n${query}`);
      }
    } catch (e) {
      alert("Unable to inspect active tab on restricted pages.");
    }
  });

  chipAudit.addEventListener("click", () => {
    sideInput.value = "Run 50-condition CTO audit on ";
    sideInput.focus();
  });

  chipClear.addEventListener("click", () => {
    document.getElementById("chat-stream").innerHTML = "";
    conversationHistory = conversationHistory.slice(0, 1);
  });
});
