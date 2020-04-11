// From https://www.shadertoy.com/view/Wlj3zm

uniform sampler2D image;
varying vec2 vTexCoord;
uniform float time;

uniform float kSpeed;
uniform float kSize;
uniform float kStrength;

void main()
{
    vec2 uv = vTexCoord;
    float kSpeed = kSpeed * 0.1;
    float kSize = kSize * 0.1;
    float kStrength = kStrength * 0.1;

    vec2 p = vTexCoord * 2.0 - 1.0;

    float off = (p.x * p.y) * kSize + time * kSpeed;
    vec2 offset = vec2(sin(off), cos(off));
    uv = uv + kStrength * offset;

    float adj_scale = 1.0;
    float centerx = 0.0;
    float centery = 0.0;
    vec2 scaled_coords = (uv/adj_scale);
    vec2 coord = scaled_coords-vec2(0.5/adj_scale)+vec2(0.5)+vec2(-centerx, -centery);
    vec2 modcoord = mod(coord, 1.0);

    if (mod(coord.x, 2.0) > 1.0) {
        modcoord.x = 1.0 - modcoord.x;
    }

    if (mod(coord.y, 2.0) > 1.0) {
        modcoord.y = 1.0 - modcoord.y;
    }

    gl_FragColor = texture2D(image, modcoord);
}