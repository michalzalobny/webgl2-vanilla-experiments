// Plane made out of two triangles
const planeVertices = [-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0];
const planeTexcoords = [0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1];
export const planeObject = {
  vertices: planeVertices,
  texcoords: planeTexcoords,
  normals: [],
};

// Cube made out of 12 triangles (6 faces)
const cubeVertices = [
  // Front face
  -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,

  // Back face
  0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5,

  // Top face
  -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,

  // Bottom face
  -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,

  // Right face
  0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,

  // Left face
  -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,
];
const cubeTexcoords = [
  // Front face
  0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

  // Back face
  0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

  // Top face
  0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

  // Bottom face
  0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

  // Right face
  0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

  // Left face
  0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,
];

export const cubeObject = {
  vertices: cubeVertices,
  texcoords: cubeTexcoords,
  normals: [],
};
