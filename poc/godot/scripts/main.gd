# C-002 PoC-1B — Sect hall scene in Godot 4 (same assets, layout, animations and scenario as Phaser).
# Throwaway proof-of-concept code. Not product code.
#
# Parameters
#   Web:    URL query  ?n=60&scenario=normal&hud=1&log=http://localhost:8787&run=id&seek=0
#   Native: user args  Godot.exe -- n=60 scenario=normal hud=1 log=http://localhost:8787 run=id
extends Node2D

const W := 1080
const H := 1920
const CharacterScript := preload("res://scripts/character.gd")

var params := {}
var N := 60
var scenario_name := "normal"
var log_url := ""
var run_id := ""
var hud_on := false
var probe := false  # web only: expose scenario time for automated screenshots

var rig: Dictionary
var anims: Dictionary
var layout: Dictionary
var scenario: Dictionary
var names: Array
var textures := {}
var name_settings: LabelSettings
var glow_shader: Shader
var add_mat: CanvasItemMaterial

var chars: Array = []
var npc_count := 0
var slots: Array = []
var sc_time := 0.0
var ev_index := 0
var clock := 0.0
var qi_pool: Array = []    # CPUParticles2D
var qi_busy := {}          # emitter -> character
var bg := {}
var banner: Label
var banner_tween: Tween
var hud: Label
var hud_at := 0.0
var frame_ms: PackedFloat32Array = PackedFloat32Array()
var flush_at := 0.0
var start_ms := 0
var http: HTTPRequest
var http_busy := false
var pending: Array = []
var last_frame_us := 0


func _ready() -> void:
	randomize()
	_read_params()
	N = clampi(int(params.get("n", "60")), 1, 120)
	scenario_name = params.get("scenario", "normal")
	log_url = params.get("log", "")
	run_id = params.get("run", "godot-%d" % Time.get_unix_time_from_system())
	hud_on = params.get("hud", "0") == "1"
	probe = OS.has_feature("web") and params.get("probe", "0") == "1"

	rig = _json("res://assets/rig.json")
	anims = _json("res://shared/anims.json")
	layout = _json("res://shared/layout.json")
	scenario = _json("res://shared/scenario_%s.json" % scenario_name)
	names = _json("res://shared/names.json")["names"]

	var font: FontFile = load("res://assets/fonts/NotoSans-Bold-VI.ttf")
	name_settings = LabelSettings.new()
	name_settings.font = font
	name_settings.font_size = 22
	name_settings.font_color = Color("#FFF6DA")
	name_settings.outline_size = 10
	name_settings.outline_color = Color("#1A1030")
	glow_shader = load("res://scripts/glow.gdshader")
	add_mat = CanvasItemMaterial.new()
	add_mat.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD

	# background layers
	for k in ["bg_sky", "bg_mountains", "bg_hall"]:
		var s := Sprite2D.new()
		s.texture = tex(k + ".png")
		s.position = Vector2(W / 2.0, H / 2.0)
		s.z_index = -4000 + bg.size()
		add_child(s)
		bg[k] = s
	var mist := Sprite2D.new()
	mist.texture = tex("fg_mist.png")
	mist.position = Vector2(W / 2.0, H / 2.0)
	mist.modulate.a = 0.85
	mist.z_index = 3500
	add_child(mist)
	bg["fg_mist"] = mist

	# ambient qi motes
	var motes := CPUParticles2D.new()
	motes.texture = tex("fx_glow.png")
	motes.material = add_mat
	motes.amount = 50
	motes.lifetime = 6.0
	motes.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	motes.emission_rect_extents = Vector2(W / 2.0, (H - 900) / 2.0)
	motes.position = Vector2(W / 2.0, (H + 900) / 2.0)
	motes.direction = Vector2(0, -1)
	motes.spread = 15
	motes.gravity = Vector2.ZERO
	motes.initial_velocity_min = 15
	motes.initial_velocity_max = 40
	motes.scale_amount_min = 0.35
	motes.scale_amount_max = 0.35
	motes.scale_amount_curve = _fade_curve()
	motes.color_ramp = _alpha_ramp(0.7)
	motes.z_index = 3000
	add_child(motes)

	_build_slots()
	for npc in layout["npcs"]:
		var c := _new_char(npc["kind"], Vector2(npc["x"], npc["y"]), npc["scale"], npc["name"], Color(1, 1, 1), true, true)
		chars.append(c)
	npc_count = chars.size()
	for i in N:
		var s: Dictionary = slots[i]
		var c := _new_char(rig["tiers"][0], Vector2(s["x"], s["y"]), s["scale"], names[i % names.size()], s["tint"], s["show_name"], false)
		chars.append(c)

	for i in 12:
		var e := CPUParticles2D.new()
		e.texture = tex("fx_glow.png")
		e.material = add_mat
		e.amount = 20
		e.lifetime = 1.4
		e.emitting = false
		e.direction = Vector2(0, -1)
		e.spread = 12
		e.gravity = Vector2.ZERO
		e.initial_velocity_min = 30
		e.initial_velocity_max = 70
		e.scale_amount_min = 0.45
		e.scale_amount_max = 0.45
		e.scale_amount_curve = _fade_curve()
		e.color_ramp = _alpha_ramp(0.9)
		e.z_index = 3200
		add_child(e)
		qi_pool.append(e)

	banner = Label.new()
	var bs := LabelSettings.new()
	bs.font = font
	bs.font_size = 54
	bs.font_color = Color("#FFE7A3")
	bs.outline_size = 18
	bs.outline_color = Color("#3A1A40")
	banner.label_settings = bs
	banner.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	banner.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	banner.size = Vector2(W, 200)
	banner.position = Vector2(0, 600)
	banner.pivot_offset = Vector2(W / 2.0, 100)
	banner.modulate.a = 0.0
	banner.z_index = 4000
	add_child(banner)

	if hud_on:
		hud = Label.new()
		hud.position = Vector2(16, 16)
		hud.add_theme_font_size_override("font_size", 28)
		hud.add_theme_color_override("font_color", Color(0, 1, 0.53))
		hud.z_index = 4090
		add_child(hud)

	http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(_r, _c, _h, _b): http_busy = false; _send_next())

	var seek := float(params.get("seek", "0"))
	if seek > 0.0:
		sc_time = seek
		var evs: Array = scenario["events"]
		while ev_index < evs.size() and evs[ev_index]["t"] < seek:
			ev_index += 1
	start_ms = Time.get_ticks_msec()
	flush_at = 5.0


func _read_params() -> void:
	if OS.has_feature("web"):
		var q = JavaScriptBridge.eval("location.search", true)
		if typeof(q) == TYPE_STRING:
			for pair in String(q).trim_prefix("?").split("&", false):
				var kv := pair.split("=", true, 1)
				if kv.size() == 2:
					params[kv[0]] = kv[1].uri_decode()
	for a in OS.get_cmdline_user_args():
		var kv := String(a).trim_prefix("--").split("=", true, 1)
		if kv.size() == 2:
			params[kv[0]] = kv[1]


func _json(path: String) -> Variant:
	return JSON.parse_string(FileAccess.get_file_as_string(path))


func tex(file: String) -> Texture2D:
	if not textures.has(file):
		textures[file] = load("res://assets/" + file)
	return textures[file]


func short_name(n: String) -> String:
	var parts := n.split(" ")
	var core := n
	if parts.size() > 2:
		core = parts[parts.size() - 2] + " " + parts[parts.size() - 1]
	return core.substr(0, 8) + "…" if core.length() > 9 else core


func _fade_curve() -> Curve:
	var c := Curve.new()
	c.add_point(Vector2(0, 1))
	c.add_point(Vector2(1, 0))
	return c


func _alpha_ramp(a: float) -> Gradient:
	var g := Gradient.new()
	g.set_color(0, Color(1, 1, 1, a))
	g.set_color(1, Color(1, 1, 1, 0))
	return g


func _new_char(kind: String, pos: Vector2, s: float, n: String, t: Color, show: bool, full: bool) -> Node2D:
	var c: Node2D = CharacterScript.new()
	add_child(c)
	c.setup(self, kind, pos, s, n, t, show, full)
	return c


func _build_slots() -> void:
	var rows: Array = layout["rows"]
	var remaining := N
	for ri in rows.size():
		if remaining <= 0:
			break
		var row: Dictionary = rows[ri]
		var count: int = mini(int(row["cap"]), remaining)
		remaining -= count
		var width: float = layout["rowWidth"][ri]
		var depth_k := float(ri) / float(rows.size() - 1)
		var shade: float = 1.0 - (1.0 - float(layout["backRowTint"])) * depth_k
		for i in count:
			var x: float = W / 2.0 - width / 2.0 + (width / count) * (i + 0.5) + (12.0 if ri % 2 else -12.0)
			slots.append({"x": x, "y": row["y"], "scale": row["scale"], "show_name": row["showName"], "tint": Color(shade, shade, shade)})


func disciple(slot: int) -> Node2D:
	return chars[npc_count + (slot % N)]


# ------------------------------------------------------------ scenario events
func _run_events(dt: float) -> void:
	sc_time += dt
	var length: float = scenario["length"]
	if sc_time >= length:
		sc_time -= length
		ev_index = 0
	var evs: Array = scenario["events"]
	while ev_index < evs.size() and evs[ev_index]["t"] <= sc_time:
		_handle(evs[ev_index])
		ev_index += 1


func _handle(ev: Dictionary) -> void:
	var c = disciple(int(ev["slot"]))
	match ev["type"]:
		"celebrate":
			if not c.moving:
				c.play("celebrate")
		"cultivate":
			var dur: float = ev.get("duration", 8.0)
			c.mode = "cultivate"
			c.cultivate_until = clock + dur
			for e in qi_pool:
				if not qi_busy.has(e):
					qi_busy[e] = c
					e.emitting = true
					get_tree().create_timer(dur).timeout.connect(func(): e.emitting = false; qi_busy.erase(e))
					break
		"join":
			var target := Vector2(c.home.x, c.home.y)
			c.set_char_name(ev.get("name", c.char_name))
			c.tier = 0
			c.apply_kind(rig["tiers"][0])
			c.position.x = -80.0 if target.x < W / 2.0 else W + 80.0
			c.move_to(target, 1.6)
		"swap":
			var d = disciple(int(ev.get("slot2", 0)))
			if c == d or c.moving or d.moving:
				return
			var cp := Vector2(c.home.x, c.home.y)
			var dp := Vector2(d.home.x, d.home.y)
			var cs: float = c.base_scale
			var ds: float = d.base_scale
			c.move_to(dp, 1.1)
			d.move_to(cp, 1.1)
			c.set_base_scale(ds)
			d.set_base_scale(cs)
		"breakthrough":
			_breakthrough(c)


func _breakthrough(c) -> void:
	var x: float = c.position.x
	var y: float = c.home.y
	var sc: float = c.base_scale
	# 1) seal ring
	var seal := Sprite2D.new()
	seal.texture = tex("fx_seal.png")
	seal.material = add_mat
	seal.position = Vector2(x, y - 4)
	seal.scale = Vector2.ZERO
	seal.z_index = c.z_index - 1
	add_child(seal)
	var t1 := create_tween()
	t1.tween_property(seal, "scale", Vector2(sc * 0.9, sc * 0.35), 0.5).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	var t1r := create_tween()
	t1r.tween_property(seal, "rotation_degrees", 360.0, 2.6)
	# 2) qi gathering: particles spawned on a ring, moving to the centre
	var gather := CPUParticles2D.new()
	gather.texture = tex("fx_glow.png")
	gather.material = add_mat
	gather.position = Vector2(x, y - 80 * sc)
	gather.amount = 24
	gather.lifetime = 0.7
	gather.emission_shape = CPUParticles2D.EMISSION_SHAPE_SPHERE_SURFACE  # circle edge in 2D
	gather.emission_sphere_radius = 220 * sc
	gather.gravity = Vector2.ZERO
	gather.radial_accel_min = -900 * sc
	gather.radial_accel_max = -900 * sc
	gather.scale_amount_min = 0.6
	gather.scale_amount_max = 0.6
	gather.z_index = 3300
	add_child(gather)
	# 3) engine-native glow on the character
	c.set_glow(true)
	var tg := create_tween()
	tg.tween_method(c.set_glow_strength, 0.0, 1.0, 1.3)

	await get_tree().create_timer(1.4).timeout
	gather.emitting = false
	# 4) light pillar + burst
	var pillar := Sprite2D.new()
	pillar.texture = tex("fx_pillar.png")
	pillar.material = add_mat
	pillar.centered = false
	pillar.offset = Vector2(-128, -1024)
	pillar.position = Vector2(x, y)
	pillar.scale = Vector2(sc * 1.4, 1.2)
	pillar.modulate.a = 0.0
	pillar.z_index = 3400
	add_child(pillar)
	var tp := create_tween()
	tp.tween_property(pillar, "modulate:a", 1.0, 0.15)
	tp.tween_interval(0.25)
	tp.tween_property(pillar, "modulate:a", 0.0, 0.15)
	tp.tween_callback(pillar.queue_free)
	var burst := CPUParticles2D.new()
	burst.texture = tex("fx_glow.png")
	burst.material = add_mat
	burst.position = Vector2(x, y - 80 * sc)
	burst.amount = 36
	burst.lifetime = 0.9
	burst.one_shot = true
	burst.explosiveness = 1.0
	burst.spread = 180
	burst.gravity = Vector2.ZERO
	burst.initial_velocity_min = 150
	burst.initial_velocity_max = 420
	burst.scale_amount_min = 0.7
	burst.scale_amount_max = 0.7
	burst.scale_amount_curve = _fade_curve()
	burst.color_ramp = _alpha_ramp(1.0)
	burst.z_index = 3400
	add_child(burst)
	burst.emitting = true
	get_tree().create_timer(1.2).timeout.connect(burst.queue_free)
	# 5) tier change + celebrate
	c.tier = (c.tier + 1) % rig["tiers"].size()
	c.apply_kind(rig["tiers"][c.tier])
	c.play("celebrate")
	var bump := create_tween()
	var base: Vector2 = c.scale
	bump.tween_property(c, "scale", base * 1.15, 0.16)
	bump.tween_property(c, "scale", base, 0.16)
	# 6) banner
	banner.text = "%s\nđột phá %s!" % [c.char_name, rig["tier_names"][c.tier]]
	banner.modulate.a = 1.0
	banner.scale = Vector2(0.6, 0.6)
	if banner_tween:
		banner_tween.kill()
	banner_tween = create_tween()
	banner_tween.tween_property(banner, "scale", Vector2.ONE, 0.3).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	banner_tween.tween_interval(1.5)
	banner_tween.tween_property(banner, "modulate:a", 0.0, 0.5)

	await get_tree().create_timer(1.2).timeout
	gather.queue_free()
	var ts := create_tween()
	ts.tween_property(seal, "modulate:a", 0.0, 0.3)
	ts.tween_callback(seal.queue_free)
	var tg2 := create_tween()
	tg2.tween_method(c.set_glow_strength, 1.0, 0.0, 0.3)
	tg2.tween_callback(func(): c.set_glow(false))


# ------------------------------------------------------------ frame loop
func _process(delta: float) -> void:
	var dt: float = min(delta, 0.1)
	clock += dt
	# Log the REAL interval between frames (Godot's `delta` may be smoothed).
	var now_us := Time.get_ticks_usec()
	if last_frame_us > 0:
		frame_ms.append((now_us - last_frame_us) / 1000.0)
	last_frame_us = now_us
	_run_events(dt)
	if probe:
		JavaScriptBridge.eval("window.__scTime=%f" % sc_time)
	for c in chars:
		c.step(clock, dt)
	for e in qi_busy:
		var c = qi_busy[e]
		e.position = Vector2(c.position.x, c.position.y - 60 * c.base_scale)
	bg["bg_mountains"].position.x = W / 2.0 + sin(clock * 0.15) * 14.0
	bg["fg_mist"].position.x = W / 2.0 + sin(clock * 0.22) * 40.0
	if hud and clock - hud_at > 0.5:
		hud_at = clock
		hud.text = "Godot %s | n=%d | %.1f fps" % [Engine.get_version_info()["string"], N, Engine.get_frames_per_second()]  # engine fps counter (1 s average)
	if clock >= flush_at:
		flush_at = clock + 5.0
		_flush()


func _flush() -> void:
	var batch := frame_ms
	frame_ms = PackedFloat32Array()
	if log_url == "":
		return
	var body := {
		"run": run_id,
		"engine": "godot-web" if OS.has_feature("web") else "godot-native",
		"engineVersion": Engine.get_version_info()["string"],
		"renderer": RenderingServer.get_video_adapter_name(),
		"n": N,
		"scenario": scenario_name,
		"tSinceStartMs": Time.get_ticks_msec() - start_ms,
		"frameMs": Array(batch),
		"memory": OS.get_static_memory_usage(),
		"userAgent": OS.get_name(),
	}
	pending.append(JSON.stringify(body))
	_send_next()


func _send_next() -> void:
	if http_busy or pending.is_empty():
		return
	http_busy = true
	var err := http.request(log_url + "/frames", ["Content-Type: application/json"], HTTPClient.METHOD_POST, pending.pop_front())
	if err != OK:
		http_busy = false
