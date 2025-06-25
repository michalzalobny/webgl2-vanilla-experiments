import { GeometriesManager } from '../lib/GeometriesManager';
import { Camera } from '../lib/Camera';
import { InstancedMesh } from '../lib/InstancedMesh';
import { ShaderProgram } from '../lib/ShaderProgram';
import { globalState } from '../utils/globalState';

import fragmentShaderParticle from '../shaders/particle/fragment.glsl';
import vertexShaderParticle from '../shaders/particle/vertex.glsl';

import fragmentShaderLine from '../shaders/line/fragment.glsl';
import vertexShaderLine from '../shaders/line/vertex.glsl';

import { Vec3 } from '../lib/math/Vec3';
import { Mat4 } from '../lib/math/Mat4';

interface Props {
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
  private props: Props;

  private instancedPoints: InstancedMesh | null = null;
  private pointsProgram: ShaderProgram;

  private instancedSticks: InstancedMesh | null = null;
  private sticksProgram: ShaderProgram;

  constructor(props: Props) {
    this.props = props;

    this.pointsProgram = new ShaderProgram({
      gl: this.props.gl,
      vertexCode: vertexShaderParticle,
      fragmentCode: fragmentShaderParticle,
      texturesManager: null,
      texturesToUse: [],
      uniforms: {
        u_time: globalState.uTime,
      },
    });

    this.sticksProgram = new ShaderProgram({
      gl: this.props.gl,
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

  private createInstancePoints(positions: number[][]) {
    const COUNT = positions.length;
    const POINT_SIZE = 5;

    this.instancedPoints = new InstancedMesh({
      gl: this.props.gl,
      instanceCount: COUNT,
      geometry: this.props.geometriesManager.getGeometry('plane'),
      shaderProgram: this.pointsProgram,
    });

    // Compute new values per instance
    let newPositions: number[] = [];
    let newScales: number[] = [];
    let newRotations: number[] = [];
    positions.forEach((v, key) => {
      const pos = new Vec3(positions[key][0], positions[key][1], 0);
      newPositions.push(...pos);
      newScales.push(POINT_SIZE, POINT_SIZE, POINT_SIZE);
      newRotations.push(0, 0, 0);
    });

    //Construct matrix
    const instanceMatrices = new Float32Array(COUNT * 16);
    for (let i = 0; i < COUNT; i++) {
      const pos = new Vec3(newPositions[i * 3 + 0], newPositions[i * 3 + 1], newPositions[i * 3 + 2]);
      const scale = new Vec3(newScales[i * 3 + 0], newScales[i * 3 + 1], newScales[i * 3 + 2]);
      const rotX = newRotations[i * 3 + 0];
      const rotY = newRotations[i * 3 + 1];
      const rotZ = newRotations[i * 3 + 2];
      const modelMatrix = new Mat4().identity().translate(pos).rotateX(rotX).rotateY(rotY).rotateZ(rotZ).scale(scale);
      instanceMatrices.set(modelMatrix, i * 16);
    }
    this.instancedPoints.setInstanceMatrices(instanceMatrices);
  }

  private createInstanceSticks(positions: { p1: number; p2: number }[], pointsPositions: number[][]) {
    const COUNT = positions.length;

    const LINE_WIDTH = 0.8;

    this.instancedSticks = new InstancedMesh({
      gl: this.props.gl,
      instanceCount: COUNT,
      geometry: this.props.geometriesManager.getGeometry('plane'),
      shaderProgram: this.sticksProgram,
    });

    // Compute new values per instance
    let newPositions: number[] = [];
    let newScales: number[] = [];
    let newRotations: number[] = [];
    positions.forEach((v) => {
      const p1 = pointsPositions[v.p1 - 1];
      const p2 = pointsPositions[v.p2 - 1];

      const A = new Vec3(...p1);
      const B = new Vec3(...p2);

      const mid = new Vec3().add(A).add(B).multiply(0.5);

      newPositions.push(...mid);
      newScales.push(A.distance(B), LINE_WIDTH, 1);

      const tempVec = new Vec3().copy(B).sub(A);
      const angle = Math.atan2(tempVec.y, tempVec.x); // Used to calculate the angle between the two points
      newRotations.push(0, 0, angle);
    });

    //Construct matrix
    const instanceMatrices = new Float32Array(COUNT * 16);
    for (let i = 0; i < COUNT; i++) {
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

  private init() {
    const width = this.props.width;
    const height = this.props.height;
    const startX = this.props.startX;
    const startY = this.props.startY;
    const spacing = this.props.spacing;

    const pointsPositions: number[][] = [];
    const sticksPositions: { p1: number; p2: number }[] = [];

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
    this.createInstancePoints(pointsPositions);

    //Sticks
    this.createInstanceSticks(sticksPositions, pointsPositions);
  }

  public update() {}

  public render() {
    this.instancedPoints?.render({
      camera: this.props.camera,
    });

    this.instancedSticks?.render({
      camera: this.props.camera,
    });
  }

  public onResize() {}

  public destroy() {
    this.pointsProgram.destroy();
    this.sticksProgram.destroy();
  }
}
