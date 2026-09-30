"""Buddha Air ATR 72-600 — procedural build for the web fleet.

Headless Blender build: geometry, PBR materials and a GLB export.

Conventions (must match src/three/Aircraft.jsx or the GLB cannot be a
drop-in replacement):

    three.js        Blender        glTF (after export_yup)
    +X nose         +X nose        +X nose
    +Y up           +Z up          +Y up
    +Z wing         -Y wing        -Z wing

    origin          fuselage centre, mid-cabin
    span            +/-13.6  (27.2 m)
    length          x -14.0 .. +13.6
    wing root       z +1.15, root y 0.6 -> tip y 13.6
    nacelles        x 1.6, z 1.35, y +/-4.6
    horizontal tail x -11.6
    fin             x -12.2

Run:  blender -b -P scripts/blender/build_aircraft.py -- --out <path>.glb
"""

import bpy
import bmesh
import math
import os
import sys

from mathutils import Vector

# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------

TWO_PI = math.pi * 2.0


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.length_unit = 'METERS'
    return scene


def new_mesh_object(name, verts, faces, collection=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    ob = bpy.data.objects.new(name, me)
    (collection or bpy.context.collection).objects.link(ob)
    return ob


def shade_smooth(ob, angle_deg=34.0):
    """Smooth shading with a sharp-edge cutoff so panels and leading edges
    keep their crease instead of turning to soap."""
    for p in ob.data.polygons:
        p.use_smooth = True
    # shade_smooth_by_angle operates on the SELECTED objects, not on `ob`.
    # In a background build nothing is selected, so the call threw and was
    # swallowed — leaving every face purely smooth, which made the flat
    # tip-cap fans streak badly under raking light.
    prev_active = bpy.context.view_layer.objects.active
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    try:
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle_deg))
    except Exception:
        pass
    bpy.context.view_layer.objects.active = prev_active


def add_bevel(ob, width=0.03, segments=2, angle=50.0):
    m = ob.modifiers.new('ba-bevel', 'BEVEL')
    m.width = width
    m.segments = segments
    m.limit_method = 'ANGLE'
    m.angle_limit = math.radians(angle)
    return m


def add_subsurf(ob, levels=1, render_levels=2):
    m = ob.modifiers.new('ba-subsurf', 'SUBSURF')
    m.levels = levels
    m.render_levels = render_levels
    return m


# --------------------------------------------------------------------------
# materials
# --------------------------------------------------------------------------

def make_material(name, base, metallic=0.0, roughness=0.5, **extra):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*base, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    for key, value in extra.items():
        if key in bsdf.inputs:
            bsdf.inputs[key].default_value = value
    mat.diffuse_color = (*base, 1.0)
    return mat


def build_materials():
    return {
        'paint': make_material('BA Paint', (0.90, 0.91, 0.93), 0.35, 0.26),
        'belly': make_material('BA Belly', (0.55, 0.57, 0.61), 0.55, 0.38),
        'red': make_material('BA Red', (0.68, 0.05, 0.07), 0.30, 0.30),
        'dark': make_material('BA Dark', (0.04, 0.05, 0.07), 0.65, 0.22),
        'glass': make_material('BA Glass', (0.42, 0.58, 0.72), 0.0, 0.05),
        'metal': make_material('BA Metal', (0.72, 0.74, 0.78), 0.95, 0.24),
        'rubber': make_material('BA Rubber', (0.05, 0.05, 0.06), 0.0, 0.92),
        'nav': None,
    }


# --------------------------------------------------------------------------
# fuselage
# --------------------------------------------------------------------------

# (x, radius, centre-z) nose -> tail. The tail cone upsweeps so the
# horizontal stabiliser clears the runway on rotation.
FUSE_PROFILE = [
    (13.60, 0.03, 0.00),
    (13.35, 0.34, 0.02),
    (12.95, 0.66, 0.05),
    (12.45, 0.95, 0.06),
    (11.80, 1.16, 0.05),
    (11.00, 1.28, 0.03),
    (10.10, 1.34, 0.00),
    (9.00, 1.37, 0.00),
    (4.00, 1.37, 0.00),
    (-2.00, 1.37, 0.00),
    (-6.50, 1.36, 0.00),
    (-9.00, 1.31, 0.04),
    (-10.80, 1.20, 0.13),
    (-12.20, 1.00, 0.28),
    (-13.20, 0.72, 0.44),
    (-13.90, 0.42, 0.56),
    (-14.30, 0.16, 0.64),
]

FUSE_SECTIONS = 40


def fuse_radius_at(x):
    """Interpolated (radius, centre-z) of the fuselage at chordwise `x`."""
    prof = FUSE_PROFILE
    if x >= prof[0][0]:
        return prof[0][1], prof[0][2]
    if x <= prof[-1][0]:
        return prof[-1][1], prof[-1][2]
    for i in range(len(prof) - 1):
        x0, r0, c0 = prof[i]
        x1, r1, c1 = prof[i + 1]
        if x1 <= x <= x0:
            f = (x0 - x) / (x0 - x1)
            return r0 + (r1 - r0) * f, c0 + (c1 - c0) * f
    return prof[-1][1], prof[-1][2]


def fuse_surface_z(x, y, raise_=0.0):
    """Height of the upper fuselage skin at (x, y) — mirrors build_fuselage
    (y = cos(a)*r, z = cz + sin(a)*1.02r) so anything mounted on it hugs the
    curve instead of floating inside the shell."""
    r, cz = fuse_radius_at(x)
    ratio = max(min(abs(y) / max(r, 1e-6), 1.0), 0.0)
    a = math.acos(ratio)
    return cz + math.sin(a) * r * 1.02 + raise_


def build_surface_patch(name, x0, x1, y0, y1, raise_=0.02, nx=8, ny=5):
    """A quad grid laid on the upper fuselage skin (used for cockpit glass)."""
    verts = []
    faces = []
    for i in range(nx + 1):
        x = x0 + (x1 - x0) * i / nx
        for j in range(ny + 1):
            y = y0 + (y1 - y0) * j / ny
            verts.append((x, y, fuse_surface_z(x, y, raise_)))
    # A descending y-range (the port side is built mirror-image) would invert
    # the winding, and glTF materials are single-sided — the pane would be
    # back-face culled. Reverse those faces instead.
    flip = y1 < y0
    for i in range(nx):
        for j in range(ny):
            a = i * (ny + 1) + j
            b = a + 1
            c = (i + 1) * (ny + 1) + j
            d = c + 1
            faces.append((a, c, d, b) if flip else (a, b, d, c))
    return new_mesh_object(name, verts, faces)


def build_fuselage():
    verts = []
    faces = []
    rings = []
    for (x, r, cz) in FUSE_PROFILE:
        ring = []
        for i in range(FUSE_SECTIONS):
            a = TWO_PI * i / FUSE_SECTIONS
            # Very slightly wider than tall, and a flattened underside —
            # a pure cylinder reads as a pipe under raking light.
            ry = r * (1.0 + 0.02 * math.cos(a * 2.0))
            rz = r * 1.02
            y = math.cos(a) * ry
            z = cz + math.sin(a) * rz
            if math.sin(a) < -0.55:
                z = max(z, cz - rz * 0.92)
            ring.append(len(verts))
            verts.append((x, y, z))
        rings.append(ring)

    for i in range(len(rings) - 1):
        a, b = rings[i], rings[i + 1]
        for j in range(FUSE_SECTIONS):
            k = (j + 1) % FUSE_SECTIONS
            faces.append((a[j], a[k], b[k], b[j]))

    # cap nose and tail with a fan to a centre vertex
    for ring, (x, r, cz), flip in (
        (rings[0], FUSE_PROFILE[0], True),
        (rings[-1], FUSE_PROFILE[-1], False),
    ):
        c = len(verts)
        verts.append((x, 0.0, cz))
        for j in range(FUSE_SECTIONS):
            k = (j + 1) % FUSE_SECTIONS
            faces.append((c, ring[k], ring[j]) if flip else (c, ring[j], ring[k]))

    ob = new_mesh_object('Fuselage', verts, faces)
    return ob


# --------------------------------------------------------------------------
# lifting surfaces
# --------------------------------------------------------------------------

def naca_thickness(t, x):
    return 5.0 * t * (
        0.2969 * math.sqrt(x)
        - 0.1260 * x
        - 0.3516 * x * x
        + 0.2843 * x * x * x
        - 0.1015 * x * x * x * x
    )


def airfoil_points(chord, thickness, le_x, z, n=16, pitch=0.0):
    """Closed airfoil outline in the X/Y plane (X chordwise, Y thickness),
    positioned at leading-edge x `le_x`, at height `z`, with pitch = the
    local angle of incidence in radians (leading edge up is positive)."""
    upper = []
    lower = []
    for i in range(n):
        beta = math.pi * i / (n - 1)
        x = 0.5 * (1.0 - math.cos(beta))          # cosine spacing
        yt = naca_thickness(thickness, max(x, 1e-5)) * chord
        upper.append((x * chord, yt))
        lower.append((x * chord, -yt))
    outline = upper + list(reversed(lower[1:-1]))

    cy = math.cos(pitch)
    sy = math.sin(pitch)
    pts = []
    for (cx, cy_) in outline:
        # pitch rotates about the quarter chord
        rx = cx - 0.25 * chord
        ry = cy_
        rx2 = rx * cy - ry * sy
        ry2 = rx * sy + ry * cy
        pts.append((le_x + rx2 + 0.25 * chord, ry2, z))
    return pts


def loft(sections):
    """Bridge a list of equal-length closed outlines into a solid."""
    verts = []
    faces = []
    idx = []
    for sec in sections:
        ring = []
        for p in sec:
            ring.append(len(verts))
            verts.append(p)
        idx.append(ring)

    n = len(sections[0])
    for i in range(len(idx) - 1):
        a, b = idx[i], idx[i + 1]
        for j in range(n):
            k = (j + 1) % n
            faces.append((a[j], a[k], b[k], b[j]))

    for ring, flip in ((idx[0], True), (idx[-1], False)):
        cx = sum(verts[v][0] for v in ring) / n
        cy = sum(verts[v][1] for v in ring) / n
        cz = sum(verts[v][2] for v in ring) / n
        c = len(verts)
        verts.append((cx, cy, cz))
        for j in range(n):
            k = (j + 1) % n
            faces.append((c, ring[k], ring[j]) if flip else (c, ring[j], ring[k]))
    return verts, faces


def build_wing(name, root_le, tip_le, root_chord, tip_chord, root_z, tip_z,
               root_y, tip_y, root_t, tip_t, stations=9, incidence=0.0):
    sections = []
    for i in range(stations):
        f = i / (stations - 1)
        y = root_y + (tip_y - root_y) * f
        z = root_z + (tip_z - root_z) * f
        chord = root_chord + (tip_chord - root_chord) * f
        le = root_le + (tip_le - root_le) * f
        th = root_t + (tip_t - root_t) * f
        # washout: nose-down toward the tip prevents a tip-stall snap
        inc = incidence * (1.0 - f)
        pts = airfoil_points(chord, th, le, z, pitch=inc)
        sections.append([(p[0], y, p[2]) for p in pts])
    return new_mesh_object(name, *loft(sections))


def build_fin(name, root_x, tip_x, root_chord, tip_chord, base_z, tip_z,
              base_t, tip_t, stations=8, sweep_le=0.0):
    sections = []
    for i in range(stations):
        f = i / (stations - 1)
        z = base_z + (tip_z - base_z) * f
        chord = root_chord + (tip_chord - root_chord) * f
        le = root_x + (tip_x - root_x) * f
        th = base_t + (tip_t - base_t) * f
        pts = airfoil_points(chord, th, le, 0.0)
        sections.append([(p[0], p[1], z) for p in pts])
    return new_mesh_object(name, *loft(sections))


# --------------------------------------------------------------------------
# propulsion
# --------------------------------------------------------------------------

def build_nacelle(name, centre_x, centre_y, centre_z, length=2.9, radius=0.62):
    verts = []
    faces = []
    rings = []
    profile = [
        (-length * 0.5, radius * 0.55),
        (-length * 0.42, radius * 0.95),
        (-length * 0.25, radius * 1.02),
        (0.0, radius * 1.0),
        (length * 0.22, radius * 0.92),
        (length * 0.40, radius * 0.72),
        (length * 0.50, radius * 0.45),
    ]
    seg = 28
    for (dx, r) in profile:
        ring = []
        for i in range(seg):
            a = TWO_PI * i / seg
            ring.append(len(verts))
            verts.append((centre_x + dx, centre_y + math.cos(a) * r, centre_z + math.sin(a) * r))
        rings.append(ring)
    for i in range(len(rings) - 1):
        a, b = rings[i], rings[i + 1]
        for j in range(seg):
            k = (j + 1) % seg
            faces.append((a[j], a[k], b[k], b[j]))
    for ring, flip in ((rings[0], True), (rings[-1], False)):
        c = len(verts)
        verts.append((centre_x + (profile[0][0] if flip else profile[-1][0]), centre_y, centre_z))
        for j in range(seg):
            k = (j + 1) % seg
            faces.append((c, ring[k], ring[j]) if flip else (c, ring[j], ring[k]))
    return new_mesh_object(name, verts, faces)


def build_propeller(name, centre, radius=2.05, blades=6, chord=0.30):
    """Spinner + blades as ONE object so the rig can spin it about X with a
    single node. Blades are flat tapered plates with a little twist."""
    verts = []
    faces = []

    # spinner (cone pointing +X)
    seg = 24
    nose = len(verts)
    verts.append((centre[0] + 0.62, centre[1], centre[2]))
    rings = []
    for (dx, r) in ((0.30, 0.26), (-0.10, 0.30), (-0.34, 0.24)):
        ring = []
        for i in range(seg):
            a = TWO_PI * i / seg
            ring.append(len(verts))
            verts.append((centre[0] + dx, centre[1] + math.cos(a) * r, centre[2] + math.sin(a) * r))
        rings.append(ring)
    for i in range(len(rings) - 1):
        a, b = rings[i], rings[i + 1]
        for j in range(seg):
            k = (j + 1) % seg
            faces.append((a[j], a[k], b[k], b[j]))
    for j in range(seg):
        k = (j + 1) % seg
        faces.append((nose, rings[0][j], rings[0][k]))
    c = len(verts)
    verts.append((centre[0] - 0.34, centre[1], centre[2]))
    for j in range(seg):
        k = (j + 1) % seg
        faces.append((c, rings[-1][k], rings[-1][j]))

    # blades: swept, tapered plates, pitched about their long axis
    for b in range(blades):
        ang = TWO_PI * b / blades
        base = len(verts)
        stations = 6
        for s in range(stations):
            f = s / (stations - 1)
            r = 0.34 + (radius - 0.34) * f
            c = chord * (1.0 - 0.55 * f)
            sweep = 0.30 * f                      # blade tip swept back
            pitch = math.radians(30.0 - 15.0 * f) # twist, root to tip
            cy = math.cos(ang)
            sy = math.sin(ang)
            # Orthonormal blade frame. R = radial, T = tangential, A = axial.
            # The chord axis is T pitched toward A; thickness is perpendicular
            # to both. (The old version multiplied the normal offsets by zero
            # and put the thickness on `off * 6`, i.e. a 0.30 m plank.)
            px, py = -sy, cy
            sp, cp = math.sin(pitch), math.cos(pitch)
            for (u, v) in ((0.0, -0.5), (0.0, 0.5), (c, 0.5), (c, -0.5)):
                uu = u - 0.5 * c
                t = v * 0.05                      # 0.05 m thick overall
                xx = centre[0] + uu * sp + t * cp
                yy = centre[1] + cy * r + px * sweep + px * (cp * uu - sp * t)
                zz = centre[2] + sy * r + py * sweep + py * (cp * uu - sp * t)
                verts.append((xx, yy, zz))
        for s in range(stations - 1):
            a0 = base + s * 4
            a1 = base + (s + 1) * 4
            for j in range(4):
                k = (j + 1) % 4
                faces.append((a0 + j, a0 + k, a1 + k, a1 + j))
        # cap the root
        faces.append((base + 0, base + 3, base + 2, base + 1))

    return new_mesh_object(name, verts, faces)


# --------------------------------------------------------------------------
# undercarriage
# --------------------------------------------------------------------------

def build_gear():
    verts = []
    faces = []

    def box(cx, cy, cz, sx, sy, sz, rot_z=0.0):
        base = len(verts)
        cr = math.cos(rot_z)
        sr = math.sin(rot_z)
        for (dx, dy, dz) in (
            (-1, -1, -1), (1, -1, -1), (1, 1, -1), (-1, 1, -1),
            (-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1),
        ):
            y = dy * sy * cr - dx * sx * sr
            x = dx * sx * cr + dy * sy * sr
            verts.append((cx + x, cy + y, cz + dz * sz))
        for (a, b, c, d) in (
            (0, 1, 2, 3), (4, 5, 6, 7), (0, 1, 5, 4),
            (2, 3, 7, 6), (1, 2, 6, 5), (0, 3, 7, 4),
        ):
            faces.append((base + a, base + b, base + c, base + d))

    def wheel(cx, cy, cz, r, w, seg=16):
        base = len(verts)
        for sx in (-w * 0.5, w * 0.5):
            for i in range(seg):
                a = TWO_PI * i / seg
                verts.append((cx + sx, cy + math.cos(a) * r, cz + math.sin(a) * r))
        for i in range(seg):
            k = (i + 1) % seg
            faces.append((base + i, base + k, base + seg + k, base + seg + i))
        ca = len(verts)
        verts.append((cx - w * 0.5, cy, cz))
        cb = len(verts)
        verts.append((cx + w * 0.5, cy, cz))
        for i in range(seg):
            k = (i + 1) % seg
            faces.append((ca, base + k, base + i))
            faces.append((cb, base + seg + i, base + seg + k))

    # nose leg
    box(4.6, 0.0, -2.0, 0.10, 0.10, 0.52)
    wheel(4.6, 0.0, -2.62, 0.42, 0.26)
    # main legs
    for side in (-1.0, 1.0):
        box(-1.2, side * 1.9, -2.0, 0.11, 0.11, 0.58)
        for off in (-0.20, 0.20):
            wheel(-1.2 + off, side * 1.9, -2.72, 0.46, 0.24)

    ob = new_mesh_object('Gear', verts, faces)
    return ob


# --------------------------------------------------------------------------
# livery: assign faces to material slots by position (no texture bake needed
# for the base scheme — the window band, belly and cheatline are all
# position-selectable, which exports far more reliably than a baked map)
# --------------------------------------------------------------------------

def assign_fuselage_livery(ob, mats):
    ob.data.materials.append(mats['paint'])   # 0
    ob.data.materials.append(mats['belly'])   # 1
    ob.data.materials.append(mats['red'])     # 2
    ob.data.materials.append(mats['dark'])    # 3

    for poly in ob.data.polygons:
        c = poly.center
        x, y, z = c.x, c.y, c.z
        mat = 0
        # belly panel: below the centreline and outboard of the keel
        if z < -0.52:
            mat = 1
        # cheatline running the length of the cabin
        if -0.62 < z < -0.30 and abs(y) > 0.4 and -9.6 < x < 10.4:
            mat = 2
        # cabin window band
        if 0.16 < z < 0.52 and abs(y) > 0.95 and -9.2 < x < 9.6:
            # window pitch ~0.62 m so the band breaks into panes
            f = ((x + 9.2) % 0.62) / 0.62
            if f < 0.52:
                mat = 3
        ob.data.polygons[poly.index].material_index = mat


def assign_by_slot(ob, mat):
    ob.data.materials.clear()
    ob.data.materials.append(mat)
    for p in ob.data.polygons:
        p.material_index = 0


# --------------------------------------------------------------------------
# assembly
# --------------------------------------------------------------------------

def build(out_path):
    scene = reset_scene()
    mats = build_materials()

    fus = build_fuselage()
    assign_fuselage_livery(fus, mats)
    shade_smooth(fus)

    parts = [fus]

    # main wing — one piece carried through the fuselage reads better than
    # two halves, and avoids a visible seam at the root
    wing = build_wing(
        'Wing', root_le=1.75, tip_le=0.05, root_chord=2.95, tip_chord=1.45,
        root_z=1.15, tip_z=1.62, root_y=-0.4, tip_y=13.6,
        root_t=0.16, tip_t=0.12, stations=11, incidence=math.radians(1.6),
    )
    # wing spans +Y only; mirror across the centreline
    wing_m = wing.copy()
    wing_m.data = wing.data.copy()
    bpy.context.collection.objects.link(wing_m)
    for v in wing_m.data.vertices:
        v.co.y = -v.co.y
    for p in wing_m.data.polygons:
        p.flip()
    wing_m.name = 'Wing.L'
    wing.name = 'Wing.R'
    for w in (wing, wing_m):
        assign_by_slot(w, mats['paint'])
        shade_smooth(w)
        parts.append(w)

    # horizontal stabiliser
    stab = build_wing(
        'HStab', root_le=-10.7, tip_le=-11.6, root_chord=2.05, tip_chord=1.10,
        root_z=0.62, tip_z=0.78, root_y=-0.3, tip_y=4.65,
        root_t=0.13, tip_t=0.10, stations=7, incidence=math.radians(-2.4),
    )
    stab_m = stab.copy()
    stab_m.data = stab.data.copy()
    bpy.context.collection.objects.link(stab_m)
    for v in stab_m.data.vertices:
        v.co.y = -v.co.y
    for p in stab_m.data.polygons:
        p.flip()
    stab_m.name = 'HStab.L'
    for s in (stab, stab_m):
        assign_by_slot(s, mats['paint'])
        shade_smooth(s)
        parts.append(s)

    # vertical fin
    fin = build_fin(
        'VFin', root_x=-10.55, tip_x=-12.35, root_chord=3.45, tip_chord=1.45,
        base_z=1.10, tip_z=5.55, base_t=0.14, tip_t=0.10, stations=9,
    )
    assign_by_slot(fin, mats['red'])
    shade_smooth(fin)
    add_bevel(fin, 0.05, 2, 40)
    parts.append(fin)

    # nacelles + propellers
    props = []
    for side, label in ((-1.0, 'R'), (1.0, 'L')):
        nac = build_nacelle(f'Nacelle.{label}', 1.60, side * 4.60, 1.35)
        assign_by_slot(nac, mats['metal'])
        shade_smooth(nac)
        parts.append(nac)

        prop = build_propeller(f'Prop.{label}', (3.05, side * 4.60, 1.35))
        assign_by_slot(prop, mats['dark'])
        shade_smooth(prop)
        parts.append(prop)
        props.append(prop)
        # The rig spins the propeller about its hub. `from_pydata` leaves the
        # object origin at the world origin, which would swing the whole
        # airframe instead of turning the blades.
        scene.cursor.location = (3.05, side * 4.60, 1.35)
        bpy.ops.object.select_all(action='DESELECT')
        prop.select_set(True)
        bpy.context.view_layer.objects.active = prop
        bpy.ops.object.origin_set(type='ORIGIN_CURSOR')

    gear = build_gear()
    parts.append(gear)

    # Cockpit glass. The old version dropped cubes at z=0.52 while the
    # fuselage crown at that station is z ~ 1.15, so they were buried
    # inside the shell and never appeared. These patches are sampled
    # straight off the skin, so they hug the curve.
    for side in (-1.0, 1.0):
        label = 'L' if side > 0 else 'R'
        ws = build_surface_patch(
            f'Windshield.{label}',
            11.62, 12.78,            # aft .. forward edge
            0.07 * side, 0.66 * side,  # centreline post .. side
            raise_=0.03,
        )
        assign_by_slot(ws, mats['glass'])
        shade_smooth(ws, 45.0)
        parts.append(ws)

        sw = build_surface_patch(
            f'CockpitSide.{label}',
            11.02, 11.56,
            0.20 * side, 0.72 * side,
            raise_=0.03,
            nx=5, ny=4,
        )
        assign_by_slot(sw, mats['glass'])
        shade_smooth(sw, 45.0)
        parts.append(sw)

    # nav lights
    for (name, loc, col) in (
        ('Nav.Port', (1.2, 13.55, 0.55), (1.0, 0.10, 0.06)),
        ('Nav.Stbd', (1.2, -13.55, 0.55), (0.10, 0.85, 0.28)),
        ('Nav.Tail', (-13.7, 0.0, 0.72), (1.0, 1.0, 1.0)),
    ):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.15, segments=12, ring_count=8, location=loc)
        ob = bpy.context.active_object
        ob.name = name
        assign_by_slot(ob, mats['dark'])
        shade_smooth(ob)
        parts.append(ob)

    # apply modifiers so the export carries final geometry
    for ob in parts:
        bpy.context.view_layer.objects.active = ob
        for m in list(ob.modifiers):
            try:
                bpy.ops.object.modifier_apply(modifier=m.name)
            except Exception:
                ob.modifiers.remove(m)

    # Origin at the fuselage centre — required by Aircraft.jsx. Deselect
    # first: origin_set acts on every selected object, and the primitive
    # adds above leave theirs selected.
    scene.cursor.location = (0.0, 0.0, 0.0)
    bpy.ops.object.select_all(action='DESELECT')
    fus.select_set(True)
    bpy.context.view_layer.objects.active = fus
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')

    # ---- report -------------------------------------------------------
    tris = 0
    for ob in parts:
        if ob.type == 'MESH':
            tris += sum(len(p.vertices) - 2 for p in ob.data.polygons)
    xs = [v.co.x for ob in parts if ob.type == 'MESH' for v in ob.data.vertices]
    ys = [v.co.y for ob in parts if ob.type == 'MESH' for v in ob.data.vertices]
    zs = [v.co.z for ob in parts if ob.type == 'MESH' for v in ob.data.vertices]
    print('BUILD tris=%d objects=%d' % (tris, len(parts)))
    print('BUILD span=%.2f (y %.2f..%.2f)' % (max(ys) - min(ys), min(ys), max(ys)))
    print('BUILD length=%.2f (x %.2f..%.2f)' % (max(xs) - min(xs), min(xs), max(xs)))
    print('BUILD height=%.2f (z %.2f..%.2f)' % (max(zs) - min(zs), min(zs), max(zs)))

    # ---- export -------------------------------------------------------
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT',
        export_normals=True,
        export_texcoords=False,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=7,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_lights=False,
        export_cameras=False,
        export_extras=False,
    )
    size = os.path.getsize(out_path)
    print('EXPORTED %s (%d bytes)' % (out_path, size))


def main():
    argv = sys.argv
    out = None
    if '--' in argv:
        args = argv[argv.index('--') + 1:]
        for i, a in enumerate(args):
            if a == '--out':
                out = args[i + 1]
    if not out:
        raise SystemExit('usage: blender -b -P build_aircraft.py -- --out model.glb')
    build(out)


main()
