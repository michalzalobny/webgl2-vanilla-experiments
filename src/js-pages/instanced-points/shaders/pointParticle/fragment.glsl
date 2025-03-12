#version 300 es
precision highp float;

in vec3 v_instanceColor;
out vec4 fragColor;

void main() {
    vec2 coord = gl_PointCoord * 2.0 - 1.0; // [-1, 1] space
    if (length(coord) > 1.0) discard; // Circle cut-out

    fragColor = vec4(v_instanceColor, 1.0);
}