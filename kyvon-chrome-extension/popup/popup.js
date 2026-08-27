document.addEventListener("DOMContentLoaded", async () => {
  const promptInput = document.getElementById("prompt-input");
  const btnAudit = document.getElementById("btn-audit");
  const btnSidePanel = document.getElementById("btn-sidepanel");

  // Auto-populate from selection on active tab if available
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection()?.toString() || ""
      });
      if (result?.result) {
        promptInput.value = result.result;
      }
    }
  } catch (e) {
    // Ignore tab access errors on chrome:// pages
  }

  btnAudit.addEventListener("click", async () => {
    const text = promptInput.value.trim();
    if (!text) return;

    await chrome.storage.local.set({
      pendingQuery: {
        text: text,
        mode: "audit",
        timestamp: Date.now()
      }
    });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.windowId) {
      await chrome.sidePanel.open({ windowId: tab.windowId });
      window.close();
    }
  });

  btnSidePanel.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.windowId) {
      await chrome.sidePanel.open({ windowId: tab.windowId });
      window.close();
    }
  });
});
