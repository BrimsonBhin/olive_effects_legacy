/***  
    Port of https://www.shadertoy.com/view/lsXGWn
    Adaption and Implementation by CGVIRUS for Olive-Editor Community
***/

#version 330
uniform sampler2D tex;
uniform vec2 resolution;
uniform float time;
uniform float kScale;

vec2 getDistortion(vec2 uv, float d, float t) {
	uv.x += cos(d) + t * 0.9;
	uv.y += sin(d + t * 0.75);
	return uv;
}

vec4 getDistortedTexture(sampler2D sample, vec2 uv) {
	vec4 rgb = texture2D(tex, uv);
	return rgb;
}

void main()
{
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	float t = time;
	vec2 mid = vec2(0.5,0.5);
	vec2 focus = abs(sin(t*kScale))/resolution.xy;
	float d1 = distance(focus+sin(t * 0.25) * 0.5,uv);	
	float d2 = distance(focus
						+cos(t),uv);	
	vec4 rgb = (getDistortedTexture(tex, getDistortion(uv, d1, t)) + getDistortedTexture(tex, getDistortion(uv, -d2, t))) * 0.5;
	rgb.r /= d2;
	rgb.g += -0.5 + d1;
	rgb.b = -0.5 + (d1 + d2) / 2.0;
	gl_FragColor = rgb;
}