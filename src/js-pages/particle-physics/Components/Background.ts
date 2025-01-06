import { ShaderProgram } from '../lib/ShaderProgram';
import { Mesh } from '../lib/Mesh';
import { globalState } from '../utils/globalState';
import { GeometriesManager } from '../lib/GeometriesManager';
import { Camera } from '../lib/Camera';

import fragmentShader from '../shaders/background/fragment.glsl';
import vertexShader from '../shaders/background/vertex.glsl';
import { vec3 } from 'gl-matrix';

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

    this.mesh.position = vec3.fromValues(0, 0, -10); // Put the background behind everything
  }

  public update() {
    this.mesh?.render({ camera: this.camera });
  }

  public onResize() {
    const w = globalState.stageSize.value[0];
    const h = globalState.stageSize.value[1];
    if (this.mesh) {
      this.mesh.scale = vec3.fromValues(w * 1.1, h * 1.1, 1);
    }
  }

  public destroy() {
    if (this.mesh) this.mesh.destroy();
    if (this.program) this.program.destroy();
  }
}
