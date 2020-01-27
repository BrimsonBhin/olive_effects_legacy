/*
Olive port of https://www.shadertoy.com/view/WdVSWd
*/

uniform sampler2D tex;
uniform vec2 resolution;

const float GoldenAngle = 2.39996323;
const float Iterations = 512.0;
const vec3 ContrastFactor = vec3(9.0);

uniform float kContrastAmount;
uniform float kSmooth;
uniform float kRadius;

// bigger is better quality

const mat2 Rotation = mat2(
    cos(GoldenAngle),
    sin(GoldenAngle),
   -sin(GoldenAngle),
    cos(GoldenAngle)
);

///////////
/*
    calculates circle of confusion diameter for each fixel from physical parameters and depth map

    this function is unused

    see http://ivizlab.sfu.ca/papers/cgf2012.pdf, page 10
*/

float blurRadius(
    float A, // aperture
    float f, // focal length
    float S1, // focal distance
    float far, // far clipping plane
    float maxCoc, // mac coc diameter

    vec2 uv,
    sampler2D depthMap)
{
    vec4 currentPixel = texture2D(depthMap, uv);

    float S2 = currentPixel.r * far;

    //https://en.wikipedia.org/wiki/Circle_of_confusion
    float coc = A * ( abs(S2 - S1) / S2 ) * ( f / (S1 - f) );

    float sensorHeight = 0.024; // 24mm

    float percentOfSensor = coc / sensorHeight;

    // blur factor
    return clamp(percentOfSensor, 0.0, maxCoc);
}
///////////

vec3 bokeh(sampler2D tex, vec2 uv, float kRadiusus) {
    vec3 num, // numerator                       acc = areas concentric circles? ( ͡° ͜ʖ ͡°)
         weight;

    float rec = 1.0; // reciprocal

    vec2 horizontalAngle = vec2(0.0, kRadiusus * 0.01 / sqrt(Iterations));

    for (float i; i < Iterations; i++) {
        rec += 1.0 / rec;

        horizontalAngle = horizontalAngle * Rotation;

        vec2 offset = (rec - 1.0) * horizontalAngle;

        vec2 aspect = vec2(resolution.y/resolution.x, 1.0);

        vec2 sampleUV = uv + aspect * offset;

        vec3 col = texture2D(tex, sampleUV).rgb;

        // increase contrast and Smooth
        vec3 bokeh = kSmooth + pow(col, ContrastFactor) * kContrastAmount;

        num += col * bokeh;
        weight += bokeh;
    }
    return num / weight;
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float rad = kRadius/10.;
    gl_FragColor = vec4(bokeh(tex, uv, rad), 1.0);
}