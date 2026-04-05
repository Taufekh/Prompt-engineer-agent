/* ============================================================
   Prompt Engineer Agent — app.js
   ============================================================ */

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL   = 'claude-sonnet-4-20250514';

let lastPrompt = '';
let lastTopic  = '';

/* ── API key management ─────────────────────────────────── */

function getApiKey() {
  return sessionStorage.getItem('anthropic_api_key') || '';
}

function saveKey() {
  const key = document.getElementById('api-key').value.trim();
  if (!key.startsWith('sk-ant-')) {
    alert('That doesn\'t look like a valid Anthropic API key (should start with sk-ant-).');
    return;
  }
  sessionStorage.setItem('anthropic_api_key', key);
  document.getElementById('api-key').value = '••••••••••••••••••••';
  document.getElementById('save-key-btn').textContent = '✓ Saved';
  document.getElementById('api-key-section').classList.add('saved');
}

/* ── Core API call ──────────────────────────────────────── */

async function callClaude(system, userMessage) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('No API key found. Please enter your Anthropic API key above.');
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  return res.json();
}

/* ── Generate prompt ────────────────────────────────────── */

async function generatePrompt() {
  const topic = document.getElementById('topic').value.trim();
  if (!topic) { document.getElementById('topic').focus(); return; }

  const style   = document.getElementById('style').value;
  const llm     = document.getElementById('llm').value;
  const btn     = document.getElementById('gen-btn');

  setLoading(true);

  const styleDesc = {
    concise:    'concise, direct, minimal fluff',
    detailed:   'detailed, thorough, comprehensive',
    creative:   'creative, exploratory, open-ended',
    structured: 'structured, analytical, step-by-step',
  }[style];

  const llmNote = llm === 'general'
    ? ''
    : ` optimized for ${llm === 'gpt' ? 'GPT-4/4o' : llm.charAt(0).toUpperCase() + llm.slice(1)}`;

  const system = `You are an expert prompt engineer. Your job is to take a topic or task description and craft an elegant, precise, and highly effective prompt that can be imported into an LLM.

Rules for the prompt you craft:
- Be specific and clear — remove ambiguity
- Use the right structure (role, context, task, constraints, format) only when each element adds value
- Keep it as short as possible while remaining complete
- Make it immediately usable — no placeholders unless they're clearly marked as [FILL IN]
- Avoid over-engineering or being verbose
- Output style should be: ${styleDesc}${llmNote}

Respond with a JSON object in this exact format (no markdown, no backticks, just raw JSON):
{
  "prompt": "the complete engineered prompt here",
  "technique": "the main prompting technique used (e.g. Role prompting, Chain-of-thought, Few-shot, etc.)",
  "why": "one sentence on why this structure works for this task",
  "tone": "word or short phrase describing the tone"
}`;

  try {
    const data   = await callClaude(system, `Topic/task: ${topic}`);
    const raw    = data.content?.find(b => b.type === 'text')?.text || '';
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

    lastPrompt = parsed.prompt;
    lastTopic  = topic;

    document.getElementById('prompt-out').textContent = parsed.prompt;
    document.getElementById('meta-badges').innerHTML = `
      <span class="badge badge-purple">${parsed.technique}</span>
      <span class="badge badge-teal">${parsed.tone}</span>
      <span class="badge badge-amber">${styleDesc.split(',')[0]}</span>
    `;
    document.getElementById('output').style.display = 'block';
    document.getElementById('followup-section').style.display = 'none';
  } catch (e) {
    document.getElementById('prompt-out').textContent = `Error: ${e.message}`;
    document.getElementById('output').style.display = 'block';
  }

  setLoading(false);
}

/* ── Follow-up actions ──────────────────────────────────── */

async function runFollowup(systemPrompt, userMessage) {
  document.getElementById('followup-section').style.display = 'block';
  document.getElementById('followup-out').textContent = 'Thinking…';

  try {
    const data = await callClaude(systemPrompt, userMessage);
    const text = data.content?.find(b => b.type === 'text')?.text || '';
    document.getElementById('followup-out').textContent = text;
  } catch (e) {
    document.getElementById('followup-out').textContent = `Error: ${e.message}`;
  }
}

function refine() {
  if (!lastPrompt) return;
  runFollowup(
    'You are an expert prompt engineer. Refine the given prompt to be more elegant, precise, and effective. Return only the improved prompt — no explanation.',
    `Refine this prompt:\n\n${lastPrompt}`
  );
}

function variant() {
  if (!lastTopic) return;
  runFollowup(
    'You are an expert prompt engineer. Generate an alternative prompt for the same task using a different prompting technique or structure. Return only the new prompt — no explanation.',
    `Original topic: ${lastTopic}\n\nOriginal prompt:\n${lastPrompt}`
  );
}

function explain() {
  if (!lastPrompt) return;
  runFollowup(
    'You are an expert prompt engineer and educator. Explain why the given prompt is effective. Break down its structure, the technique used, and how each part contributes to the result. Be clear and concise.',
    `Explain this prompt:\n\n${lastPrompt}`
  );
}

/* ── Copy ───────────────────────────────────────────────── */

function copyPrompt() {
  if (!lastPrompt) return;
  navigator.clipboard.writeText(lastPrompt).then(() => {
    const el = document.getElementById('copy-msg');
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1800);
  });
}

/* ── UI helpers ─────────────────────────────────────────── */

function setLoading(on) {
  const btn = document.getElementById('gen-btn');
  document.getElementById('btn-icon').innerHTML = on
    ? '<span class="spinner"></span>'
    : '✨';
  document.getElementById('btn-text').textContent = on ? 'Engineering…' : 'Engineer prompt';
  btn.disabled = on;
}

/* ── Keyboard shortcut: Cmd/Ctrl + Enter ────────────────── */
document.getElementById('topic').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generatePrompt();
});

/* ── Restore saved key indicator on load ────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  if (getApiKey()) {
    document.getElementById('api-key').value = '••••••••••••••••••••';
    document.getElementById('save-key-btn').textContent = '✓ Saved';
    document.getElementById('api-key-section').classList.add('saved');
  }
});
