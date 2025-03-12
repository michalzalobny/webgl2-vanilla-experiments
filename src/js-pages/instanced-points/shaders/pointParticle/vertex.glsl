#version 300 es
precision highp float;

in vec3 a_instanceOffset;
in vec3 a_instanceColor;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

out vec3 v_instanceColor;

void main() {
    gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_instanceOffset, 1.0);
    gl_PointSize = 2.0 / gl_Position.w * 1000.0;
    v_instanceColor = a_instanceColor;
}