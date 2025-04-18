import fragmentShader from '../shaders/pointParticle/fragment.glsl';
import vertexShader from '../shaders/pointParticle/vertex.glsl';

import { ShaderProgram } from '../lib/ShaderProgram';
import { globalState } from '../utils/globalState';
import { InstancedPoints } from '../lib/InstancedPoints';
import { Camera } from '../lib/Camera';
import { Vec3 } from '../lib/math/Vec3';

type Props = {
  mass?: number;
  gl: WebGL2RenderingContext;
  camera: Camera;
};

export class Point {
  public velocity = new Vec3();
  public acceleration = new Vec3();

  private tempVec3 = new Vec3();
  private sumForces = new Vec3();

  private mass: number;
  private gl;
  private camera: Camera;
  private invMass: number;
  private program: ShaderProgram;
  public mesh: InstancedPoints;

  constructor(props: Props) {
    const { camera, gl, mass = 1 } = props;
    if (props.mass === 0) throw new Error('Mass cannot be 0');
    this.gl = gl;
    this.camera = camera;
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

    this.mesh = new InstancedPoints({
      instanceCount: 500000,
      gl: this.gl,
      shaderProgram: this.program,
    });
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

  // Euler integration of the particle's position and velocity
  private integrate = (dt: number) => {
    // Apply forces to acceleration
    this.acceleration.copy(this.sumForces).multiply(this.invMass);

    // Update velocity: velocity += acceleration * dt
    this.tempVec3.copy(this.acceleration).multiply(dt);
    this.velocity.add(this.tempVec3);

    // Update position: position += velocity * dt
    this.tempVec3.copy(this.velocity).multiply(dt);
    this.mesh.addPosition(this.tempVec3);

    this.clearForces();
  };

  public onResize() {}

  public destroy() {
    this.program.destroy();
    this.mesh.destroy();
  }
}
