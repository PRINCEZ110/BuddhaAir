"""Render the built GLB straight out of Blender so the geometry can be judged
without the web renderer in the way.

    blender -b -P render_aircraft.py -- --in <model.glb> --out <dir>

Produces side / front-quarter / rear-quarter PNGs using Cycles on CPU, which
is the only path that works headless (EEVEE needs a GPU context).
"""
import bpy
import math
import sys
import os
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []


def arg(name, default=None):
    if name in argv:
        return argv[argv.index(name) + 1]
    return default


SRC = arg('--in', 'public/models/atr72.glb')
OUT = os.path.abspath(arg('--out', '.screenshots'))
SIZE = (int(arg('--w', 1440)), int(arg('--h', 900)))
SAMPLES = int(arg('--samples', 32))

os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

# bounding box of everything we just imported
pts = [ob.matrix_world @ Vector(c) for ob in bpy.context.scene.objects for c in ob.bound_box]
mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
centre = (mn + mx) / 2
radius = max((mx - mn).length / 2, 1.0)
print('RENDER bbox min=(%.2f %.2f %.2f) max=(%.2f %.2f %.2f) r=%.2f'
      % (mn.x, mn.y, mn.z, mx.x, mx.y, mx.z, radius))

# world: a simple gradient sky so metal has something to reflect
world = bpy.data.worlds.new('BA World')
world.use_nodes = True
bg = world.node_tree.nodes.get('Background')
bg.inputs['Color'].default_value = (0.35, 0.45, 0.60, 1.0)
bg.inputs['Strength'].default_value = 1.0
bpy.context.scene.world = world

# key sun + a soft fill so the underside is readable
sun = bpy.data.objects.new('Sun', bpy.data.lights.new('Sun', 'SUN'))
sun.data.energy = 4.0
sun.data.angle = math.radians(2.0)
sun.rotation_euler = (math.radians(55), 0, math.radians(135))
bpy.context.collection.objects.link(sun)

fill = bpy.data.objects.new('Fill', bpy.data.lights.new('Fill', 'AREA'))
fill.data.energy = 600.0
fill.data.size = 20.0
fill.location = (radius * 3, -radius * 3, radius * 2)
bpy.context.collection.objects.link(fill)

cam_data = bpy.data.cameras.new('Cam')
cam_data.lens = 60
cam = bpy.data.objects.new('Cam', cam_data)
bpy.context.collection.objects.link(cam)
bpy.context.scene.camera = cam

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.render.resolution_x, scene.render.resolution_y = SIZE
scene.render.film_transparent = False
scene.render.image_settings.file_format = arg('--format', 'PNG')
scene.render.image_settings.quality = int(arg('--quality', 92))

mode = arg('--mode', 'views')

if mode == 'detail':
    # explicit close-ups of the parts that looked wrong in the wide renders
    VIEWS = [
        ('d_wingtip', Vector((0.0, 13.6, 1.6)), Vector((0.0, 13.6, 1.6)) + Vector((1.2, 3.0, 1.4))),
        ('d_nose', Vector((13.6, 0.0, 0.5)), Vector((13.6, 0.0, 0.5)) + Vector((3.0, -3.2, 1.4))),
        ('d_nacelle', Vector((1.6, 4.6, 1.35)), Vector((1.6, 4.6, 1.35)) + Vector((4.0, 2.6, 1.8))),
        ('d_te', Vector((-4.0, 8.0, 1.5)), Vector((-4.0, 8.0, 1.5)) + Vector((2.0, 3.4, 2.2))),
    ]
    cam_data.lens = 70
else:
    VIEWS = [
        ('side', (0.0, 1.0, 0.18)),
        ('front34', (0.80, -0.62, 0.34)),
        ('rear34', (-0.80, -0.62, 0.34)),
        ('top34', (0.55, -0.55, 0.75)),
    ]

for view in VIEWS:
    if mode == 'detail':
        name, target, loc = view
        cam.location = loc
        cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
    else:
        name, dirn = view
        d = Vector(dirn).normalized()
        cam.location = centre + d * (radius * 3.1)
        cam.rotation_euler = (centre - cam.location).to_track_quat('-Z', 'Y').to_euler()
    ext = '.jpg' if scene.render.image_settings.file_format == 'JPEG' else '.png'
    path = os.path.join(OUT, '%s%s' % (name, ext))
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print('RENDER wrote %s' % path)

print('RENDER done')
