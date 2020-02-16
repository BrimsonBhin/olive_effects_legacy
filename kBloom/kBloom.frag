/*
Amaturish mess
Box blur: https://www.shadertoy.com/view/MtGyDy
getColor() function: https://www.shadertoy.com/view/4dcXWs
ACESFilm tonemap: https://www.shadertoy.com/view/wl2SDt
*/

uniform vec2 resolution;
uniform sampler2D image;

uniform float kThreshold;
uniform float kIntensity;
uniform float kRadius;

vec4 getColor(vec4 tex) {
    vec4 Color = max((tex - (kThreshold/10.0)) * (kIntensity/2.0), 0.0);
    return vec4(pow(Color.xyz,vec3(1.0/2.2)), 1.0);
}

float random(vec3 scale, float seed){
    return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);
}

vec3 boxBlur(sampler2D tex, vec2 uv, vec2 delta){
    vec4 color=vec4(0.0);
    float total=0.0;
    float offset=random(vec3(12.9898,78.233,151.7182),0.0);
    for(float t=-30.0;t<=30.0;t++){
        float percent=(t+offset-0.5)/30.0;
        float weight=1.0-abs(percent);
        vec4 bsample= vec4(getColor(texture2D(tex,uv+delta*percent)));
        bsample.rgb*=bsample.a;
        color+=bsample*weight;
        total+=weight;
    }

    color=color/total;
    color.rgb/=color.a;

    return vec3(color);
}

vec3 blurCFG(in sampler2D tex, vec2 uv)
{
    const float angle = 0.0 ;
    float amount = kRadius * 0.005;

    vec2 delta = vec2(cos(angle) * amount, sin(angle) * amount);

    vec3 c = boxBlur(tex, uv, delta);

    return vec3(c);
}

vec3 blend(vec3 a, vec3 b) {
    return 1.0 - (1.0 - a) * (1.0 - b);
}

vec3 ACESFilm(vec3 x)
{
    const float a = 2.51;
    const float b = 0.03;
    const float c = 2.43;
    const float d = 0.59;
    const float e = 0.14;
    return (x*(a*x+b))/(x*(c*x+d)+e);
}

void main()
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 tx = texture2D(image, uv);

    gl_FragColor = vec4(blend(tx.xyz, ACESFilm(blurCFG(image, uv))), 1.0);
}