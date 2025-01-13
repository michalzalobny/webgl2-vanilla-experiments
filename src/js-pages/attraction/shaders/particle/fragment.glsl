#version 300 es

precision highp float;

in vec2 v_uv;
in vec3 v_fragNormal;
in vec3 v_fragPosition;

uniform float u_time;
uniform vec3 u_cameraPositionWorld;
uniform mat4 u_viewMatrix;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  float circle = distance(v_uv, vec2(0.5, 0.5));
  circle = 1.0 - step(0.5, circle);
  vec3 finalColor = mix(vec3(1.0, 1.0, 1.0), vec3(0.0, 0.0, 0.0), (v_uv.x-v_uv.y));

  vec4 color = vec4(finalColor, circle);

  outColor = color;
}
    