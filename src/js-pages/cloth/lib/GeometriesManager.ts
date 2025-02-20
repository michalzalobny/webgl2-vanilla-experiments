import { parseOBJ, GeometryObject } from './parseOBJ';

interface AddGeometry {
  geometryUrl: string;
  geometryObject: GeometryObject;
}

export class GeometriesManager {
  private loadedGeometries: Map<string, GeometryObject> = new Map();

  constructor() {}

  public getGeometry(geometryUrl: string) {
    const geometryObject = this.loadedGeometries.get(geometryUrl);
    if (!geometryObject) {
      console.error(`Geometry not found. ${geometryUrl} `);
      return null;
    }
    return geometryObject;
  }

  private async loadGeometry(elUrl: string) {
    const response = await fetch(elUrl);
    const text = await response.text();
    const objData = parseOBJ(text);

    this.addGeometry({ geometryUrl: elUrl, geometryObject: objData });

    return Promise.resolve();
  }

  public addGeometry({ geometryUrl, geometryObject }: AddGeometry) {
    if (this.loadedGeometries.has(geometryUrl)) {
      console.error(`Geometry already loaded. ${geometryUrl} `);
      return;
    }
    this.loadedGeometries.set(geometryUrl, geometryObject);
  }

  public async addGeometriesToLoad(objsToLoad: string[]) {
    const promises = objsToLoad.map((geometryUrl) => {
      return this.loadGeometry(geometryUrl);
    });
    return Promise.allSettled(promises).then(() => {
      Promise.resolve();
    });
  }

  public destroy() {
    this.loadedGeometries.clear();
  }
}
