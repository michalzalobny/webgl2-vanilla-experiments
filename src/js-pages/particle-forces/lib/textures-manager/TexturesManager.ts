import { loadImage } from './utils';

interface Constructor {
  gl: WebGL2RenderingContext;
}

interface TextureObject {
  width: number;
  height: number;
  frameBuffer?: WebGLFramebuffer;
  texture: WebGLTexture;
  depthBuffer?: WebGLRenderbuffer;
}

export class TexturesManager {
  private gl: WebGL2RenderingContext;
  private loadedTextures: Map<string, TextureObject> = new Map();

  constructor(props: Constructor) {
    const { gl } = props;
    this.gl = gl;
  }

  public getTextureObj(textureUrl: string) {
    const textureObject = this.loadedTextures.get(textureUrl);
    if (!textureObject) {
      console.error(`Texture not found. ${textureUrl} `);
      return null;
    }
    return textureObject;
  }

  public async loadTexture(url: string) {
    const gl = this.gl;

    const image = await loadImage(url);

    // Create and bind the texture
    const texture = gl.createTexture();
    if (!texture) {
      return console.error('Unable to create texture.');
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const mode = gl.REPEAT; // or gl.CLAMP_TO_EDGE

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, mode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, mode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Upload the image to the texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Generate mipmaps
    const isPowerOfTwo = (value: number) => {
      return (value & (value - 1)) == 0;
    };
    if (isPowerOfTwo(image.width) && isPowerOfTwo(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    // Add the texture to the loaded textures
    this.loadedTextures.set(url, {
      texture,
      height: image.height,
      width: image.width,
    });

    // Unbind the texture
    gl.bindTexture(gl.TEXTURE_2D, null);

    return this.loadedTextures.get(url);
  }

  public removeTexture(url: string) {
    const textureObject = this.loadedTextures.get(url);
    if (!textureObject) {
      console.error(`Texture not found. ${url} `);
      return;
    }
    const gl = this.gl;
    gl.deleteTexture(textureObject.texture);
    this.loadedTextures.delete(url);
  }

  public createFrameBufferTexture(width: number, height: number, name: string) {
    const gl = this.gl;

    const frameBuffer = gl.createFramebuffer();
    if (!frameBuffer) return console.error('Cannot create frame buffer for frame buffer texture.');

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    // Create and set up the color texture
    const texture = gl.createTexture();
    if (!texture) return console.error('Cannot create frame buffer texture.');
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    // Create and set up the depth renderbuffer
    const depthBuffer = gl.createRenderbuffer();
    if (!depthBuffer) return console.error('Cannot create depth renderbuffer.');
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    // Check if the framebuffer is complete
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.error('Framebuffer is not complete. Status:', status);

      // Remove everything in case of error
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      texture && gl.deleteTexture(texture);
      depthBuffer && gl.deleteRenderbuffer(depthBuffer);
      frameBuffer && gl.deleteFramebuffer(frameBuffer);
    }

    // Add the texture and renderbuffer to the loaded textures
    this.loadedTextures.set(name, {
      width,
      height,
      frameBuffer,
      texture,
      depthBuffer,
    });

    // Unbind texture, renderbuffer, and framebuffer
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return this.loadedTextures.get(name);
  }

  private resizeFrameBufferTextures(width: number, height: number) {
    this.loadedTextures.forEach((textureObject) => {
      // Don't do anything if the texture does not have a frame buffer etc.
      if (!textureObject.frameBuffer || !textureObject.depthBuffer) return;

      const gl = this.gl;

      gl.bindFramebuffer(gl.FRAMEBUFFER, textureObject.frameBuffer);

      // Resize the color texture
      gl.bindTexture(gl.TEXTURE_2D, textureObject.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      // Resize the depth renderbuffer
      gl.bindRenderbuffer(gl.RENDERBUFFER, textureObject.depthBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

      // Unbind texture, renderbuffer, and framebuffer
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    });
  }

  public destroy() {
    this.loadedTextures.forEach((textureObject) => {
      if (textureObject.texture) {
        this.gl.deleteTexture(textureObject.texture);
      }

      if (textureObject.frameBuffer) {
        this.gl.deleteFramebuffer(textureObject.frameBuffer);
      }

      if (textureObject.depthBuffer) {
        this.gl.deleteRenderbuffer(textureObject.depthBuffer);
      }
    });
    this.loadedTextures.clear();
  }

  public resize() {
    const width = this.gl.drawingBufferWidth || 0;
    const height = this.gl.drawingBufferHeight || 0;
    this.resizeFrameBufferTextures(width, height);
  }
}
