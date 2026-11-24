// C-002 PoC: outer glow for a CanvasGroup (the character), comparable to Phaser's Glow filter.
shader_type canvas_item;
render_mode unshaded;

uniform sampler2D screen_texture : hint_screen_texture, repeat_disable, filter_linear_mipmap;
uniform vec4 glow_color : source_color = vec4(1.0, 0.906, 0.639, 1.0);
uniform float strength = 0.0;
uniform float radius = 14.0;

void fragment() {
	vec4 c = textureLod(screen_texture, SCREEN_UV, 0.0);
	if (c.a > 0.0001) {
		c.rgb /= c.a;
	}
	float acc = 0.0;
	for (int i = 0; i < 16; i++) {
		float a = float(i) * 0.392699; // 2*PI/16
		vec2 dir = vec2(cos(a), sin(a));
		acc += textureLod(screen_texture, SCREEN_UV + dir * radius * SCREEN_PIXEL_SIZE, 0.0).a;
		acc += textureLod(screen_texture, SCREEN_UV + dir * radius * 0.5 * SCREEN_PIXEL_SIZE, 0.0).a;
	}
	acc = clamp(acc / 16.0, 0.0, 1.0);
	vec4 glow = vec4(glow_color.rgb, acc * strength);
	COLOR = mix(glow, c, c.a);
	COLOR.rgb += glow_color.rgb * 0.35 * strength * c.a; // inner brightening
}
