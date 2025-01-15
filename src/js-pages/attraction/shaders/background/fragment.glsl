#version 300 es

precision highp float;

in vec2 v_uv;

uniform float u_time;
uniform vec2 u_resolution;

// we need to declare an output for the fragment shader
out vec4 outColor;


void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.y / u_resolution.x;
  vec2 uv_aspect = vec2(uv.x, uv.y * aspect);

  vec3 color1 = vec3(0.12, 0.02, 0.01);
  vec3 color2 = vec3(0.18, 0.02, 0.01);
  // vec3 color1 = vec3(0.01, 0.02, 0.12);
  // vec3 color2 = vec3(0.01, 0.02, 0.18);

  float diff = 0.05;
  float strength = 0.3;
  // mind the aspect ratio
  float circle = smoothstep(strength + diff, strength - diff, distance(uv_aspect, vec2(0.5, 0.5 * aspect)));

  float t = uv.x;
  vec3 finalColor = mix(color1, color2, circle);
  outColor = vec4(finalColor, 1.0);
}
    