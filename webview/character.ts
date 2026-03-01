import { CharacterState, AgentActivity } from './types';
import { characterSprites, renderSprite, TILE_SIZE } from './sprites';

export function createCharacter(col: number, row: number): CharacterState {
  return {
    activity: 'idle',
    position: { col, row },
    targetPosition: null,
    animFrame: 0,
    speechBubble: null,
    speechBubbleTimer: 0,
    facingDir: 'down',
  };
}

export function updateCharacter(char: CharacterState, dt: number) {
  char.animFrame += dt * 4;

  if (char.speechBubbleTimer > 0) {
    char.speechBubbleTimer -= dt;
    if (char.speechBubbleTimer <= 0) {
      char.speechBubble = null;
      char.speechBubbleTimer = 0;
    }
  }

  if (char.activity === 'celebrating') {
    // celebration handled by animFrame
  }
}

export function setActivity(char: CharacterState, activity: AgentActivity, statusText?: string) {
  char.activity = activity;
  if (statusText) {
    char.speechBubble = statusText;
    char.speechBubbleTimer = 4;
  }
}

export function renderCharacter(ctx: CanvasRenderingContext2D, char: CharacterState, x: number, y: number, scale: number) {
  const sprites = characterSprites;
  let sprite;

  switch (char.activity) {
    case 'typing':
    case 'editing':
    case 'running':
    case 'searching':
    case 'reading':
      sprite = Math.floor(char.animFrame) % 2 === 0 ? sprites.type1 : sprites.type2;
      break;
    case 'celebrating':
      sprite = sprites.celebrate;
      break;
    case 'walking':
      sprite = Math.floor(char.animFrame) % 2 === 0 ? sprites.idle : sprites.type1;
      break;
    default:
      sprite = sprites.idle;
  }

  renderSprite(ctx, sprite, x, y, scale);

  if (char.speechBubble) {
    renderSpeechBubble(ctx, char.speechBubble, x, y, scale, char);
  }
}

function renderSpeechBubble(ctx: CanvasRenderingContext2D, text: string, charX: number, charY: number, scale: number, char: CharacterState) {
  const fontSize = Math.max(8, 5 * scale);
  ctx.font = `${fontSize}px monospace`;
  const metrics = ctx.measureText(text);
  const textW = metrics.width;
  const padX = 4 * scale;
  const padY = 3 * scale;
  const bubbleW = textW + padX * 2;
  const bubbleH = fontSize + padY * 2;
  const bx = charX + 8 * scale - bubbleW / 2;
  const by = charY - bubbleH - 4 * scale;

  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  const r = 3 * scale;
  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.lineTo(bx + bubbleW - r, by);
  ctx.quadraticCurveTo(bx + bubbleW, by, bx + bubbleW, by + r);
  ctx.lineTo(bx + bubbleW, by + bubbleH - r);
  ctx.quadraticCurveTo(bx + bubbleW, by + bubbleH, bx + bubbleW - r, by + bubbleH);
  ctx.lineTo(bx + r, by + bubbleH);
  ctx.quadraticCurveTo(bx, by + bubbleH, bx, by + bubbleH - r);
  ctx.lineTo(bx, by + r);
  ctx.quadraticCurveTo(bx, by, bx + r, by);
  ctx.closePath();
  ctx.fill();

  // Tail
  ctx.beginPath();
  ctx.moveTo(charX + 6 * scale, by + bubbleH);
  ctx.lineTo(charX + 8 * scale, by + bubbleH + 4 * scale);
  ctx.lineTo(charX + 10 * scale, by + bubbleH);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#222';
  ctx.fillText(text, bx + padX, by + padY + fontSize * 0.8);
}
