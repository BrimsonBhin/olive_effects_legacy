// Olive port of https://www.shadertoy.com/view/Mdf3zr

uniform vec2 resolution;
uniform sampler2D image;
varying vec2 vTexCoord;

uniform float kBlueAmount;
uniform float kGreenAmount;
uniform float kRadius;

float d;

// http://chilliant.blogspot.com/2012/08/srgb-approximations-for-hlsl.html
vec4 sRGB_Linear(vec4 C_srgb) {
    return 0.012522878 * C_srgb +
        0.682171111 * C_srgb * C_srgb +
        0.305306011 * C_srgb * C_srgb * C_srgb;
}

float lookup(vec2 p, float dx, float dy)
{
    vec2 uv = (p.xy + vec2(dx * d, dy * d)) / resolution.xy;
    vec4 c = sRGB_Linear(texture2D(image, uv.xy));

    // return as luma
    return 0.2126*c.r + 0.7152*c.g + 0.0722*c.b;
}

// https://github.com/dmnsgn/glsl-tone-map
vec3 unreal(vec3 x) {
  return x / (x + 0.155) * 1.019;
}

void main()
{
    d = kRadius; // kernel offset
    vec4 s = texture2D(image, vTexCoord);
    vec2 p = gl_FragCoord.xy;
    const vec3 val = vec3(-1.0, 0.0, 1.0);
    const vec2 val2 = vec2(-2.0, 2.0);

    // simple sobel edge detection
    float gx = 0.0;
    gx += val.x * lookup(p, val.x, val.x);
    gx += val2.x * lookup(p, val.x, val.y);
    gx += val.x * lookup(p, val.x, val.z);
    gx += val.z * lookup(p, val.z, val.x);
    gx += val2.y * lookup(p, val.z, val.y);
    gx += val.z * lookup(p, val.z, val.z);

    float gy = 0.0;
    gy += val.x * lookup(p, val.x, val.x);
    gy += val2.x * lookup(p, val.y, val.x);
    gy += val.x * lookup(p, val.z, val.x);
    gy += val.z * lookup(p, val.x, val.z);
    gy += val2.y * lookup(p, val.y, val.z);
    gy += val.z * lookup(p, val.z, val.z);

    // hack: use g^2 to conceal noise in the video
    float g = gx*gx + gy*gy;
    float g2 = g * (kGreenAmount * 0.1) / (kBlueAmount * 0.1);

    vec4 col = texture2D(image, p / resolution.xy);
    col = vec4(0.0, g, g2, 1.0);

    // Screen blend
    vec3 color = 1.0 - (1.0 - s.xyz) * (1.0 - unreal(col.xyz));

    gl_FragColor = vec4(color, s.a);
}
