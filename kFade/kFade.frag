/*
Olive port of https://www.shadertoy.com/view/3tlXR8
*/

uniform sampler2D image;
uniform vec2 resolution;
uniform float time;

uniform float kValue;

// hardness of alpha clipping
// lower = harder edge
// higher = softer edge
uniform float kAlphaRange;

void main() {

    // define the UVs, make them square by using the same iRes dimension
	vec2 uv = gl_FragCoord.xy/resolution.xy;

    // color textures
    vec4 clrA = texture2D(image, uv);

    // fade mask
    vec4 alphaTex = texture2D(image, uv);
    float a = alphaTex.r;

    float myAlpha = kValue / 100.0; // set this to fade the alpha (0-1)
    float alphaStart = mix(0.0, 1.0 + (kAlphaRange*0.1), myAlpha);
	float aMin = alphaStart - (kAlphaRange*0.1);
    float aMinRangInv = 1.0 / (kAlphaRange*0.1);

	a = a * aMinRangInv + (-aMin * aMinRangInv);
	float alpha = clamp(a, 0.0, 1.0);

    gl_FragColor = mix(clrA, vec4(0.0), alpha);
}