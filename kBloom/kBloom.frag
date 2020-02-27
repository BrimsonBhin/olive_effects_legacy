/*
getColor(): https://www.shadertoy.com/view/4dcXWs
Blur: https://github.com/spite/Wagner
Blend: https://github.com/jamieowen/glsl-blend
Tonemap: https://github.com/dmnsgn/glsl-tone-map
*/

uniform vec2 resolution;
uniform sampler2D image;
varying vec2 vTexCoord;

uniform float kThreshold;
uniform float kIntensity;
uniform float kRadius;

const vec2 renderScale = vec2(1.0);

// Threshold Colours
vec3 getColor(vec2 uv)
{
    vec3 tex = pow(texture2D(image, uv).rgb, vec3(2.2));
    vec3 base_col = max((tex - (kThreshold/10.0)) * (kIntensity), 0.0);

    // Smooth based on chit
    float lum = dot(base_col, vec3(0.2126, 0.7152, 0.0722));
    float weight = smoothstep(0.0, kIntensity, log2(lum));

    return mix(vec3(0.0), base_col.rgb, weight);
}

// Blur Colours
float random(vec3 scale, float seed){
    return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);
}

vec3 gaussian(sampler2D tex, vec2 fragCoord) {
    vec4 color=vec4(0.0);
    float total=0.0;
    float offset=random(vec3(12.9898,78.233,151.7182),0.0);
    float amount = (log2(kRadius*renderScale.x))*0.01;

    for(float t=-30.0;t<=30.0;t++){
        float percent=(t+offset-0.5)/30.0;
        float weight=1.0-abs(percent);
        vec4 bsample= vec4(getColor(fragCoord +
                            vec2(cos(0.0)*amount,sin(0.0)*amount) * percent), 1.0);
        bsample.rgb*=bsample.a;
        color+=bsample*weight;
        total+=weight;
    }

    color=color/total;
    return color.rgb/=color.a;
}

vec3 ScreenBlend(vec3 a, vec3 b) {
    return 1.0 - ((1.0 - a) * (1.0 - b));
}

vec3 Tonemap(vec3 x) {
    return x / (x + 0.155) * 1.019;
}

void main()
{
    vec3 base = texture2D(image, vTexCoord).rgb;
    vec3 blend = Tonemap(gaussian(image, vTexCoord));

    gl_FragColor = vec4(ScreenBlend(base, blend), 1.0);
}
