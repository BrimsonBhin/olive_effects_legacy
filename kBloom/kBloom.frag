uniform sampler2D image;
uniform vec2 resolution;
varying vec2 vTexCoord;

uniform float kRadius;
uniform float kThres;
uniform float kInt;

const float kKernel = 32.0;
const vec2 renderScale = vec2(1.0);

// sRGB to Linear: http://chilliant.blogspot.com/2012/08/srgb-approximations-for-hlsl.html
vec4 sRGB_Linear(vec4 C_srgb) {
    return 0.012522878 * C_srgb +
        0.682171111 * C_srgb * C_srgb +
        0.305306011 * C_srgb * C_srgb * C_srgb;
}

// Linearize Colours and compare multiplied blend to black
vec3 getColor(vec2 uv) {
    vec3 color = sRGB_Linear(texture2D(image, uv)).rgb;
    return max((color * color)/(kThres * 0.1), 0.0);
}

// Blur from https://github.com/spite/Wagner
float nrand(vec2 n) {
	return fract(sin(dot(n, vec2(12.9898, 78.233)))* 43758.5453);
}

vec4 blur(sampler2D tex, vec2 fragCoord) {
    vec4 color = vec4(0.0);
    float total = 0.0;
    float offset = nrand(0.01*gl_FragCoord.xy);
    float amount = log2(kRadius*renderScale.x)*0.01;

    for(float t=-kKernel; t<=kKernel; t++) {
        float percent = (t+offset-0.5)/kKernel;
        float weight = 1.0 - abs(percent);
        vec4 bsample = vec4(getColor(fragCoord +
                        vec2(cos(0.0)*amount,sin(0.0)*amount) * percent), 1.0);
        bsample.rgb *= bsample.a;
        color += bsample*weight;
        total += weight;
    }

    color = color/total;
    color.rgb /= color.a;
    return color;
}

// Tonemap: https://github.com/dmnsgn/glsl-tone-map
vec4 Tonemap(vec4 x) {
    return x / (x + 0.155) * 1.019;
}

void main() {
    vec4 base = texture2D(image, vTexCoord);
    vec4 blend = blur(image, vTexCoord);

    // Blend: https://github.com/jamieowen/glsl-blend
    gl_FragColor = mix(base, 1.0 - (1.0 - base) * (1.0 - Tonemap(blend)), base.a);
}
