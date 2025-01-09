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
    this.mesh.scale.setTo(this.mass * 50, this.mass * 50, 1);
  }

  public update() {
    // Add velocity to position
    this.mesh.position.add(this.velocity);
    this.mesh.render({ camera: this.camera });
  }

  public onResize() {}

  public destroy() {
    this.program.destroy();
    this.mesh.destroy();
  }
}
