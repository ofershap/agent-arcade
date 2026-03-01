# Agent Arcade - Pixel Art Office for Your Cursor AI Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![VS Code](https://img.shields.io/badge/Cursor-1.85+-007ACC.svg)](https://cursor.com)

Your AI agent gets a tiny office. It sits at the desk when coding, wanders around on breaks, celebrates when builds pass. You can click things while you wait.

```
Install → Open "Agent Arcade" tab in bottom panel → done
```

> 27KB total. No paid assets, no frameworks, no config. Pure Canvas 2D pixel art drawn from code.

![Agent Arcade pixel art office - AI agent working at desk, wandering idle, celebrating builds](assets/demo.gif)

---

## What Happens

The extension watches Cursor's agent transcript files. When the agent writes code, the character walks to the desk and types. When it reads files, the bubble says so. When it finishes, it celebrates.

Between tasks, the character has a life of its own. Coffee breaks, browsing the bookshelf, petting the cat, stretching. Click any object and the character notices - walks over after a short delay to check it out.

| Agent doing | Character does |
|---|---|
| Writing / editing code | Sits at desk, types (back to you) |
| Reading files | At desk, speech bubble shows what |
| Running commands | At desk with status bubble |
| Idle / thinking | Wanders the office, interacts with objects |
| Build passes | Jumps and celebrates |

---

## Interactive Objects

Everything in the office is clickable.

| Object | What it does |
|---|---|
| Lamp | Toggle room lights on/off |
| Window | Open/close curtains (sky changes with real time of day) |
| Arcade cabinet | Cycles through mini-games on screen (Space Invaders, Tetris, Pong) |
| Bookshelf | Shows book titles one by one |
| Water cooler | Bubble animation |
| Plant | Grows through 3 stages as you click (water it!) |
| Cat | Nudges it - purrs, wanders back |
| Coffee mug | Steam animation |

Click any object while the agent is idle and the character walks over to it after a beat.

---

## Install

### From source (current)

```bash
git clone https://github.com/ofershap/agent-arcade.git
cd agent-arcade
npm install
npm run build
npx vsce package --no-dependencies
```

Then in Cursor: `Cmd+Shift+P` > "Install from VSIX" > select `agent-arcade-0.1.0.vsix`.

The panel appears as a tab in the bottom panel bar (next to Terminal, Output, etc).

### From marketplace

Coming soon.

---

## How It Works

Agent Arcade reads Cursor's JSONL agent transcripts at `~/.cursor/projects/<workspace>/agent-transcripts/`. It watches for file changes and infers what the agent is doing from the transcript content - writing, reading, running commands, searching, or idle.

No modification to Cursor is needed. It's read-only observation of transcript files that Cursor already writes.

```
Cursor writes JSONL transcript
    ↓
FileWatcher detects change
    ↓
TranscriptParser infers activity (typing/reading/running/idle)
    ↓
postMessage to webview
    ↓
Character walks to desk / wanders / celebrates
```

---

## Project Structure

```
src/
├── extension.ts          # Extension entry, registers panel
├── panelProvider.ts       # WebviewViewProvider, HTML injection
├── cursorWatcher.ts       # Watches transcript dirs for changes
└── transcriptParser.ts    # Parses JSONL, infers agent activity

webview/
├── index.ts              # Canvas setup, event handlers, message bridge
├── office.ts             # Renders walls, floor, lighting, z-sorting
├── character.ts          # Movement, idle waypoints, speech bubbles
├── objects.ts            # All interactive objects (arcade, plant, cat...)
├── sprites.ts            # Programmatic pixel art sprite generation
├── hitTest.ts            # Click and hover detection
├── gameLoop.ts           # requestAnimationFrame loop
├── canvas.ts             # Shared drawing utils
└── types.ts              # TypeScript interfaces
```

All sprites are generated procedurally in `sprites.ts` using `fill()` and `outline()` helpers on pixel arrays. No external image assets.

---

## Idle Behavior

When the agent isn't working, the character cycles through activities on its own:

- Standing and looking around
- Walking to the coffee mug
- Browsing the bookshelf (faces away from you)
- Petting the cat
- Playing the arcade cabinet
- Stretching (arms up)
- Watering the plant
- Getting water from the cooler

Each activity has its own duration with some randomness so it doesn't feel robotic. The character walks between spots at a leisurely pace, and faster when heading to the desk for work.

---

## Screenshots

| Idle | Working | Celebrating |
|---|---|---|
| ![idle](assets/idle.png) | ![working](assets/working.png) | ![celebrating](assets/celebrate.png) |

Lamp off:

![dark mode](assets/dark.png)

---

## Author

[![Made by ofershap](https://gitshow.dev/api/card/ofershap)](https://gitshow.dev/ofershap)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/ofershap)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github&logoColor=white)](https://github.com/ofershap)

## License

[MIT](LICENSE) &copy; [Ofer Shapira](https://github.com/ofershap)
