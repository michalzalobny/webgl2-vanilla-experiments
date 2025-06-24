#version 300 es

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;
in vec3 a_instanceOffset;
in vec3 a_instanceColor;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;

out vec2 v_uv;
out vec3 v_fragNormal;
out vec3 v_fragPosition;
out vec3 v_instanceColor;

void main() {
    // Transform position
    vec4 worldPosition = u_modelMatrix * vec4(a_position, 1.0) + vec4(a_instanceOffset, 0.0);
    vec4 viewPosition = u_viewMatrix * worldPosition;
    gl_Position = u_projectionMatrix * viewPosition;

    // Transform normal
    mat4 normalMatrix = transpose(inverse(u_modelMatrix));
    vec4 normal = normalize(normalMatrix * vec4(a_normal, 0.0));
    normal = normalize(u_viewMatrix * normal); // to view space

    // Pass to fragment shader
    v_fragPosition = vec3(viewPosition);
    v_fragNormal = normal.xyz;
    v_uv = a_uv;
    v_instanceColor = a_instanceColor;
}
