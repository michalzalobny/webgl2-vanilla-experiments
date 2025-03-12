import { ShaderProgram } from './ShaderProgram';
import { Camera } from './Camera';
import { Vec3 } from './math/Vec3';
import { Mat4 } from './math/Mat4';

interface Constructor {
  shaderProgram: ShaderProgram;
  gl: WebGL2RenderingContext;
  instanceCount: number;
}

interface Render {
  camera: Camera;
}

export class InstancedPoints {
  private gl: WebGL2RenderingContext;
  private shaderProgram: ShaderProgram;

  private VAO: WebGLVertexArrayObject | null = null;

  private instanceOffsets: Float32Array;
  private instanceColors: Float32Array;

  private instanceOffsetBuffer: WebGLBuffer | null = null;
  private instanceColorBuffer: WebGLBuffer | null = null;

  private modelMatrix = new Mat4();

  private position = new Vec3(0);
  private scale = new Vec3(1);
  private rotation = new Vec3(0, 0, 0);
  private shouldUpdateModelMatrix = true;

  private instanceCount: number;

  constructor(props: Constructor) {
    const { gl, shaderProgram, instanceCount } = props;

    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.instanceCount = instanceCount;

    // Allocate buffers
    this.instanceOffsets = new Float32Array(this.instanceCount * 3);
    this.instanceColors = new Float32Array(this.instanceCount * 3);

    for (let i = 0; i < this.instanceCount; i++) {
      this.instanceOffsets[i * 3 + 0] = (Math.random() * 2 - 1) * 40;
      this.instanceOffsets[i * 3 + 1] = (Math.random() * 2 - 1) * 40;
      this.instanceOffsets[i * 3 + 2] = 0; // Flat grid, but can be randomized too

      this.instanceColors[i * 3 + 0] = Math.random();
      this.instanceColors[i * 3 + 1] = Math.random();
      this.instanceColors[i * 3 + 2] = Math.random();
    }

    this.init();
  }

  public addPosition(vec: Vec3) {
    this.position.add(vec);
    this.shouldUpdateModelMatrix = true;
  }

  private init() {
    const gl = this.gl;
    this.VAO = gl.createVertexArray();
    gl.bindVertexArray(this.VAO);

    // === Instance Offsets Buffer ===
    this.instanceOffsetBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceOffsetBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.instanceOffsets, gl.DYNAMIC_DRAW); // Dynamic for updates

    const a_instanceOffset = gl.getAttribLocation(this.shaderProgram.program, 'a_instanceOffset');
    gl.enableVertexAttribArray(a_instanceOffset);
    gl.vertexAttribPointer(a_instanceOffset, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(a_instanceOffset, 1); // One per instance

    // === Instance Colors Buffer ===
    this.instanceColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.instanceColors, gl.DYNAMIC_DRAW); // Dynamic for updates

    const a_instanceColor = gl.getAttribLocation(this.shaderProgram.program, 'a_instanceColor');
    gl.enableVertexAttribArray(a_instanceColor);
    gl.vertexAttribPointer(a_instanceColor, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(a_instanceColor, 1); // One per instance

    gl.bindVertexArray(null);
  }

  public updateInstances() {
    for (let i = 0; i < this.instanceCount; i++) {
      const index = i * 3;
      this.instanceOffsets[index + 2] = (window.performance.now() * 0.1 * index) / this.instanceCount;
    }

    // Efficiently update only the instance buffer with new data
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceOffsetBuffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.instanceOffsets);
  }

  public render(props: Render) {
    const { camera } = props;

    this.shaderProgram.use();
    this.gl.bindVertexArray(this.VAO);
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
    this.shaderProgram.setUniformMatrix4fv('u_projectionMatrix', camera.perspectiveProjectionMatrix);

    this.gl.drawArraysInstanced(this.gl.POINTS, 0, 1, this.instanceCount);
    this.gl.bindVertexArray(null);
  }

  public destroy() {
    this.gl.deleteBuffer(this.instanceOffsetBuffer);
    this.gl.deleteBuffer(this.instanceColorBuffer);
    this.gl.deleteVertexArray(this.VAO);
  }
}
