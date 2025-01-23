import { GeometriesManager } from '../lib/GeometriesManager';
import { Camera } from '../lib/Camera';
import { Point } from './Point';
import { Stick } from './Stick';
import { Vec3 } from '../lib/math/Vec3';

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

  private points: Point[] = [];
  private sticks: Stick[] = [];

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

    this.init();

    console.log(this.sticks);
    console.log(this.points);
  }

  private init() {
    const width = this.width;
    const height = this.height;
    const startX = this.startX;
    const startY = this.startY;
    const spacing = this.spacing;
    for (let y = 0; y <= height; y++) {
      for (let x = 0; x <= width; x++) {
        const point = new Point({
          camera: this.camera,
          geometriesManager: this.geometriesManager,
          gl: this.gl,
          x: startX + x * spacing,
          y: startY + y * spacing,
        });

        if (x !== 0) {
          const leftPoint = this.points[this.points.length - 1];
          const stick = new Stick({
            camera: this.camera,
            color: new Vec3(1, 1, 1),
            geometriesManager: this.geometriesManager,
            gl: this.gl,
            p1: point,
            p2: leftPoint,
          });

          leftPoint.addStick(stick, 0);
          point.addStick(stick, 0);
          this.sticks.push(stick);
        }

        if (y !== 0) {
          const upPoint = this.points[x + (y - 1) * (width + 1)];

          const stick = new Stick({
            camera: this.camera,
            color: new Vec3(1, 1, 1),
            geometriesManager: this.geometriesManager,
            gl: this.gl,
            p1: point,
            p2: upPoint,
          });

          upPoint.addStick(stick, 1);
          point.addStick(stick, 1);
          this.sticks.push(stick);
        }

        if (y === 0 && x % 2 === 0) {
          point.pin();
        }

        this.points.push(point);
      }
    }
  }

  public update() {
    this.points.forEach((point) => {
      point.update();
    });

    this.sticks.forEach((stick) => {
      stick.update();
    });
  }

  public render() {
    this.points.forEach((point) => {
      point.render();
    });

    this.sticks.forEach((stick) => {
      stick.render();
    });
  }

  public onResize() {}

  public destroy() {}
}
