// Olive port of https://www.shadertoy.com/view/XlsGWf

uniform sampler2D tex;
uniform vec2 resolution;
varying vec2 vTexCoord;
uniform float kDegree;

void main()
{
    vec2 uv = vTexCoord;

    // Degree Angle
    float rot = radians(kDegree);

    uv-=0.5;

    mat2 m = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
   	uv  = m * uv;

    uv+=0.5;

    gl_FragColor = texture2D(tex, uv);
}