uniform sampler2D image;
uniform vec2 resolution;
varying vec2 vTexCoord;

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

// From Olive's BoxBlur function
vec3 blur(vec2 uv) {
    // We only sample on hard pixels, so we don't accept decimal radii
    float real_radius = ceil(kRadius);
    // Calculate the weight of each pixel based on the radius
    float divider = 1.0 / real_radius;
    vec3 composite = vec3(0.0);
    
    for (float i=-real_radius+0.5;i<=real_radius;i+=2.0) {
        vec2 pixel_coord = vTexCoord;
        pixel_coord.x += i/resolution.x;
        composite += getTexture(pixel_coord) * divider;
    }

    return composite;
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
    vec3 blend = aces(blur(vTexCoord));

    // "Screen" blend
    blend.rgb = mix(vec3(dot(blend, coef)), blend, kSat);
    base.rgb += blend - (base.rgb * blend);

    gl_FragColor = base;
}
