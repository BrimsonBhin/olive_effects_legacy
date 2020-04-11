uniform sampler2D image;
uniform vec2 resolution;
varying vec2 vTexCoord;

uniform float kBlur;
uniform float kSize;
uniform float kSoft;
uniform float kCenterX;
uniform float kCenterY;
uniform bool kCircular;
uniform bool kInvert;

// "One Pass Blur" by Xor https://www.shadertoy.com/view/ld2fDd
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

vec4 Linear(sampler2D inP, vec2 uv, vec2 O, float Scale) {
    vec4 F = vec4(floor(uv.xyxy*Scale+vec4(0.0,0.0,1.0,1.0))/Scale);
    vec4 S = vec4((uv-F.xy)*Scale,(F.zw-uv)*Scale);

    return (texture2D(inP,F.xy+O)*S.z+texture2D(inP,F.zy+O)*S.x)*S.w+
           (texture2D(inP,F.xw+O)*S.z+texture2D(inP,F.zw+O)*S.x)*S.y;
}

vec4 blur(sampler2D inP, vec2 coord) {
    float Blur = resolution.y/(kBlur * 10.0);
    vec4 Tex = vec4(0);
    for(float x = 0.0;x<1.0;x+=0.1) {
        for(float y = 0.0;y<1.0;y+=0.1) {
            Tex += Linear(inP, coord+vec2(x,y)/Blur,-vec2(x,y)/Blur,Blur);
        }
    }
    Tex *= 0.01;
    return vec4(Tex.rgb * Tex.a, Tex.a);
}

// Vignette from Olive
vec4 vignette(sampler2D inP, vec2 coord) {
    if (kSize == 0.0) {
        discard;
    }

    vec4 c = texture2D(inP, coord);
    vec2 vignetteCoord = coord;
    if (kCircular) {
        float ar = (resolution.x/resolution.y);
        vignetteCoord.x *= ar;
        vignetteCoord.x -= (1.0-(1.0/ar));
    }

    float dist = distance(vignetteCoord, vec2(0.5 + kCenterX*0.01, 0.5 + kCenterY*0.01));
    float size = (kSize*0.01);

    if (kInvert) {
        c *= 1.0 - smoothstep(size, size*0.99*(1.0-kSoft*0.01), dist);
    } else {
        c *= smoothstep(size, size*0.99*(1.0-kSoft*0.01), dist);
    }

    return c;
}

void main() {
    vec2 uv = vTexCoord.xy;
    vec4 base = texture2D(image, uv);
    vec4 bg = blur(image, uv);
    vec4 col = vignette(image, uv);

    gl_FragColor = vec4(bg.rgb*(1.0-col.a) + col.rgb, 1.0);
}