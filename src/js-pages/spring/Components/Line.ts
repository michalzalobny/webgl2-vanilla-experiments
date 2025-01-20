import { ShaderProgram } from '../lib/ShaderProgram';
import { Mesh } from '../lib/LineMesh';
import { globalState } from '../utils/globalState';
import { GeometriesManager } from '../lib/GeometriesManager';
import { Camera } from '../lib/Camera';

import fragmentShader from '../shaders/line/fragment.glsl';
import vertexShader from '../shaders/line/vertex.glsl';
import { Vec3 } from '../lib/math/Vec3';

interface Constructor {
  gl: WebGL2RenderingContext;
  geometriesManager: GeometriesManager;
  camera: Camera;
}

export class Line {
  private gl: WebGL2RenderingContext;

  private mesh: Mesh | null = null;

  private program: ShaderProgram | null = null;

  private geometriesManager: GeometriesManager;
  private camera: Camera;

  public startPoint = new Vec3(0, 0, 0);
  public endPoint = new Vec3(0, 0, 0);

  private programUniforms = {
    u_time: globalState.uTime,
    u_resolution: globalState.stageSize,
  };

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
      uniforms: this.programUniforms,
    });

    this.mesh = new Mesh({
      gl: this.gl,
      shaderProgram: this.program,
      geometry: this.geometriesManager.getGeometry('plane'),
    });

    this.mesh.position = new Vec3(0, 0, 0);
    this.mesh.scale = new Vec3(1, 1, 1);
    this.mesh.rotation = new Vec3(0, 0, 0);
  }

  public update(startPoint: Vec3, endPoint: Vec3) {
    this.startPoint.setTo(startPoint);
    this.endPoint.setTo(endPoint);
    this.mesh?.scale.setTo(this.startPoint.distance(this.endPoint), 10, 1);

    const tempVec = new Vec3().copy(this.endPoint).sub(this.startPoint);
    const angle = Math.atan2(tempVec.y, tempVec.x); // Used to calculate the angle between the two points

    this.mesh?.rotation.setTo(0, 0, angle);
    const meshPosition = new Vec3().copy(this.startPoint).add(this.endPoint).multiply(0.5);
    this.mesh?.position.setTo(meshPosition);
  }

  public render() {
    this.mesh?.render({ camera: this.camera });
  }

  public onResize() {}

  public destroy() {
    if (this.mesh) this.mesh.destroy();
    if (this.program) this.program.destroy();
  }
}
