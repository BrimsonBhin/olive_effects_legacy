// Olive port of https://www.shadertoy.com/view/3tlXR8

uniform sampler2D image;
uniform float kValue;
varying vec2 vTexCoord;

// hardness of alpha clipping
// lower = harder edge
// higher = softer edge
uniform float kAlphaRange;

void main() {
    float kAlphaRange = kAlphaRange * 0.1;
    // define the UVs, make them square by using the same iRes dimension

    // color textures
    vec4 clrA = texture2D(image, vTexCoord);

    // fade mask
    vec4 alphaTex = texture2D(image, vTexCoord);
    float a = alphaTex.r;

    float myAlpha = kValue * 0.01; // set this to fade the alpha (0-1)
    float alphaStart = mix(0.0, 1.0 + (kAlphaRange), myAlpha);
    float aMin = alphaStart - (kAlphaRange);
    float aMinRangInv = 1.0 / (kAlphaRange);

    a = a * aMinRangInv + (-aMin * aMinRangInv);
    float alpha = clamp(a, 0.0, 1.0);

    gl_FragColor = mix(clrA, vec4(0.0), alpha);
}