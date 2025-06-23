import GUI from 'lil-gui';

export const globalState = {
  gui: null as GUI | null,
  pixelRatio: {
    value: 1,
  },
  dt: {
    value: 1,
  },
  physics_dt: {
    value: 1,
  },
  uTime: {
    value: 0,
  },
  mouse2DTarget: {
    value: [0, 0],
  },
  mouse2DCurrent: {
    value: [0, 0],
  },
  debugHolderEl: null as HTMLDivElement | null,
  canvasEl: null as HTMLCanvasElement | null,
};
