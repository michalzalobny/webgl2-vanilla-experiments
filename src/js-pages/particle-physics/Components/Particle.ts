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

  public update() {
    const dt = globalState.dt.value;
    // Update acceleration so it points to the center of the screen
    const center = new Vec3(0, 0, 0);
    const force = center.sub(this.mesh.position);
    force.normalize();
    force.multiply(0.1);
    this.acceleration = force;

    this.integrate(dt);

    // Dont let the particle go out of the screen
    const leftBound = -globalState.stageSize.value[0] / 2;
    const rightBound = globalState.stageSize.value[0] / 2;
    const topBound = globalState.stageSize.value[1] / 2;
    const bottomBound = -globalState.stageSize.value[1] / 2;
    if (this.mesh.position.x - this.mass / 2 < leftBound || this.mesh.position.x + this.mass / 2 > rightBound) {
      this.velocity.x *= -1;
    }
    if (this.mesh.position.y - this.mass / 2 < bottomBound || this.mesh.position.y + this.mass / 2 > topBound) {
      this.velocity.y *= -1;
    }

    this.mesh.render({ camera: this.camera });
  }

  // Euler integration of the particle's position and velocity
  private integrate = (dt: number) => {
    // Update velocity: velocity += acceleration * dt
    this.tempVec3.copy(this.acceleration).multiply(dt);
    this.velocity.add(this.tempVec3);

    // Update position: position += velocity * dt
    this.tempVec3.copy(this.velocity).multiply(dt);
    this.mesh.position.add(this.tempVec3);
  };

  public onResize() {}

  public destroy() {
    this.program.destroy();
    this.mesh.destroy();
  }
}
