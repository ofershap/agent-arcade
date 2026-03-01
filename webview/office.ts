import { OfficeState, InteractiveObject, Position } from './types';
import { TILE_SIZE, floorTile, wallTile, renderSprite } from './sprites';
import { renderCharacter } from './character';

const COLS = 20;
const ROWS = 12;

const WALL_ROWS = 3;

export function createOfficeLayout(): number[][] {
  const map: number[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: number[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push(r < WALL_ROWS ? 1 : 0);
    }
    map.push(row);
  }
  return map;
}

export function renderOffice(ctx: CanvasRenderingContext2D, state: OfficeState, scale: number) {
  const tileS = TILE_SIZE * scale;

  // Floor
  for (let r = WALL_ROWS; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      renderSprite(ctx, floorTile, c * tileS, r * tileS, scale);
    }
  }

  // Walls
  for (let r = 0; r < WALL_ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      renderSprite(ctx, wallTile, c * tileS, r * tileS, scale);
    }
  }

  if (state.dimmed) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, COLS * tileS, ROWS * tileS);
  }

  const sortable: { zY: number; render: () => void }[] = [];

  for (const obj of state.objects) {
    sortable.push({
      zY: obj.zY,
      render: () => obj.render(ctx, obj, state.tick, scale),
    });
  }

  sortable.push({
    zY: state.character.position.row * tileS + TILE_SIZE * scale,
    render: () => renderCharacterInOffice(ctx, state, scale),
  });

  sortable.sort((a, b) => a.zY - b.zY);
  for (const item of sortable) item.render();

  if (state.hoveredObjectId) {
    const obj = state.objects.find(o => o.id === state.hoveredObjectId);
    if (obj) {
      const px = obj.position.col * tileS;
      const py = obj.position.row * tileS;
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = Math.max(1, scale);
      ctx.strokeRect(px - scale, py - scale, obj.hitbox.w * tileS + scale * 2, obj.hitbox.h * tileS + scale * 2);
    }
  }
}

function renderCharacterInOffice(ctx: CanvasRenderingContext2D, state: OfficeState, scale: number) {
  const { character } = state;
  const tileS = TILE_SIZE * scale;
  const px = character.position.col * tileS;
  const py = character.position.row * tileS - 8 * scale;
  renderCharacter(ctx, character, px, py, scale);
}

export function tileToPixel(pos: Position, scale: number): { x: number; y: number } {
  return {
    x: pos.col * TILE_SIZE * scale,
    y: pos.row * TILE_SIZE * scale,
  };
}

export const OFFICE_COLS = COLS;
export const OFFICE_ROWS = ROWS;
