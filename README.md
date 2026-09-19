# StudyFlow

A Chrome extension that explains any word or phrase on the web using AI — plus dictionary definitions, YouTube/Netflix subtitle support, and video auto-pause while you look things up.

## What it does

- **Highlight any word or phrase on any webpage** to get an instant AI-generated explanation: a simple definition, why it's used in that specific sentence, a memory tip, and an example sentence — powered by Groq.
- **Dictionary definitions** alongside the AI explanation, pulled from Merriam-Webster's Collegiate Dictionary.
- **YouTube & Netflix subtitle support** — click any word in the live subtitle popup to get the same explanation. The video automatically pauses while you're looking a word up, and resumes when you're done.
- **Manual search** via the extension popup, for looking up words without needing to find them on a page.
- **Save words** you look up for later review, with delete/clear options.
- **Customizable explanations**:
  - Choose the **language** explanations are given in (English, Hindi, Spanish, French, German, Japanese).
  - Choose the **length** of explanations (Short / Medium / Long).
- **Dark mode**, and a master on/off switch for the whole extension.

## How it works

This repo is the browser extension (content scripts + popup UI). It talks to a separate backend service — [V2_Backend](https://github.com/vanshthadani/V2_Backend) — which handles the actual AI (Groq) and dictionary (Merriam-Webster) API calls, keeping API keys off the client entirely.

**Flow:** highlight a word → extension sends it to the backend → backend calls Groq for an explanation and Merriam-Webster for a definition, in parallel → both come back and render in a tooltip near the highlighted text.

## Tech stack

- Vanilla JavaScript, Manifest V3 (no frameworks)
- Content scripts injected per-site (general pages, YouTube, Netflix)
- Chrome `storage` API for settings and saved words
- Communicates with a Node/Express backend over HTTPS

## Project structure

| File | Purpose |
|---|---|
| `manifest.json` | Extension configuration and permissions |
| `content.js` | Runs on all pages — handles text selection and tooltip dismissal |
| `tooltip.js` | Builds and positions the explanation tooltip |
| `youtube.js` | YouTube-specific subtitle capture, click-to-explain, and video pause/resume |
| `netflix.js` | Netflix equivalent of `youtube.js` |
| `background.js` | Service worker — routes requests to the backend, reads user settings |
| `dict.js` | Calls the backend's dictionary endpoint |
| `popup.html` / `popup.js` / `popup.css` | Extension popup: manual search, settings, saved words |

## Setup (local development)

1. Clone this repo.
2. Go to `chrome://extensions` in Chrome.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select this repo's folder.
5. The extension icon should appear in your toolbar.

The extension is pre-configured to talk to a hosted backend instance. 

## Notes

- UI labels (e.g. "Simple Explanation") stay in English by design, since the tool is aimed at English learners — only the AI-generated explanation content is localized to the selected language.
- The extension requests broad `<all_urls>` access since highlighting works on any page — no data is collected or stored beyond what's needed to generate an explanation.
