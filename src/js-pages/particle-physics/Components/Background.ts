import { ShaderProgram } from '../lib/ShaderProgram';
import { Mesh } from '../lib/Mesh';
import { globalState } from '../utils/globalState';
import { GeometriesManager } from '../lib/GeometriesManager';
import { Camera } from '../lib/Camera';

import fragmentShader from '../shaders/background/fragment.glsl';
import vertexShader from '../shaders/background/vertex.glsl';

interface Constructor {
  gl: WebGL2RenderingContext;
  geometriesManager: GeometriesManager;
  camera: Camera;
}

export class Background {
  private gl: WebGL2RenderingContext;

  private mesh: Mesh | null = null;

  private program: ShaderProgram | null = null;

  private geometriesManager: GeometriesManager;
  private camera: Camera;

  constructor(props: Constructor) {
    const { gl, geometriesManager, camera } = props;

    this.gl = gl;
    this.geometriesManager = geometriesManager;
    this.camera = camera;

    this.init();
  }

  private init() {
    this.program = new ShaderProgram({
      gl: this.gl,
      fragmentCode: fragmentShader,
      vertexCode: vertexShader,
      texturesManager: null,
      uniforms: {
        u_time: globalState.uTime,
        u_resolution: globalState.stageSize,
      },
    });

    this.mesh = new Mesh({
      gl: this.gl,
      shaderProgram: this.program,
      geometry: this.geometriesManager.getGeometry('plane'),
    });
  }

  public update() {
    if (this.mesh) {
      // Disable depth test when rendering the background - it will be behind everything
      this.gl.disable(this.gl.DEPTH_TEST);
      this.mesh.render({ camera: this.camera });
      this.gl.enable(this.gl.DEPTH_TEST);
    }
  }

  public onResize() {}

  public destroy() {
    if (this.mesh) this.mesh.destroy();
    if (this.program) this.program.destroy();
  }
}
