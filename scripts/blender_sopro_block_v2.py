import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(bpy.data.filepath).parent if bpy.data.filepath else Path.cwd()
BLEND_OUT = ROOT / "sopro-v2.blend"
GLB_OUT = ROOT / "public" / "models" / "sopro-v2.glb"
PREVIEW_OUT = ROOT / "tmp" / "sopro-v2-preview.png"


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in list(bpy.data.collections):
        if collection.name != "Collection":
            bpy.data.collections.remove(collection)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.cameras, bpy.data.lights):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)


def ensure_collection(name):
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(collection)
    return collection


def move_to_collection(obj, collection_name):
    collection = ensure_collection(collection_name)
    for current in list(obj.users_collection):
        current.objects.unlink(obj)
    collection.objects.link(obj)


def material(name, color, roughness=0.5, metallic=0.0, alpha=1.0, transmission=0.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.diffuse_color = (*color, alpha)
    nodes = mat.node_tree.nodes
    bsdf = next((node for node in nodes if node.type == "BSDF_PRINCIPLED"), None)
    if bsdf is None:
        bsdf = nodes.new("ShaderNodeBsdfPrincipled")
        output = next((node for node in nodes if node.type == "OUTPUT_MATERIAL"), None)
        if output is None:
            output = nodes.new("ShaderNodeOutputMaterial")
        mat.node_tree.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if "Alpha" in bsdf.inputs:
        bsdf.inputs["Alpha"].default_value = alpha
    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = transmission
    if "IOR" in bsdf.inputs:
        bsdf.inputs["IOR"].default_value = 1.45
    if alpha < 1.0:
        if hasattr(mat, "surface_render_method"):
            mat.surface_render_method = "DITHERED"
        mat.use_transparency_overlap = False
    return mat


def assign(obj, mat):
    if mat:
        obj.data.materials.append(mat)


def box(name, location, dimensions, mat, collection="ARCH", bevel=0.035, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign(obj, mat)
    if bevel:
        modifier = obj.modifiers.new("Soft edges", "BEVEL")
        modifier.width = bevel
        modifier.segments = 2
        modifier.limit_method = "ANGLE"
    move_to_collection(obj, collection)
    return obj


def cylinder(name, location, radius, depth, mat, collection="LANDSCAPE", vertices=16):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location)
    obj = bpy.context.object
    obj.name = name
    assign(obj, mat)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    move_to_collection(obj, collection)
    return obj


def beam_between(name, start, end, radius, mat, collection="ARCH"):
    start = Vector(start)
    end = Vector(end)
    delta = end - start
    midpoint = (start + end) / 2
    obj = cylinder(name, midpoint, radius, delta.length, mat, collection, vertices=12)
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = delta.to_track_quat("Z", "Y")
    return obj


def create_pool(name, center, size, deck_z, elevated=False):
    x, y = center
    length, width = size
    base_z = deck_z + (0.18 if elevated else -0.28)
    box(f"{name}_basin", (x, y, base_z), (length, width, 0.38), MAT_POOL_TILE, "WATER", 0.03)
    water_z = deck_z + (0.43 if elevated else 0.04)
    box(f"{name}_water", (x, y, water_z), (length - 0.18, width - 0.18, 0.07), MAT_WATER, "WATER", 0.025)
    rim_z = water_z + 0.02
    rim = 0.10
    box(f"{name}_rim_front", (x + length / 2, y, rim_z), (rim, width + rim, 0.12), MAT_STONE, "ARCH", 0.02)
    box(f"{name}_rim_back", (x - length / 2, y, rim_z), (rim, width + rim, 0.12), MAT_STONE, "ARCH", 0.02)
    box(f"{name}_rim_left", (x, y - width / 2, rim_z), (length, rim, 0.12), MAT_STONE, "ARCH", 0.02)
    box(f"{name}_rim_right", (x, y + width / 2, rim_z), (length, rim, 0.12), MAT_STONE, "ARCH", 0.02)
    if elevated:
        box(f"{name}_support", (x - 0.25, y, deck_z - 0.18), (length + 0.45, width + 0.35, 0.30), MAT_BROWN, "ARCH", 0.05)
        panel_x = x + length / 2 + 0.08
        box(f"{name}_glass_front", (panel_x, y, deck_z + 0.68), (0.05, width, 0.78), MAT_GLASS_POOL, "GLASS", 0.015)
        for yy in (y - width / 2, y + width / 2):
            cylinder(f"{name}_rail_{yy:.2f}", (panel_x, yy, deck_z + 0.68), 0.025, 0.88, MAT_METAL, "ARCH", 12)


def create_window(name, x, y, z, width):
    box(f"{name}_glass", (x, y, z), (0.055, width, 2.18), MAT_GLASS, "GLASS", 0.01)
    for yy in (y - width / 2, y, y + width / 2):
        cylinder(f"{name}_vframe_{yy:.2f}", (x + 0.012, yy, z), 0.025, 2.28, MAT_WOOD, "ARCH", 10)
    box(f"{name}_top", (x, y, z + 1.11), (0.08, width + 0.05, 0.06), MAT_WOOD, "ARCH", 0.01)
    box(f"{name}_bottom", (x, y, z - 1.11), (0.08, width + 0.05, 0.06), MAT_WOOD, "ARCH", 0.01)


def create_stair(name, y, mirror=False):
    steps = 17
    run = 3.55
    rise = 2.88
    start_x = 5.65
    direction = -1
    for index in range(steps):
        depth = run / steps
        height = (index + 1) * rise / steps
        x = start_x + direction * (index + 0.5) * depth
        box(
            f"{name}_step_{index + 1:02d}",
            (x, y, height / 2 + 0.06),
            (depth + 0.02, 0.86, height),
            MAT_CONCRETE,
            "STAIRS",
            0.015,
        )
        box(
            f"{name}_tread_{index + 1:02d}",
            (x, y, height + 0.025),
            (depth + 0.035, 0.88, 0.05),
            MAT_WOOD,
            "STAIRS",
            0.012,
        )
    side = -1 if mirror else 1
    rail_y = y + side * 0.53
    beam_between(f"{name}_handrail", (5.55, rail_y, 1.05), (2.25, rail_y, 3.78), 0.035, MAT_WOOD, "STAIRS")
    for idx in range(5):
        t = idx / 4
        x = 5.55 + (2.25 - 5.55) * t
        z = 0.95 + (3.68 - 0.95) * t
        cylinder(f"{name}_post_{idx}", (x, rail_y, z - 0.32), 0.025, 0.72, MAT_WOOD, "STAIRS", 10)


def create_bed(name, x, y, z, flip=False):
    box(f"{name}_base", (x, y, z + 0.18), (2.0, 1.45, 0.34), MAT_WOOD_LIGHT, "FURNITURE", 0.08)
    box(f"{name}_mattress", (x, y, z + 0.42), (1.92, 1.38, 0.20), MAT_FABRIC, "FURNITURE", 0.10)
    pillow_x = x - 0.70 if flip else x + 0.70
    box(f"{name}_pillow_a", (pillow_x, y - 0.32, z + 0.58), (0.50, 0.48, 0.14), MAT_WHITE, "FURNITURE", 0.10)
    box(f"{name}_pillow_b", (pillow_x, y + 0.32, z + 0.58), (0.50, 0.48, 0.14), MAT_WHITE, "FURNITURE", 0.10)


def create_sofa(name, x, y, z, flip=False):
    box(f"{name}_seat", (x, y, z + 0.34), (1.65, 0.76, 0.28), MAT_FABRIC, "FURNITURE", 0.10)
    back_x = x - 0.70 if flip else x + 0.70
    box(f"{name}_back", (back_x, y, z + 0.70), (0.24, 0.78, 0.82), MAT_FABRIC, "FURNITURE", 0.10)


def create_kitchen(name, x, y, z, side=1):
    box(f"{name}_cabinet", (x, y, z + 0.45), (1.85, 0.58, 0.90), MAT_WOOD_LIGHT, "FURNITURE", 0.045)
    box(f"{name}_counter", (x, y, z + 0.94), (1.92, 0.64, 0.08), MAT_STONE_DARK, "FURNITURE", 0.02)
    box(f"{name}_cooktop", (x + 0.48, y, z + 0.99), (0.55, 0.40, 0.025), MAT_METAL_DARK, "FURNITURE", 0.01)
    box(f"{name}_sink", (x - 0.45, y, z + 0.99), (0.46, 0.36, 0.025), MAT_METAL, "FURNITURE", 0.01)


def create_table(name, x, y, z):
    cylinder(f"{name}_top", (x, y, z + 0.76), 0.48, 0.08, MAT_WOOD_LIGHT, "FURNITURE", 32)
    cylinder(f"{name}_leg", (x, y, z + 0.39), 0.07, 0.72, MAT_METAL_DARK, "FURNITURE", 12)
    for angle in (0, math.pi / 2, math.pi, 3 * math.pi / 2):
        cx = x + math.cos(angle) * 0.72
        cy = y + math.sin(angle) * 0.72
        cylinder(f"{name}_chair_{angle:.2f}", (cx, cy, z + 0.42), 0.25, 0.42, MAT_RATTAN, "FURNITURE", 12)


def create_palm(name, x, y, z=0):
    trunk_height = 4.3
    trunk = cylinder(f"{name}_trunk", (x, y, z + trunk_height / 2), 0.17, trunk_height, MAT_TRUNK, "LANDSCAPE", 12)
    trunk.rotation_euler[1] = math.radians(3)
    crown_z = z + trunk_height
    for index in range(10):
        angle = index * math.tau / 10
        length = 2.0 if index % 2 == 0 else 1.65
        leaf = box(
            f"{name}_leaf_{index:02d}",
            (x + math.cos(angle) * length * 0.46, y + math.sin(angle) * length * 0.46, crown_z + 0.20),
            (length, 0.24, 0.055),
            MAT_LEAF,
            "LANDSCAPE",
            0.07,
            (math.radians(10), math.radians(-12), angle),
        )
        leaf.rotation_euler.rotate_axis("Y", math.radians(8))


def create_bush(name, x, y, z=0, scale=1.0):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.48 * scale, location=(x, y, z + 0.42 * scale))
    obj = bpy.context.object
    obj.name = name
    obj.scale = (1.25, 0.78, 0.82)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign(obj, MAT_BUSH)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    move_to_collection(obj, "LANDSCAPE")


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


clear_scene()

scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.length_unit = "METERS"
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 1400
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = str(PREVIEW_OUT)
scene.render.film_transparent = False
if scene.world is None:
    scene.world = bpy.data.worlds.new("Sopro World")
scene.world.color = (0.04, 0.055, 0.07)
scene.world.use_nodes = True
world_nodes = scene.world.node_tree.nodes
background = next((node for node in world_nodes if node.type == "BACKGROUND"), None)
if background is None:
    background = world_nodes.new("ShaderNodeBackground")
    output = next((node for node in world_nodes if node.type == "OUTPUT_WORLD"), None)
    if output is None:
        output = world_nodes.new("ShaderNodeOutputWorld")
    scene.world.node_tree.links.new(background.outputs["Background"], output.inputs["Surface"])
background.inputs["Color"].default_value = (0.055, 0.085, 0.11, 1)
background.inputs["Strength"].default_value = 0.32

MAT_OFFWHITE = material("Sopro | Off-white mineral", (0.72, 0.70, 0.64), 0.82)
MAT_WHITE = material("Sopro | Linen white", (0.88, 0.86, 0.80), 0.72)
MAT_BROWN = material("Sopro | Earth brown", (0.18, 0.095, 0.055), 0.68)
MAT_CONCRETE = material("Sopro | Warm concrete", (0.46, 0.43, 0.38), 0.88)
MAT_STONE = material("Sopro | Pool coping", (0.64, 0.65, 0.61), 0.58)
MAT_STONE_DARK = material("Sopro | Dark stone", (0.095, 0.105, 0.105), 0.34)
MAT_WOOD = material("Sopro | Cumaru", (0.35, 0.16, 0.065), 0.48)
MAT_WOOD_LIGHT = material("Sopro | Natural wood", (0.56, 0.31, 0.13), 0.50)
MAT_RATTAN = material("Sopro | Rattan", (0.53, 0.31, 0.12), 0.70)
MAT_GLASS = material("Sopro | Clear glass", (0.18, 0.42, 0.48), 0.09, alpha=0.24, transmission=0.55)
MAT_GLASS_POOL = material("Sopro | Pool glass", (0.04, 0.56, 0.68), 0.07, alpha=0.40, transmission=0.38)
MAT_WATER = material("Sopro | Water", (0.025, 0.42, 0.53), 0.10, metallic=0.05, alpha=0.72, transmission=0.28)
MAT_POOL_TILE = material("Sopro | Pool tile", (0.02, 0.20, 0.25), 0.32)
MAT_METAL = material("Sopro | Brushed metal", (0.36, 0.39, 0.40), 0.26, metallic=0.75)
MAT_METAL_DARK = material("Sopro | Dark metal", (0.035, 0.045, 0.045), 0.24, metallic=0.72)
MAT_GREEN = material("Sopro | Lawn", (0.11, 0.26, 0.07), 0.95)
MAT_BUSH = material("Sopro | Tropical foliage", (0.045, 0.30, 0.09), 0.88)
MAT_LEAF = material("Sopro | Palm leaves", (0.025, 0.24, 0.075), 0.82)
MAT_TRUNK = material("Sopro | Palm trunk", (0.23, 0.12, 0.055), 0.92)
MAT_SAND = material("Sopro | Sand", (0.54, 0.40, 0.24), 0.98)
MAT_PAVING = material("Sopro | Paving", (0.31, 0.31, 0.28), 0.93)
MAT_FABRIC = material("Sopro | Upholstery", (0.66, 0.58, 0.47), 0.90)

# Context platform and the compact landscape frame.
box("SITE_SandBase", (0, 0, -0.30), (17.5, 12.5, 0.45), MAT_SAND, "SITE", 0.10)
box("SITE_Paving", (0.5, 0, -0.04), (14.6, 9.7, 0.16), MAT_PAVING, "SITE", 0.06)
box("SITE_BackGarden", (-5.70, 0, 0.03), (1.35, 6.55, 0.15), MAT_GREEN, "LANDSCAPE", 0.08)
box("SITE_FrontGarden", (6.45, 0, 0.03), (1.25, 6.55, 0.15), MAT_GREEN, "LANDSCAPE", 0.08)
box("SITE_CentralPath", (5.45, 0, 0.07), (3.15, 0.72, 0.13), MAT_CONCRETE, "SITE", 0.04)

# Primary block: two ground studios plus two upper studios.
box("ARCH_Foundation", (0, 0, 0.02), (10.55, 6.75, 0.22), MAT_CONCRETE, "ARCH", 0.045)
box("ARCH_UpperSlab", (0, 0, 2.92), (10.45, 6.72, 0.22), MAT_OFFWHITE, "ARCH", 0.045)
box("ARCH_Roof", (-0.25, 0, 5.88), (10.95, 7.05, 0.30), MAT_OFFWHITE, "ARCH", 0.07)
box("ARCH_BackWall_Ground", (-5.10, 0, 1.47), (0.22, 6.72, 2.82), MAT_OFFWHITE, "ARCH", 0.03)
box("ARCH_BackWall_Upper", (-5.10, 0, 4.40), (0.22, 6.72, 2.80), MAT_OFFWHITE, "ARCH", 0.03)
box("ARCH_PartyWall_Ground", (-0.25, 0, 1.47), (9.75, 0.18, 2.82), MAT_CONCRETE, "ARCH", 0.025)
box("ARCH_PartyWall_Upper", (-0.25, 0, 4.40), (9.75, 0.18, 2.80), MAT_CONCRETE, "ARCH", 0.025)
for y in (-3.30, 3.30):
    box(f"ARCH_SideWall_Ground_{y:+.2f}", (-0.30, y, 1.47), (9.70, 0.20, 2.82), MAT_BROWN, "ARCH", 0.035)
    box(f"ARCH_SideWall_Upper_{y:+.2f}", (-0.30, y, 4.40), (9.70, 0.20, 2.80), MAT_BROWN, "ARCH", 0.035)

# Interior service cores preserve the floor-plan reading without claiming executive dimensions.
for y in (-1.66, 1.66):
    side = -1 if y < 0 else 1
    box(f"ARCH_Ground_BathBack_{side}", (-1.05, y, 1.34), (0.16, 2.72, 2.46), MAT_OFFWHITE, "ARCH", 0.02)
    box(f"ARCH_Ground_BathSide_{side}", (-0.10, y - side * 1.10, 1.34), (2.00, 0.14, 2.46), MAT_OFFWHITE, "ARCH", 0.02)
    box(f"ARCH_Upper_BathBack_{side}", (-1.05, y, 4.27), (0.16, 2.72, 2.42), MAT_OFFWHITE, "ARCH", 0.02)
    box(f"ARCH_Upper_BathSide_{side}", (-0.10, y - side * 1.10, 4.27), (2.00, 0.14, 2.42), MAT_OFFWHITE, "ARCH", 0.02)

# Brown fins and white stepped crown reproduce the main facade language in the official renders.
for y in (-3.32, 0.0, 3.32):
    box(f"FACADE_Fin_Ground_{y:+.2f}", (4.25, y, 1.50), (1.65, 0.28, 2.96), MAT_BROWN, "FACADE", 0.055)
    box(f"FACADE_Fin_Upper_{y:+.2f}", (4.25, y, 4.43), (1.65, 0.28, 2.88), MAT_BROWN, "FACADE", 0.055)
for index, y in enumerate((-2.48, -0.82, 0.82, 2.48)):
    crown_height = 0.64 if index in (1, 2) else 0.48
    box(f"FACADE_Crown_{index}", (4.40, y, 6.05 + crown_height / 2), (1.45, 1.48, crown_height), MAT_OFFWHITE, "FACADE", 0.055)

# Four transparent living fronts, framed in warm timber.
for level, z in (("G", 1.48), ("U", 4.41)):
    create_window(f"FACADE_{level}_Left", 4.62, -1.66, z, 2.85)
    create_window(f"FACADE_{level}_Right", 4.62, 1.66, z, 2.85)

# Private terraces and pools: ground gardens and elevated upper pools.
for label, y in (("Left", -1.66), ("Right", 1.66)):
    box(f"TERRACE_Ground_{label}", (5.18, y, 0.12), (2.40, 3.05, 0.18), MAT_CONCRETE, "ARCH", 0.04)
    create_pool(f"POOL_Ground_{label}", (5.55, y), (2.12, 1.56), 0.16, elevated=False)
    box(f"TERRACE_Upper_{label}", (5.10, y, 3.02), (2.35, 3.05, 0.24), MAT_BROWN, "ARCH", 0.05)
    create_pool(f"POOL_Upper_{label}", (5.38, y), (2.00, 1.50), 3.04, elevated=True)

# External stairs and handcrafted wood rails.
create_stair("STAIR_Left", -3.78, mirror=False)
create_stair("STAIR_Right", 3.78, mirror=True)

# Interior cues kept intentionally simplified for a performant commercial viewer.
for level, z in (("G", 0.13), ("U", 3.06)):
    for side, y in (("L", -1.66), ("R", 1.66)):
        create_bed(f"FURN_{level}_{side}_Bed", -3.78, y, z, flip=True)
        create_sofa(f"FURN_{level}_{side}_Sofa", 0.62, y, z, flip=False)
        kitchen_y = y + (-0.92 if y > 0 else 0.92)
        create_kitchen(f"FURN_{level}_{side}_Kitchen", 2.35, kitchen_y, z)
        create_table(f"FURN_{level}_{side}_Table", 3.55, y, z)

# Tropical frame. The trees are stylized to avoid expensive foliage geometry in the GLB.
for name, x, y, scale in (
    ("Bush_Back_01", -5.65, -2.50, 1.0),
    ("Bush_Back_02", -5.65, -1.20, 0.9),
    ("Bush_Back_03", -5.65, 1.20, 0.9),
    ("Bush_Back_04", -5.65, 2.50, 1.0),
    ("Bush_Front_01", 6.55, -2.75, 1.0),
    ("Bush_Front_02", 6.55, 2.75, 1.0),
):
    create_bush(name, x, y, scale=scale)
for index, y in enumerate((-4.30, 4.30)):
    create_palm(f"Palm_Front_{index + 1}", 6.85, y)
for index, y in enumerate((-4.15, 4.15)):
    create_palm(f"Palm_Back_{index + 1}", -6.30, y)

# Architectural camera and lighting.
bpy.ops.object.camera_add(location=(18.5, -10.8, 8.6))
camera = bpy.context.object
camera.name = "CAM_Sopro_Hero"
camera.data.lens = 48
camera.data.sensor_width = 36
look_at(camera, (1.4, 0, 2.65))
scene.camera = camera
move_to_collection(camera, "CAMERAS")

bpy.ops.object.light_add(type="SUN", location=(4, -6, 12))
sun = bpy.context.object
sun.name = "LIGHT_TropicalSun"
sun.data.energy = 3.0
sun.data.angle = math.radians(18)
sun.rotation_euler = (math.radians(28), math.radians(-18), math.radians(-34))
move_to_collection(sun, "LIGHTS")

bpy.ops.object.light_add(type="AREA", location=(2.0, -4.5, 10.5))
key = bpy.context.object
key.name = "LIGHT_SkyFill"
key.data.energy = 1250
key.data.shape = "DISK"
key.data.size = 8.0
look_at(key, (0, 0, 2.0))
move_to_collection(key, "LIGHTS")

# Metadata makes the fidelity limits explicit inside the source file.
scene["sopro_source"] = "Book oficial Sopro, plantas e renders fornecidos no projeto"
scene["sopro_fidelity"] = "Representação comercial proporcional; cotas executivas não fornecidas"
scene["sopro_units"] = "2 térreas 34 m² + 2 superiores 29 m² por bloco, conforme book"
scene["sopro_version"] = "2.0-web"

PREVIEW_OUT.parent.mkdir(parents=True, exist_ok=True)
GLB_OUT.parent.mkdir(parents=True, exist_ok=True)

bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_OUT))
bpy.ops.render.render(write_still=True)
bpy.ops.object.select_all(action="DESELECT")
for obj in bpy.context.scene.objects:
    if obj.type in {"MESH", "CURVE"} and not obj.hide_render:
        obj.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=str(GLB_OUT),
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_cameras=False,
    export_lights=False,
    export_yup=True,
)
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_OUT))

mesh_count = sum(1 for obj in scene.objects if obj.type == "MESH")
triangles = sum(len(obj.data.loop_triangles) for obj in scene.objects if obj.type == "MESH")
print({
    "blend": str(BLEND_OUT),
    "glb": str(GLB_OUT),
    "preview": str(PREVIEW_OUT),
    "objects": len(scene.objects),
    "meshes": mesh_count,
    "triangles_cached": triangles,
})
