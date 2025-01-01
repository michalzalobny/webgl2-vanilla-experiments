import { vec3 } from 'gl-matrix';

import { ShaderProgram } from '../lib/ShaderProgram';
import { Mesh } from '../lib/Mesh';
import { TexturesManager } from '../lib/textures-manager/TexturesManager';
import { globalState } from '../utils/globalState';
import { GeometriesManager } from '../lib/GeometriesManager';
import { Camera } from '../lib/Camera';

import fragmentShaderMedia from '../shaders/media/fragment.glsl';
import vertexShaderMedia from '../shaders/media/vertex.glsl';

import bgFragment from '../shaders/background/fragment.glsl';
import bgVertex from '../shaders/background/vertex.glsl';

interface Constructor {
  gl: WebGL2RenderingContext;
  texturesManager: TexturesManager;
  geometriesManager: GeometriesManager;
  camera: Camera;
}

export class Objects3D {
  private gl: WebGL2RenderingContext;

  private bgMesh: Mesh | null = null;
  private mediaPlanes: Mesh[] = [];

  private bgProgram: ShaderProgram | null = null;

  private mediaPlaneProgram: ShaderProgram | null = null;

  private texturesManager: TexturesManager;
  private geometriesManager: GeometriesManager;
  private camera: Camera;

  constructor(props: Constructor) {
    const { gl, texturesManager, geometriesManager, camera } = props;

    this.gl = gl;
    this.texturesManager = texturesManager;
    this.geometriesManager = geometriesManager;
    this.camera = camera;

    this.init();
  }

  private init() {
    this.mediaPlaneProgram = new ShaderProgram({
      gl: this.gl,
      vertexCode: vertexShaderMedia,
      fragmentCode: fragmentShaderMedia,
      texturesManager: this.texturesManager,
      texturesToUse: [
        {
          textureSrc: `/public/assets/generated_images/${1}.jpg`,
          uniformName: 'u_image',
        },
      ],
      uniforms: {
        u_time: globalState.uTime,
      },
    });
    for (let i = 0; i < 2; i++) {
      const mediaPlane = new Mesh({
        gl: this.gl,
        shaderProgram: this.mediaPlaneProgram,
        geometry: this.geometriesManager.getGeometry('plane'),
      });

      mediaPlane.position = vec3.fromValues((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.25, 0);
      mediaPlane.rotation = vec3.fromValues(0, 0, 0);
      mediaPlane.scale = vec3.fromValues(0.01, 0.01, 0.01);

      this.mediaPlanes.push(mediaPlane);
    }

    this.bgProgram = new ShaderProgram({
      gl: this.gl,
      fragmentCode: bgFragment,
      vertexCode: bgVertex,
      texturesManager: this.texturesManager,
      uniforms: {
        u_time: globalState.uTime,
        u_resolution: globalState.stageSize,
      },
    });

    this.bgMesh = new Mesh({
      gl: this.gl,
      shaderProgram: this.bgProgram,
      geometry: this.geometriesManager.getGeometry('plane'),
    });
  }

  private randomFromSeed = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  public update() {
    const mouse2DCurrent = globalState.mouse2DCurrent.value;

    if (this.bgMesh) {
      // Disable depth test when rendering the background - it will be behind everything
      this.gl.disable(this.gl.DEPTH_TEST);
      this.bgMesh.render({ camera: this.camera });
      this.gl.enable(this.gl.DEPTH_TEST);
    }

    this.mediaPlanes.forEach((mediaPlane, key) => {
      const seed = this.randomFromSeed(key);

      mediaPlane.position = vec3.fromValues(
        mouse2DCurrent[0] * seed + (this.randomFromSeed(key + 0.3) - 0.5) * 0.25,
        (this.randomFromSeed(key + 0.5) - 0.5) * 0.25,
        seed * 0.1
      );

      mediaPlane.render({ camera: this.camera, instanceNumber: key + 1 });
    });
  }

  public destroy() {
    // Destroy meshes
    if (this.bgMesh) this.bgMesh.destroy();
    this.mediaPlanes.forEach((mediaPlane) => {
      mediaPlane.destroy();
    });

    // Destroy programs
    if (this.bgProgram) this.bgProgram.destroy();
    if (this.mediaPlaneProgram) this.mediaPlaneProgram.destroy();
  }
}
