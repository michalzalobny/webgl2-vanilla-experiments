#version 300 es

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;

uniform float u_entry_scale;

out vec2 v_uv;
out vec3 v_fragNormal;
out vec3 v_fragPosition;

void main() {
    mat4 modelMatrix = u_modelMatrix;

    modelMatrix[0][0] *= u_entry_scale;
    modelMatrix[1][1] *= u_entry_scale;
    modelMatrix[2][2] *= u_entry_scale;

    vec4 worldPosition = modelMatrix * vec4(a_position, 1.0);
    vec4 viewPosition = u_viewMatrix * worldPosition;

    gl_Position = u_projectionMatrix * viewPosition;
 
    // Transform normal to world space (using the inverse transpose for normals)
    vec4 normal = vec4(a_normal, 0.0);
    mat4 normalMatrix = transpose(inverse(modelMatrix));
    normal = normalize(normalMatrix * normal);
    // Transform normal to view space
    normal = normalize(u_viewMatrix * normal);

    v_fragPosition = vec3(viewPosition);
    v_fragNormal = normal.xyz;
    v_uv = a_uv; 
}