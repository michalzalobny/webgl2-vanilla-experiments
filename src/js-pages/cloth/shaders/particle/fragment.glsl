#version 300 es

precision highp float;

in vec2 v_uv;
in vec3 v_fragNormal;
in vec3 v_fragPosition;
in vec3 v_instanceColor;
in float v_visibility;

uniform float u_time;
uniform vec3 u_cameraPositionWorld;
uniform mat4 u_viewMatrix;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  if (v_visibility < 0.5) discard;

  float circle = distance(v_uv, vec2(0.5, 0.5));
  circle = 1.0 - step(0.5, circle);


  vec4 color = vec4(v_instanceColor, 1.0);
  color = vec4(vec3(0.0), 1.0);

  outColor = color;
}
    