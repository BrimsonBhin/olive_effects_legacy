/*
Olive port of https://www.shadertoy.com/view/4dcXWs
*/

#version 330
#define M_PI 3.1415926535897932384626433832795

uniform sampler2D image;
uniform vec2 resolution;

/*
[Bloom Settings]
BLOOM_THRESHOLD - how bright a pixel needs to be to become blurred
BLOOM_INTENSITY - how bright the bloom effect is
BLUR_SIZE - the radius of the bloom
*/

uniform float kBloomThreshold;
uniform float kBloomIntensity;
uniform float kBlurSize;

#define kBlurIterations 8
#define kBlurSubdivisions 32

vec3 getHDR(vec3 tex) {
    return max((tex - (kBloomThreshold/100.0)) * (kBloomIntensity/100.0), 0.0);
}

vec3 gaussian(sampler2D sampler, vec2 uv) {
    vec3 sum = vec3(0.0);

    for(int i = 1; i <= kBlurIterations; i++) {
        float angle = 360.0 / float(kBlurSubdivisions);
        for(int j = 0; j < kBlurSubdivisions; j++) {
            float dist = (kBlurSize/100.0) * (float(i+1) / float(kBlurIterations));
            float s    = sin(angle * float(j));
            float c	   = cos(angle * float(j));

            sum += getHDR(texture2D(sampler, uv + vec2(c,s)*dist).xyz);
        }
    }
    sum /= float(kBlurIterations * kBlurSubdivisions);
    return sum * (kBloomIntensity/100.0);
}

vec3 blend(vec3 a, vec3 b) {
    return 1. - (1. - a)*(1. - b);
}

void main(void)
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 tx = texture2D(image, uv);

    gl_FragColor.xyz = gaussian(image, uv);
    gl_FragColor.xyz = blend(tx.xyz, gl_FragColor.xyz);
}