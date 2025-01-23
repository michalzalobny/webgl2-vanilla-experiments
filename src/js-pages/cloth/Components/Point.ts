import fragmentShader from '../shaders/particle/fragment.glsl';
import vertexShader from '../shaders/particle/vertex.glsl';
import { GeometriesManager } from '../lib/GeometriesManager';
import { ShaderProgram } from '../lib/ShaderProgram';
import { globalState } from '../utils/globalState';
import { Mesh } from '../lib/Mesh';
import { Camera } from '../lib/Camera';
import { Vec3 } from '../lib/math/Vec3';
import { Stick } from './Stick';

type Props = {
  x: number;
  y: number;
  mass?: number;
  radius?: number;
  pinned?: boolean;
  geometriesManager: GeometriesManager;
  gl: WebGL2RenderingContext;
  camera: Camera;
};

export class Point {
  private sumForces = new Vec3();
  private mass: number;
  private x: number;
  private y: number;
  private gl;
  private pinned;
  private radius;
  private camera: Camera;
  private geometriesManager: GeometriesManager;
  private invMass: number;
  private program: ShaderProgram;
  private sticks: Stick[] = [];
  public mesh: Mesh;

  constructor(props: Props) {
    const { camera, geometriesManager, gl, x, y, mass = 1, pinned = false, radius = 4 } = props;
    if (props.mass === 0) throw new Error('Mass cannot be 0');
    this.gl = gl;
    this.pinned = pinned;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.camera = camera;
    this.geometriesManager = geometriesManager;
    this.mass = mass;
    this.invMass = 1 / mass;

    this.program = new ShaderProgram({
      gl: this.gl,
      vertexCode: vertexShader,
      fragmentCode: fragmentShader,
      texturesManager: null,
      texturesToUse: [],
      uniforms: {
        u_time: globalState.uTime,
      },
    });

    this.mesh = new Mesh({
      gl: this.gl,
      shaderProgram: this.program,
      geometry: this.geometriesManager.getGeometry('plane'),
    });

    this.mesh.position.setTo(this.x, this.y, 0);
    this.mesh.scale.setTo(this.radius * 2, this.radius * 2, 1);
  }

  public addStick(stick: Stick, index: number) {
    this.sticks[index] = stick;
  }

  public pin() {
    this.pinned = true;
  }

  public addForce(force: Vec3) {
    this.sumForces.add(force);
  }

  private clearForces() {
    this.sumForces.setTo(0, 0, 0);
  }

  public update() {
    const physics_dt = globalState.physics_dt.value;

    this.integrate(physics_dt);
  }

  public render() {
    this.mesh.render({ camera: this.camera });
  }

  private integrate = (dt: number) => {};

  public onResize() {}

  public destroy() {
    this.program.destroy();
    this.mesh.destroy();
  }
}
