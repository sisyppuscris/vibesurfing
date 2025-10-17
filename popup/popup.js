// Popup iframe script: communicates with content script and AI stubs
(function () {
  const promptEl = document.getElementById('prompt');
  const resultsEl = document.getElementById('results');
  const summaryBtn = document.getElementById('summary');
  const askBtn = document.getElementById('ask');
  const writeBtn = document.getElementById('write');

  // receive focus message with selected text (sent when user presses Ctrl+M)
  window.addEventListener('message', (ev) => {
    const msg = ev.data;
    if (!msg || !msg.type) return;
    if (msg.type === 'FOCUS_INPUT') {
      if (msg.text) promptEl.value = msg.text;
      promptEl.focus();
      promptEl.setSelectionRange(promptEl.value.length, promptEl.value.length);
    }
  });

  function sendToContent(type, payload) {
    window.parent.postMessage(Object.assign({ type }, payload), '*');
  }

  summaryBtn.addEventListener('click', async () => {
    resultsEl.innerText = 'Generating summary...';
    const resp = await fetchSummary(promptEl.value);
    renderSummary(resp);
  });

  askBtn.addEventListener('click', async () => {
    resultsEl.innerText = 'Answering...';
    const resp = await fetchAsk(promptEl.value);
    renderAnswer(resp);
  });

  writeBtn.addEventListener('click', async () => {
    resultsEl.innerText = 'Writing...';
    const text = await fetchWrite(promptEl.value);
    // insert into page via parent
    sendToContent('INSERT_TEXT', { text });
    resultsEl.innerText = 'Inserted.';
  });

  function renderSummary(resp) {
    resultsEl.innerHTML = '';
    if (!resp || !resp.points) {
      resultsEl.innerText = 'No summary.';
      return;
    }
    const ul = document.createElement('ul');
    resp.points.forEach((p) => {
      const li = document.createElement('li');
      li.innerText = p.text;
      li.addEventListener('click', () => {
        sendToContent('HIGHLIGHT_AND_SCROLL', { rangeInfo: { textSnippet: p.snippet } });
      });
      ul.appendChild(li);
    });
    resultsEl.appendChild(ul);
  }

  function renderAnswer(resp) {
    resultsEl.innerText = resp?.answer || 'No answer.';
  }

  // --- AI stubs (replace with real backend integration) ---
  async function fetchSummary(text) {
    // naive local summary: split into sentences and take first 3
    if (!text) return { points: [] };
    const sents = text.split(/(?<=[。.?!\n])/).map(s => s.trim()).filter(Boolean);
    const points = sents.slice(0, 5).map(s => ({ text: s.slice(0, 120), snippet: s }));
    return { points };
  }

  async function fetchAsk(text) {
    // stub: echo
    return { answer: text ? 'Stub answer based on: ' + text.slice(0, 200) : 'No context provided.' };
  }

  async function fetchWrite(text) {
    // stub: simple template
    return text ? `Dear recipient,\n\n${text}\n\nBest regards` : '';
  }

  // keyboard: Tab to accept a fake completion suggestion
  promptEl.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      // show a simple completion inline
      const val = promptEl.value || '';
      promptEl.value = val + ' — suggested completion';
    } else if (e.key === 'Enter' && e.ctrlKey) {
      // Ctrl+Enter => write
      writeBtn.click();
    }
  });

})();
