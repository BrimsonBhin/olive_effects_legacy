/*
A conglomerate, amateurish mess.

Horizontal Blur from https://www.shadertoy.com/view/llGSz3
HDR function and blending from https://www.shadertoy.com/view/4dcXWs
ACES Tonemap from https://www.shadertoy.com/view/wl2SDt

*/

uniform sampler2D image;
uniform vec2 resolution;

uniform float kThreshold;
uniform float kIntensity;

uniform float kKernel;
const float kWeight = 1.0;

vec3 ACESFilm(vec3 x)
{
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return (x*(a*x+b))/(x*(c*x+d)+e);
}

vec3 getHDR(vec3 tex) {
    return max((tex - (kThreshold/10.0)) * (kIntensity/10.0), 0.0);
}

vec3 blend(vec3 a, vec3 b) {
    return 1.0 - (1.0 - a) * (1.0 - b);
}

vec3 BlurColor(in sampler2D tex, in vec2 fragCoord)
{
	vec2 uv = fragCoord.xy / resolution.xy;
	vec3 sum = vec3(0);
    float pixelSizeX = 1.0 / resolution.x;

    // Horizontal Blur
    vec3 accumulation = vec3(0);
    vec3 weightsum = vec3(0);
    for (float i = -kKernel; i <= kKernel; i++){
        accumulation += getHDR(texture2D(tex, uv + vec2(i * pixelSizeX, 0.0)).xyz * kWeight);
        weightsum += kWeight;
    }
    sum = accumulation / weightsum;
    return (sum);
}

void main()
{
    vec2 fragCoord = gl_FragCoord.xy;
	vec2 uv = fragCoord.xy / resolution.xy;
	vec4 tx = texture2D(image, uv);

    gl_FragColor.xyz = BlurColor(image, fragCoord.xy);
    gl_FragColor.xyz = blend(tx.xyz, ACESFilm(gl_FragColor.xyz));
}