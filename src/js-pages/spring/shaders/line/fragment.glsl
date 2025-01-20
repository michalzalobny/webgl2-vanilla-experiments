#version 300 es

precision highp float;

in vec2 v_uv;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;


void main() {
  vec2 uv = v_uv;

  float s = 1.0 - abs(uv.y - 0.5) * 2.0;
  outColor = vec4(u_color, s);
}
    