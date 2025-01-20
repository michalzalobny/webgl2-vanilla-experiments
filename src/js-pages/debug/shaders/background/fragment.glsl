#version 300 es

precision highp float;

in vec2 v_uv;

uniform float u_time;

uniform vec2 u_resolution;

// we need to declare an output for the fragment shader
out vec4 outColor;

#define PI 3.14159265359
#define NUM_PARTICLES 10.0
#define NUM_EXPLOSIONS 2.0

//random hashing function that takes one float and returns two (vec2)
vec2 Hash12(float t){
    float x = fract(sin(t*674.3)*453.2);
    float y = fract(sin((t+x)*714.3)*263.2);
    return vec2(x,y);
}

vec2 Hash12_Polar(float t){
    float a = fract(sin(t*674.3)*453.2) * 2.0 * PI; //Angle from 0 to 2PI
    float d = fract(sin((t+a)*714.3)*263.2); //Distance from 0 to 1
    return vec2(sin(a) , cos(a)) * d; //Converting polar coords to cartesian coords system
}

float explosion (vec2 st, float t){
    float sparks = 0.0;
    for(float i = 0.0 ; i< NUM_PARTICLES; i++) {
        vec2 dir = Hash12_Polar(i + 1.0) * 0.5; 
        float d = length(st - dir * t);
        float brightness = mix(0.0, 0.0005, smoothstep(0.0, 0.1, t));
        brightness *= sin(t * 15. + i) * 0.5 + 0.5; // blinking of firework while alive
        brightness *= smoothstep(1.0, 0.5, t); // fades out the effect before it restarts
        sparks += brightness / d ;
    }
    return sparks;
}

void main()
{
    vec3 color;
    vec2 st = v_uv * vec2(u_resolution.x / u_resolution.y, 1.0);
    st -= 0.5;

    for(float i = 0.0 ; i< NUM_EXPLOSIONS; i++) {
        float part = i / NUM_EXPLOSIONS;
        float t = u_time * (part + 0.2) + part * 0.8;
        float ft = floor(t);
        vec3 colorValue = sin(vec3(.34 * part, .54 * (1.0 - part), 0.45) * ft) * 0.45 + 0.55;
        vec2 offset = Hash12(i + 1.0 + ft) - 0.5;
        offset *= vec2(0.85, 0.15); //Shrink the possible explosion area
        offset += vec2(0.0, 0.25); //Move the possible explosion area up
        color += explosion(st - offset, fract(t)) * colorValue;
    }

    color *= 2.0;
    
    outColor = vec4(vec3(color), 1.0);
}