import { ShaderProgram } from '../lib/ShaderProgram';
import { Mesh } from '../lib/Mesh';
import { globalState } from '../utils/globalState';
import { GeometriesManager } from '../lib/GeometriesManager';
import { Camera } from '../lib/Camera';

import fragmentShader from '../shaders/liquid/fragment.glsl';
import vertexShader from '../shaders/liquid/vertex.glsl';
import { Vec3 } from '../lib/math/Vec3';

interface Constructor {
  gl: WebGL2RenderingContext;
  geometriesManager: GeometriesManager;
  camera: Camera;
}

export class Liquid {
  private gl: WebGL2RenderingContext;

  public mesh: Mesh | null = null;

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
    this.mesh?.render({ camera: this.camera });
  }

  public onResize() {
    const w = globalState.stageSize.value[0];
    const h = globalState.stageSize.value[1];
    const elHeight = h / 3;
    if (this.mesh) {
      this.mesh.scale = new Vec3(w, elHeight, 1);
      this.mesh.position = new Vec3(0, -elHeight / 2 - (h / 2 - elHeight), -0.0001); // Put it behind the particles
    }
  }

  public destroy() {
    if (this.mesh) this.mesh.destroy();
    if (this.program) this.program.destroy();
  }
}
