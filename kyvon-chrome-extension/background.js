// ==============================================================================
// ⚡ KYVON Chrome Extension — Background Service Worker (Manifest V3)
// ==============================================================================

const ENDPOINT = "https://ctoai.reiwasakura.tech/v1/chat/completions";
const DEFAULT_KEY = "";

// Initialize Context Menus & Storage on Install
chrome.runtime.onInstalled.addListener(async () => {
  // Ensure default configuration in storage
  const stored = await chrome.storage.local.get(["apiKey", "endpoint", "model"]);
  if (!stored.apiKey) {
    await chrome.storage.local.set({
      apiKey: DEFAULT_KEY,
      endpoint: ENDPOINT,
      model: "ctoai-core"
    });
  }

  // Create Context Menus
  chrome.contextMenus.create({
    id: "kyvon-audit-selection",
    title: "⚡ Audit Selection with KYVON (50-Condition Matrix)",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "kyvon-explain-selection",
    title: "🧠 Explain Architecture & Invariants",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "kyvon-open-sidepanel",
    title: "🚀 Open KYVON Side Panel",
    contexts: ["all"]
  });
});

// Handle Context Menu Actions
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.windowId) return;

  if (info.menuItemId === "kyvon-open-sidepanel") {
    await chrome.sidePanel.open({ windowId: tab.windowId });
    return;
  }

  if (info.menuItemId === "kyvon-audit-selection" || info.menuItemId === "kyvon-explain-selection") {
    const selectedText = info.selectionText || "";
    if (!selectedText.trim()) return;

    // Save pending query in storage and open Side Panel
    await chrome.storage.local.set({
      pendingQuery: {
        text: selectedText,
        mode: info.menuItemId === "kyvon-audit-selection" ? "audit" : "explain",
        timestamp: Date.now()
      }
    });

    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

// Message Passing Listener for Extension Pages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_SIDE_PANEL") {
    (async () => {
      try {
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (currentTab?.windowId) {
          await chrome.sidePanel.open({ windowId: currentTab.windowId });
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: "No active window found" });
        }
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep channel open for async response
  }

  if (message.type === "GET_ACTIVE_TAB_CONTENT") {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
          sendResponse({ success: false, error: "No active tab" });
          return;
        }

        const [injection] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => ({
            title: document.title,
            url: window.location.href,
            selectedText: window.getSelection()?.toString() || "",
            bodySnippet: document.body.innerText.slice(0, 4000)
          })
        });

        sendResponse({ success: true, data: injection.result });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }
});
