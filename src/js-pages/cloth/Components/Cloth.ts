import { GeometriesManager } from '../lib/GeometriesManager';
import { Camera } from '../lib/Camera';
import { InstancedMesh } from '../lib/InstancedMesh';
import { Stick } from './Stick';
import { ShaderProgram } from '../lib/ShaderProgram';
import { globalState } from '../utils/globalState';

import fragmentShaderParticle from '../shaders/particle/fragment.glsl';
import vertexShaderParticle from '../shaders/particle/vertex.glsl';

import fragmentShaderLine from '../shaders/line/fragment.glsl';
import vertexShaderLine from '../shaders/line/vertex.glsl';
import { Vec3 } from '../lib/math/Vec3';
import { Mat4 } from '../lib/math/Mat4';

interface Constructor {
  gl: WebGL2RenderingContext;
  geometriesManager: GeometriesManager;
  camera: Camera;
  width: number;
  height: number;
  startX: number;
  startY: number;
  spacing: number;
}

export class Cloth {
  private gl: WebGL2RenderingContext;
  private geometriesManager: GeometriesManager;
  private camera: Camera;
  private width: number;
  private height: number;
  private startX: number;
  private startY: number;
  private spacing: number;

  private instancedPoints: InstancedMesh | null = null;
  private pointsProgram: ShaderProgram;

  private instancedSticks: InstancedMesh | null = null;
  private sticksProgram: ShaderProgram;

  constructor(props: Constructor) {
    const { camera, geometriesManager, gl, height, spacing, startX, startY, width } = props;

    this.gl = gl;
    this.camera = camera;
    this.geometriesManager = geometriesManager;
    this.width = width;
    this.height = height;
    this.startX = startX;
    this.startY = startY;
    this.spacing = spacing;

    this.pointsProgram = new ShaderProgram({
      gl: this.gl,
      vertexCode: vertexShaderParticle,
      fragmentCode: fragmentShaderParticle,
      texturesManager: null,
      texturesToUse: [],
      uniforms: {
        u_time: globalState.uTime,
      },
    });

    this.sticksProgram = new ShaderProgram({
      gl: this.gl,
      vertexCode: vertexShaderLine,
      fragmentCode: fragmentShaderLine,
      texturesManager: null,
      texturesToUse: [],
      uniforms: {
        u_time: globalState.uTime,
      },
    });

    this.init();
  }

  private init() {
    const width = this.width;
    const height = this.height;
    const startX = this.startX;
    const startY = this.startY;
    const spacing = this.spacing;

    const pointsPositions: number[][] = [];
    const sticksPositions = [];

    for (let y = 0; y <= height; y++) {
      for (let x = 0; x <= width; x++) {
        pointsPositions.push([startX + x * spacing, startY + y * spacing, 0]);

        if (x !== 0) {
          const leftPoint = pointsPositions.length - 1;
          const currPoint = pointsPositions.length;

          const stick = {
            p1: currPoint,
            p2: leftPoint,
          };

          // leftPoint.addStick(stick, 0);
          // point.addStick(stick, 0);
          sticksPositions.push(stick);
        }

        if (y !== 0) {
          const upPoint = x + (y - 1) * (width + 1) + 1;

          const currPoint = pointsPositions.length;

          const stick = {
            p1: currPoint,
            p2: upPoint,
          };

          // upPoint.addStick(stick, 1);
          // point.addStick(stick, 1);
          // this.sticks.push(stick);
          sticksPositions.push(stick);
        }

        if (y === 0 && x % 2 === 0) {
          // point.pin();
        }

        // this.points.push(point);
      }
    }

    //Points
    const instCount = pointsPositions.length;

    this.instancedPoints = new InstancedMesh({
      gl: this.gl,
      instanceCount: instCount,
      geometry: this.geometriesManager.getGeometry('plane'),
      shaderProgram: this.pointsProgram,
    });
    // this.instancedPoints.scale.multiply(10);
    // this.instancedPoints.updatePositions(new Float32Array(pointsPositions.flat()));

    const instanceCountApple = instCount;
    const instanceMatricesApple = new Float32Array(instanceCountApple * 16);

    for (let i = 0; i < instCount; i++) {
      const pos = new Vec3(pointsPositions[i][0], pointsPositions[i][1], 0);
      const scale = new Vec3(4, 4, 4);
      const rotX = 0;
      const rotY = 0;
      const rotZ = 0;
      const modelMatrix = new Mat4().identity().translate(pos).rotateX(rotX).rotateY(rotY).rotateZ(rotZ).scale(scale);
      instanceMatricesApple.set(modelMatrix, i * 16);
    }
    this.instancedPoints.setInstanceMatrices(instanceMatricesApple);

    //Sticks
    this.instancedSticks = new InstancedMesh({
      gl: this.gl,
      instanceCount: sticksPositions.length,
      geometry: this.geometriesManager.getGeometry('plane'),
      shaderProgram: this.pointsProgram,
    });

    let newPositions: number[] = [];
    let newScales: number[] = [];
    let newRotations: number[] = [];
    sticksPositions.forEach((v, key) => {
      const p1 = pointsPositions[v.p1 - 1];
      const p2 = pointsPositions[v.p2 - 1];

      const A = new Vec3(...p1);
      const B = new Vec3(...p2);

      const mid = new Vec3().add(A).add(B).multiply(0.5);

      newPositions.push(mid[0], mid[1], mid[2]);
      newScales.push(A.distance(B), Stick.LINE_WIDTH, 1);

      const tempVec = new Vec3().copy(B).sub(A);
      const angle = Math.atan2(tempVec.y, tempVec.x); // Used to calculate the angle between the two points
      newRotations.push(0, 0, angle);
    });

    const instanceCount = newPositions.length / 3;
    const instanceMatrices = new Float32Array(instanceCount * 16);

    for (let i = 0; i < sticksPositions.length; i++) {
      const pos = new Vec3(newPositions[i * 3 + 0], newPositions[i * 3 + 1], newPositions[i * 3 + 2]);
      const scale = new Vec3(newScales[i * 3 + 0], newScales[i * 3 + 1], newScales[i * 3 + 2]);
      const rotX = newRotations[i * 3 + 0];
      const rotY = newRotations[i * 3 + 1];
      const rotZ = newRotations[i * 3 + 2];
      const modelMatrix = new Mat4().identity().translate(pos).rotateX(rotX).rotateY(rotY).rotateZ(rotZ).scale(scale);
      instanceMatrices.set(modelMatrix, i * 16);
    }

    this.instancedSticks.setInstanceMatrices(instanceMatrices);
  }

  public update() {}

  public render() {
    this.instancedPoints?.render({
      camera: this.camera,
    });

    this.instancedSticks?.render({
      camera: this.camera,
    });
  }

  public onResize() {}

  public destroy() {
    this.pointsProgram.destroy();
    this.sticksProgram.destroy();
  }
}
