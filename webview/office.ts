import { OfficeState } from './types';
import { TILE_SIZE, COLS, ROWS, floorTile, wallTile, renderSprite } from './sprites';
import { renderCharacter } from './character';

const WALL_ROWS = 1;

export function renderOffice(ctx: CanvasRenderingContext2D, state: OfficeState, scale: number, offsetX: number, offsetY: number) {
  const tileS = TILE_SIZE * scale;
  const sceneW = COLS * tileS;
  const sceneH = ROWS * tileS;

  ctx.fillStyle = '#0e0e1a';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.save();
  ctx.translate(offsetX, offsetY);

  if (state.customBackground) {
    state.customBackground.renderWall(ctx, COLS, WALL_ROWS, TILE_SIZE, scale, state.tick);
    state.customBackground.renderFloor(ctx, COLS, ROWS, WALL_ROWS, TILE_SIZE, scale, state.tick);
  } else {
    // Floor
    for (let r = WALL_ROWS; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        renderSprite(ctx, floorTile, c * tileS, r * tileS, scale);

    // Wall
    for (let r = 0; r < WALL_ROWS; r++)
      for (let c = 0; c < COLS; c++)
        renderSprite(ctx, wallTile, c * tileS, r * tileS, scale);
  }

  // Baseboard — thick line where wall meets floor
  const baseY = WALL_ROWS * tileS;
  ctx.fillStyle = '#3a3a58';
  ctx.fillRect(0, baseY - Math.ceil(scale), sceneW, Math.ceil(scale * 2));
  ctx.fillStyle = '#2a2a44';
  ctx.fillRect(0, baseY + Math.ceil(scale), sceneW, Math.ceil(scale));

  // Wall shadow on floor (soft gradient)
  const shadowGrad = ctx.createLinearGradient(0, baseY, 0, baseY + 20 * scale);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0.2)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(0, baseY, sceneW, 20 * scale);

  // Z-sorted rendering of objects and character
  const sortable: { zY: number; render: () => void }[] = [];

  for (const obj of state.objects) {
    sortable.push({
      zY: obj.zY,
      render: () => obj.render(ctx, obj, state.tick, scale),
    });
  }

  sortable.push({
    zY: (state.character.position.row + 1) * TILE_SIZE,
    render: () => {
      const px = state.character.position.col * tileS;
      const py = state.character.position.row * tileS - 8 * scale;
      renderCharacter(ctx, state.character, px, py, scale);
    },
  });

  sortable.sort((a, b) => a.zY - b.zY);
  for (const item of sortable) item.render();

  // Lamp light cone on floor
  const lamp = state.objects.find(o => o.id === 'lamp');
  if (lamp && lamp.state.on) {
    const lx = lamp.position.col * tileS + 8 * scale;
    const ly = lamp.position.row * tileS + 8 * scale;
    const pulseR = 50 * scale + Math.sin(state.tick * 1.5) * 3 * scale;
    const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly + 20 * scale, pulseR);
    grad.addColorStop(0, 'rgba(255,240,180,0.12)');
    grad.addColorStop(0.4, 'rgba(255,240,180,0.06)');
    grad.addColorStop(1, 'rgba(255,240,180,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(lx - pulseR, ly, pulseR * 2, pulseR);
  }

  // Monitor glow (subtle blue glow on desk area)
  const desk = state.objects.find(o => o.id === 'desk');
  if (desk && !state.dimmed) {
    const mx = desk.position.col * tileS + 16 * scale;
    const my = desk.position.row * tileS;
    const glowR = 25 * scale;
    const grad = ctx.createRadialGradient(mx, my, 0, mx, my, glowR);
    const pulse = 0.06 + 0.02 * Math.sin(state.tick * 2);
    grad.addColorStop(0, `rgba(100,160,255,${pulse})`);
    grad.addColorStop(1, 'rgba(100,160,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(mx - glowR, my - glowR, glowR * 2, glowR * 2);
  }

  // Dimmed overlay
  if (state.dimmed) {
    ctx.fillStyle = 'rgba(0,0,20,0.5)';
    ctx.fillRect(0, 0, sceneW, sceneH);
  }

  // Ambient dust particles
  renderParticles(ctx, state, scale);

  // Floating click texts
  renderFloatingTexts(ctx, state, scale, offsetX);

  // Click counter badge
  renderClickCounter(ctx, state, scale);

  ctx.restore();
}

function renderFloatingTexts(ctx: CanvasRenderingContext2D, state: OfficeState, scale: number, _offsetX: number) {
  for (const ft of state.floatingTexts) {
    const progress = ft.age / 1.2;
    const alpha = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;
    const rise = ft.age * 40 * scale;
    const wobble = Math.sin(ft.age * 6) * 3 * scale;
    const growScale = progress < 0.15 ? progress / 0.15 : 1;
    const fontSize = Math.max(10, Math.round(5 * scale * growScale));

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillStyle = ft.color;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = Math.max(1, scale * 0.4);
    const x = ft.x + wobble;
    const y = ft.y - rise;
    ctx.strokeText(ft.text, x, y);
    ctx.fillText(ft.text, x, y);
    ctx.restore();
  }
}

function renderClickCounter(ctx: CanvasRenderingContext2D, state: OfficeState, scale: number) {
  if (!state.clickCounter || state.clickCounter.count < 5) return;

  const count = state.clickCounter.count;
  const sceneW = COLS * TILE_SIZE * scale;
  const fontSize = Math.max(10, Math.round(4 * scale));
  ctx.font = `bold ${fontSize}px monospace`;

  let label: string;
  let color: string;
  if (count >= 50) { label = `🔥 ${count}x COMBO!`; color = '#ff4444'; }
  else if (count >= 20) { label = `⚡ ${count}x combo!`; color = '#ffaa00'; }
  else if (count >= 10) { label = `✨ ${count}x combo`; color = '#ffdd00'; }
  else { label = `${count}x`; color = '#aaddff'; }

  const tw = ctx.measureText(label).width;
  const px = sceneW - tw - 6 * scale;
  const py = 4 * scale + fontSize;

  const pulse = 1 + Math.sin(state.tick * 8) * 0.05 * Math.min(count, 20);
  ctx.save();
  ctx.translate(px + tw / 2, py - fontSize / 2);
  ctx.scale(pulse, pulse);
  ctx.translate(-(px + tw / 2), -(py - fontSize / 2));

  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillText(label, px + scale * 0.3, py + scale * 0.3);
  ctx.fillStyle = color;
  ctx.fillText(label, px, py);
  ctx.restore();
}

function renderParticles(ctx: CanvasRenderingContext2D, state: OfficeState, scale: number) {
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 8; i++) {
    const x = ((state.tick * 4 + i * 83) % (COLS * TILE_SIZE)) * scale;
    const y = ((Math.sin(state.tick * 0.3 + i * 1.7) * 0.5 + 0.5) * ROWS * TILE_SIZE) * scale;
    const sz = (0.8 + Math.sin(state.tick * 0.6 + i) * 0.4) * scale;
    ctx.fillStyle = '#ffe8c0';
    ctx.beginPath();
    ctx.arc(x, y, sz, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
