// ai.js - placeholder for AI backend integration
export async function callAi(endpoint, payload) {
  // replace with real fetch to backend or third-party API
  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(r => r.json());
}
