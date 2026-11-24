# C-002 PoC-1B — one chibi character built from the shared layered rig.
# Throwaway proof-of-concept code. Not product code.
extends Node2D
class_name Character

var main: Node  # main.gd
var rig: Dictionary
var anims: Dictionary
var parts := {}            # layer name -> Sprite2D
var body_root: Node2D      # holds the sprites (re-parented under a CanvasGroup while glowing)
var glow_group: CanvasGroup = null
var kind := ""
var tier := 0
var phase := 0.0
var mode := "idle"
var cultivate_until := 0.0
var clip_name := ""
var clip_t := 0.0
var moving := false
var mv_from := Vector2.ZERO
var mv_to := Vector2.ZERO
var mv_t := 0.0
var mv_dur := 1.0
var base_scale := 0.5
var home := Vector2.ZERO
var label: Label = null
var char_name := ""
var tint := Color(1, 1, 1)


func setup(p_main: Node, p_kind: String, pos: Vector2, scale_px: float, p_name: String, p_tint: Color, show_name: bool, full_name := false) -> void:
	main = p_main
	rig = main.rig
	anims = main.anims
	phase = randf()
	base_scale = scale_px
	home = pos
	position = pos
	char_name = p_name
	tint = p_tint
	body_root = Node2D.new()
	add_child(body_root)
	_apply_scale()
	apply_kind(p_kind)
	if show_name:
		label = Label.new()
		label.label_settings = main.name_settings
		label.text = p_name if full_name else main.short_name(p_name)
		label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		label.size = Vector2(200, 34)
		label.position = Vector2(-100, 8)
		label.z_index = 1
		add_child(label)
	_update_z()


func _apply_scale() -> void:
	var s: float = base_scale / float(rig["base"]["scale"])
	body_root.scale = Vector2(s, s)


func apply_kind(p_kind: String) -> void:
	kind = p_kind
	var files: Dictionary = rig["kinds"][p_kind]
	var s: float = rig["base"]["scale"]
	var root: Array = rig["base"]["root"]
	for layer in rig["layers"]:
		var lname: String = layer["name"]
		var spr: Sprite2D = parts.get(lname)
		if not files.has(lname):
			if spr:
				spr.visible = false
			continue
		var tex: Texture2D = main.tex(files[lname])
		if spr == null:
			spr = Sprite2D.new()
			spr.centered = false
			var pv: Array = layer["pivot"]
			# rotate around the pivot: node sits on the pivot, texture is offset back
			spr.offset = Vector2(-pv[0] * s, -pv[1] * s)
			spr.position = Vector2((pv[0] - root[0]) * s, (pv[1] - root[1]) * s)
			parts[lname] = spr
			body_root.add_child(spr)
		spr.texture = tex
		spr.visible = true
		spr.modulate = tint


func set_char_name(n: String) -> void:
	char_name = n
	if label:
		label.text = main.short_name(n)


func play(n: String) -> void:
	clip_name = n
	clip_t = 0.0


func move_to(target: Vector2, dur: float) -> void:
	moving = true
	mv_from = Vector2(position.x, home.y)
	mv_to = target
	mv_t = 0.0
	mv_dur = dur


func set_base_scale(v: float) -> void:
	base_scale = v
	_apply_scale()


func _update_z() -> void:
	z_index = int(home.y) - 2000  # z range is limited to +-4096


static func smooth(x: float) -> float:
	return x * x * (3.0 - 2.0 * x)


static func sample_track(keys: Array, t: float) -> float:
	if t <= keys[0][0]:
		return keys[0][1]
	for i in range(1, keys.size()):
		var k1: Array = keys[i]
		var k0: Array = keys[i - 1]
		if t <= k1[0]:
			return k0[1] + (k1[1] - k0[1]) * smooth((t - k0[0]) / max(0.000001, k1[0] - k0[0]))
	return keys[keys.size() - 1][1]


func step(time: float, dt: float) -> void:
	if mode == "cultivate" and time > cultivate_until:
		mode = "idle"
	var wave: Dictionary = anims["waves"][mode]
	var rot := {}
	var root_y := 0.0
	var body_sy := 1.0
	var period: float = wave["period"]
	for ch in wave["channels"]:
		var v: float = ch.get("offset", 0.0) + ch["amp"] * sin(TAU * (time / period + phase + ch["phase"]))
		if ch["layer"] == "root" and ch["prop"] == "y":
			root_y += v
		elif ch["prop"] == "rot":
			rot[ch["layer"]] = rot.get(ch["layer"], 0.0) + v
		elif ch["prop"] == "scaleY":
			body_sy += v
	if clip_name != "":
		var clip: Dictionary = anims["clips"][clip_name]
		clip_t += dt
		for track in clip["tracks"]:
			var v := sample_track(clip["tracks"][track], clip_t)
			if track == "root_y":
				root_y += v
			elif track == "head_rot":
				for l in ["head", "face", "hair_front", "hat", "beard"]:
					rot[l] = rot.get(l, 0.0) + v
			else:
				rot[track] = rot.get(track, 0.0) + v
		if clip_t >= clip["duration"]:
			clip_name = ""
	if moving:
		mv_t += dt
		var k: float = min(1.0, mv_t / mv_dur)
		var e := smooth(k)
		position.x = mv_from.x + (mv_to.x - mv_from.x) * e
		home.y = mv_from.y + (mv_to.y - mv_from.y) * e
		root_y += -abs(sin(k * PI * 4.0)) * 16.0
		if k >= 1.0:
			moving = false
			home.x = mv_to.x
		_update_z()
	for lname in rot:
		var spr: Sprite2D = parts.get(lname)
		if spr:
			spr.rotation_degrees = rot[lname]
	var body: Sprite2D = parts.get("body")
	if body:
		body.scale = Vector2(1.0, body_sy)
	body_root.position.y = root_y * base_scale
	position.y = home.y


# Engine-native glow for breakthrough: wrap the sprites in a CanvasGroup with a glow shader.
func set_glow(on: bool) -> void:
	if on and glow_group == null:
		glow_group = CanvasGroup.new()
		glow_group.fit_margin = 40.0
		glow_group.clear_margin = 40.0
		var mat := ShaderMaterial.new()
		mat.shader = main.glow_shader
		mat.set_shader_parameter("strength", 0.0)
		glow_group.material = mat
		remove_child(body_root)
		glow_group.add_child(body_root)
		add_child(glow_group)
		move_child(glow_group, 0)
	elif not on and glow_group != null:
		glow_group.remove_child(body_root)
		remove_child(glow_group)
		glow_group.queue_free()
		glow_group = null
		add_child(body_root)
		move_child(body_root, 0)


func set_glow_strength(v: float) -> void:
	if glow_group:
		(glow_group.material as ShaderMaterial).set_shader_parameter("strength", v)
