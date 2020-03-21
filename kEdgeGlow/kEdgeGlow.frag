// Olive port of https://www.shadertoy.com/view/Mdf3zr

uniform vec2 resolution;
uniform sampler2D image;
varying vec2 vTexCoord;

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
    vec4 s = texture2D(image, vTexCoord);
    d = kRadius; // kernel offset
    vec2 p = gl_FragCoord.xy;
    const vec3 val = vec3(-1.0, 0.0, 1.0);

    // simple sobel edge detection
    float gx = 0.0;
    gx += val.x * lookup(p, val.x, val.x);
    gx += -2.0 * lookup(p, val.x,  val.y);
    gx += val.x * lookup(p, val.x,  val.z);
    gx +=  val.z * lookup(p,  val.z, val.x);
    gx +=  2.0 * lookup(p,  val.z,  val.y);
    gx +=  val.z * lookup(p,  val.z,  val.z);

    float gy = val.y;
    gy += val.x * lookup(p, val.x, val.x);
    gy += -2.0 * lookup(p,  val.y, val.x);
    gy += val.x * lookup(p,  val.z, val.x);
    gy +=  val.z * lookup(p, val.x,  val.z);
    gy +=  2.0 * lookup(p,  val.y,  val.z);
    gy +=  val.z * lookup(p,  val.z,  val.z);

    // hack: use g^2 to conceal noise in the video
    float g = gx*gx + gy*gy;
    float g2 = g * (kGreenAmount * 0.1) / (kBlueAmount * 0.1);

    vec4 col = texture2D(image, p / resolution.xy);
    col = vec4(0.0, g, g2, 1.0);

    vec3 color = blend(s.xyz, ACESFilm(col.xyz));

    gl_FragColor = vec4(color, gl_FragColor.a);
}
