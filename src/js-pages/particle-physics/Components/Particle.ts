import { vec2, vec3 } from 'gl-matrix';

import fragmentShader from '../shaders/particle/fragment.glsl';
import vertexShader from '../shaders/particle/vertex.glsl';
import { GeometriesManager } from '../lib/GeometriesManager';
import { ShaderProgram } from '../lib/ShaderProgram';
import { globalState } from '../utils/globalState';
import { Mesh } from '../lib/Mesh';
import { Camera } from '../lib/Camera';
import { updateDebug } from '../utils/updateDebug';

type Props = {
  x: number;
  y: number;
  mass: number;
  geometriesManager: GeometriesManager;
  gl: WebGL2RenderingContext;
  camera: Camera;
};

export class Particle {
  public position: vec2 = vec2.create();
  public velocity: vec2 = vec2.create();
  public acceleration: vec2 = vec2.create();

  public mass: number = 1;

  private geometriesManager: GeometriesManager;
  private gl: WebGL2RenderingContext;

  private program: ShaderProgram;
  private mesh: Mesh;

  private camera: Camera;

  constructor({ mass, geometriesManager, x, y, gl, camera }: Props) {
    this.position = vec2.fromValues(x, y);
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
  }

  public update() {
    // Add velocity to position
    vec2.add(this.position, this.position, this.velocity);

    this.mesh.position = vec3.fromValues(this.position[0], this.position[1], 0);
    this.mesh.scale = vec3.fromValues(this.mass * 50, this.mass * 50, 1);
    this.mesh.render({ camera: this.camera });
  }

  public onResize() {}

  public destroy() {
    this.program.destroy();
    this.mesh.destroy();
  }
}
