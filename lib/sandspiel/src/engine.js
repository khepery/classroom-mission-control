import init, { Universe, Species } from "../wasm/sandtable.js";
import { startWebGL } from "./render.js";
import { startFluid } from "./fluid.js";

export { Species };

export async function createEngine(canvas, fluidCanvas, size = 160) {
  const { memory } = await init({ module_or_path: new URL("./wasm/sandtable_bg.wasm", import.meta.url) });
  const universe = Universe.new(size, size);
  function clearWind() {
    const winds = new Uint8Array(memory.buffer, universe.winds(), size * size * 4);
    winds.fill(0);
    for (let i = 0; i < winds.length; i += 4) winds[i] = winds[i + 1] = 126;
    new Uint8Array(memory.buffer, universe.burns(), size * size * 4).fill(0);
  }
  clearWind();
  canvas.width = canvas.height = size * 2;
  let render;
  let fluid;
  try {
    render = startWebGL({ canvas, universe, memory });
    fluid = startFluid({ universe, memory, canvas: fluidCanvas, sandCanvas: canvas });
  } catch (error) {
    render?.destroy();
    universe.free();
    throw error;
  }
  return {
    size,
    paint: (x, y, brush, material) => universe.paint(x, y, brush, material),
    tick() { universe.tick(); fluid.update(); },
    render,
    clear() {
      universe.reset();
      clearWind();
      fluid.reset();
      fluid.update();
      fluid.reset();
      fluid.update();
      universe.reset();
      clearWind();
    },
    cells: () => new Uint8Array(memory.buffer, universe.cells(), size * size * 4),
    destroy() {
      render.destroy();
      fluid.destroy();
      universe.free();
    },
  };
}
