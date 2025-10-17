// reader.js - stub for summary and QA
export async function summarize(text) {
  // very naive
  const sents = text.split(/(?<=[。.?!\n])/).map(s => s.trim()).filter(Boolean);
  return sents.slice(0, 5).map(s => ({ text: s, snippet: s }));
}

export async function ask(text, question) {
  return { answer: 'Stub answer: ' + (question || '') };
}
