#version 300 es

precision highp float;

in vec2 v_uv;

uniform float u_time;
uniform vec2 u_resolution;

// we need to declare an output for the fragment shader
out vec4 outColor;


void main() {
  vec2 uv = v_uv;

  vec3 finalColor = vec3(1.0, 1.0, 1.0);
  outColor = vec4(finalColor, 1.0);
}
    