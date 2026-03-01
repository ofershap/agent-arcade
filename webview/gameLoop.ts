import { OfficeState } from './types';
import { renderOffice } from './office';
import { updateCharacter } from './character';

export function startGameLoop(
  canvas: HTMLCanvasElement,
  state: OfficeState,
  getScale: () => number
) {
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  let lastTime = performance.now();

  function loop(now: number) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    state.tick += dt;

    updateCharacter(state.character, dt);

    const scale = getScale();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderOffice(ctx, state, scale);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
