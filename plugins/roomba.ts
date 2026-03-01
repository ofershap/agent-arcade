import { InteractiveObject, SpriteData } from '../webview/types';
import { TILE_SIZE, COLS, renderSprite, makeSprite, fill, outline } from '../webview/sprites';

const OL = '#1a1a2e';

const roombaSprite: SpriteData = (() => {
  const s = makeSprite(18, 8);
  const BD = '#2a2a2e';
  const BM = '#3a3a40';
  const BL = '#4a4a52';
  const BT = '#555560';
  const GR = '#44cc66';
  const WH = '#cccccc';

  fill(s, 4, 0, 13, 0, BD); outline(s, 4, 0, 13, 0, OL);
  fill(s, 2, 1, 15, 1, '#555558'); outline(s, 2, 1, 15, 1, OL);
  fill(s, 1, 2, 16, 5, BM); outline(s, 1, 2, 16, 5, OL);
  fill(s, 2, 6, 15, 6, BD); outline(s, 2, 6, 15, 6, OL);
  fill(s, 5, 7, 12, 7, BD); outline(s, 5, 7, 12, 7, OL);

  fill(s, 3, 3, 14, 4, BL);
  fill(s, 5, 3, 12, 4, BT);

  fill(s, 6, 2, 11, 2, WH);

  s[3][8] = GR; s[3][9] = GR;

  s[3][5] = '#ffffff'; s[3][12] = '#ffffff';
  s[4][5] = OL; s[4][12] = OL;

  s[4][1] = '#666'; s[4][16] = '#666';

  return s;
})();

type RoombaPhase = 'waiting' | 'entering' | 'cleaning' | 'exiting' | 'gone';

function nextRoombaDelay(isFirst: boolean): number {
  return isFirst ? 60 : 180 + Math.random() * 120;
}

export function createRoomba(): InteractiveObject {
  const startCol = -1.5;
  const floorRow = 2.2;

  return {
    id: 'roomba', sprites: [roombaSprite], position: { col: startCol, row: floorRow },
    hitbox: { w: 18, h: 8 }, zY: (floorRow + 0.5) * TILE_SIZE,
    state: {
      phase: 'waiting' as RoombaPhase,
      timer: nextRoombaDelay(true),
      cleanTargetCol: 1.0,
      cleanTargetRow: floorRow,
      cleanLegs: 0,
      maxCleanLegs: 4,
      facingRight: true,
      spinAngle: 0,
      firstRun: true,
    },
    onClick: (obj) => {
      if ((obj.state.phase as RoombaPhase) === 'waiting' || (obj.state.phase as RoombaPhase) === 'gone') {
        obj.state.phase = 'entering';
        obj.state.timer = 0;
        obj.position.col = -1.5;
        obj.state.cleanLegs = 0;
        obj.state.cleanTargetCol = 1.0;
        obj.state.cleanTargetRow = floorRow;
        return '🤖 Deploying Roomba!';
      }
      return '🤖 Cleaning in progress...';
    },
    render: (ctx, obj, tick, scale) => {
      const dt = 0.016;
      const phase = obj.state.phase as RoombaPhase;
      const speed = 0.7;
      const exitCol = COLS + 1;

      if (phase === 'waiting') {
        obj.state.timer = (obj.state.timer as number) - dt;
        if ((obj.state.timer as number) <= 0) {
          obj.state.phase = 'entering';
          obj.position.col = -1.5;
          obj.state.cleanLegs = 0;
          obj.state.cleanTargetCol = 0.5 + Math.random() * 2;
          obj.state.cleanTargetRow = 1.5 + Math.random() * 1.0;
          console.log('[Roomba] Entering office');
        }
        return;
      }

      if (phase === 'gone') {
        obj.state.timer = (obj.state.timer as number) - dt;
        if ((obj.state.timer as number) <= 0) {
          obj.state.phase = 'waiting';
          obj.state.timer = nextRoombaDelay(false);
          obj.position.col = -1.5;
          console.log(`[Roomba] Next visit in ${Math.round(obj.state.timer as number)}s`);
        }
        return;
      }

      obj.state.spinAngle = ((obj.state.spinAngle as number) + dt * 8) % (Math.PI * 2);
      obj.zY = (obj.position.row + 0.5) * TILE_SIZE;

      if (phase === 'entering') {
        const targetCol = obj.state.cleanTargetCol as number;
        const targetRow = obj.state.cleanTargetRow as number;
        const dx = targetCol - obj.position.col;
        const dy = targetRow - obj.position.row;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.1) {
          obj.position.col += (dx / dist) * speed * dt;
          obj.position.row += (dy / dist) * speed * dt;
          obj.state.facingRight = dx > 0;
        } else {
          obj.state.phase = 'cleaning';
          obj.state.cleanLegs = 0;
          obj.state.maxCleanLegs = 3 + Math.floor(Math.random() * 3);
          obj.state.cleanTargetCol = obj.state.facingRight ? 4.5 + Math.random() : 0.5 + Math.random();
          obj.state.cleanTargetRow = 1.3 + Math.random() * 1.2;
          console.log(`[Roomba] Cleaning (${obj.state.maxCleanLegs} legs)`);
        }
      }

      if (phase === 'cleaning') {
        const targetCol = obj.state.cleanTargetCol as number;
        const targetRow = obj.state.cleanTargetRow as number;
        const dx = targetCol - obj.position.col;
        const dy = targetRow - obj.position.row;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.15) {
          obj.position.col += (dx / dist) * speed * dt;
          obj.position.row += (dy / dist) * speed * dt;
          obj.state.facingRight = dx > 0;
        } else {
          obj.state.cleanLegs = (obj.state.cleanLegs as number) + 1;
          if ((obj.state.cleanLegs as number) >= (obj.state.maxCleanLegs as number)) {
            obj.state.phase = 'exiting';
          } else {
            const goRight = (obj.state.cleanLegs as number) % 2 === 0;
            obj.state.cleanTargetCol = goRight ? 4.0 + Math.random() * 1.5 : 0.3 + Math.random() * 1.5;
            obj.state.cleanTargetRow = 1.3 + Math.random() * 1.2;
          }
        }
      }

      if (phase === 'exiting') {
        obj.position.col += speed * dt;
        obj.state.facingRight = true;
        if (obj.position.col >= exitCol) {
          obj.state.phase = 'gone';
          obj.state.timer = 0.5;
          obj.state.firstRun = false;
          console.log('[Roomba] Exited office');
        }
      }

      const x = obj.position.col * TILE_SIZE * scale;
      const y = obj.position.row * TILE_SIZE * scale;

      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.ellipse(x + 9 * scale, y + 8 * scale, 8 * scale, 2 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      if (!(obj.state.facingRight as boolean)) {
        ctx.save();
        ctx.translate(x + 18 * scale, 0);
        ctx.scale(-1, 1);
        renderSprite(ctx, roombaSprite, 0, y, scale);
        ctx.restore();
      } else {
        renderSprite(ctx, roombaSprite, x, y, scale);
      }

      if (phase === 'cleaning' || phase === 'entering' || phase === 'exiting') {
        const angle = obj.state.spinAngle as number;
        for (let i = 0; i < 3; i++) {
          const a = angle + (i * Math.PI * 2) / 3;
          const px = x + (9 + Math.cos(a) * 4) * scale;
          const py = y + (7 + Math.sin(a) * 1.2) * scale;
          ctx.fillStyle = `rgba(180,160,140,${0.15 + 0.1 * Math.sin(tick * 6 + i)})`;
          ctx.beginPath();
          ctx.arc(px, py, 0.8 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
  };
}
