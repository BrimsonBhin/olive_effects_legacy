/*
Olive port of https://www.shadertoy.com/view/Mdf3zr
*/

uniform vec2 resolution;
uniform sampler2D image;

uniform float kBlueAmount;
uniform float kGreenAmount;
uniform float kRadius;

float d;

float lookup(vec2 p, float dx, float dy)
{
    vec2 uv = (p.xy + vec2(dx * d, dy * d)) / resolution.xy;
    vec4 c = texture2D(image, uv.xy);

	// return as luma
    return 0.2126*c.r + 0.7152*c.g + 0.0722*c.b;
}

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

vec3 blend(vec3 a, vec3 b) {
    return 1. - (1. - a)*(1. - b);
}

void main()
{
    vec2 tex = gl_FragCoord.xy / resolution.xy;
    vec4 s = texture2D(image, tex);
    d = kRadius; // kernel offset
    vec2 p = gl_FragCoord.xy;

	// simple sobel edge detection
    float gx = 0.0;
    gx += -1.0 * lookup(p, -1.0, -1.0);
    gx += -2.0 * lookup(p, -1.0,  0.0);
    gx += -1.0 * lookup(p, -1.0,  1.0);
    gx +=  1.0 * lookup(p,  1.0, -1.0);
    gx +=  2.0 * lookup(p,  1.0,  0.0);
    gx +=  1.0 * lookup(p,  1.0,  1.0);

    float gy = 0.0;
    gy += -1.0 * lookup(p, -1.0, -1.0);
    gy += -2.0 * lookup(p,  0.0, -1.0);
    gy += -1.0 * lookup(p,  1.0, -1.0);
    gy +=  1.0 * lookup(p, -1.0,  1.0);
    gy +=  2.0 * lookup(p,  0.0,  1.0);
    gy +=  1.0 * lookup(p,  1.0,  1.0);

	// hack: use g^2 to conceal noise in the video
    float g = gx*gx + gy*gy;
    float g2 = g * (kGreenAmount/10.0) / (kBlueAmount/10.0);

    vec4 col = texture2D(image, p / resolution.xy);
    col = vec4(0.0, g, g2, 1.0);

    vec3 color = blend(s.xyz, ACESFitted(col.xyz));

    gl_FragColor = vec4(color, 1.0);
}
