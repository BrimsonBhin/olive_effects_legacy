/*
Olive port of https://www.shadertoy.com/view/XlsGWf
*/

uniform sampler2D tex;
uniform vec2 resolution;

uniform float kDegree;

void main()
{	
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    //Angle you want to rotate the texture to
    //float rot = radians(45.0);
    
    float rot = radians(kDegree);
    
    uv-=.5;
    
    mat2 m = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
   	uv  = m * uv;
    
    uv+=.5;
    
    gl_FragColor = texture2D(tex, uv);
}