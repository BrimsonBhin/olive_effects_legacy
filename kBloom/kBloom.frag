uniform sampler2D image;
varying vec2 vTexCoord;

const float kKernel = 16.0;
const float scaleFactor = 300.0;
const float invScaleFactor = 1.0 / scaleFactor;
const vec2 sFact = vec2(invScaleFactor, 0.0);
const vec3 coef = vec3(0.2126, 0.7152, 0.0722);

uniform float kRadius;
uniform float kThres;
uniform float kRange;
uniform float kCol;
uniform float kSat;

// http://chilliant.blogspot.com/2012/08/srgb-approximations-for-hlsl.html
vec4 srgb_linear(vec4 C_srgb) {
    return 0.012522878 * C_srgb +
        0.682171111 * C_srgb * C_srgb +
        0.305306011 * C_srgb * C_srgb * C_srgb;
}

vec3 getTexture(vec2 uv) {
    float kThres = kThres * 0.1;
    vec3 tex = srgb_linear(texture2D(image, uv)).rgb;
    float weight = smoothstep(kThres, kThres * kRange, dot(tex, coef));
    return mix(vec3(0.0), kCol * tex, weight);
}

vec3 downScale(vec2 uv) {
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

float InterleavedGradientNoise(vec2 uv) {
    const vec3 magic = vec3(10.06711056, 10.00583715, 52.19829189);
    return fract(magic.z * fract(dot(uv, magic.xy)));
}

vec4 blur(vec2 uv) {
    const vec2 sc = vec2(cos(0.0), sin(0.0));
    vec4 color = vec4(0.0);
    float total = 0.0;
    float amount = kRadius*0.002;

    for(float t=-kKernel; t<=kKernel; t++) {
        float percent = (t + InterleavedGradientNoise(uv))/kKernel;
        float weight = 1.0 - abs(percent);
        vec4 bsample = vec4(downScale(uv + vec2(sc.xy*amount) * percent), 1.0);
        bsample.rgb*=bsample.a;
        color+=bsample*weight;
        total+=weight;
    }
    color=color/total;
    color.rgb/=color.a;
    return color;
}

vec3 aces(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x*(a*x +b)) / (x*(c*x+d)+e), 0.0, 1.0);
}

void main() {
    vec4 base = texture2D(image, vTexCoord);
    vec3 blend = aces(blur(vTexCoord).rgb);

    blend.rgb = mix(vec3(dot(blend, coef)), blend, kSat);
    base.rgb += blend - (base.rgb * blend);

    gl_FragColor = base;
}