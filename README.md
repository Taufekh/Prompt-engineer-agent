# Prompt Engineer Agent

A lightweight, zero-dependency AI agent that takes any topic or task description and crafts an elegant, effective prompt ready to paste into any LLM.

Built with vanilla HTML/CSS/JS and powered by the [Anthropic API](https://www.anthropic.com/).

---

## Features

- **Instant prompt engineering** — describe a goal, get a production-ready prompt
- **Style controls** — concise, detailed, creative, or structured output
- **LLM targeting** — general, Claude, GPT-4/4o, or Gemini
- **Technique badges** — shows which prompting technique was applied and why
- **Follow-up actions** — refine, generate a variant, or get a full explanation
- **One-click copy**
- **Light/dark mode** — follows system preference
- **Zero dependencies** — single HTML file + CSS + JS, no build step

---

## Quick start

Enter your Anthropic API key in the key field at the top and start engineering prompts.

### Serve locally

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

Then open `http://localhost:8080`.

### Option 3 — Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Set source to `main` branch, `/ (root)`.
4. Your app will be live at.

---

## API key

You need an [Anthropic API key](https://console.anthropic.com/). Keys are stored in `sessionStorage` only — they are never persisted to disk and are cleared when the browser tab closes.

> **Note:** Direct browser-to-API calls require the `anthropic-dangerous-direct-browser-calls: true` header, which is set automatically. This is fine for personal/internal tools. For a production app with real users, proxy the API through your own backend to keep the key secret.

---

## Project structure

```
prompt-engineer-agent/
├── index.html      # App shell & markup
├── style.css       # All styles (light + dark mode)
├── app.js          # Agent logic & API calls
├── .gitignore
└── README.md
```

---

## Customisation

**Change the model**
Edit `MODEL` at the top of `app.js`:
```js
const MODEL = 'claude-opus-4-20250514'; // heavier, slower, smarter
```

**Add more style options**
In `index.html`, add `<option>` elements to `#style`, then add corresponding entries to the `styleDesc` map in `app.js`.

**Add more LLM targets**
Same pattern — extend the `<select id="llm">` in HTML and the `llmNote` logic in `app.js`.

**Tweak the system prompt**
The engineer prompt is in `generatePrompt()` in `app.js`. Adjust the rules to change how prompts are structured.

---

## Browser support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires:
- `fetch` API
- `navigator.clipboard`
- `sessionStorage`

---

## License

MIT — use freely, attribution appreciated.
