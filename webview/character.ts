import { CharacterState, AgentActivity } from './types';
import { characterSprites, renderSprite, TILE_SIZE } from './sprites';
import { roundRect } from './canvas';

const DESK_COL = 1.9;
const DESK_ROW = 1.05;
const IDLE_COL = 3;
const IDLE_ROW = 1.8;
const CELEBRATE_COL = 3;
const CELEBRATE_ROW = 1.8;

const WALK_SPEED_IDLE = 1.5;
const WALK_SPEED_WORK = 5.0;

interface IdleWaypoint {
  col: number;
  row: number;
  action: string;
  duration: number;
}

const IDLE_WAYPOINTS: IdleWaypoint[] = [
  { col: 3, row: 1.8, action: 'stand', duration: 8 },
  { col: 3, row: 1.8, action: 'lookAround', duration: 6 },
  { col: 2.8, row: 1.4, action: 'coffee', duration: 5 },
  { col: 3, row: 1.8, action: 'stand', duration: 7 },
  { col: 5.0, row: 1.2, action: 'browse', duration: 6 },
  { col: 3, row: 1.8, action: 'stand', duration: 5 },
  { col: 3.5, row: 2, action: 'petCat', duration: 4 },
  { col: 3, row: 1.8, action: 'stand', duration: 8 },
  { col: 0.3, row: 1.6, action: 'arcade', duration: 7 },
  { col: 2.5, row: 2, action: 'stretch', duration: 4 },
  { col: 3, row: 1.8, action: 'stand', duration: 6 },
  { col: 4.9, row: 2.2, action: 'waterPlant', duration: 4 },
  { col: 3, row: 1.8, action: 'stand', duration: 7 },
  { col: 4.3, row: 1.8, action: 'drink', duration: 5 },
  { col: 3, row: 1.8, action: 'stand', duration: 6 },
];

let idleWaypointIdx = 0;
let idleActionTimer = 12;
let idleAction = 'stand';

export function createCharacter(col: number, row: number): CharacterState {
  return {
    activity: 'idle',
    position: { col, row },
    targetPosition: null,
    animFrame: 0,
    speechBubble: null,
    speechBubbleTimer: 0,
    facingDir: 'right',
  };
}

const OBJECT_POSITIONS: Record<string, { col: number; row: number; action: string }> = {
  arcade: { col: 0.3, row: 1.6, action: 'arcade' },
  coffee: { col: 2.8, row: 1.4, action: 'coffee' },
  bookshelf: { col: 5.0, row: 1.2, action: 'browse' },
  watercooler: { col: 4.3, row: 1.8, action: 'drink' },
  plant: { col: 4.9, row: 2.2, action: 'waterPlant' },
  cat: { col: 3.5, row: 2, action: 'petCat' },
  lamp: { col: 0.8, row: 1.0, action: 'lookAround' },
  window: { col: 4.0, row: 1.0, action: 'lookAround' },
};

export function attractToObject(char: CharacterState, objectId: string) {
  if (char.activity !== 'idle') return;
  const pos = OBJECT_POSITIONS[objectId];
  if (!pos) return;
  setTimeout(() => {
    if (char.activity !== 'idle') return;
    char.targetPosition = { col: pos.col, row: pos.row };
    idleAction = pos.action;
    idleActionTimer = 5 + Math.random() * 2;
    const bubbles: Record<string, string> = {
      arcade: '🕹️ Quick game...',
      coffee: '☕ Coffee break',
      browse: '📚 Hmm, interesting...',
      drink: '💧 Stay hydrated',
      waterPlant: '🌱 Water time',
      petCat: '🐱 Good kitty',
      lookAround: '🤔 ...',
    };
    if (bubbles[pos.action]) {
      char.speechBubble = bubbles[pos.action];
      char.speechBubbleTimer = 3;
    }
  }, 800 + Math.random() * 1200);
}

export function setActivity(char: CharacterState, activity: AgentActivity, statusText?: string) {
  const prev = char.activity;
  char.activity = activity;

  if (statusText) {
    char.speechBubble = statusText;
    char.speechBubbleTimer = 6;
  }

  if (activity === 'celebrating' && prev !== 'celebrating') {
    char.animFrame = 0;
    char.targetPosition = { col: CELEBRATE_COL, row: CELEBRATE_ROW };
  } else if (activity === 'idle') {
    idleActionTimer = 0;
    idleAction = '';
  } else if (activity !== 'walking') {
    char.targetPosition = null;
    idleAction = '';
    idleActionTimer = 0;
    char.targetPosition = { col: DESK_COL, row: DESK_ROW };
  }
}

export function updateCharacter(char: CharacterState, dt: number) {
  char.animFrame += dt * 4;

  if (char.speechBubbleTimer > 0) {
    char.speechBubbleTimer -= dt;
    if (char.speechBubbleTimer <= 0) {
      if (isWorking(char.activity)) {
        const dots = '.'.repeat((Math.floor(char.animFrame) % 3) + 1);
        char.speechBubble = `Working${dots}`;
        char.speechBubbleTimer = 0.5;
      } else {
        char.speechBubble = null;
        char.speechBubbleTimer = 0;
      }
    }
  } else if (isWorking(char.activity) && isAtDesk(char) && !char.speechBubble) {
    const dots = '.'.repeat((Math.floor(char.animFrame) % 3) + 1);
    char.speechBubble = `Working${dots}`;
    char.speechBubbleTimer = 0.5;
  }

  if (char.activity === 'idle') {
    updateIdleBehavior(char, dt);
  }

  if (char.targetPosition) {
    const dx = char.targetPosition.col - char.position.col;
    const dy = char.targetPosition.row - char.position.row;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.12) {
      char.position.col = char.targetPosition.col;
      char.position.row = char.targetPosition.row;
      char.targetPosition = null;
    } else {
      const speed = isWorking(char.activity) ? WALK_SPEED_WORK : WALK_SPEED_IDLE;
      const step = Math.min(speed * dt, dist);
      char.position.col += (dx / dist) * step;
      char.position.row += (dy / dist) * step;
      if (Math.abs(dx) > 0.05) char.facingDir = dx > 0 ? 'right' : 'left';
    }
  }
}

function updateIdleBehavior(char: CharacterState, dt: number) {
  if (char.targetPosition) return;

  idleActionTimer -= dt;

  if (idleActionTimer <= 0) {
    idleWaypointIdx = (idleWaypointIdx + 1) % IDLE_WAYPOINTS.length;
    const wp = IDLE_WAYPOINTS[idleWaypointIdx];
    idleAction = wp.action;
    idleActionTimer = wp.duration + Math.random() * 3;

    const dist = Math.sqrt(
      (wp.col - char.position.col) ** 2 + (wp.row - char.position.row) ** 2
    );
    if (dist > 0.3) {
      char.targetPosition = { col: wp.col, row: wp.row };
    }

    const bubbles: Record<string, string> = {
      coffee: '☕ Coffee break',
      browse: '📚 Hmm, interesting...',
      petCat: '🐱 Good kitty',
      arcade: '🕹️ Quick game...',
      stretch: '🙆 Stretching',
      waterPlant: '🌱 Water time',
      drink: '💧 Stay hydrated',
      lookAround: '🤔 ...',
    };

    if (bubbles[wp.action]) {
      char.speechBubble = bubbles[wp.action];
      char.speechBubbleTimer = Math.min(wp.duration, 4);
    }
  }
}

function isAtDesk(char: CharacterState): boolean {
  return Math.abs(char.position.col - DESK_COL) < 0.5 && Math.abs(char.position.row - DESK_ROW) < 0.5;
}

function isWorking(activity: AgentActivity): boolean {
  return activity === 'typing' || activity === 'editing' || activity === 'running'
    || activity === 'searching' || activity === 'reading';
}

export function renderCharacter(ctx: CanvasRenderingContext2D, char: CharacterState, x: number, y: number, scale: number) {
  const sprites = characterSprites;
  let sprite;
  let drawY = y;

  const isMoving = char.targetPosition !== null;

  if (isMoving) {
    sprite = Math.floor(char.animFrame * 2) % 2 === 0 ? sprites.walk1 : sprites.walk2;
  } else if (char.activity === 'celebrating') {
    sprite = sprites.celebrate;
    drawY -= Math.abs(Math.sin(char.animFrame * 4)) * 5 * scale;
  } else if (isWorking(char.activity) && isAtDesk(char)) {
    sprite = Math.floor(char.animFrame * 2) % 2 === 0 ? sprites.sitType1 : sprites.sitType2;
    char.facingDir = 'back';
  } else {
    switch (idleAction) {
      case 'coffee':
        sprite = sprites.back;
        char.facingDir = 'back';
        break;
      case 'drink':
        sprite = sprites.idle;
        char.facingDir = 'left';
        break;
      case 'browse':
        sprite = sprites.back;
        char.facingDir = 'back';
        break;
      case 'arcade':
        sprite = sprites.back;
        char.facingDir = 'back';
        break;
      case 'waterPlant':
        sprite = sprites.idle;
        char.facingDir = 'right';
        break;
      case 'stretch':
        sprite = sprites.celebrate;
        break;
      case 'petCat':
        sprite = sprites.idle;
        drawY += Math.sin(char.animFrame * 2) * scale;
        break;
      default:
        sprite = sprites.idle;
        const lookCycle = char.animFrame % 6;
        char.facingDir = lookCycle < 2.5 ? 'right' : lookCycle < 4.5 ? 'left' : 'right';
        break;
    }
    drawY += Math.sin(char.animFrame * 0.8) * 0.5 * scale;
  }

  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(x + 8 * scale, y + 21 * scale, 5 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  if (char.facingDir === 'back') {
    renderSprite(ctx, sprite, x, drawY, scale);
  } else if (char.facingDir === 'left') {
    ctx.save();
    ctx.translate(x + 16 * scale, 0);
    ctx.scale(-1, 1);
    renderSprite(ctx, sprite, 0, drawY, scale);
    ctx.restore();
  } else {
    renderSprite(ctx, sprite, x, drawY, scale);
  }

  if (char.speechBubble) {
    renderSpeechBubble(ctx, char.speechBubble, x, drawY, scale, char);
  }
}

function renderSpeechBubble(ctx: CanvasRenderingContext2D, text: string, charX: number, charY: number, scale: number, char: CharacterState) {
  const fontSize = Math.max(9, Math.round(4.5 * scale));
  ctx.font = `bold ${fontSize}px monospace`;

  let icon = '';
  switch (char.activity) {
    case 'reading': icon = '📖 '; break;
    case 'editing': icon = '✏️ '; break;
    case 'running': icon = '⚡ '; break;
    case 'searching': icon = '🔍 '; break;
    case 'typing': icon = '⌨️ '; break;
    case 'celebrating': icon = '🎉 '; break;
  }

  const displayText = text.length > 22 ? text.slice(0, 19) + '...' : text;
  const fullText = char.activity === 'idle' ? displayText : icon + displayText;
  const metrics = ctx.measureText(fullText);
  const padX = 5 * scale;
  const padY = 3 * scale;
  const bubbleW = metrics.width + padX * 2;
  const bubbleH = fontSize + padY * 2;
  const sceneW = 6 * 32 * scale;
  let bx = charX + 8 * scale - bubbleW / 2;
  let by = charY - bubbleH - 8 * scale;
  if (bx < 2 * scale) bx = 2 * scale;
  if (bx + bubbleW > sceneW - 2 * scale) bx = sceneW - bubbleW - 2 * scale;
  if (by < 2 * scale) by = 2 * scale;

  ctx.fillStyle = 'rgba(20,20,35,0.93)';
  roundRect(ctx, bx, by, bubbleW, bubbleH, 3 * scale);
  ctx.fill();

  ctx.strokeStyle = char.activity === 'idle' ? 'rgba(180,180,180,0.4)' : 'rgba(100,160,255,0.5)';
  ctx.lineWidth = Math.max(1, scale * 0.5);
  roundRect(ctx, bx, by, bubbleW, bubbleH, 3 * scale);
  ctx.stroke();

  ctx.fillStyle = 'rgba(20,20,35,0.93)';
  ctx.beginPath();
  ctx.moveTo(charX + 5 * scale, by + bubbleH);
  ctx.lineTo(charX + 8 * scale, by + bubbleH + 4 * scale);
  ctx.lineTo(charX + 11 * scale, by + bubbleH);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#d0e0ff';
  ctx.fillText(fullText, bx + padX, by + padY + fontSize * 0.82);
}

