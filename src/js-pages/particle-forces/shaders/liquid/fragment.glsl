#version 300 es

precision highp float;

in vec2 v_uv;

uniform float u_time;
uniform vec2 u_resolution;


// we need to declare an output for the fragment shader
out vec4 outColor;


void main() {
  vec2 uv = v_uv;
  vec3 color1 = vec3(0.15, 0.15, 0.65);
  outColor = vec4(color1, 0.8);
}
    