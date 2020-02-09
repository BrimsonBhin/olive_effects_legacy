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

const mat3 ACESInputMat = mat3(
    0.59719, 0.35458, 0.04823,
    0.07600, 0.90834, 0.01566,
    0.02840, 0.13383, 0.83777
);

// ODT_SAT => XYZ => D60_2_D65 => sRGB
const mat3 ACESOutputMat = mat3(
     1.60475, -0.53108, -0.07367,
    -0.10208,  1.10813, -0.00605,
    -0.00327, -0.07276,  1.07602
);

vec3 RRTAndODTFit(vec3 v)
{
    vec3 a = v * (v + 0.0245786) - 0.000090537;
    vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
    return a / b;
}

vec3 ACESFitted(vec3 color)
{
    color = color * ACESInputMat;
    // Apply RRT and ODT
    color = RRTAndODTFit(color);
    color = color * ACESOutputMat;
    // Clamp to [0, 1]
    color = clamp(color, 0.0, 1.0);
    return color;
}

vec3 getHDR(vec3 tex) {
    return max((tex - (kThreshold/100.0)) * (kIntensity), 0.0);
}

vec3 blend(vec3 a, vec3 b) {
    return 1.0 - (1.0 - a)*(1.0 - b);
}

vec3 BlurColor(in sampler2D tex, in vec2 fragCoord)
{
	vec2 uv = fragCoord.xy / resolution.xy;
	vec3 sum = vec3(0);
    float pixelSizeX = 1.0 / resolution.x; 
    float pixelSizeY = 1.0 / resolution.y;
    
    // Horizontal Blur
    vec3 accumulation = vec3(0);
    vec3 weightsum = vec3(0);
    for (float i = -kKernel; i <= kKernel; i++){
        accumulation += texture2D(tex, uv + vec2(i * pixelSizeX, 0.0)).xyz * kWeight;
        weightsum += kWeight;
    }
    
    sum = accumulation / weightsum;
    
    return getHDR(ACESFitted(sum));
}


void main()
{
    vec2 fragCoord = gl_FragCoord.xy;
	vec2 uv = fragCoord.xy / resolution.xy;
	vec4 tx = texture2D(image, uv);
    
    gl_FragColor.xyz = BlurColor(image, fragCoord);   
    gl_FragColor.xyz = blend(tx.xyz, gl_FragColor.xyz);
}