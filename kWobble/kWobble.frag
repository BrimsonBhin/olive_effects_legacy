// From https://www.shadertoy.com/view/Wlj3zm

uniform sampler2D image;
varying vec2 vTexCoord;
uniform float time;

uniform float kSpeed;
uniform float kSize;
uniform float kStrength;

void main()
{
    float kSpeed = kSpeed * 0.1;
    float kSize = kSize * 0.1;
    float kStrength = kStrength * 0.1;

    vec2 p = vTexCoord * 2.0 - 1.0;

    float off = (p.x * p.y) * kSize + time * kSpeed;
    vec2 offset = vec2(sin(off), cos(off));

    gl_FragColor = texture2D(image, vTexCoord + kStrength * offset);
}