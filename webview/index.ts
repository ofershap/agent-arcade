import { OfficeState, AgentMessage, InteractiveObject, BackgroundRenderer } from './types';
import { createDefaultObjects } from './objects';
import { createCharacter, setActivity, attractToObject } from './character';
import { startGameLoop } from './gameLoop';
import { handleClick, updateHover } from './hitTest';
import { TILE_SIZE, COLS, ROWS } from './sprites';

declare function acquireVsCodeApi(): {
  postMessage(msg: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
};

const vscode = acquireVsCodeApi();
const canvas = document.getElementById('officeCanvas') as HTMLCanvasElement;
let scale = 3;
let offsetX = 0;
let offsetY = 0;

function resize() {
  const availW = window.innerWidth;
  const availH = window.innerHeight;
  const nativeW = COLS * TILE_SIZE;
  const nativeH = ROWS * TILE_SIZE;
  const scaleW = availW / nativeW;
  const scaleH = availH / nativeH;
  scale = Math.min(scaleW, scaleH);
  if (scale < 1) scale = 1;
  const sceneW = Math.floor(nativeW * scale);
  const sceneH = Math.floor(nativeH * scale);
  canvas.width = availW;
  canvas.height = availH;
  canvas.style.width = availW + 'px';
  canvas.style.height = availH + 'px';
  offsetX = Math.max(0, Math.floor((availW - sceneW) / 2));
  offsetY = Math.max(0, Math.floor((availH - sceneH) / 2));
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.imageSmoothingEnabled = false;
}

const state: OfficeState = {
  objects: createDefaultObjects(),
  character: createCharacter(3, 1.8),
  dimmed: false,
  tick: 0,
  hoveredObjectId: null,
  floatingTexts: [],
  clickCounter: null,
  customBackground: null,
};

const CLICK_COUNTER_RESET = 2.5;

function spawnFloatingText(x: number, y: number, text: string, color: string) {
  state.floatingTexts.push({ text, x, y, age: 0, color });
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvas.width / rect.width) - offsetX;
  const my = (e.clientY - rect.top) * (canvas.height / rect.height) - offsetY;
  const clicked = handleClick(mx, my, state, scale);
  if (clicked) {
    attractToObject(state.character, clicked);

    if (state.clickCounter && state.clickCounter.objectId === clicked) {
      state.clickCounter.count++;
      state.clickCounter.resetTimer = CLICK_COUNTER_RESET;
    } else {
      state.clickCounter = { objectId: clicked, count: 1, resetTimer: CLICK_COUNTER_RESET };
    }

    const count = state.clickCounter!.count;
    if (count >= 5) {
      const fx = mx + offsetX;
      const fy = my + offsetY;
      const colors = ['#88ddff', '#aaffaa', '#ffdd66', '#ff88aa', '#ddaaff'];
      const color = count >= 10 ? '#ffdd00' : colors[(count - 1) % colors.length]!;
      spawnFloatingText(fx, fy - 10 * scale, `+${count}`, color);
    }
  }
});

export function registerObject(obj: InteractiveObject) {
  const existing = state.objects.findIndex(o => o.id === obj.id);
  if (existing >= 0) state.objects[existing] = obj;
  else state.objects.push(obj);
}

export function registerBackground(bg: BackgroundRenderer) {
  state.customBackground = bg;
}

export function removeObject(id: string) {
  state.objects = state.objects.filter(o => o.id !== id);
}

(window as Record<string, unknown>).cursorOffice = { registerObject, registerBackground, removeObject };
(window as Record<string, unknown>).agentArcade = { registerObject, registerBackground, removeObject };

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvas.width / rect.width) - offsetX;
  const my = (e.clientY - rect.top) * (canvas.height / rect.height) - offsetY;
  updateHover(mx, my, state, scale);
  canvas.style.cursor = state.hoveredObjectId ? 'pointer' : 'default';
});

window.addEventListener('message', (e) => {
  const msg = e.data as AgentMessage;
  if (msg.type === 'agentStatus') {
    setActivity(state.character, msg.activity, msg.statusText ?? undefined);
  }
});

window.addEventListener('resize', resize);
resize();
startGameLoop(canvas, state, () => scale, () => offsetX, () => offsetY);

vscode.postMessage({ type: 'webviewReady' });
