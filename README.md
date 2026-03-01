# Cursor Office

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![VS Code](https://img.shields.io/badge/Cursor-1.85+-007ACC.svg)](https://cursor.com)

Your AI agent writes your code, reads your files, runs your tests, and fixes your bugs. The least you can do is give it an office.

**Warning: once you install this, a Cursor window without a tiny pixel office at the bottom will feel broken forever.**

```
Install → Open "Cursor Office" in bottom panel (Cmd+Shift+.) → done
```

> 27KB. No config. Every sprite drawn from code. Zero images.

![Cursor Office - pixel art office for Cursor AI agents](assets/demo.gif)

---

## The Pitch

You outsourced your job to an AI agent. It writes code for hours while you get coffee, scroll Twitter, or pretend to be in a meeting. But does it get a desk? A window? A coffee mug? No. It works in a void. A terminal. A blinking cursor.

That's not how you treat an employee.

**Cursor Office** gives your agent a proper workspace. A desk with a monitor. A bookshelf. A cat. An arcade cabinet for breaks. A window with a real sky that matches your actual time of day. When it writes code, it sits at the desk and types. When it reads files, it reads files. When it finishes a build, it stands up and celebrates. When it's idle, it gets coffee, pets the cat, waters the plant.

You don't need to check the terminal anymore. Glance at the bottom panel. Character at the desk — things are happening. Character wandering — the agent is done. You'll stop noticing it after a day, the same way you stop noticing background music. It's just ambient awareness.

Your agent works hard. Give it an office.

---

## What the Agent Does All Day

| Agent activity | What you see |
|---|---|
| Writing / editing code | Sits at desk, types away (back to you, like a real employee) |
| Reading files | At desk, speech bubble shows which file |
| Running commands | At desk with status bubble |
| Idle / between tasks | Wanders the office — coffee, bookshelf, cat, arcade |
| Build passes | Jumps up and celebrates |

---

## Office Amenities

Everything is clickable. Your agent's office is better than yours.

| Object | What happens |
|---|---|
| Lamp | Toggle room lights (the agent works late too) |
| Window | Open/close curtains — sky matches real time of day, stars at night |
| Arcade cabinet | Cycles through Space Invaders, Tetris, and Pong on the screen |
| Bookshelf | Shows book titles: Clean Code, SICP, Design Patterns... |
| Water cooler | Bubble animation — hydration matters |
| Plant | Grows through 3 stages when you water it (click it!) |
| Cat | Nudge it — purrs, wanders off, comes back |
| Coffee mug | Steam rises — it's always fresh |
| Roomba | Enters every few minutes to clean the floor. Even agents deserve a clean office |

Click any object while idle and the character walks over to check it out.

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
git clone https://github.com/ofershap/cursor-office.git
cd cursor-office
npm install
npm run build
npx vsce package --no-dependencies
```

Then in Cursor: `Cmd+Shift+P` > "Install from VSIX" > select `cursor-office-0.1.0.vsix`.

The panel appears as a tab in the bottom panel bar (next to Terminal, Output, etc). Or hit `Cmd+Shift+.` to jump straight there.

### From marketplace

Coming soon.

---

## How It Works

Cursor Office reads Cursor's JSONL agent transcripts at `~/.cursor/projects/<workspace>/agent-transcripts/`. It watches for file changes and figures out what the agent is doing.

No modification to Cursor needed. Read-only. Watches files Cursor already writes.

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

## Break Room Behavior

When the agent isn't working, it has a life:

- Standing and looking around
- Walking to the coffee mug
- Browsing the bookshelf
- Petting the cat
- Playing the arcade cabinet
- Watering the plant
- Getting water from the cooler

Each activity has some randomness so it doesn't feel scripted. The character walks between spots at a leisurely pace, faster when heading to the desk for actual work. Just like a real employee.

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
git clone https://github.com/ofershap/cursor-office.git
cd cursor-office
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
├── objects.ts            # Built-in interactive objects (arcade, plant, cat...)
├── sprites.ts            # Programmatic pixel art sprite generation
├── hitTest.ts            # Click and hover detection
├── gameLoop.ts           # requestAnimationFrame loop
├── canvas.ts             # Shared drawing utils
└── types.ts              # TypeScript interfaces

plugins/
└── roomba.ts             # Reference plugin — robot vacuum cleaner
```

---

## Contributing

Drop a `.ts` file in the [`plugins/`](plugins/) folder. The built-in Roomba ([`plugins/roomba.ts`](plugins/roomba.ts)) is the reference plugin — a self-contained robot vacuum with its own sprite, state machine, and animations.

```typescript
import { createMyThing } from '../plugins/my-thing';
```

Or register objects at runtime without touching source:

```typescript
window.cursorOffice.registerObject(myObject);
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide — plugin template, `InteractiveObject` interface, sprite helpers, backgrounds, and character attract.

---

## Sponsor

Want your brand in the office? A mug with your logo, a poster on the wall, a gadget on the desk. Pixel art, fully interactive, seen by every user every session. Reach out on [LinkedIn](https://linkedin.com/in/ofershap) or open an issue.

---

## Author

[![Made by ofershap](https://gitshow.dev/api/card/ofershap)](https://gitshow.dev/ofershap)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/ofershap)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github&logoColor=white)](https://github.com/ofershap)

## License

[MIT](LICENSE) &copy; [Ofer Shapira](https://github.com/ofershap)
