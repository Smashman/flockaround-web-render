// Converted from HueShift.gdshader (from Flock Around source)
in vec2 vUV;

uniform sampler2D uTexture;
uniform float uTime;
uniform float hueShiftSpeed;
uniform float hueShiftOffset;

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

bool is_in_stripe(float x, float stripe_width, float stripe_spacing) {
    float cycle = stripe_width + stripe_spacing;
    float m = mod(x, cycle);
    return m < stripe_width;
}

void main() {
    vec4 tex_color = texture2D(uTexture, vUV);
    vec3 shifted_rgb = tex_color.rgb;

    // float animated_shift = mod(uTime * hueShiftSpeed + hueShiftOffset, 1.0);

    vec3 hsv = rgb2hsv(shifted_rgb);
    float x = vUV.x + vUV.y/5.0 + uTime * 0.1;

    bool stripe = is_in_stripe(x, 0.03, 0.03);

    if(stripe){
        hsv.x = fract(hsv.x + 0.5);
    }

    shifted_rgb = hsv2rgb(hsv);

    gl_FragColor = vec4(shifted_rgb, tex_color.a);
}