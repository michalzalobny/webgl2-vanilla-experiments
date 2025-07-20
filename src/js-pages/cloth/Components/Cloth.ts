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
import { Vec4 } from '../lib/math/Vec4';
import { Mat4 } from '../lib/math/Mat4';

import { Point } from './Point';
import { Stick } from './Stick';

import { Mouse } from './Mouse';

import { UpdateEventProps } from '../utils/GlobalFrame';
import { Vec2 } from '../lib/math/Vec2';
import { GlobalResize } from '../utils/GlobalResize';
import { Quat } from '../lib/math/Quat';

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
  static gravity = new Vec2(0.0, -981 * 0.0001);
  static drag = 0.01;
  static elasticity = 10.0;

  private props: Props;

  private instancedPoints: InstancedMesh | null = null;
  private pointsProgram: ShaderProgram;

  private instancedSticks: InstancedMesh | null = null;
  private sticksProgram: ShaderProgram;

  private tempMatrix = new Mat4();

  private points: Point[] = [];
  private sticks: Stick[] = [];

  private mouse: Mouse = new Mouse();

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

  private positionInstancePoints() {
    const COUNT = this.points.length;

    const positions = this.points.map((point) => point.getPosition());

    const POINT_SIZE = 8;

    // Compute new values per instance
    let newPositions: number[] = [];
    let newScales: number[] = [];
    let newRotations: number[] = [];
    positions.forEach((v, key) => {
      newPositions.push(positions[key][0], positions[key][1], positions[key][2]);
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
      const modelMatrix = this.tempMatrix
        .identity()
        .translate(pos)
        .rotateX(rotX)
        .rotateY(rotY)
        .rotateZ(rotZ)
        .scale(scale);
      instanceMatrices.set(modelMatrix, i * 16);
    }
    this.instancedPoints?.setInstanceMatrices(instanceMatrices);
  }

  private positionInstanceSticks() {
    const COUNT = this.sticks.length;
    const LINE_WIDTH = 5;

    // Compute new values per instance
    let newPositions: Mat4[] = [];
    let newScales: Mat4[] = [];
    let newRotations: Mat4[] = [];

    this.sticks.forEach((stick) => {
      // Input points
      const P1 = stick.p0.getPosition().clone();
      const P2 = stick.p1.getPosition().clone();

      // 1. Compute direction vector (normalize)
      const direction = P1.clone().sub(P2).normalize();

      // Rotation to align (1, 0, 0) with `direction`
      const from = new Vec3(1, 0, 0);
      const q = Quat.create();
      q.rotationTo(from, direction);

      // Create rotation matrix from quaternion
      const rotationMatrix = new Mat4();
      rotationMatrix.fromQuat(q);

      // 4. Scale (stretch along X by distance)
      const length = P1.distance(P2);

      //Getting the matrix that scales the particle
      let scaleMatrix = new Mat4(
        ...new Vec4(length, 0, 0, 0),
        ...new Vec4(0, LINE_WIDTH, 0, 0),
        ...new Vec4(0, 0, LINE_WIDTH, 0),
        ...new Vec4(0, 0, 0, 1),
      );

      //Getting the matrix that translates the particle to the position of the velocity
      const mid = P1.clone().add(P2).multiply(0.5);
      const translationMatrix = new Mat4(
        ...new Vec4(1, 0, 0, 0),
        ...new Vec4(0, 1, 0, 0),
        ...new Vec4(0, 0, 1, 0),
        ...new Vec4(...mid, 1),
      );

      newPositions.push(translationMatrix);
      newScales.push(scaleMatrix);
      newRotations.push(rotationMatrix);
    });

    //Construct matrix
    const instanceMatrices = new Float32Array(COUNT * 16);
    for (let i = 0; i < COUNT; i++) {
      const translationMatrix = newPositions[i];
      const scaleMatrix = newScales[i];
      const rotationMatrix = newRotations[i];

      const modelMatrix = this.tempMatrix
        .identity()
        .multiply(translationMatrix)
        .multiply(rotationMatrix)
        .multiply(scaleMatrix);

      instanceMatrices.set(modelMatrix, i * 16);
    }
    this.instancedSticks?.setInstanceMatrices(instanceMatrices);
  }

  private init() {
    const width = this.props.width;
    const height = this.props.height;
    const startX = this.props.startX;
    const startY = this.props.startY;
    const spacing = this.props.spacing;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const point = new Point({
          x: startX + x * spacing,
          y: startY + y * spacing,
          z: 0,
          mass: 1,
        });

        if (x !== 0) {
          const leftPoint = this.points[this.points.length - 1];

          const stick = new Stick({
            p0: point,
            p1: leftPoint,
            length: this.props.spacing,
          });

          this.sticks.push(stick);

          leftPoint.addStick(stick, 0);
          point.addStick(stick, 0);
        }

        if (y !== 0) {
          const upPoint = this.points[x + (y - 1) * width];

          const stick = new Stick({
            p0: point,
            p1: upPoint,
            length: this.props.spacing,
          });

          this.sticks.push(stick);

          upPoint.addStick(stick, 1);
          point.addStick(stick, 1);
        }

        if (y === height - 1 && x % 2 === 0) {
          point.pin();
        }

        this.points.push(point);
      }
    }

    //Points
    this.instancedPoints = new InstancedMesh({
      gl: this.props.gl,
      instanceCount: this.points.length,
      geometry: this.props.geometriesManager.getGeometry('cube'),
      shaderProgram: this.pointsProgram,
    });

    //Sticks
    this.instancedSticks = new InstancedMesh({
      gl: this.props.gl,
      instanceCount: this.sticks.length,
      geometry: this.props.geometriesManager.getGeometry('cube'),
      shaderProgram: this.sticksProgram,
    });
  }

  public update(e: UpdateEventProps) {
    const w = GlobalResize.windowSize.value[0];
    const h = GlobalResize.windowSize.value[1];

    this.sticks.forEach((stick) => stick.update());

    this.points.forEach((point, key) => {
      // if (key !== 2) return;
      point.update(e.dt, Cloth.drag, Cloth.gravity, Cloth.elasticity, this.mouse, w, h);
      // points[i]->Update(deltaTime, drag, gravity, elasticity, mouse, renderer->GetWindowWidth(), renderer->GetWindowHeight());
    });

    this.positionInstancePoints();
    this.positionInstanceSticks();
  }

  public render(e: UpdateEventProps) {
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

    this.mouse.destroy();
  }
}
