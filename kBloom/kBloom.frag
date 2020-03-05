/*
getColor(): https://github.com/martymcmodding/qUINT
Blur: https://github.com/spite/Wagner
Blend: https://github.com/jamieowen/glsl-blend
Tonemap: https://github.com/dmnsgn/glsl-tone-map
sRGB to Linear: http://chilliant.blogspot.com/2012/08/srgb-approximations-for-hlsl.html
*/

uniform sampler2D image;
uniform vec2 resolution;
varying vec2 vTexCoord;

uniform float kThreshold;
uniform float kSaturation;
uniform float kRadius;

const float kKernel = 32.0;
const vec2 renderScale = vec2(1.0);

vec4 sRGB_Linear(vec4 C_srgb) {
    return 0.012522878 * C_srgb +
        0.682171111 * C_srgb * C_srgb +
        0.305306011 * C_srgb * C_srgb * C_srgb;
}

// Threshold Colours
vec3 getColor(vec2 uv) {
    float kSaturation = kSaturation/100.0;
    vec4 color = sRGB_Linear(texture2D(image, uv));
    color.a = clamp(dot(color.rgb, vec3(0.333)), 0.0, 1.0);

	color.rgb = mix(color.www, color.rgb, (kSaturation));
	return color.rgb *= (pow(color.a, kThreshold)) / (color.a + 1e-3);
}

// Blur Colours
float random(vec3 scale, float seed) {
    return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);
}

vec4 blur(sampler2D tex, vec2 fragCoord) {
    vec4 color = vec4(0.0);
    float total = 0.0;
    float offset = random(vec3(12.9898,78.233,151.7182),0.0);
    float amount = (log2(kRadius*renderScale.x))*0.01;

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

vec4 Tonemap(vec4 x) {
    return x / (x + 0.155) * 1.019;
}

void main() {
    vec4 base = texture2D(image, vTexCoord);
    vec4 blend = blur(image, vTexCoord);
    vec4 ScreenBlend = 1.0 - (1.0 - base) * (1.0 - Tonemap(blend));

    gl_FragColor = mix(base, ScreenBlend, base.a);
}