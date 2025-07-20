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

  private modelMatrix = new Mat4();

  public position = new Vec3(0);
  public scale = new Vec3(1);
  public rotation = new Vec3(0, 0, 0);

  private instanceColors;
  private instanceCount: number;

  private instanceMatrixBuffer: WebGLBuffer | null = null;

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

    this.init();
  }

  private init() {
    const gl = this.gl;
    const program = this.shaderProgram.program;

    // Create and bind VAO
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

    // Vertex normals (optional)
    if (this.normals?.length > 0) {
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

    // Texture coordinates (optional)
    if (this.texcoords?.length > 0) {
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

    // ---- Instancing data ----

    // Instanced colors
    for (let i = 0; i < this.instanceCount; i++) {
      this.instanceColors[i * 3 + 0] = Math.random(); // R
      this.instanceColors[i * 3 + 1] = Math.random(); // G
      this.instanceColors[i * 3 + 2] = Math.random(); // B
    }

    this.instanceColorBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceColorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.instanceColors, this.gl.DYNAMIC_DRAW);

    // Setup attribute
    const a_instanceColor = this.gl.getAttribLocation(this.shaderProgram.program, 'a_instanceColor');
    this.gl.enableVertexAttribArray(a_instanceColor);
    this.gl.vertexAttribPointer(a_instanceColor, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.vertexAttribDivisor(a_instanceColor, 1);

    // Unbind VAO to finalize setup
    gl.bindVertexArray(null);
  }

  public setInstanceMatrices(instanceMatrices: Float32Array) {
    const gl = this.gl;

    if (instanceMatrices.length !== this.instanceCount * 16) {
      throw new Error(`Expected ${this.instanceCount * 16} matrix elements, got ${instanceMatrices.length}`);
    }

    if (!this.instanceMatrixBuffer) {
      this.instanceMatrixBuffer = gl.createBuffer();
    }

    gl.bindVertexArray(this.VAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceMatrixBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, instanceMatrices, gl.DYNAMIC_DRAW);

    const program = this.shaderProgram.program;
    const baseAttribLocation = gl.getAttribLocation(program, 'a_instanceMatrix');

    if (baseAttribLocation === -1) {
      throw new Error(`Attribute 'a_instanceMatrix' not found in shader`);
    }

    // Set up 4 attribute locations for the 4 columns of mat4
    for (let i = 0; i < 4; i++) {
      const loc = baseAttribLocation + i;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 64, i * 16);
      gl.vertexAttribDivisor(loc, 1); // Advance per instance
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
    this.shaderProgram.setUniform3f('u_cameraPositionWorld', camera.position);
    this.shaderProgram.setUniformMatrix4fv('u_projectionMatrix', camera.perspectiveProjectionMatrix);

    gl.drawArraysInstanced(gl.TRIANGLES, 0, this.vertices.length / 3, this.instanceCount);

    gl.bindVertexArray(null);
  }

  public destroy() {
    const gl = this.gl;
    if (this.positionBuffer) gl.deleteBuffer(this.positionBuffer);
    if (this.normalBuffer) gl.deleteBuffer(this.normalBuffer);
    if (this.uvBuffer) gl.deleteBuffer(this.uvBuffer);
    if (this.VAO) gl.deleteVertexArray(this.VAO);
  }
}
