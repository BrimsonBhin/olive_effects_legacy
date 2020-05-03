uniform sampler2D image;
varying vec2 vTexCoord;
const vec3 coef = vec3(0.2126, 0.7152, 0.0722);

uniform float kSat;
uniform float kThres;
uniform float kInt;

vec3 Prefilter(vec2 uv) {
    vec4 color = texture2D(image, uv);
    color.w = clamp(dot(color.rgb, coef), 0.0, 1.0);

    color.rgb = mix(color.www, color.rgb, 1.0);
    color.rgb *= (pow(color.w, kThres) * kInt) / (color.w + 1e-3);
    return color.rgb;
}

vec3 downScale(vec2 uv) {
    const float scaleFactor = 300.0;
    const float invScaleFactor = pow(scaleFactor, -1.0);
    const vec2 sFact = vec2(invScaleFactor, 0.0);
    vec2 gp = uv * scaleFactor;
    vec2 g = floor(gp) * sFact.x;
    vec2 p = fract(gp);

    vec3 c = Prefilter(g);
    vec3 c2 = Prefilter(g + sFact);
    vec3 c3 = Prefilter(g + sFact.xx);
    vec3 c4 = Prefilter(g + sFact.yx);

   return mix(mix(c, c2, p.x), mix(c4, c3, p.x), p.y); //Smooths it out
}

float InterleavedGradientNoise(vec2 uv) {
    const vec3 magic = vec3(10.0, 10.0, 100.0);
    return fract(magic.z * fract(dot(uv, magic.xy)));
}

vec3 blur(vec2 uv) {
    vec3 color = vec3(0.0);
    float total = 0.0;
    const float amount = 0.032;
    float offset = InterleavedGradientNoise(uv);
    const float rad1 = radians(-45.0);
    const float rad2 = radians(45.0);
    vec2 angle = vec2(cos(rad1), sin(rad1)) * amount;
    vec2 angle2 = vec2(cos(rad2), sin(rad2)) * amount;
    for(float x=-16.0+0.5;x<=16.0;x+=2.0) {
        float percent = (x+offset-0.5)/16.0;
        float weight = 1.0 - abs(percent);
        vec3 bsample = downScale(uv + angle * percent);
        bsample += downScale(uv + angle2 * percent);
        color += (bsample*2.0)*weight;
        total += weight;
    }
    return color/total;
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
    vec3 blend = aces(blur(uv));
    
    blend = mix(vec3(dot(blend, coef)), blend, kSat);
    base.rgb += blend - (base.rgb * blend);

    gl_FragColor = base;
}