import { GeometriesManager } from '../lib/GeometriesManager';
import { Camera } from '../lib/Camera';

interface Constructor {
  gl: WebGL2RenderingContext;
  geometriesManager: GeometriesManager;
  camera: Camera;
}

export class Cloth {
  private gl: WebGL2RenderingContext;
  private geometriesManager: GeometriesManager;
  private camera: Camera;

  constructor(props: Constructor) {
    const { gl, geometriesManager, camera } = props;

    this.gl = gl;
    this.geometriesManager = geometriesManager;
    this.camera = camera;

    this.init();
  }

  private init() {}

  public update() {}

  public render() {}

  public onResize() {}

  public destroy() {}
}
