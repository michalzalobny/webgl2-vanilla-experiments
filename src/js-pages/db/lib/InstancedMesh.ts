import { ShaderProgram } from './ShaderProgram';
import { createAndInitBuffer, setupVertexAttribute } from './Util';
import { Camera } from './Camera';
import { GeometryObject } from './parseOBJ';
import { Vec3 } from './math/Vec3';
import { Mat4 } from './math/Mat4';

interface Constructor {
  geometry: GeometryObject | null;
  shaderProgram: ShaderProgram;
  instanceCount: number;
  gl: WebGL2RenderingContext;
}

interface Render {
  camera: Camera;
}

export class InstancedMesh {
  private gl: WebGL2RenderingContext;
  private shaderProgram: ShaderProgram;
  private vertices: number[];
  private normals: number[];
  private texcoords: number[];
  private VAO: WebGLVertexArrayObject | null = null;

  private positionBuffer: WebGLBuffer | null = null;
  private normalBuffer: WebGLBuffer | null = null;
  private uvBuffer: WebGLBuffer | null = null;
  private instanceColorBuffer: WebGLBuffer | null = null;
  private instanceMatrixBuffer: WebGLBuffer | null = null;
  private instanceVisibilityBuffer: WebGLBuffer | null = null;

  private modelMatrix = new Mat4();

  public position = new Vec3(0);
  public scale = new Vec3(1);
  public rotation = new Vec3(0, 0, 0);

  private instanceColors: Float32Array;
  private instanceVisibility: Float32Array;
  private instanceCount: number;

  constructor(props: Constructor) {
    const { gl, shaderProgram, geometry, instanceCount } = props;

    if (!geometry) throw new Error('No geometry provided for the Mesh');

    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.vertices = geometry.vertices;
    this.normals = geometry.normals;
    this.texcoords = geometry.texcoords;
    this.instanceCount = instanceCount;

    this.instanceColors = new Float32Array(this.instanceCount * 3);
    this.instanceVisibility = new Float32Array(this.instanceCount);
    this.instanceVisibility.fill(1); // Default: all visible

    this.init();
  }

  private init() {
    const gl = this.gl;
    const program = this.shaderProgram.program;

    this.VAO = gl.createVertexArray();
    gl.bindVertexArray(this.VAO);

    // Vertex positions
    this.positionBuffer = createAndInitBuffer({
      gl,
      target: gl.ARRAY_BUFFER,
      data: new Float32Array(this.vertices),
    });
    setupVertexAttribute({
      gl,
      name: 'a_position',
      program,
      buffer: this.positionBuffer,
      size: 3,
    });

    // Normals
    if (this.normals.length > 0) {
      this.normalBuffer = createAndInitBuffer({
        gl,
        target: gl.ARRAY_BUFFER,
        data: new Float32Array(this.normals),
      });
      setupVertexAttribute({
        gl,
        name: 'a_normal',
        program,
        buffer: this.normalBuffer,
        size: 3,
      });
    }

    // Texture coordinates
    if (this.texcoords.length > 0) {
      this.uvBuffer = createAndInitBuffer({
        gl,
        target: gl.ARRAY_BUFFER,
        data: new Float32Array(this.texcoords),
      });
      setupVertexAttribute({
        gl,
        name: 'a_uv',
        program,
        buffer: this.uvBuffer,
        size: 2,
      });
    }

    // Instance colors
    for (let i = 0; i < this.instanceCount; i++) {
      this.instanceColors[i * 3 + 0] = Math.random();
      this.instanceColors[i * 3 + 1] = Math.random();
      this.instanceColors[i * 3 + 2] = Math.random();
    }

    this.instanceColorBuffer = createAndInitBuffer({
      gl,
      target: gl.ARRAY_BUFFER,
      data: this.instanceColors,
    });

    setupVertexAttribute({
      gl,
      name: 'a_instanceColor',
      program,
      buffer: this.instanceColorBuffer,
      size: 3,
      divisor: 1,
    });

    // Instance visibility
    this.instanceVisibilityBuffer = createAndInitBuffer({
      gl,
      target: gl.ARRAY_BUFFER,
      data: this.instanceVisibility,
    });

    setupVertexAttribute({
      gl,
      name: 'a_visibility',
      program,
      buffer: this.instanceVisibilityBuffer,
      size: 1,
      divisor: 1,
    });

    gl.bindVertexArray(null);
  }

  public setInstanceMatrices(instanceMatrices: Float32Array) {
    const gl = this.gl;

    if (instanceMatrices.length !== this.instanceCount * 16) {
      throw new Error(`Expected ${this.instanceCount * 16} matrix elements, got ${instanceMatrices.length}`);
    }

    if (!this.instanceMatrixBuffer) {
      this.instanceMatrixBuffer = createAndInitBuffer({
        gl,
        target: gl.ARRAY_BUFFER,
        data: instanceMatrices,
      });
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceMatrixBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, instanceMatrices, gl.DYNAMIC_DRAW);
    }

    gl.bindVertexArray(this.VAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceMatrixBuffer);

    const program = this.shaderProgram.program;
    const baseLocation = gl.getAttribLocation(program, 'a_instanceMatrix');

    if (baseLocation === -1) {
      throw new Error(`Attribute 'a_instanceMatrix' not found in shader`);
    }

    for (let i = 0; i < 4; i++) {
      const loc = baseLocation + i;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 64, i * 16);
      gl.vertexAttribDivisor(loc, 1);
    }

    gl.bindVertexArray(null);
  }

  public setInstanceColors(colors: Float32Array) {
    if (colors.length !== this.instanceCount * 3) {
      throw new Error(`Expected ${this.instanceCount * 3} color components, got ${colors.length}`);
    }

    this.instanceColors.set(colors);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceColorBuffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.instanceColors);
  }

  public setInstanceVisibility(visibility: Float32Array) {
    if (visibility.length !== this.instanceCount) {
      throw new Error(`Expected ${this.instanceCount} visibility flags, got ${visibility.length}`);
    }

    this.instanceVisibility.set(visibility);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceVisibilityBuffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.instanceVisibility);
  }

  public render(props: Render) {
    const { camera } = props;
    const gl = this.gl;

    this.shaderProgram.use();
    gl.bindVertexArray(this.VAO);

    this.modelMatrix.identity();
    this.modelMatrix.translate(this.position);
    this.modelMatrix.scale(this.scale);
    this.modelMatrix.rotateX(this.rotation[0]);
    this.modelMatrix.rotateY(this.rotation[1]);
    this.modelMatrix.rotateZ(this.rotation[2]);

    this.shaderProgram.setUniformMatrix4fv('u_modelMatrix', this.modelMatrix);
    this.shaderProgram.setUniformMatrix4fv('u_viewMatrix', camera.viewMatrix);
    this.shaderProgram.setUniformMatrix4fv('u_projectionMatrix', camera.perspectiveProjectionMatrix);
    this.shaderProgram.setUniform3f('u_cameraPositionWorld', camera.position);

    gl.drawArraysInstanced(gl.TRIANGLES, 0, this.vertices.length / 3, this.instanceCount);

    gl.bindVertexArray(null);
  }

  public destroy() {
    const gl = this.gl;
    if (this.positionBuffer) gl.deleteBuffer(this.positionBuffer);
    if (this.normalBuffer) gl.deleteBuffer(this.normalBuffer);
    if (this.uvBuffer) gl.deleteBuffer(this.uvBuffer);
    if (this.instanceColorBuffer) gl.deleteBuffer(this.instanceColorBuffer);
    if (this.instanceMatrixBuffer) gl.deleteBuffer(this.instanceMatrixBuffer);
    if (this.instanceVisibilityBuffer) gl.deleteBuffer(this.instanceVisibilityBuffer);
    if (this.VAO) gl.deleteVertexArray(this.VAO);
  }
}
