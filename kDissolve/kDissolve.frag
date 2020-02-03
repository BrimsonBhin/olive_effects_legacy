/*
Edit of the Luma Key Shader.
*/

uniform sampler2D tex;
varying vec2 vTexCoord;

uniform float kValue;

void main(void) {
    vec4 texture_color = texture2D(tex,vTexCoord);

    float luma = kValue;

    texture_color.a = kValue/100.0;

    texture_color.rgb *= texture_color.a;
    gl_FragColor = texture_color;
}