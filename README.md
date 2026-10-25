# AI Micro-Lab: Your Vibe Coding Sandbox

A small React app for chatting with AI models (Claude, Gemini, GPT) through [OpenRouter](https://openrouter.ai), built so you can practice **vibe coding**: describing what you want in plain English and letting an AI agent write the code while you steer.

**Stack:** React + Vite + Tailwind CSS + Lucide icons. No backend, no database.

---

## Quickstart (3 steps)

You need [Node.js](https://nodejs.org) 18 or newer and a free [OpenRouter account](https://openrouter.ai) with a key from <https://openrouter.ai/keys>. Add a few dollars of credits at <https://openrouter.ai/credits> to use paid models.

1. **Get the code**
   ```bash
   git clone <repo-url> ai-micro-lab
   cd ai-micro-lab
   ```
2. **Add your key**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and replace `your_openrouter_key_here` with your real key.
3. **Run it**
   ```bash
   npm install
   npm run dev
   ```
   Your browser opens at <http://localhost:5173>. Type a prompt, pick a model, press **Send** (or Cmd/Ctrl + Enter).

> If you edit `.env` while the app is running, stop it (Ctrl + C) and run `npm run dev` again.

### Secret safety

- `.env` is listed in `.gitignore`, so git will never upload it. Only put your key in `.env`, nowhere else.
- This app calls OpenRouter **from the browser**, so your key is visible in your browser's DevTools. That's fine on your own computer with your own key. **Do not deploy this app publicly** (a real product would add a server in the middle).
- If you ever leak a key, delete it at <https://openrouter.ai/keys> and make a new one. In OpenRouter you can also set a spending limit on each key.

---

## Set up an AI coding agent in VS Code (Cline or Roo Code)

1. Open this folder in VS Code. Click **Install** when it suggests the recommended extensions (Cline, Roo Code, Prettier, Tailwind CSS IntelliSense). You only need one of Cline or Roo Code.
2. Click the Cline (or Roo Code) icon in the sidebar and open its **Settings** (gear icon).
3. Set **API Provider** to **OpenRouter**.
4. Paste your OpenRouter key into **OpenRouter API Key**. (The agent stores this itself. It's separate from your `.env`.)
5. Choose a **Model**, for example `anthropic/claude-sonnet-5.5`. Pick a cheaper model for small tweaks.
6. Save, then try: _"Change the header gradient to green and blue."_

The files `CLAUDE.md` and `.cursorrules` teach the agent this project's rules (small edits, plain-English explanations, run the build before saying "done", never touch your `.env`). You don't have to do anything with them.

---

## The Vibe Coder's Playbook

1. **Scope small.** Ask for one thing at a time. "Add a clear button under the response box" works. "Make this a full chat app with accounts" doesn't. Small steps are easier to check and easier to undo.
2. **Be specific.** Say _where_ and _what_: "In `StatusBar.jsx`, make the success text bigger." Mention how it should look and behave.
3. **Feed errors back.** When something breaks, copy the **exact** error text and paste it to the AI. Check two places: the red error overlay in the browser, and the browser console (right-click, Inspect, Console). Add what you were doing when it broke.
4. **Commit as a save-state.** When something works, save it before trying the next thing:
   ```bash
   git add .
   git commit -m "Add dark mode toggle"
   ```
   If the AI wrecks things, go back with `git restore .` (discards uncommitted changes) or ask for help to roll back.
5. **Read the explanation.** The agent should tell you what it changed in two sentences. If you don't understand it, ask: _"Explain that like I'm new to coding."_ You're the pilot. The AI is the co-pilot.
6. **Let the AI check its work.** Ask it to run `npm run build` after changes.

---

## Hands-On Challenges

Do them in order, and commit after each one. Write your own prompts. Example prompts are hints, not answers.

### Challenge 1: UI. Colors and a dark/light toggle

Customize the dashboard colors, then add a dark/light mode toggle button in the header (use the `Sun` and `Moon` icons from `lucide-react`).

- Tailwind is already set up with `darkMode: "class"`, so adding or removing a `dark` class on the page's top element switches modes.
- The app currently uses dark colors everywhere, so the AI will need to add light-mode versions (like `bg-white dark:bg-slate-950`).
- Try: _"Add a theme toggle button in the header that switches between light and dark mode. Make the light theme look clean and modern."_

### Challenge 2: Feature. Prompt history in `localStorage`

Keep a list of past prompts that survives page refreshes. Clicking one puts it back in the prompt box. Add a "Clear history" button.

- `localStorage` is a small storage area in the browser. It keeps text, so the AI will use `JSON.stringify` / `JSON.parse`.
- Try: _"Save each prompt I send to localStorage and show the last 10 in a list under the prompt box. Clicking one should fill the textarea."_
- Test it by sending a few prompts and refreshing the page.

### Challenge 3: AI logic. "Critique and Refine"

Add a **Critique and Refine** button that appears after a response. When clicked, it sends the AI's answer back to the model with a prompt like _"Critique this answer, then rewrite it to be better"_ and shows the improved version.

- You'll need to work with `src/hooks/useOpenRouter.js` and `src/App.jsx`.
- Stretch goals: show original and refined side by side, or let the user pick a different model for the critique step.
- Try: _"Add a Critique and Refine button under the response. It should send the current response to the model asking it to critique and improve it, then replace the response with the result."_

---

## Project Map

```
src/
  App.jsx                  Page layout and selected model
  components/              Header, ModelSwitcher, PromptTester, ResponseViewer, StatusBar
  hooks/useOpenRouter.js   Loading / response / error / token state
  services/openrouter.js   The one file that talks to OpenRouter
  services/models.js       The models in the dropdown (edit this to add more)
```

### Changing the models

Open `src/services/models.js` and edit the list. IDs must match <https://openrouter.ai/models> exactly. OpenRouter retires older models over time, so if you get a "model not found" error, look up the current ID.

### Troubleshooting

| Problem                       | Fix                                                                         |
| ----------------------------- | --------------------------------------------------------------------------- |
| "No API key found"            | Make sure `.env` exists (not just `.env.example`), then restart `npm run dev` |
| `401` error                   | Key is wrong or was deleted. Re-copy it from openrouter.ai/keys              |
| `402` error                   | Out of credits. Add some at openrouter.ai/credits                           |
| `404` / "model not found"     | Model ID is outdated. Check openrouter.ai/models                            |
| Blank page                    | Open the browser console, copy the error, and paste it to your AI agent     |
| `npm: command not found`      | Install Node.js from nodejs.org, then reopen the terminal                   |
