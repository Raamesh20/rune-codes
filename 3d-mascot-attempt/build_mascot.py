"""
Procedural Rune Codes mascot for Blender 5.x (run headless):
  blender -b --python build_mascot.py -- <out_dir>
Builds real geometry, a pivot hierarchy, six NLA animation clips,
exports a GLB and renders preview images for comparison with the original art.
"""
import bpy, math, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
OUT = argv[0]
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.fps = 30
D = bpy.data


def lin(hex_):
    hex_ = hex_.lstrip("#")
    c = [int(hex_[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


def mat(name, hex_, rough=0.6, metal=0.0, emit=None, strength=0.0):
    m = D.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*lin(hex_), 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = (*lin(emit), 1)
        b.inputs["Emission Strength"].default_value = strength
    return m


M = {
    "fur": mat("Fur Grey", "#7c7f87", 0.9),
    "furDark": mat("Fur Dark", "#5d6068", 0.85),
    "furLight": mat("Fur White", "#dcdad6", 0.9),
    "pink": mat("Ear Pink", "#d99a95", 0.8),
    "hoodie": mat("Hoodie Navy", "#0a0f22", 0.95),
    "pants": mat("Pants Black", "#121318", 0.9),
    "black": mat("Black Gloss", "#0b0b0e", 0.25),
    "eyeWhite": mat("Eye White", "#f5f5f2", 0.2),
    "iris": mat("Iris", "#6d7f99", 0.25),
    "mouth": mat("Mouth", "#5c1a1d", 0.6),
    "tongue": mat("Tongue", "#e07a7a", 0.5),
    "white": mat("White", "#f4f5f7", 0.5),
    "blue": mat("Electric Blue", "#2f7bff", 0.4, emit="#3a8bff", strength=3.0),
    "tablet": mat("Tablet", "#2a2d35", 0.3, metal=0.6),
    "glint": mat("Eye Glint", "#ffffff", 0.1, emit="#ffffff", strength=2.0),
}

ALL_PARTS = []


def link(o, m, parent):
    if m:
        o.data.materials.append(m)
    ALL_PARTS.append(o)
    if parent:
        bpy.context.view_layer.update()
        o.parent = parent
        o.matrix_parent_inverse = parent.matrix_world.inverted()
    return o


def smooth(o):
    for p in o.data.polygons:
        p.use_smooth = True


def sphere(name, loc, scale, m, parent=None, rot=(0, 0, 0), seg=32, ring=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=ring, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name, o.scale = name, scale
    smooth(o)
    return link(o, m, parent)


def cone(name, loc, r1, depth, m, rot=(0, 0, 0), parent=None, r2=0.0, verts=24):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    smooth(o)
    return link(o, m, parent)


def cyl(name, loc, r, depth, m, rot=(0, 0, 0), parent=None, verts=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    smooth(o)
    return link(o, m, parent)


def box(name, loc, scale, m, parent=None, bevel=0.03, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name, o.scale = name, scale
    bv = o.modifiers.new("bevel", "BEVEL")
    bv.width, bv.segments = bevel, 3
    bv.affect = "EDGES"
    smooth(o)
    return link(o, m, parent)


def torus(name, loc, R, r, m, rot=(math.pi / 2, 0, 0), parent=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, rotation=rot,
                                     major_segments=48, minor_segments=12)
    o = bpy.context.active_object
    o.name = name
    smooth(o)
    return link(o, m, parent)


def pivot(name, loc, parent=None):
    o = D.objects.new(name, None)
    o.empty_display_size = 0.08
    o.location = loc
    scene.collection.objects.link(o)
    if parent:
        bpy.context.view_layer.update()
        o.parent = parent
        o.matrix_parent_inverse = parent.matrix_world.inverted()
    return o


def fluff(o, strength=0.018, size=0.06):
    """Subdivide + noise displacement for an irregular, fur-like silhouette."""
    sub = o.modifiers.new("sub", "SUBSURF")
    sub.levels = sub.render_levels = 1
    tex = D.textures.new(f"{o.name}_n", "CLOUDS")
    tex.noise_scale = size
    d = o.modifiers.new("fluff", "DISPLACE")
    d.texture, d.strength, d.mid_level = tex, strength, 0.5


# ───────────────────────── Pivot hierarchy (animation "bones") ─────────────────────────
root = pivot("root", (0, 0, 0))
hips = pivot("hips", (0, 0, 0.62), root)
legR = pivot("legR", (-0.17, 0, 0.62), hips)
legL = pivot("legL", (0.17, 0, 0.62), hips)
body = pivot("body", (0, 0, 0.62), hips)
head = pivot("head", (0, 0, 1.17), body)
armR = pivot("armR", (-0.31, 0, 1.03), body)   # character's right = viewer's left
elbR = pivot("elbR", (-0.31, 0, 0.76), armR)
armL = pivot("armL", (0.31, 0, 1.03), body)
elbL = pivot("elbL", (0.31, 0, 0.76), armL)
tail = pivot("tail", (-0.08, 0.2, 0.66), hips)

# ───────────────────────── Legs and sneakers ─────────────────────────
for side, piv in ((-1, legR), (1, legL)):
    x = 0.17 * side
    cyl(f"pant_{side}", (x, 0, 0.37), 0.125, 0.5, M["pants"], parent=piv)
    box(f"pocket_{side}", (x + 0.12 * side, -0.01, 0.42), (0.03, 0.09, 0.09), M["pants"], parent=piv, bevel=0.015)
    box(f"buckle_{side}", (x + 0.15 * side, -0.01, 0.5), (0.012, 0.02, 0.035), M["white"], parent=piv, bevel=0.005)
    box(f"sole_{side}", (x, -0.05, 0.03), (0.12, 0.2, 0.03), M["white"], parent=piv, bevel=0.025)
    box(f"shoe_{side}", (x, -0.03, 0.1), (0.115, 0.18, 0.07), M["black"], parent=piv, bevel=0.05)
    box(f"toe_{side}", (x, -0.15, 0.08), (0.1, 0.07, 0.045), M["white"], parent=piv, bevel=0.04)
    box(f"swoosh_{side}", (x + 0.115 * side, -0.02, 0.1), (0.008, 0.08, 0.025), M["blue"], parent=piv, bevel=0.006)
    box(f"laces_{side}", (x, -0.08, 0.17), (0.05, 0.06, 0.012), M["white"], parent=piv, bevel=0.008)

# ───────────────────────── Torso / hoodie ─────────────────────────
sphere("waist", (0, 0, 0.64), (0.3, 0.22, 0.13), M["pants"], parent=body)
sphere("hoodie", (0, 0, 0.88), (0.34, 0.26, 0.34), M["hoodie"], parent=body)
torus("hoodie_hem", (0, 0, 0.64), 0.27, 0.06, M["hoodie"], rot=(0, 0, 0), parent=body)
sphere("pocket", (0, -0.215, 0.74), (0.18, 0.05, 0.08), M["hoodie"], parent=body)
torus("hood", (0, 0.04, 1.15), 0.2, 0.075, M["hoodie"], rot=(0.25, 0, 0), parent=body)
sphere("chest_fluff", (0, -0.13, 1.13), (0.15, 0.1, 0.09), M["furLight"], parent=body)
for sx in (-1, 1):
    cyl(f"string_{sx}", (0.055 * sx, -0.255, 1.02), 0.009, 0.13, M["white"], parent=body)
    sphere(f"string_tip_{sx}", (0.055 * sx, -0.258, 0.945), (0.016, 0.016, 0.03), M["blue"], parent=body)

# Chest logo: chevron mark + wordmark
bpy.ops.object.text_add(location=(0, -0.262, 0.86), rotation=(math.pi / 2, 0, 0))
logo = bpy.context.active_object
logo.data.body = "RUNECODES"
logo.data.size = 0.062
logo.data.align_x = "CENTER"
logo.data.extrude = 0.003
bpy.ops.object.convert(target="MESH")
link(logo, M["white"], body)
bpy.ops.object.text_add(location=(0, -0.262, 0.93), rotation=(math.pi / 2, 0, 0))
mark = bpy.context.active_object
mark.data.body = "</>"
mark.data.size = 0.085
mark.data.align_x = "CENTER"
mark.data.extrude = 0.003
bpy.ops.object.convert(target="MESH")
link(mark, M["white"], body)

# ───────────────────────── Arms ─────────────────────────
for side, sh, el in ((-1, armR, elbR), (1, armL, elbL)):
    x = 0.31 * side
    sphere(f"shoulder_{side}", (x, 0, 1.0), (0.1, 0.1, 0.1), M["hoodie"], parent=sh)
    sphere(f"upper_{side}", (x, 0, 0.89), (0.085, 0.085, 0.15), M["hoodie"], parent=sh)
    sphere(f"fore_{side}", (x, 0, 0.66), (0.08, 0.08, 0.13), M["hoodie"], parent=el)
    torus(f"cuff_{side}", (x, 0, 0.55), 0.068, 0.02, M["hoodie"], rot=(0, 0, 0), parent=el)
    hand = sphere(f"hand_{side}", (x, 0, 0.48), (0.08, 0.075, 0.085), M["fur"], parent=el)
    fluff(hand, 0.01, 0.04)
    for k in range(3):  # finger bumps
        sphere(f"finger_{side}_{k}", (x + 0.02 * side, -0.05 + 0.05 * k, 0.42), (0.03, 0.025, 0.03), M["fur"], parent=el)

# Right hand: thumb along the forearm so the posed arm reads as a thumbs-up
sphere("thumb", (-0.31, -0.02, 0.37), (0.03, 0.03, 0.065), M["fur"], parent=elbR)
# Left hand holds the tablet
box("tablet", (0.42, -0.06, 0.52), (0.015, 0.2, 0.27), M["tablet"], parent=elbL, bevel=0.015,
    rot=(0, 0.12, 0.9))

# ───────────────────────── Head ─────────────────────────
skull = sphere("skull", (0, 0, 1.56), (0.45, 0.39, 0.4), M["fur"], parent=head)
fluff(skull, 0.03, 0.07)
muzzle = sphere("muzzle", (0, -0.2, 1.42), (0.33, 0.22, 0.2), M["furLight"], parent=head)
fluff(muzzle, 0.018, 0.05)
sphere("snout", (0, -0.36, 1.45), (0.12, 0.1, 0.08), M["furLight"], parent=head)
sphere("nose", (0, -0.455, 1.49), (0.06, 0.04, 0.042), M["black"], parent=head)
sphere("mouth", (0, -0.385, 1.36), (0.1, 0.05, 0.06), M["mouth"], parent=head)
sphere("tongue", (0, -0.4, 1.33), (0.065, 0.035, 0.03), M["tongue"], parent=head)
for sx in (-1, 1):
    cone(f"fang_{sx}", (0.055 * sx, -0.42, 1.39), 0.014, 0.04, M["white"], rot=(math.pi, 0, 0), parent=head)
    # cheek tufts
    tuft = cone(f"cheek_{sx}", (0.43 * sx, -0.08, 1.42), 0.11, 0.24, M["furLight"],
                rot=(0, sx * (math.pi / 2 + 0.35), 0), parent=head)
    fluff(tuft, 0.012, 0.04)
    # eyes
    ex, ez = 0.15 * sx, 1.6
    sphere(f"eye_{sx}", (ex, -0.29, ez), (0.13, 0.09, 0.135), M["eyeWhite"], parent=head)
    sphere(f"iris_{sx}", (ex - 0.005 * sx, -0.37, ez - 0.005), (0.09, 0.02, 0.095), M["iris"], parent=head)
    sphere(f"pupil_{sx}", (ex - 0.005 * sx, -0.385, ez - 0.005), (0.055, 0.012, 0.06), M["black"], parent=head)
    sphere(f"glint_{sx}", (ex - 0.035, -0.398, ez + 0.04), (0.022, 0.006, 0.022), M["glint"], parent=head)
    # glasses
    torus(f"lens_{sx}", (ex, -0.405, ez), 0.155, 0.013, M["black"], parent=head)
    cyl(f"temple_{sx}", (0.29 * sx, -0.25, ez + 0.01), 0.008, 0.28, M["black"], rot=(math.pi / 2, 0, 0), parent=head)
    # brows
    sphere(f"brow_{sx}", (0.16 * sx, -0.33, 1.78), (0.085, 0.03, 0.026), M["furDark"],
           rot=(0, -0.25 * sx, 0), parent=head)
    # ears
    ear = cone(f"ear_{sx}", (0.29 * sx, 0.03, 1.93), 0.17, 0.44, M["fur"], rot=(0.1, 0.42 * sx, 0), parent=head)
    fluff(ear, 0.015, 0.05)
    cone(f"ear_in_{sx}", (0.285 * sx, -0.04, 1.9), 0.11, 0.33, M["pink"], rot=(0.1, 0.42 * sx, 0), parent=head)
cyl("bridge", (0, -0.395, 1.61), 0.01, 0.04, M["black"], rot=(0, math.pi / 2, 0), parent=head)
# forehead markings
for k, (x, z) in enumerate(((-0.08, 1.88), (0.0, 1.9), (0.08, 1.88))):
    sphere(f"mark_{k}", (x, -0.28, z), (0.025, 0.02, 0.06), M["furDark"], parent=head)
# hair tuft
for k, (x, ry, rx) in enumerate(((-0.08, -0.4, -0.3), (0.0, 0.1, -0.45), (0.09, 0.45, -0.3), (0.03, -0.15, -0.1))):
    t = cone(f"hair_{k}", (x, -0.08, 1.96), 0.09, 0.3, M["fur"], rot=(rx, ry, 0), parent=head)
    fluff(t, 0.012, 0.04)

# ───────────────────────── Tail (metaballs → mesh) ─────────────────────────
def meta(name, pts, m):
    mb = D.metaballs.new(name)
    mb.resolution = mb.render_resolution = 0.045
    o = D.objects.new(name, mb)
    scene.collection.objects.link(o)
    for p, r in pts:
        e = mb.elements.new()
        e.co, e.radius = p, r
    mb.materials.append(m)
    bpy.context.view_layer.objects.active = o
    for ob in scene.objects:
        ob.select_set(False)
    o.select_set(True)
    bpy.ops.object.convert(target="MESH")
    mo = bpy.context.active_object
    mo.name = name + "_mesh"
    smooth(mo)
    ALL_PARTS.append(mo)
    bpy.context.view_layer.update()
    mo.parent = tail
    mo.matrix_parent_inverse = tail.matrix_world.inverted()
    fluff(mo, 0.03, 0.06)
    return mo

meta("tailbody", [((-0.12, 0.22, 0.62), 0.13), ((-0.3, 0.26, 0.56), 0.2), ((-0.48, 0.24, 0.56), 0.24),
                  ((-0.64, 0.18, 0.64), 0.22), ((-0.74, 0.12, 0.76), 0.19)], M["fur"])
meta("tailtip", [((-0.79, 0.09, 0.87), 0.18), ((-0.81, 0.07, 0.95), 0.13)], M["furLight"])

# ───────────────────────── Animation clips (NLA tracks) ─────────────────────────
PIVOTS = [root, hips, legR, legL, body, head, armR, elbR, armL, elbL, tail]
R = math.radians
# Signature pose from the artwork: right arm thumbs-up, left arm holding the tablet.
BASE = {
    "armR": dict(rot=(R(-30), R(40), 0)),
    "elbR": dict(rot=(R(-115), 0, R(-10))),
    "armL": dict(rot=(R(-5), R(-12), 0)),
    "elbL": dict(rot=(R(-35), 0, 0)),
    "head": dict(rot=(0, R(-4), R(-4))),
    "tail": dict(rot=(0, 0, 0)),
}
REST = {p.name: (p.location.copy(), p.rotation_euler.copy(), p.scale.copy()) for p in PIVOTS}


def pose(name, overrides):
    loc, rot, sc = REST[name]
    b = BASE.get(name, {})
    o = overrides.get(name, {})
    r = o.get("rot", b.get("rot", (0, 0, 0)))
    dl = o.get("dloc", (0, 0, 0))
    s = o.get("scale", (1, 1, 1))
    return Vector(loc) + Vector(dl), r, s


def clip(name, keys):
    for p in PIVOTS:
        ad = p.animation_data_create()
        act = D.actions.new(f"{name}__{p.name}")
        act.use_fake_user = True
        ad.action = act
        for frame, ov in keys:
            l, r, s = pose(p.name, ov)
            p.location, p.rotation_euler, p.scale = l, r, s
            p.keyframe_insert("location", frame=frame)
            p.keyframe_insert("rotation_euler", frame=frame)
            p.keyframe_insert("scale", frame=frame)
        track = ad.nla_tracks.new()
        track.name = name
        strip = track.strips.new(name, 1, act)
        try:
            if act.slots and strip.action_slot is None:
                strip.action_slot = act.slots[0]
        except Exception:
            pass
        ad.action = None


def sway(a):
    return dict(rot=(0, 0, R(a)))

# Idle: breathing bob, head tilt, tail swish (loops)
clip("Idle", [
    (1, {"body": dict(scale=(1, 1, 1)), "tail": sway(-6), "head": dict(rot=(0, R(-4), R(-4)))}),
    (30, {"body": dict(scale=(1.01, 1.01, 1.025), dloc=(0, 0, 0.01)), "tail": sway(8), "head": dict(rot=(R(3), R(3), R(2)))}),
    (60, {"body": dict(scale=(1, 1, 1)), "tail": sway(-6), "head": dict(rot=(0, R(-4), R(-4)))}),
])

# Walk: in-place stride (loops)
def walk_key(f, ph):
    s = math.sin(ph)
    return (f, {
        "legR": dict(rot=(R(28 * s), 0, 0)), "legL": dict(rot=(R(-28 * s), 0, 0)),
        "armR": dict(rot=(R(-24 * s), R(10), 0)), "armL": dict(rot=(R(24 * s), R(-10), 0)),
        "elbR": dict(rot=(R(-25), 0, 0)), "elbL": dict(rot=(R(-25), 0, 0)),
        "hips": dict(dloc=(0, 0, 0.025 * abs(math.cos(ph)))),
        "body": dict(rot=(R(4), 0, R(4 * s))), "tail": sway(12 * s),
        "head": dict(rot=(0, 0, R(-3 * s))),
    })
clip("Walk", [walk_key(1 + i * 4, i * math.pi / 4) for i in range(9)])

# Wave: right arm up, forearm waving
wave_keys = []
for i, f in enumerate((1, 8, 14, 20, 26, 32, 40)):
    up = f not in (1, 40)
    wave_keys.append((f, {
        "armR": dict(rot=(R(-10), R(150 if up else 40), 0)) if up else {},
        "elbR": dict(rot=(R(-20), R((25 if i % 2 else -25) if up else 0), 0)) if up else {},
        "head": dict(rot=(0, R(6 if up else 0), R(-8 if up else 0))),
        "tail": sway(10 if i % 2 else -10),
    }))
clip("Wave", wave_keys)

# Jump: anticipation, launch, land
clip("Jump", [
    (1, {}),
    (7, {"hips": dict(dloc=(0, 0, -0.08)), "body": dict(scale=(1.06, 1.06, 0.9)),
         "legR": dict(rot=(R(-20), 0, 0)), "legL": dict(rot=(R(-20), 0, 0))}),
    (15, {"root": dict(dloc=(0, 0, 0.5)), "body": dict(scale=(0.95, 0.95, 1.08)),
          "armR": dict(rot=(R(-20), R(130), 0)), "armL": dict(rot=(R(-20), R(-130), 0)), "tail": sway(25)}),
    (23, {"root": dict(dloc=(0, 0, 0.0)), "hips": dict(dloc=(0, 0, -0.06)), "body": dict(scale=(1.06, 1.06, 0.92))}),
    (32, {}),
])

# Celebrate: both arms up, two hops, wiggle
cel = []
for i, f in enumerate((1, 8, 14, 20, 26, 32, 40, 48)):
    hop = 0.28 if i in (2, 5) else 0.0
    cel.append((f, {} if f in (1, 48) else {
        "root": dict(dloc=(0, 0, hop)),
        "armR": dict(rot=(R(-10), R(155), 0)), "armL": dict(rot=(R(-10), R(-155), 0)),
        "elbR": dict(rot=(0, R(15 if i % 2 else -15), 0)), "elbL": dict(rot=(0, R(-15 if i % 2 else 15), 0)),
        "head": dict(rot=(R(-8), 0, R(8 if i % 2 else -8))), "tail": sway(20 if i % 2 else -20),
        "body": dict(rot=(0, R(6 if i % 2 else -6), 0)),
    }))
clip("Celebrate", cel)

# Point: right arm extends to the side, index toward the demo
clip("Point", [
    (1, {}),
    (10, {"armR": dict(rot=(R(-35), R(85), 0)), "elbR": dict(rot=(R(-10), 0, 0)),
          "body": dict(rot=(0, 0, R(-10))), "head": dict(rot=(0, R(6), R(-14)))}),
    (40, {"armR": dict(rot=(R(-38), R(88), 0)), "elbR": dict(rot=(R(-12), 0, 0)),
          "body": dict(rot=(0, 0, R(-10))), "head": dict(rot=(0, R(6), R(-14)))}),
    (50, {}),
])

# Return pivots to the static signature pose
for p in PIVOTS:
    l, r, s = pose(p.name, {})
    p.location, p.rotation_euler, p.scale = l, r, s

# ───────────────────────── Export GLB ─────────────────────────
glb = os.path.join(OUT, "rune-mascot.glb")
bpy.ops.export_scene.gltf(
    filepath=glb, export_format="GLB", export_apply=True, export_yup=True,
    export_animations=True, export_animation_mode="NLA_TRACKS",
)

tris = 0
dg = bpy.context.evaluated_depsgraph_get()
for o in ALL_PARTS:
    ev = o.evaluated_get(dg)
    me = ev.to_mesh()
    me.calc_loop_triangles()
    tris += len(me.loop_triangles)
    ev.to_mesh_clear()
print(f"GLB: {glb}  size={os.path.getsize(glb)/1024:.0f}KB  triangles~{tris}")

# ───────────────────────── Preview renders ─────────────────────────
for p in PIVOTS:
    if p.animation_data:
        for t in p.animation_data.nla_tracks:
            t.mute = True

world = D.worlds.new("World")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (*lin("#0a1230"), 1)

cam_data = D.cameras.new("cam")
cam_data.lens = 70
cam = D.objects.new("cam", cam_data)
scene.collection.objects.link(cam)
cam.location = (-0.12, -6.4, 1.1)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam


def light(name, kind, loc, energy, color, size=2.0, target=(0, 0, 1)):
    ld = D.lights.new(name, kind)
    ld.energy = energy
    ld.color = lin(color)
    if kind == "AREA":
        ld.size = size
    o = D.objects.new(name, ld)
    o.location = loc
    scene.collection.objects.link(o)
    d = Vector(target) - Vector(loc)
    o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()

light("key", "AREA", (1.5, -3.5, 3.0), 380, "#ffffff", 3)
light("fill", "AREA", (-2.5, -3, 1.5), 110, "#9cc0ff", 3)
light("rimL", "AREA", (-2.2, 2.2, 2.0), 1200, "#3a7bff", 2)
light("rimR", "AREA", (2.2, 2.2, 2.0), 1200, "#3a7bff", 2)

r = scene.render
for eng in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
    try:
        r.engine = eng
        break
    except TypeError:
        continue
r.resolution_x, r.resolution_y = 720, 1080
try:
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
except Exception:
    pass
r.image_settings.file_format = "PNG"
try:
    scene.eevee.taa_render_samples = 32
except Exception:
    pass


def render(fname):
    r.filepath = os.path.join(OUT, fname)
    bpy.ops.render.render(write_still=True)

scene.frame_set(1)
render("preview_front.png")

# A few animation frames for review
for track_name, frame in (("Wave", 20), ("Celebrate", 14), ("Walk", 5)):
    for p in PIVOTS:
        if p.animation_data:
            for t in p.animation_data.nla_tracks:
                t.mute = t.name != track_name
    scene.frame_set(frame)
    render(f"preview_{track_name.lower()}.png")

# Three-quarter view of the base pose
for p in PIVOTS:
    if p.animation_data:
        for t in p.animation_data.nla_tracks:
            t.mute = True
for p in PIVOTS:
    l, rr, s = pose(p.name, {})
    p.location, p.rotation_euler, p.scale = l, rr, s
cam.location = (-3.6, -5.0, 1.3)
cam.rotation_euler = (math.radians(90), 0, math.radians(-36))
scene.frame_set(1)
render("preview_34.png")
print("DONE")
