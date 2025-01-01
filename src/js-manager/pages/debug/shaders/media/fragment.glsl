#version 300 es

precision highp float;

in vec2 v_uv;
in vec3 v_fragNormal;
in vec3 v_fragPosition;

uniform sampler2D u_image;
uniform float u_time;
uniform vec3 u_cameraPositionWorld;
uniform mat4 u_viewMatrix;

// we need to declare an output for the fragment shader
out vec4 outColor;

#define PI 3.14159265359


void main() {
  vec2 uv = v_uv;
  uv.y = 1.0 - uv.y;

  // Texture
  vec4 color = texture(u_image, uv);

  outColor = color;
}
    