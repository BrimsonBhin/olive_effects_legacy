/*

A conglomerate, amateurish mess.

Horizontal Blur from Olive's BoxBlur shader
HDR function and blending from https://www.shadertoy.com/view/4dcXWs
ACES Tonemap from https://www.shadertoy.com/view/wl2SDt

*/

#version 330

uniform vec2 resolution;
uniform sampler2D image;

uniform float kRadius;
uniform float kThreshold;
uniform float kIntensity;

vec3 ACESFilm(vec3 x)
{
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return (x*(a*x+b))/(x*(c*x+d)+e);
}

// Get specific colors
vec4 getHDR(vec4 tex) {
    return max((tex - (kThreshold/10.0)) * (kIntensity/10.0), 0.0);
}

// Function replaces the texture2D() with a vec4 with specific colors
vec3 tHDR(in sampler2D tex, in vec2 fragCoord){
    vec3 t = getHDR(texture2D(tex, fragCoord.xy)).xyz;
    return t;
}

vec3 blend(vec3 a, vec3 b) {
    return 1.0 - (1.0 - a) * (1.0 - b);
}

vec3 blur(in sampler2D tex, in vec2 fragCoord) {
	float rad = ceil(kRadius);
	float divider = 1.0 / rad;

	vec4 color = vec4(0.0);

    for (float x=-rad+0.5;x<=rad;x+=2.0) {
        color += vec4(tHDR(tex, (vec2(fragCoord.x+x, fragCoord.y))/resolution.xy)*(divider), 0.0);
        color += vec4(tHDR(tex, (vec2(fragCoord.x, fragCoord.y+x))/resolution.xy)*(divider), 0.0);
    }

    return vec3(color/2.0);
}

void main(void)
{
    vec2 fragCoord = gl_FragCoord.xy;
	vec2 uv = fragCoord.xy / resolution.xy;
	vec4 tx = texture2D(image, uv);

    gl_FragColor.xyz = blur(image, fragCoord.xy);
    gl_FragColor.xyz = blend(tx.xyz, ACESFilm(gl_FragColor.xyz));
    gl_FragColor = vec4(gl_FragColor.xyz, 1.0);
}