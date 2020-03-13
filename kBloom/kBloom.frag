uniform sampler2D image;
uniform vec2 resolution;
varying vec2 vTexCoord;

uniform float kRadius;
uniform float kThres;

const float kKernel = 32.0;
const vec2 renderScale = vec2(1.0);

// http://chilliant.blogspot.com/2012/08/srgb-approximations-for-hlsl.html
vec4 sRGB_Linear(vec4 C_srgb) {
    return 0.012522878 * C_srgb +
        0.682171111 * C_srgb * C_srgb +
        0.305306011 * C_srgb * C_srgb * C_srgb;
}

// Linearize Colours and compare multiplied blend to black
vec4 getColor(vec2 uv) {
    vec4 color = sRGB_Linear(texture2D(image, uv));
    return max(pow(color, vec4(kThres)), 0.0);
}

// InterleavedGradientNoise(): https://www.shadertoy.com/view/MslGR8
// Blur(): https://github.com/spite/Wagner
float InterleavedGradientNoise(vec2 uv)
{
    const vec3 magic = vec3(10.06711056, 10.00583715, 52.19829189);
    return fract(magic.z * fract(dot(uv, magic.xy)));
}

vec4 blur(sampler2D tex, vec2 fragCoord) {
    vec4 color = vec4(0.0);
    float total = 0.0;
    float offset = InterleavedGradientNoise(fragCoord);
    float amount = log2(kRadius*renderScale.x)*0.01;

    for(float t=-kKernel; t<=kKernel; t++) {
        float percent = (t+offset)/kKernel;
        float weight = 1.0 - abs(percent);
        vec4 bsample = getColor(fragCoord +
                        vec2(cos(0.0)*amount, sin(0.0)*amount) * percent);
        bsample.rgb *= bsample.a;
        color += bsample*weight;
        total += weight;
    }

    color = color/total;
    color.rgb /= color.a;
    return color;
}

// https://github.com/dmnsgn/glsl-tone-map
vec4 Tonemap(vec4 x) {
    return x / (x + 0.155) * 1.019;
}

void main() {
    vec4 base = texture2D(image, vTexCoord);
    vec4 blend = blur(image, vTexCoord);

    // https://github.com/jamieowen/glsl-blend
    gl_FragColor = mix(base, 1.0 - (1.0 - base) * (1.0 - Tonemap(blend)), base.a);
}
