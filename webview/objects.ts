import { InteractiveObject, OfficeState, SpriteData } from './types';
import {
  TILE_SIZE, deskSprite, chairSprite,
  mugSprite1, mugSprite2,
  plantStage1, plantStage2, plantStage3,
  whiteboardSprite, arcadeCabinetSprite,
  lampSprite, lampSpriteOff,
  renderSprite,
} from './sprites';

function defaultRender(ctx: CanvasRenderingContext2D, obj: InteractiveObject, tick: number, scale: number) {
  const sprite = obj.sprites[0];
  if (!sprite) return;
  const x = obj.position.col * TILE_SIZE * scale;
  const y = obj.position.row * TILE_SIZE * scale;
  renderSprite(ctx, sprite, x, y, scale);
}

export function createDesk(col: number, row: number): InteractiveObject {
  return {
    id: 'desk',
    sprites: [deskSprite],
    position: { col, row },
    hitbox: { w: 2, h: 1 },
    zY: (row + 1) * TILE_SIZE,
    state: {},
    onClick: () => {},
    render: defaultRender,
  };
}

export function createChair(col: number, row: number): InteractiveObject {
  return {
    id: 'chair',
    sprites: [chairSprite],
    position: { col, row },
    hitbox: { w: 1, h: 1 },
    zY: (row + 1) * TILE_SIZE,
    state: {},
    onClick: () => {},
    render: defaultRender,
  };
}

export function createCoffeeMug(col: number, row: number): InteractiveObject {
  return {
    id: 'coffee',
    sprites: [mugSprite1, mugSprite2],
    position: { col, row },
    hitbox: { w: 1, h: 1 },
    zY: (row + 1) * TILE_SIZE,
    state: { steaming: false, steamTimer: 0 },
    onClick: (obj) => {
      obj.state.steaming = true;
      obj.state.steamTimer = 3;
    },
    render: (ctx, obj, tick, scale) => {
      if (obj.state.steamTimer as number > 0) {
        obj.state.steamTimer = (obj.state.steamTimer as number) - 0.016;
        if ((obj.state.steamTimer as number) <= 0) {
          obj.state.steaming = false;
          obj.state.steamTimer = 0;
        }
      }
      const sprite = obj.state.steaming
        ? (Math.floor(tick * 3) % 2 === 0 ? obj.sprites[1] : obj.sprites[0])
        : obj.sprites[0];
      const x = obj.position.col * TILE_SIZE * scale;
      const y = obj.position.row * TILE_SIZE * scale;
      renderSprite(ctx, sprite!, x, y, scale);
    },
  };
}

export function createPlant(col: number, row: number): InteractiveObject {
  return {
    id: 'plant',
    sprites: [plantStage1, plantStage2, plantStage3],
    position: { col, row },
    hitbox: { w: 1, h: 1 },
    zY: (row + 1) * TILE_SIZE,
    state: { stage: 0, clickCount: 0 },
    onClick: (obj) => {
      obj.state.clickCount = (obj.state.clickCount as number) + 1;
      const clicks = obj.state.clickCount as number;
      if (clicks >= 6) obj.state.stage = 2;
      else if (clicks >= 3) obj.state.stage = 1;
    },
    render: (ctx, obj, tick, scale) => {
      const stage = obj.state.stage as number;
      const sprite = obj.sprites[Math.min(stage, obj.sprites.length - 1)];
      const x = obj.position.col * TILE_SIZE * scale;
      const y = obj.position.row * TILE_SIZE * scale;
      renderSprite(ctx, sprite!, x, y, scale);
    },
  };
}

export function createWhiteboard(col: number, row: number): InteractiveObject {
  return {
    id: 'whiteboard',
    sprites: [whiteboardSprite],
    position: { col, row },
    hitbox: { w: 2, h: 2 },
    zY: row * TILE_SIZE,
    state: { text: 'Waiting for agent...' },
    onClick: () => {},
    render: (ctx, obj, tick, scale) => {
      const x = obj.position.col * TILE_SIZE * scale;
      const y = obj.position.row * TILE_SIZE * scale;
      renderSprite(ctx, obj.sprites[0]!, x, y, scale);

      const text = obj.state.text as string;
      if (text) {
        const fontSize = Math.max(6, 3.5 * scale);
        ctx.font = `${fontSize}px monospace`;
        ctx.fillStyle = '#333';
        const maxW = 28 * scale;
        const lines = wrapText(ctx, text, maxW);
        lines.forEach((line, i) => {
          ctx.fillText(line, x + 3 * scale, y + (5 + i * 5) * scale, maxW);
        });
      }
    },
  };
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export function createArcadeCabinet(col: number, row: number): InteractiveObject {
  return {
    id: 'arcade',
    sprites: [arcadeCabinetSprite],
    position: { col, row },
    hitbox: { w: 1, h: 2 },
    zY: (row + 2) * TILE_SIZE,
    state: { clickCount: 0, showBubble: false, bubbleTimer: 0 },
    onClick: (obj, office) => {
      obj.state.clickCount = (obj.state.clickCount as number) + 1;
      if ((obj.state.clickCount as number) >= 3) {
        obj.state.showBubble = true;
        obj.state.bubbleTimer = 3;
        obj.state.clickCount = 0;
      }
    },
    render: (ctx, obj, tick, scale) => {
      const x = obj.position.col * TILE_SIZE * scale;
      const y = obj.position.row * TILE_SIZE * scale;
      renderSprite(ctx, obj.sprites[0]!, x, y, scale);

      // Animate screen glow
      const glowAlpha = 0.3 + 0.2 * Math.sin(tick * 3);
      ctx.fillStyle = `rgba(100,200,255,${glowAlpha})`;
      ctx.fillRect(x + 4 * scale, y + 6 * scale, 8 * scale, 9 * scale);

      if (obj.state.bubbleTimer as number > 0) {
        obj.state.bubbleTimer = (obj.state.bubbleTimer as number) - 0.016;
        if ((obj.state.bubbleTimer as number) <= 0) {
          obj.state.showBubble = false;
          obj.state.bubbleTimer = 0;
        }
        const fontSize = Math.max(8, 5 * scale);
        ctx.font = `${fontSize}px monospace`;
        const label = 'Coming soon!';
        const tw = ctx.measureText(label).width;
        const bx = x - tw / 2 + 8 * scale;
        const by = y - fontSize - 6 * scale;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(bx - 4 * scale, by - 2 * scale, tw + 8 * scale, fontSize + 4 * scale);
        ctx.fillStyle = '#e43b44';
        ctx.fillText(label, bx, by + fontSize * 0.8);
      }
    },
  };
}

export function createLamp(col: number, row: number): InteractiveObject {
  return {
    id: 'lamp',
    sprites: [lampSprite, lampSpriteOff],
    position: { col, row },
    hitbox: { w: 1, h: 1 },
    zY: 0,
    state: { on: true },
    onClick: (obj, office) => {
      obj.state.on = !(obj.state.on as boolean);
      office.dimmed = !(obj.state.on as boolean);
    },
    render: (ctx, obj, tick, scale) => {
      const sprite = (obj.state.on as boolean) ? obj.sprites[0] : obj.sprites[1];
      const x = obj.position.col * TILE_SIZE * scale;
      const y = obj.position.row * TILE_SIZE * scale;
      renderSprite(ctx, sprite!, x, y, scale);

      if (obj.state.on as boolean) {
        const cx = x + 8 * scale;
        const cy = y + 6 * scale;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24 * scale);
        grad.addColorStop(0, 'rgba(255,240,180,0.12)');
        grad.addColorStop(1, 'rgba(255,240,180,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(cx - 24 * scale, cy - 24 * scale, 48 * scale, 48 * scale);
      }
    },
  };
}

export function createDefaultObjects(): InteractiveObject[] {
  return [
    createLamp(9, 0),
    createWhiteboard(12, 1),
    createDesk(3, 6),
    createChair(4, 8),
    createCoffeeMug(6, 6),
    createPlant(1, 9),
    createArcadeCabinet(16, 5),
  ];
}
