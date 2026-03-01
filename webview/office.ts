import { OfficeState } from './types';
import { TILE_SIZE, COLS, ROWS, floorTile, wallTile, renderSprite } from './sprites';
import { renderCharacter } from './character';

const WALL_ROWS = 2;

export function renderOffice(ctx: CanvasRenderingContext2D, state: OfficeState, scale: number) {
  const tileS = TILE_SIZE * scale;

  for (let r = WALL_ROWS; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      renderSprite(ctx, floorTile, c * tileS, r * tileS, scale);
    }
  }

  for (let r = 0; r < WALL_ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      renderSprite(ctx, wallTile, c * tileS, r * tileS, scale);
    }
  }

  ctx.fillStyle = '#4a4a6e';
  ctx.fillRect(0, WALL_ROWS * tileS - Math.ceil(scale * 0.5), COLS * tileS, Math.ceil(scale * 1.5));

  const sortable: { zY: number; render: () => void }[] = [];

  for (const obj of state.objects) {
    sortable.push({
      zY: obj.zY,
      render: () => obj.render(ctx, obj, state.tick, scale),
    });
  }

  sortable.push({
    zY: state.character.position.row * tileS + TILE_SIZE * scale,
    render: () => {
      const { character } = state;
      const px = character.position.col * tileS;
      const py = character.position.row * tileS - 8 * scale;
      renderCharacter(ctx, character, px, py, scale);
    },
  });

  sortable.sort((a, b) => a.zY - b.zY);
  for (const item of sortable) item.render();

  if (state.hoveredObjectId) {
    const obj = state.objects.find(o => o.id === state.hoveredObjectId);
    if (obj) {
      const px = obj.position.col * tileS;
      const py = obj.position.row * tileS;
      const pw = obj.hitbox.w * tileS;
      const ph = obj.hitbox.h * tileS;

      const glowAlpha = 0.3 + 0.15 * Math.sin(state.tick * 6);
      ctx.strokeStyle = `rgba(255,255,100,${glowAlpha + 0.3})`;
      ctx.lineWidth = Math.max(2, scale * 1.5);
      ctx.shadowColor = 'rgba(255,255,100,0.6)';
      ctx.shadowBlur = 8 * scale;
      ctx.strokeRect(px - scale, py - scale, pw + scale * 2, ph + scale * 2);
      ctx.shadowBlur = 0;
    }
  }

  if (state.dimmed) {
    ctx.fillStyle = 'rgba(0,0,20,0.45)';
    ctx.fillRect(0, 0, COLS * tileS, ROWS * tileS);
  }

  renderParticles(ctx, state, scale);
}

function renderParticles(ctx: CanvasRenderingContext2D, state: OfficeState, scale: number) {
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 6; i++) {
    const x = ((state.tick * 6 + i * 97) % (COLS * TILE_SIZE)) * scale;
    const y = ((Math.sin(state.tick * 0.4 + i * 1.3) * 0.5 + 0.5) * ROWS * TILE_SIZE) * scale;
    const sz = (1 + Math.sin(state.tick * 0.8 + i) * 0.5) * scale;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x, y, sz, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
