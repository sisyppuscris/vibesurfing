// content script: handle DOM interactions, selection copying, insertion, highlight/scroll
(function () {
  let panelVisible = false;

  function createPanel() {
    if (document.getElementById('vibesurfing-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'vibesurfing-panel';
    panel.style.position = 'fixed';
    panel.style.top = '0';
    panel.style.right = '0';
    panel.style.width = '360px';
    panel.style.height = '100%';
    panel.style.background = 'white';
    panel.style.boxShadow = '0 0 8px rgba(0,0,0,0.2)';
    panel.style.zIndex = 2147483647;
    panel.style.display = 'none';

    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('popup/popup.html');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';

    panel.appendChild(iframe);
    document.documentElement.appendChild(panel);
  }

  function togglePanel() {
    createPanel();
    const panel = document.getElementById('vibesurfing-panel');
    panelVisible = !panelVisible;
    panel.style.display = panelVisible ? 'block' : 'none';
    // focus iframe input via postMessage
    if (panelVisible) {
      const iframe = panel.querySelector('iframe');
      iframe.contentWindow.postMessage({ type: 'FOCUS_INPUT', text: window.getSelection().toString() }, '*');
    }
  }

  // Listen for messages from background/service worker
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === 'TOGGLE_PANEL') {
      togglePanel();
    }
  });

  // Also accept keyboard shortcut inside page (fallback): Ctrl+M
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'm') {
      e.preventDefault();
      togglePanel();
    }
  });

  // Listen for insert requests from iframe
  window.addEventListener('message', (ev) => {
    const msg = ev.data;
    if (!msg || !msg.type) return;

    if (msg.type === 'INSERT_TEXT') {
      insertTextAtActive(msg.text);
    }

    if (msg.type === 'HIGHLIGHT_AND_SCROLL' && msg.rangeInfo) {
      highlightAndScroll(msg.rangeInfo);
    }
  });

  function insertTextAtActive(text) {
    const active = document.activeElement;
    if (active && (active.tagName === 'TEXTAREA' || (active.tagName === 'INPUT' && active.type === 'text') || active.isContentEditable)) {
      // simple insertion
      if (active.isContentEditable) {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
          sel.deleteFromDocument();
          sel.getRangeAt(0).insertNode(document.createTextNode(text));
        }
      } else {
        const start = active.selectionStart || 0;
        const end = active.selectionEnd || 0;
        const val = active.value || '';
        active.value = val.slice(0, start) + text + val.slice(end);
      }
    } else {
      // no editable target: try to copy to clipboard
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  function highlightAndScroll(rangeInfo) {
    // rangeInfo: { xpath, startOffset, endOffset } or { textSnippet }
    if (rangeInfo.textSnippet) {
      const idx = document.body.innerText.indexOf(rangeInfo.textSnippet);
      if (idx >= 0) {
        // naive approach: find node containing snippet
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          const pos = node.nodeValue.indexOf(rangeInfo.textSnippet);
          if (pos >= 0) {
            const range = document.createRange();
            range.setStart(node, pos);
            range.setEnd(node, pos + rangeInfo.textSnippet.length);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            const rect = range.getBoundingClientRect();
            window.scrollBy({ top: rect.top - 80, behavior: 'smooth' });
            break;
          }
        }
      }
    }
  }
})();
