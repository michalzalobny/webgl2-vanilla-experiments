import fragmentShader from '../shaders/particle/fragment.glsl';
import vertexShader from '../shaders/particle/vertex.glsl';
import { GeometriesManager } from '../lib/GeometriesManager';
import { ShaderProgram } from '../lib/ShaderProgram';
import { globalState } from '../utils/globalState';
import { Mesh } from '../lib/Mesh';
import { Camera } from '../lib/Camera';
import { Vec3 } from '../lib/math/Vec3';

type Props = {
  x: number;
  y: number;
  mass: number;
  geometriesManager: GeometriesManager;
  gl: WebGL2RenderingContext;
  camera: Camera;
};

export class Particle {
  public velocity = new Vec3();
  public acceleration = new Vec3();

  private tempVec3 = new Vec3();
  private sumForces = new Vec3();

  public mass: number = 1;

  private geometriesManager: GeometriesManager;
  private gl: WebGL2RenderingContext;

  private program: ShaderProgram;
  private mesh: Mesh;

  private camera: Camera;

  constructor({ mass, geometriesManager, x, y, gl, camera }: Props) {
    this.mass = mass;
    this.gl = gl;
    this.geometriesManager = geometriesManager;
    this.camera = camera;

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

    this.mesh.position.setTo(x, y, 0);
    this.mesh.scale.setTo(this.mass, this.mass, 1);
  }

  public addForce(force: Vec3) {
    this.sumForces.add(force);
  }

  private clearForces() {
    this.sumForces.setTo(0, 0, 0);
  }

  public update() {
    const dt = globalState.dt.value;

    // Add gravity force
    const gravityForce = new Vec3(0, -9.81, 0);
    this.addForce(gravityForce);
    //Add wind force
    const windForce = new Vec3(-0.45, 0, 0);
    this.addForce(windForce);

    this.integrate(dt);

    // Don't go over the bounds
    const leftBound = -globalState.stageSize.value[0] / 2;
    const rightBound = globalState.stageSize.value[0] / 2;
    const topBound = globalState.stageSize.value[1] / 2;
    const bottomBound = -globalState.stageSize.value[1] / 2;

    const radius = this.mass / 2;

    // Handle X-bound collisions
    if (this.mesh.position.x - radius <= leftBound) {
      this.mesh.position.x = leftBound + radius;
      this.velocity.x *= -0.9; // Apply damping
    } else if (this.mesh.position.x + radius >= rightBound) {
      this.mesh.position.x = rightBound - radius;
      this.velocity.x *= -0.9;
    }

    // Handle Y-bound collisions
    if (this.mesh.position.y - radius <= bottomBound) {
      this.mesh.position.y = bottomBound + radius;
      this.velocity.y *= -0.9;
    } else if (this.mesh.position.y + radius >= topBound) {
      this.mesh.position.y = topBound - radius;
      this.velocity.y *= -0.9;
    }

    this.mesh.render({ camera: this.camera });
  }

  // Euler integration of the particle's position and velocity
  private integrate = (dt: number) => {
    // Apply forces to acceleration
    this.acceleration.copy(this.sumForces).divide(this.mass);

    // Update velocity: velocity += acceleration * dt
    this.tempVec3.copy(this.acceleration).multiply(dt);
    this.velocity.add(this.tempVec3);

    // Update position: position += velocity * dt
    this.tempVec3.copy(this.velocity).multiply(dt);
    this.mesh.position.add(this.tempVec3);

    this.clearForces();
  };

  public onResize() {}

  public destroy() {
    this.program.destroy();
    this.mesh.destroy();
  }
}
