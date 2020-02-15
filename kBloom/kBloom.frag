/*
An amateurish mess.
Horizontal Blur from Olive's BoxBlur shader
HDR function and blending from https://www.shadertoy.com/view/4dcXWs
ACES Tonemap from https://www.shadertoy.com/view/wl2SDt
*/

#version 330

uniform vec2 resolution;
uniform sampler2D image;
varying vec2 vTexCoord;

uniform float kThreshold;
uniform float kIntensity;
uniform float kRadius;

// Get specific colors
vec4 getHDR(vec4 tex) {
    return max((tex - (kThreshold/10.0)) * (kIntensity/10.0), 0.0);
}

vec3 blurH(in sampler2D tex, vec2 coord) {
    
    // We only sample on hard pixels, so we don't accept decimal radii
    float real_radius = ceil(kRadius);

    // Calculate the weight of each pixel based on the radius
    float divider = 1.0 / real_radius;      

    vec4 composite = vec4(0.0);
    for (float i=-real_radius+0.5;i<=real_radius;i+=2.0) {
        vec2 pixel_coord = coord;
        pixel_coord.x += i/resolution.x;
        
        composite += vec4(getHDR(texture2D(tex, pixel_coord))* divider);
    }
    return vec3(composite);
}

vec3 blend(vec3 a, vec3 b) {
    return 1.0 - (1.0 - a) * (1.0 - b);
}

vec3 ACESFilm(vec3 x)
{
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return (x*(a*x+b))/(x*(c*x+d)+e);
}

void main()
{
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	vec4 tx = texture2D(image, uv);

    gl_FragColor = vec4(blend(tx.xyz, ACESFilm(blurH(image, vTexCoord))), 1.0);
}