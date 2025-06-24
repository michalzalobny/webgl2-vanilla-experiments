import { GeometriesManager } from '../lib/GeometriesManager';
import { Camera } from '../lib/Camera';
import { InstancedMesh } from '../lib/InstancedMesh';
import { Stick } from './Stick';
import { ShaderProgram } from '../lib/ShaderProgram';
import { globalState } from '../utils/globalState';
import fragmentShader from '../shaders/particle/fragment.glsl';
import vertexShader from '../shaders/particle/vertex.glsl';

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

  private sticks: Stick[] = [];
  private instancedMesh: InstancedMesh | null = null;
  private pointsProgram: ShaderProgram;

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
      vertexCode: vertexShader,
      fragmentCode: fragmentShader,
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

    let pointsAmount = 0;
    const pointsPositions = [];

    for (let y = 0; y <= height; y++) {
      for (let x = 0; x <= width; x++) {
        pointsAmount += 1;
        pointsPositions.push([startX + x * spacing, startY + y * spacing, 0]);

        // if (x !== 0) {
        //   const leftPoint = this.points[this.points.length - 1];
        //   const stick = new Stick({
        //     camera: this.camera,
        //     color: new Vec3(1, 1, 1),
        //     geometriesManager: this.geometriesManager,
        //     gl: this.gl,
        //     p1: point,
        //     p2: leftPoint,
        //   });

        //   leftPoint.addStick(stick, 0);
        //   point.addStick(stick, 0);
        //   this.sticks.push(stick);
        // }

        // if (y !== 0) {
        //   const upPoint = this.points[x + (y - 1) * (width + 1)];

        //   const stick = new Stick({
        //     camera: this.camera,
        //     color: new Vec3(1, 1, 1),
        //     geometriesManager: this.geometriesManager,
        //     gl: this.gl,
        //     p1: point,
        //     p2: upPoint,
        //   });

        //   upPoint.addStick(stick, 1);
        //   point.addStick(stick, 1);
        //   this.sticks.push(stick);
        // }

        // if (y === 0 && x % 2 === 0) {
        //   point.pin();
        // }

        // this.points.push(point);
      }
    }

    this.instancedMesh = new InstancedMesh({
      gl: this.gl,
      instanceCount: pointsPositions.length,
      geometry: this.geometriesManager.getGeometry('plane'),
      shaderProgram: this.pointsProgram,
    });

    this.instancedMesh.scale.multiply(10);

    this.instancedMesh.updatePositions(new Float32Array(pointsPositions.flat()));

    // const point = new Point({
    //   camera: this.camera,
    //   geometriesManager: this.geometriesManager,
    //   gl: this.gl,
    //   x: (startX + spacing) * 0,
    //   y: (startY + spacing) * 0,
    // });

    // this.points.push(point);
  }

  public update() {
    this.sticks.forEach((stick) => {
      stick.update();
    });
  }

  public render() {
    this.instancedMesh?.render({
      camera: this.camera,
    });

    this.sticks.forEach((stick) => {
      stick.render();
    });
  }

  public onResize() {}

  public destroy() {
    this.pointsProgram.destroy();
  }
}
