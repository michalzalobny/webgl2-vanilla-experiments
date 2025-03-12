import { ShaderProgram } from './ShaderProgram';
import { createAndInitBuffer, setupVertexAttribute } from './Util';
import { Camera } from './Camera';
import { GeometryObject } from './parseOBJ';
import { Vec3 } from './math/Vec3';
import { Mat4 } from './math/Mat4';

interface Constructor {
  geometry: GeometryObject | null;
  shaderProgram: ShaderProgram;
  gl: WebGL2RenderingContext;
}

interface Render {
  camera: Camera;
}

export class Mesh {
  private gl: WebGL2RenderingContext;
  private shaderProgram: ShaderProgram;
  private vertices: number[];
  private normals: number[];
  private texcoords: number[];
  private VAO: WebGLVertexArrayObject | null = null;

  private positionBuffer: WebGLBuffer | null = null;
  private normalBuffer: WebGLBuffer | null = null;
  private uvBuffer: WebGLBuffer | null = null;

  private modelMatrix = new Mat4();

  private position = new Vec3(0);
  private scale = new Vec3(1);
  private rotation = new Vec3(0, 0, 0);
  private shouldUpdateModelMatrix = true;

  constructor(props: Constructor) {
    const { gl, shaderProgram, geometry } = props;

    if (!geometry) throw new Error('No geometry provided for the Mesh');

    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.vertices = geometry.vertices;
    this.normals = geometry.normals;
    this.texcoords = geometry.texcoords;

    this.init();
  }

  private init() {
    // Create VAO for buffer bindings
    this.VAO = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.VAO);

    // Position buffer
    this.positionBuffer = createAndInitBuffer({
      gl: this.gl,
      target: this.gl.ARRAY_BUFFER,
      data: new Float32Array(this.vertices),
    });

    setupVertexAttribute({
      gl: this.gl,
      name: 'a_position',
      program: this.shaderProgram.program,
      buffer: this.positionBuffer,
      size: 3,
    });

    // Normal buffer
    if (this.normals.length > 0) {
      this.normalBuffer = createAndInitBuffer({
        gl: this.gl,
        target: this.gl.ARRAY_BUFFER,
        data: new Float32Array(this.normals),
      });

      setupVertexAttribute({
        gl: this.gl,
        name: 'a_normal',
        program: this.shaderProgram.program,
        buffer: this.normalBuffer,
        size: 3,
      });
    }

    if (this.texcoords.length > 0) {
      // UV buffer
      this.uvBuffer = createAndInitBuffer({
        gl: this.gl,
        target: this.gl.ARRAY_BUFFER,
        data: new Float32Array(this.texcoords),
      });

      setupVertexAttribute({
        gl: this.gl,
        name: 'a_uv',
        program: this.shaderProgram.program,
        buffer: this.uvBuffer,
        size: 2,
      });
    }

    // Unbind VAO
    this.gl.bindVertexArray(null);
  }

  public setPosition(pos: Vec3) {
    this.position.setTo(pos);
    this.shouldUpdateModelMatrix = true;
  }

  public setScale(pos: Vec3) {
    this.scale.setTo(pos);
    this.shouldUpdateModelMatrix = true;
  }

  public render(props: Render) {
    const { camera } = props;

    this.shaderProgram.use();
    this.gl.bindVertexArray(this.VAO);

    if (this.shouldUpdateModelMatrix) {
      // Construct model matrix
      this.modelMatrix.identity();
      this.modelMatrix.translate(this.position);
      this.modelMatrix.scale(this.scale);
      this.modelMatrix.rotateX(this.rotation[0]);
      this.modelMatrix.rotateY(this.rotation[1]);
      this.modelMatrix.rotateZ(this.rotation[2]);

      // Load model matrix, view matrix and projection matrix to shader
      this.shaderProgram.setUniformMatrix4fv('u_modelMatrix', this.modelMatrix);
      this.shouldUpdateModelMatrix = false;
    }

    this.shaderProgram.setUniformMatrix4fv('u_viewMatrix', camera.viewMatrix);
    this.shaderProgram.setUniform3f('u_cameraPositionWorld', camera.position);
    this.shaderProgram.setUniformMatrix4fv('u_projectionMatrix', camera.perspectiveProjectionMatrix);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 3);

    // Unbind VAO
    this.gl.bindVertexArray(null);

    // Unbind textures - doing it here due to asynchronous nature of WebGL handling
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.activeTexture(this.gl.TEXTURE0);
  }

  public destroy() {
    this.gl.deleteBuffer(this.positionBuffer);
    this.gl.deleteBuffer(this.normalBuffer);
    this.gl.deleteBuffer(this.uvBuffer);
    this.gl.deleteVertexArray(this.VAO);
  }
}
