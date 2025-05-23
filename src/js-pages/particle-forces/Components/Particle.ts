import fragmentShader from '../shaders/particle/fragment.glsl';
import vertexShader from '../shaders/particle/vertex.glsl';
import { GeometriesManager } from '../lib/GeometriesManager';
import { ShaderProgram } from '../lib/ShaderProgram';
import { globalState } from '../utils/globalState';
import { Mesh } from '../lib/Mesh';
import { Camera } from '../lib/Camera';
import { Vec3 } from '../lib/math/Vec3';
import { Tween } from '../utils/Tween';

type Props = {
  x: number;
  y: number;
  mass: number;
  radius: number;
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
  private invMass: number;
  public radius: number = 1;

  private geometriesManager: GeometriesManager;
  private gl: WebGL2RenderingContext;

  private program: ShaderProgram;
  public mesh: Mesh;

  private camera: Camera;

  private uniforms = {
    u_time: globalState.uTime,
    u_entry_scale: { value: 0 },
  };

  constructor({ mass, geometriesManager, x, y, gl, camera, radius }: Props) {
    this.mass = mass;
    if (mass === 0) throw new Error('Mass cannot be 0');
    this.invMass = 1 / mass;
    this.radius = radius;
    this.gl = gl;
    this.geometriesManager = geometriesManager;
    this.camera = camera;

    this.program = new ShaderProgram({
      gl: this.gl,
      vertexCode: vertexShader,
      fragmentCode: fragmentShader,
      texturesManager: null,
      texturesToUse: [],
      uniforms: this.uniforms,
    });

    this.mesh = new Mesh({
      gl: this.gl,
      shaderProgram: this.program,
      geometry: this.geometriesManager.getGeometry('plane'),
    });

    this.mesh.position.setTo(x, y, 0);
    this.mesh.scale.setTo(this.radius * 2, this.radius * 2, 1);

    const particleTween = new Tween(`particleTween${Math.random()}`, 200);
    particleTween.addTask(this.uniforms.u_entry_scale).to({ value: 1 });
    particleTween.start();
  }

  public addForce(force: Vec3) {
    this.sumForces.add(force);
  }

  private clearForces() {
    this.sumForces.setTo(0, 0, 0);
  }

  private generateWeightForce() {
    const weight = new Vec3(0, -this.mass * 9.81 * 60, 0);
    return weight;
  }

  public update() {
    const dt = globalState.physics_dt.value;

    // Add weight force (gravity)
    const weight = this.generateWeightForce();
    this.addForce(weight);
    //Add wind force
    const windForce = new Vec3(-0.8 * 60, 0, 0);
    this.addForce(windForce);

    this.integrate(dt);

    // Don't go over the bounds
    const leftBound = -globalState.stageSize.value[0] / 2;
    const rightBound = globalState.stageSize.value[0] / 2;
    const topBound = globalState.stageSize.value[1] / 2;
    const bottomBound = -globalState.stageSize.value[1] / 2;

    const radius = this.radius;

    const damping = 0.6;
    // Handle X-bound collisions
    if (this.mesh.position.x - radius <= leftBound) {
      this.mesh.position.x = leftBound + radius;
      this.velocity.x *= -damping; // Apply damping
    } else if (this.mesh.position.x + radius >= rightBound) {
      this.mesh.position.x = rightBound - radius;
      this.velocity.x *= -damping;
    }

    // Handle Y-bound collisions
    if (this.mesh.position.y - radius <= bottomBound) {
      this.mesh.position.y = bottomBound + radius;
      this.velocity.y *= -damping;
    } else if (this.mesh.position.y + radius >= topBound) {
      this.mesh.position.y = topBound - radius;
      this.velocity.y *= -damping;
    }

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
    this.mesh.position.add(this.tempVec3);

    this.clearForces();
  };

  public onResize() {}

  public destroy() {
    this.program.destroy();
    this.mesh.destroy();
  }
}
