import { ShaderProgram } from './ShaderProgram';
import { createAndInitBuffer, setupVertexAttribute } from './Util';
import { Camera } from './Camera';
import { GeometryObject } from './parseOBJ';
import { Vec3 } from './math/Vec3';
import { Mat4 } from './math/Mat4';
import { globalState } from '../utils/globalState';

interface Constructor {
  geometry: GeometryObject | null;
  shaderProgram: ShaderProgram;
  gl: WebGL2RenderingContext;
  instanceCount: number;
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
  private instanceOffsetBuffer: WebGLBuffer | null = null;
  private instanceColorBuffer: WebGLBuffer | null = null;

  private instanceCount;
  private modelMatrix = new Mat4();

  public position = new Vec3(0);
  public scale = new Vec3(1);
  public rotation = new Vec3(0, 0, 0);
  private shouldUpdateModelMatrix = true;

  private instanceOffsets: Float32Array;
  private instanceColors: Float32Array;

  constructor(props: Constructor) {
    const { gl, shaderProgram, geometry, instanceCount } = props;

    if (!geometry) throw new Error('No geometry provided for the Mesh');

    this.instanceCount = instanceCount;

    // Allocate buffers
    this.instanceOffsets = new Float32Array(this.instanceCount * 3);
    this.instanceColors = new Float32Array(this.instanceCount * 3);

    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.vertices = geometry.vertices;
    this.normals = geometry.normals;
    this.texcoords = geometry.texcoords;

    this.init();
  }

  public addPosition(vec: Vec3) {
    this.position.add(vec);
    this.shouldUpdateModelMatrix = true;
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
    for (let i = 0; i < this.instanceCount; i++) {
      this.instanceOffsets[i * 3 + 0] = (Math.random() * 2 - 1) * 40;
      this.instanceOffsets[i * 3 + 1] = (Math.random() * 2 - 1) * 40;
      this.instanceOffsets[i * 3 + 2] = 0; // Flat grid, but can be randomized too
    }

    this.instanceOffsetBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceOffsetBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.instanceOffsets, gl.STATIC_DRAW);

    const a_instanceOffset = gl.getAttribLocation(program, 'a_instanceOffset');
    if (a_instanceOffset !== -1) {
      gl.enableVertexAttribArray(a_instanceOffset);
      gl.vertexAttribPointer(a_instanceOffset, 3, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(a_instanceOffset, 1); // advance per instance
    }

    // Instanced colors
    for (let i = 0; i < this.instanceCount; i++) {
      this.instanceColors[i * 3 + 0] = Math.random(); // R
      this.instanceColors[i * 3 + 1] = Math.random(); // G
      this.instanceColors[i * 3 + 2] = Math.random(); // B
    }

    this.instanceColorBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceColorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.instanceColors, this.gl.STATIC_DRAW);

    // Setup attribute
    const a_instanceColor = this.gl.getAttribLocation(this.shaderProgram.program, 'a_instanceColor');
    this.gl.enableVertexAttribArray(a_instanceColor);
    this.gl.vertexAttribPointer(a_instanceColor, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.vertexAttribDivisor(a_instanceColor, 1);

    // Unbind VAO to finalize setup
    gl.bindVertexArray(null);

    // setInterval(() => {
    //   this.updateInstances();
    // }, 5000);
  }

  public updateInstances() {
    for (let i = 0; i < this.instanceCount; i++) {
      const index = i * 3;
      this.instanceOffsets[index + 2] = (globalState.uTime.value * 100 * index) / this.instanceCount;
    }

    // Efficiently update only the instance buffer with new data
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceOffsetBuffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.instanceOffsets);
  }

  public render(props: Render) {
    const { camera } = props;
    const gl = this.gl;

    this.shaderProgram.use();
    gl.bindVertexArray(this.VAO);

    this.updateInstances();

    if (this.shouldUpdateModelMatrix) {
      this.modelMatrix.identity();
      this.modelMatrix.translate(this.position);
      this.modelMatrix.scale(this.scale);
      this.modelMatrix.rotateX(this.rotation[0]);
      this.modelMatrix.rotateY(this.rotation[1]);
      this.modelMatrix.rotateZ(this.rotation[2]);
      this.shaderProgram.setUniformMatrix4fv('u_modelMatrix', this.modelMatrix);
      this.shouldUpdateModelMatrix = false;
    }

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
    if (this.instanceOffsetBuffer) gl.deleteBuffer(this.instanceOffsetBuffer);
    if (this.VAO) gl.deleteVertexArray(this.VAO);
  }
}
