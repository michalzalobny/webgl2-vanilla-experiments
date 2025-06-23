import { ShaderProgram } from '../lib/ShaderProgram';
import { Mesh } from '../lib/LineMesh';
import { globalState } from '../utils/globalState';
import { GeometriesManager } from '../lib/GeometriesManager';
import { Camera } from '../lib/Camera';

import fragmentShader from '../shaders/line/fragment.glsl';
import vertexShader from '../shaders/line/vertex.glsl';
import { Vec3 } from '../lib/math/Vec3';
import { Point } from './Point';
import { GlobalResize } from '../utils/GlobalResize';

interface Props {
  gl: WebGL2RenderingContext;
  geometriesManager: GeometriesManager;
  camera: Camera;
  color: Vec3;
  p1: Point;
  p2: Point;
}

export class Stick {
  static LINE_WIDTH = 0.8;

  private gl: WebGL2RenderingContext;
  private geometriesManager: GeometriesManager;
  private camera: Camera;
  private mesh: Mesh | null = null;
  private program: ShaderProgram | null = null;

  private p1;
  private p2;

  private programUniforms = {
    u_time: globalState.uTime,
    u_resolution: GlobalResize.windowSize,
    u_color: { value: new Vec3(0) },
  };

  constructor(props: Props) {
    const { camera, color, geometriesManager, gl, p1, p2 } = props;
    this.p1 = p1;
    this.p2 = p2;
    this.camera = camera;
    this.geometriesManager = geometriesManager;
    this.gl = gl;
    this.programUniforms.u_color.value.setTo(color);
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

  public update() {
    const startPoint = this.p1.mesh.position;
    const endPoint = this.p2.mesh.position;

    this.mesh?.scale.setTo(startPoint.distance(endPoint), Stick.LINE_WIDTH, 1);

    const tempVec = new Vec3().copy(endPoint).sub(startPoint);
    const angle = Math.atan2(tempVec.y, tempVec.x); // Used to calculate the angle between the two points

    this.mesh?.rotation.setTo(0, 0, angle);
    const meshPosition = new Vec3().copy(startPoint).add(endPoint).multiply(0.5);
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
