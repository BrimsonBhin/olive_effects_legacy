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

vec3 ACESFilm(vec3 x)
{
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return (x*(a*x+b))/(x*(c*x+d)+e);
}

vec3 blend(vec3 a, vec3 b) {
    return 1.0 - (1.0 - a)*(1.0 - b);
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

    vec3 color = blend(s.xyz, ACESFilm(col.xyz));

    gl_FragColor = vec4(color, gl_FragColor.a);
}
