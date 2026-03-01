import { SpriteData } from './types';

const _ = '';
const B = '#2c2137';
const W = '#f2f0e5';
const G = '#3e8948';
const DG = '#265c42';
const LG = '#63c74d';
const BR = '#8b6144';
const DB = '#5a3a28';
const LB = '#c0915e';
const GR = '#5a5a6e';
const DGR = '#3a3a4e';
const LGR = '#8b8b9e';
const BL = '#3b5dc9';
const RD = '#e43b44';
const YL = '#f7e26b';
const WH = '#e8e8e8';
const SK = '#f2c8a0';
const HA = '#4a3728';
const SH = '#3b5dc9';

export const TILE_SIZE = 16;

export const floorTile: SpriteData = (() => {
  const C1 = '#c0915e';
  const C2 = '#b5844f';
  const C3 = '#a87842';
  const C4 = '#c99b6a';
  const row1 = [C1,C1,C2,C1,C1,C4,C1,C1,C2,C1,C1,C1,C4,C1,C2,C1];
  const row2 = [C2,C1,C1,C1,C1,C1,C2,C1,C1,C4,C1,C1,C1,C1,C1,C4];
  const row3 = [C1,C4,C1,C2,C1,C1,C1,C3,C1,C1,C1,C2,C1,C4,C1,C1];
  const row4 = [C1,C1,C1,C1,C4,C1,C1,C1,C1,C1,C3,C1,C1,C1,C1,C2];
  return [row1,row2,row3,row4,row1,row2,row3,row4,row1,row2,row3,row4,row1,row2,row3,row4];
})();

export const wallTile: SpriteData = (() => {
  const C1 = '#3a3a5c';
  const C2 = '#2c2c4a';
  const C3 = '#4a4a6e';
  const rows: SpriteData = [];
  for (let y = 0; y < 16; y++) {
    const row: string[] = [];
    for (let x = 0; x < 16; x++) {
      if (y < 2) row.push(C3);
      else if (y === 2) row.push(C2);
      else if (y < 14) row.push(x % 8 === 0 ? C2 : C1);
      else if (y === 14) row.push(C2);
      else row.push(C3);
    }
    rows.push(row);
  }
  return rows;
})();

// 32x16 wooden desk with monitor
export const deskSprite: SpriteData = (() => {
  const s: SpriteData = Array.from({ length: 16 }, () => Array(32).fill(_));
  // Desk surface
  for (let y = 4; y < 8; y++)
    for (let x = 0; x < 32; x++)
      s[y][x] = y === 4 ? DB : BR;
  // Legs
  for (let y = 8; y < 16; y++) {
    s[y][1] = DB; s[y][2] = DB;
    s[y][29] = DB; s[y][30] = DB;
  }
  // Monitor on desk
  for (let y = 0; y < 4; y++)
    for (let x = 12; x < 22; x++)
      s[y][x] = y === 0 || y === 3 || x === 12 || x === 21 ? DGR : '#4488cc';
  // Monitor stand
  s[4][16] = DGR; s[4][17] = DGR;
  return s;
})();

// 16x16 office chair (front view)
export const chairSprite: SpriteData = (() => {
  const s: SpriteData = Array.from({ length: 16 }, () => Array(16).fill(_));
  // Seat back
  for (let y = 0; y < 6; y++)
    for (let x = 3; x < 13; x++)
      s[y][x] = y === 0 || x === 3 || x === 12 ? DGR : GR;
  // Seat
  for (let y = 6; y < 9; y++)
    for (let x = 2; x < 14; x++)
      s[y][x] = y === 6 ? DGR : GR;
  // Pole
  s[9][7] = DGR; s[9][8] = DGR;
  s[10][7] = DGR; s[10][8] = DGR;
  // Base
  for (let x = 4; x < 12; x++) s[11][x] = DGR;
  // Wheels
  s[12][4] = B; s[12][5] = B;
  s[12][10] = B; s[12][11] = B;
  return s;
})();

// 8x8 coffee mug frame 1 (no steam)
export const mugSprite1: SpriteData = (() => {
  const s: SpriteData = Array.from({ length: 8 }, () => Array(8).fill(_));
  // Mug body
  for (let y = 2; y < 7; y++)
    for (let x = 1; x < 6; x++)
      s[y][x] = y === 2 || y === 6 || x === 1 || x === 5 ? WH : '#8B4513';
  // Handle
  s[3][6] = WH; s[4][6] = WH; s[5][6] = WH;
  s[3][7] = WH; s[5][7] = WH;
  return s;
})();

// 8x8 coffee mug frame 2 (with steam)
export const mugSprite2: SpriteData = (() => {
  const s: SpriteData = mugSprite1.map(r => [...r]);
  s[0][2] = LGR; s[0][4] = LGR;
  s[1][3] = LGR;
  return s;
})();

// 16x16 plant - stage 1 (small sprout)
export const plantStage1: SpriteData = (() => {
  const s: SpriteData = Array.from({ length: 16 }, () => Array(16).fill(_));
  // Pot
  for (let y = 10; y < 16; y++)
    for (let x = 4; x < 12; x++)
      s[y][x] = y === 10 || x === 4 || x === 11 ? '#a85a32' : '#c0703c';
  // Sprout
  s[8][7] = DG; s[8][8] = DG;
  s[9][7] = DG; s[9][8] = DG;
  s[7][6] = G; s[7][9] = G;
  return s;
})();

// 16x16 plant - stage 2 (growing)
export const plantStage2: SpriteData = (() => {
  const s: SpriteData = Array.from({ length: 16 }, () => Array(16).fill(_));
  // Pot
  for (let y = 10; y < 16; y++)
    for (let x = 4; x < 12; x++)
      s[y][x] = y === 10 || x === 4 || x === 11 ? '#a85a32' : '#c0703c';
  // Stem
  for (let y = 5; y < 10; y++) { s[y][7] = DG; s[y][8] = DG; }
  // Leaves
  for (let x = 4; x < 12; x++) { s[4][x] = G; s[5][x] = G; }
  s[3][5] = LG; s[3][6] = G; s[3][7] = G; s[3][8] = G; s[3][9] = G; s[3][10] = LG;
  return s;
})();

// 16x16 plant - stage 3 (full with flower)
export const plantStage3: SpriteData = (() => {
  const s: SpriteData = Array.from({ length: 16 }, () => Array(16).fill(_));
  // Pot
  for (let y = 10; y < 16; y++)
    for (let x = 4; x < 12; x++)
      s[y][x] = y === 10 || x === 4 || x === 11 ? '#a85a32' : '#c0703c';
  // Stem
  for (let y = 3; y < 10; y++) { s[y][7] = DG; s[y][8] = DG; }
  // Full foliage
  for (let y = 2; y < 6; y++)
    for (let x = 3; x < 13; x++)
      s[y][x] = (x + y) % 3 === 0 ? LG : G;
  // Flower
  s[1][7] = RD; s[1][8] = RD;
  s[0][7] = YL; s[0][8] = YL;
  s[1][6] = RD; s[1][9] = RD;
  return s;
})();

// 32x32 whiteboard
export const whiteboardSprite: SpriteData = (() => {
  const s: SpriteData = Array.from({ length: 32 }, () => Array(32).fill(_));
  // Frame
  for (let y = 0; y < 24; y++)
    for (let x = 0; x < 32; x++) {
      if (y === 0 || y === 23 || x === 0 || x === 31)
        s[y][x] = GR;
      else
        s[y][x] = WH;
    }
  // Tray at bottom
  for (let x = 2; x < 30; x++) s[24][x] = LGR;
  for (let x = 2; x < 30; x++) s[25][x] = GR;
  // Marker dots on tray
  s[24][8] = RD; s[24][12] = BL; s[24][16] = DG;
  return s;
})();

// 16x32 arcade cabinet
export const arcadeCabinetSprite: SpriteData = (() => {
  const s: SpriteData = Array.from({ length: 32 }, () => Array(16).fill(_));
  // Top/marquee
  for (let y = 0; y < 5; y++)
    for (let x = 2; x < 14; x++)
      s[y][x] = y === 0 || x === 2 || x === 13 ? B : (y < 3 ? RD : '#ff6b6b');
  // Screen area
  for (let y = 5; y < 16; y++)
    for (let x = 3; x < 13; x++)
      s[y][x] = y === 5 || y === 15 || x === 3 || x === 12 ? B : '#1a1a2e';
  // Screen glow pixels (retro game look)
  s[8][6] = LG; s[8][7] = LG; s[8][8] = LG;
  s[10][5] = BL; s[10][9] = BL;
  s[12][7] = YL;
  // Control panel
  for (let y = 16; y < 20; y++)
    for (let x = 3; x < 13; x++)
      s[y][x] = y === 16 ? B : DGR;
  // Joystick
  s[17][6] = B; s[17][7] = B;
  s[16][6] = B; s[16][7] = B;
  // Buttons
  s[18][9] = RD; s[18][11] = BL;
  // Body
  for (let y = 20; y < 30; y++)
    for (let x = 3; x < 13; x++)
      s[y][x] = x === 3 || x === 12 ? B : DGR;
  // Base
  for (let y = 30; y < 32; y++)
    for (let x = 2; x < 14; x++)
      s[y][x] = B;
  return s;
})();

// 16x8 ceiling lamp
export const lampSprite: SpriteData = (() => {
  const s: SpriteData = Array.from({ length: 8 }, () => Array(16).fill(_));
  // Mount point
  s[0][7] = GR; s[0][8] = GR;
  // Chain
  s[1][7] = GR; s[1][8] = GR;
  // Shade
  for (let x = 4; x < 12; x++) s[2][x] = DGR;
  for (let x = 3; x < 13; x++) s[3][x] = GR;
  for (let x = 3; x < 13; x++) s[4][x] = LGR;
  // Bulb glow
  s[5][7] = YL; s[5][8] = YL;
  s[6][7] = YL; s[6][8] = YL;
  return s;
})();

export const lampSpriteOff: SpriteData = (() => {
  const s: SpriteData = lampSprite.map(r => [...r]);
  s[5][7] = GR; s[5][8] = GR;
  s[6][7] = GR; s[6][8] = GR;
  return s;
})();

// --- Character sprites (simple 16x24 top-down) ---

const characterBase = (shirtColor: string, hairColor: string): { idle: SpriteData; type1: SpriteData; type2: SpriteData; celebrate: SpriteData } => {
  const makeFrame = (armL: number[], armR: number[], headExtra?: [number, number, string][]): SpriteData => {
    const s: SpriteData = Array.from({ length: 24 }, () => Array(16).fill(_));

    // Hair top
    for (let x = 5; x < 11; x++) s[0][x] = hairColor;
    for (let x = 4; x < 12; x++) s[1][x] = hairColor;

    // Head
    for (let y = 2; y < 6; y++)
      for (let x = 5; x < 11; x++)
        s[y][x] = SK;
    s[2][5] = hairColor; s[2][10] = hairColor;
    // Eyes
    s[3][6] = B; s[3][9] = B;
    // Mouth
    s[4][7] = '#d4a57a'; s[4][8] = '#d4a57a';

    // Body/shirt
    for (let y = 6; y < 14; y++)
      for (let x = 5; x < 11; x++)
        s[y][x] = shirtColor;

    // Arms
    armL.forEach((y, i) => { s[y][4] = SK; s[y][3] = shirtColor; });
    armR.forEach((y, i) => { s[y][11] = SK; s[y][12] = shirtColor; });

    // Pants
    for (let y = 14; y < 18; y++) {
      for (let x = 5; x < 8; x++) s[y][x] = '#2a4a7f';
      for (let x = 8; x < 11; x++) s[y][x] = '#2a4a7f';
    }

    // Shoes
    for (let x = 5; x < 8; x++) s[18][x] = B;
    for (let x = 8; x < 11; x++) s[18][x] = B;

    if (headExtra) headExtra.forEach(([y, x, c]) => { s[y][x] = c; });

    return s;
  };

  const idleArms = [7, 8, 9, 10];
  const idle = makeFrame(idleArms, idleArms);

  // Typing: arms forward
  const typeArmsL = [7, 8, 9];
  const type1 = makeFrame(typeArmsL, typeArmsL);
  // Second type frame: arms slightly shifted
  const type2Frame = makeFrame(typeArmsL, typeArmsL);
  for (let y = 7; y < 10; y++) {
    type2Frame[y][3] = _; type2Frame[y][2] = shirtColor;
    type2Frame[y][12] = _; type2Frame[y][13] = shirtColor;
  }
  for (let y = 7; y < 10; y++) {
    type2Frame[y][4] = _; type2Frame[y][3] = SK;
    type2Frame[y][11] = _; type2Frame[y][12] = SK;
  }

  // Celebrate: arms up
  const celebFrame = makeFrame([], []);
  // Raise arms up
  for (let y = 3; y < 7; y++) {
    celebFrame[y][3] = shirtColor; celebFrame[y][4] = SK;
    celebFrame[y][12] = shirtColor; celebFrame[y][11] = SK;
  }
  // Star sparkles
  celebFrame[1][2] = YL; celebFrame[1][13] = YL;
  celebFrame[0][3] = YL; celebFrame[0][12] = YL;

  return { idle, type1, type2: type2Frame, celebrate: celebFrame };
};

export const characterSprites = characterBase(SH, HA);

export function renderSprite(ctx: CanvasRenderingContext2D, sprite: SpriteData, x: number, y: number, scale: number) {
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const color = sprite[row][col];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}
