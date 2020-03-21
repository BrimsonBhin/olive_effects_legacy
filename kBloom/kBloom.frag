uniform sampler2D image;
uniform vec2 resolution;
varying vec2 vTexCoord;

const float kKernel = 16.0;
const float scaleFactor = 500.0;
const float invScaleFactor = 1.0 / scaleFactor;

const vec3 coef = vec3(0.2126, 0.7152, 0.0722);
const vec2 sFact = vec2(invScaleFactor, 0.0);
const vec2 renderScale = vec2(1.0);

uniform float kRadius;
uniform float kThres;
uniform float kRange;
uniform float kCol;
uniform float kSat;

// http://chilliant.blogspot.com/2012/08/srgb-approximations-for-hlsl.html
vec4 sRGB_Linear(vec4 C_srgb) {
    return 0.012522878 * C_srgb +
        0.682171111 * C_srgb * C_srgb +
        0.305306011 * C_srgb * C_srgb * C_srgb;
}

vec3 getTexture(vec2 uv)
{
    return max(sRGB_Linear(texture2D(image, uv)).rgb - log2(kThres), 0.0);
}

vec3 downScale(vec2 uv)
{
    vec2 gp = uv * scaleFactor;
    vec2 g = floor(gp) * sFact.x;
    vec2 p = fract(gp);

    vec3 c = getTexture(g);
    vec3 c2 = getTexture(g + sFact);
    vec3 c3 = getTexture(g + sFact.xx);
    vec3 c4 = getTexture(g + sFact.yx);

   return mix(mix(c, c2, p.x), mix(c4, c3, p.x), p.y); //Smooths it out
}

// InterleavedGradientNoise(): https://www.shadertoy.com/view/MslGR8
// Blur(): https://github.com/spite/Wagner
float InterleavedGradientNoise(vec2 uv)
{
    const vec3 magic = vec3(10.06711056, 10.00583715, 52.19829189);
    return fract(magic.z * fract(dot(uv, magic.xy)));
}

vec4 blur(vec2 uv) {
    vec4 color = vec4(0.0);
    float total = 0.0;
    float offset = InterleavedGradientNoise(uv);
    float amount = log2(kRadius*renderScale.x)*0.01;

    for(float t=-kKernel; t<=kKernel; t++) {
        float percent = (t+offset)/kKernel;
        float weight = 1.0 - abs(percent);
        vec4 bsample = vec4(downScale(uv +
                        vec2(cos(0.0)*amount, sin(0.0)*amount) * percent), 1.0);
        color += bsample*weight;
        total += weight;
    }

    color = color/total;
    return color;
}

void main() {
    vec4 base = texture2D(image, vTexCoord);
    vec4 blend = blur(vTexCoord);

    blend.rgb = mix(vec3(dot(blend.rgb, coef)), blend.rgb, kSat) * kCol;
    base.rgb += blend.rgb * clamp(1.0 - base.rgb, 0.0, 1.0);

    gl_FragColor = base;
}