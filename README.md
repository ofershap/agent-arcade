# Agent Arcade

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![VS Code](https://img.shields.io/badge/Cursor-1.85+-007ACC.svg)](https://cursor.com)

A pixel art office that lives in your Cursor bottom panel. Your AI agent sits at a desk, types when it's coding, wanders around when it's idle, and celebrates when builds pass.

```
Install → Open "Agent Arcade" tab in bottom panel → done
```

> 27KB. No config. Every sprite drawn from code.

![Agent Arcade - pixel art office for Cursor AI agents](assets/demo.gif)

---

## Why This Exists

I spend a lot of time staring at a blinking cursor while agents do their thing. Checking if it's still running. Scrolling up to see if something happened. Tab-switching between the chat and whatever else I'm doing. It's fine, but it's disorienting. There's no peripheral signal telling me what state the agent is in.

I started thinking about how old-school games solved a version of this problem. Dwarf Fortress runs a whole economy in a grid of ASCII characters. The Sims made "person goes to desk and sits down" feel alive with nothing but pathfinding and a state machine. Tamagotchis kept people emotionally invested in a 32x16 pixel creature.

So I made one for my IDE. A tiny character with a desk, a bookshelf, a cat, and an arcade cabinet. When the agent works, the character works. When the agent is idle, the character gets a coffee, pets the cat, browses the bookshelf. When a build passes, it jumps.

I don't need to check the terminal anymore. I just glance at the bottom panel. If the character is at the desk, things are happening. If it's wandering, the agent is done. Took me two days to stop noticing it consciously - now it's just part of the background, like music while you work.

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

## Screenshots

| Idle | Working | Celebrating |
|---|---|---|
| ![idle](assets/idle.png) | ![working](assets/working.png) | ![celebrating](assets/celebrate.png) |

Lamp off:

![dark mode](assets/dark.png)

---

## Install

### From source

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

Agent Arcade reads Cursor's JSONL agent transcripts at `~/.cursor/projects/<workspace>/agent-transcripts/`. It watches for file changes and figures out what the agent is doing from the transcript content.

No modification to Cursor needed. Read-only, watches files Cursor already writes.

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

## Idle Behavior

When the agent isn't working, the character cycles through activities on its own:

- Standing and looking around
- Walking to the coffee mug
- Browsing the bookshelf (faces away from you)
- Petting the cat
- Playing the arcade cabinet
- Stretching
- Watering the plant
- Getting water from the cooler

Each activity has its own duration with some randomness so it doesn't feel robotic. The character walks between spots at a leisurely pace, and faster when heading to the desk for work.

---

## Tech Stack

| Component | What |
|---|---|
| Extension host | VS Code / Cursor Extension API |
| Rendering | Canvas 2D, requestAnimationFrame |
| Sprites | Procedural pixel art (no external images) |
| Build | esbuild, single-file bundle |
| Language | TypeScript (strict) |

---

## Development

```bash
git clone https://github.com/ofershap/agent-arcade.git
cd agent-arcade
npm install
npm run build          # one-shot build
npm run watch          # rebuild on save
```

Press F5 in Cursor/VS Code to launch the Extension Development Host with the extension loaded.

### Project structure

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

All sprites are generated procedurally in `sprites.ts` using `fill()` and `outline()` helpers on pixel arrays. No external image assets needed.

---

## Author

[![Made by ofershap](https://gitshow.dev/api/card/ofershap)](https://gitshow.dev/ofershap)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/ofershap)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github&logoColor=white)](https://github.com/ofershap)

## License

[MIT](LICENSE) &copy; [Ofer Shapira](https://github.com/ofershap)
