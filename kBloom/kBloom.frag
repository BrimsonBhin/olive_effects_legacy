uniform sampler2D image;
uniform vec2 resolution;
varying vec2 vTexCoord;

const vec3 coef = vec3(0.2126, 0.7152, 0.0722);

uniform float kSat;
uniform float kInt;

vec4 Prefilter(vec2 uv) {
    vec4 color = texture2D(image, uv);
    return max(color*color*color, 0.0);
}

float InterleavedGradientNoise(vec2 uv)
{
    const vec3 magic = vec3(10.06711056, 10.00583715, 52.19829189);
    return fract(magic.z * fract(dot(uv, magic.xy)));
}

vec4 blur(vec2 uv) {
    vec4 color = vec4(0.0);
    float total = 0.0;
    const float kKernel = 32.0;
    const float amount = 0.032;
    float offset = InterleavedGradientNoise(uv);
    const float rad1 = radians(45.0);
    const float rad2 = radians(135.0);
    vec2 angle = vec2(cos(rad1), sin(rad1)) * amount;
    vec2 angle2 = vec2(cos(rad2), sin(rad2)) * amount;
    for(float x=-kKernel+0.5;x<=kKernel;x+=2.0) {
        float percent = (x+offset-0.5)/kKernel;
        float weight = 1.0 - abs(percent);
        vec4 bsample = Prefilter(uv + angle * percent);
        bsample += Prefilter(uv + angle2 * percent);
        color += (bsample*kInt)*weight;
        total += weight;
    }

    color = color/total;
    return color;
}

vec3 aces(const vec3 x) {
    const float a = 2.51;
    const float b = 0.03;
    const float c = 2.43;
    const float d = 0.59;
    const float e = 0.14;
    return clamp((x*(a*x +b)) / (x*(c*x+d)+e), 0.0, 1.0);
}

void main() {
    vec2 uv = vTexCoord;
    vec4 base = texture2D(image, uv);
    vec3 blend = aces(blur(uv).rgb);
    
    blend = mix(vec3(dot(blend, coef)), blend, kSat);
    base.rgb += blend - (base.rgb * blend);

    gl_FragColor = base;
}