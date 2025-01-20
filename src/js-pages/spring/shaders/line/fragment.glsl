#version 300 es

precision highp float;

in vec2 v_uv;

uniform float u_time;
uniform vec2 u_resolution;

// we need to declare an output for the fragment shader
out vec4 outColor;


void main() {
  vec2 uv = v_uv;

  float s = 1.0 - abs(uv.y - 0.5) * 2.0;
  // s = smoothstep(0.0, 0.9, s);
  vec3 finalColor = vec3(s, 0.03, 0.05);
  outColor = vec4(finalColor, s);
}
    