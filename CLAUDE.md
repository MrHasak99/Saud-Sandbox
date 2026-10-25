# Project Guide for AI Coding Agents

This is a **beginner's learning sandbox** ("AI Micro-Lab"). The human you are helping is new to coding and is learning to build software with AI. Be careful, clear, and kind.

## Stack

- React 18 + Vite 5 (plain JavaScript / JSX, no TypeScript)
- Tailwind CSS 3 (utility classes only, no custom CSS files)
- Lucide React for icons
- OpenRouter (`https://openrouter.ai/api/v1/chat/completions`), called directly from the browser

## Project Map

```
src/
  App.jsx                  Page layout, owns selected-model state
  components/              Small UI pieces (Header, ModelSwitcher, PromptTester, ResponseViewer, StatusBar)
  hooks/useOpenRouter.js   Loading / response / error / token-usage state
  services/openrouter.js   The ONLY file that calls the OpenRouter API
  services/models.js       The list of models in the dropdown
```

## Rules You Must Follow

1. **Make atomic, incremental changes.** One small feature or fix per step. Do not bundle unrelated edits.
2. **Never remove existing imports** and never wipe or rewrite a whole file unless the user explicitly asks. Edit only the lines that need to change.
3. **Explain every edit in exactly 2 simple sentences, with no jargon.** Say what changed and why, as if to a friend who has never coded.
4. **Verify before saying "done".** Run `npm run build` and confirm it passes. Tell the user to check the browser and the console for errors. Never claim something works if you did not check.
5. **Ask before adding dependencies**, and prefer what is already installed.
6. **Keep it simple.** Prefer readable code over clever code. Add short comments where a beginner might be confused.

## Secrets: Hard Rules

- **Never read, print, edit, or commit `.env` or any `.env.*` file** (except `.env.example`).
- **Never hardcode an API key** in source files, docs, or chat output.
- If you add a new setting, add it to `.env.example` with a placeholder value only.
- Client-side env vars must start with `VITE_`.
- Do not weaken `.gitignore`.

## API Notes

- Key comes from `import.meta.env.VITE_OPENROUTER_API_KEY`.
- Request format is OpenAI-compatible: `{ model, messages: [{ role, content }] }`.
- Model IDs must match OpenRouter exactly (see https://openrouter.ai/models). Edit them only in `src/services/models.js`.
- Env changes require restarting `npm run dev`.

## Commands

- `npm install` install dependencies
- `npm run dev` start the dev server at http://localhost:5173
- `npm run build` production build (use this as your verification check)
