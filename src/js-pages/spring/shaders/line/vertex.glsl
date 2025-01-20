#version 300 es

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;

uniform mat4 u_extraMatrix;

out vec2 v_uv;
out vec3 v_fragNormal;
out vec3 v_fragPosition;

void main() {
    vec4 worldPosition =  u_modelMatrix * vec4(a_position, 1.0);
    vec4 viewPosition = u_viewMatrix * worldPosition;

    gl_Position = u_projectionMatrix * viewPosition;

    v_fragPosition = vec3(viewPosition);
    v_uv = a_uv; 
}