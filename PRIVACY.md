# Privacy Policy for StudyFlow

**Last updated:** September 2026

StudyFlow ("the extension") is a Chrome extension that provides AI-generated explanations and dictionary definitions for words and phrases you highlight on webpages, YouTube, and Netflix. This page explains what data the extension handles and how.

## What data is processed

When you highlight a word or phrase, or click a word in a subtitle popup, the extension sends the following to its backend server in order to generate an explanation:

- The highlighted word or phrase itself
- A short snippet of surrounding text (the sentence it appeared in), used to give the explanation proper context
- Your selected explanation language and length preference, if you've changed them from the default

This data is sent only at the moment you actively highlight or click a word — the extension does not continuously monitor, scan, or transmit anything you haven't specifically selected.

## How that data is used

The word/phrase and context are sent to:
- **Groq's API**, to generate the AI explanation (simple definition, context, memory tip, example)
- **Merriam-Webster's Dictionary API**, to retrieve a formal definition

Neither of these requests includes your name, email, browsing history, or any other identifying information — only the specific text you selected.

## What is stored, and where

The extension uses Chrome's local storage (`chrome.storage.local`) to save, entirely on your own device:
- Words you've chosen to save for later review
- Your settings (dark mode, explanation language, explanation length, on/off toggle)

None of this is transmitted to or stored on any server. It stays on your device and is only accessible to the extension itself. Uninstalling the extension removes this data.

## What is not collected

StudyFlow does not collect, store, or sell:
- Your browsing history
- Personal identifying information (name, email, location, etc.)
- Full page contents — only the specific text you highlight or click is ever sent anywhere

## Third-party services

Because StudyFlow relies on external APIs to generate explanations and definitions, the text you highlight is subject to the respective privacy policies of:
- [Groq](https://groq.com/privacy-policy/)
- [Merriam-Webster](https://www.merriam-webster.com/about-us/privacy-policy)

## Permissions

The extension requests access to all webpages (`<all_urls>`) because its core function — highlighting text to get an explanation — needs to work on any page you visit, including YouTube and Netflix for subtitle support. This permission is used solely to detect text selection and display the explanation tooltip; it is not used to read, log, or transmit page content beyond what you explicitly highlight.

## Changes to this policy

If this policy changes, the updated version will be posted here with a revised "Last updated" date.

## Contact

Questions about this policy or how StudyFlow handles data can be directed via [the extension's GitHub repository](https://github.com/vanshthadani/V2_Main).
