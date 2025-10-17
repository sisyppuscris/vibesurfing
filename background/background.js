// background service worker: listen for command and forward to content script / popup
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-vibesurfing') {
    // send a message to the active tab to toggle the panel
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_PANEL' });
      }
    });
  }
});

// optional: onInstalled setup
chrome.runtime.onInstalled.addListener(() => {
  console.log('vibesurfing installed');
});
