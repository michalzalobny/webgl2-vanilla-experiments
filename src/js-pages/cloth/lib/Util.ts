interface CreateAndInitBuffer {
  target: number;
  data: Float32Array | Uint16Array;
  gl: WebGL2RenderingContext;
}

export const createAndInitBuffer = (props: CreateAndInitBuffer) => {
  const { target, data, gl } = props;
  const buffer = gl.createBuffer();
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data, gl.STATIC_DRAW);
  gl.bindBuffer(target, null);
  return buffer;
};

interface SetupVertexAttribute {
  name: string;
  program: WebGLProgram | null;
  buffer: WebGLBuffer | null;
  size: number;
  gl: WebGL2RenderingContext;
  type?: number;
  normalized?: boolean;
  stride?: number;
  offset?: number;
  divisor?: number;
}

export const setupVertexAttribute = (props: SetupVertexAttribute) => {
  const {
    name,
    program,
    buffer,
    size,
    gl,
    type = gl.FLOAT,
    normalized = false,
    stride = 0,
    offset = 0,
    divisor = 0,
  } = props;

  if (!program) throw new Error('Could not create VAO, no program');
  const location = gl.getAttribLocation(program, name);
  if (location === -1) {
    console.warn(
      `Could not find attribute location for ${name}. Either the attribute is not used in the vertex shader or the name is misspelled.`,
    );
    return null;
  }

  gl.enableVertexAttribArray(location);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
  if (divisor > 0) {
    gl.vertexAttribDivisor(location, divisor);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return location;
};

interface UseTexture {
  gl: WebGL2RenderingContext;
  shaderProgram: WebGLProgram | null;
  uniformLocation: WebGLUniformLocation | undefined;
  textureUnit: number;
  texture: WebGLTexture;
}

export const useTexture = (props: UseTexture) => {
  const { gl, shaderProgram, texture, textureUnit, uniformLocation } = props;

  if (!shaderProgram) {
    throw new Error('Cannot use texture. WebGL context or shader program is not available. ');
  }

  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  if (!uniformLocation) return;

  // gl.uniform1i(uniformLocation, textureUnit);
};
