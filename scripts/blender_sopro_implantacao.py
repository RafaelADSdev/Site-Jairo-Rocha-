"""Sopro — implantação 3D da Praia do Toque (120 unidades / 60 módulos)."""
import bpy
import bmesh
import math
import random
from mathutils import Vector, Euler, Matrix

D = bpy.data
C = bpy.context
USER = "Poderia fazer isso com o maximo de detalhe possivel o MCP do blander ja ta ligado a porta [e 9876"

# --- escala real (m) ---
UW = 3.35
UL = 8.55
POOL_L = 2.55
POOL_W = 2.15
PITCH = 4.22
H0 = 3.05
H1 = 2.85
ROOF_Z = H0 + H1 + 0.28

rng = random.Random(120)


def wipe():
    for ob in list(D.objects):
        D.objects.remove(ob, do_unlink=True)
    for mesh in list(D.meshes):
        D.meshes.remove(mesh)
    for mat in list(D.materials):
        D.materials.remove(mat)
    for cu in list(D.curves):
        D.curves.remove(cu)
    for img in list(D.images):
        if img.users == 0:
            D.images.remove(img)
    for col in list(D.collections):
        if col.name not in {"Collection", "Scene Collection"}:
            D.collections.remove(col)


wipe()
root = D.collections.new("Sopro_Implantacao")
C.scene.collection.children.link(root)
cols = {}
for n in ("Terreno", "Caminhos", "Piscinas", "Unidades", "Lazer", "Paisagismo", "Veiculos", "Luz_Camera", "Ref"):
    c = D.collections.new(n)
    root.children.link(c)
    cols[n] = c

scene = C.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.length_unit = "METERS"
scene.render.engine = "CYCLES"
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.render.resolution_x = 1920
scene.render.resolution_y = 1320
scene.render.film_transparent = False
try:
    scene.cycles.device = "GPU"
except Exception:
    pass


def link(ob, col):
    col.objects.link(ob)
    return ob


def shade_smooth(ob):
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def set_in(bsdf, name, value):
    if name in bsdf.inputs:
        bsdf.inputs[name].default_value = value


def mat(name, *, color, rough=0.45, spec=0.4, metal=0.0, trans=0.0, ior=1.45, emit=0.0, alpha=1.0):
    m = D.materials.get(name) or D.materials.new(name)
    m.use_nodes = True
    m.diffuse_color = (*color, alpha)
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    set_in(bsdf, "Base Color", (*color, 1))
    set_in(bsdf, "Roughness", rough)
    set_in(bsdf, "Specular IOR Level", spec)
    set_in(bsdf, "Specular", spec)
    set_in(bsdf, "Metallic", metal)
    set_in(bsdf, "Transmission Weight", trans)
    set_in(bsdf, "Transmission", trans)
    set_in(bsdf, "IOR", ior)
    if emit > 0:
        set_in(bsdf, "Emission Color", (*color, 1))
        set_in(bsdf, "Emission Strength", emit)
        if "Emission" in bsdf.inputs and "Emission Color" not in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = (*color, 1)
    if alpha < 1:
        set_in(bsdf, "Alpha", alpha)
        m.blend_method = "BLEND"
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    if trans > 0.5:
        vol = nt.nodes.new("ShaderNodeVolumeAbsorption")
        vol.inputs["Color"].default_value = (0.05, 0.42, 0.48, 1)
        vol.inputs["Density"].default_value = 0.28
        nt.links.new(vol.outputs["Volume"], out.inputs["Volume"])
    return m


def mat_noise_color(name, c_a, c_b, *, scale=18.0, rough=0.82, bump=0.12):
    m = D.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 8.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*c_a, 1)
    ramp.color_ramp.elements[1].color = (*c_b, 1)
    bumpn = nt.nodes.new("ShaderNodeBump")
    bumpn.inputs["Strength"].default_value = bump
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(noise.outputs["Fac"], bumpn.inputs["Height"])
    nt.links.new(bumpn.outputs["Normal"], bsdf.inputs["Normal"])
    set_in(bsdf, "Roughness", rough)
    set_in(bsdf, "Specular IOR Level", 0.12)
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    m.diffuse_color = (*c_a, 1)
    return m


M = {
    "grass": mat_noise_color("Grama", (0.16, 0.34, 0.10), (0.32, 0.50, 0.14), scale=22, bump=0.18),
    "grass2": mat_noise_color("GramaClara", (0.22, 0.42, 0.12), (0.40, 0.58, 0.16), scale=14, bump=0.14),
    "sand": mat_noise_color("Areia", (0.72, 0.62, 0.42), (0.84, 0.74, 0.52), scale=40, rough=0.9, bump=0.22),
    "path": mat_noise_color("PedraClara", (0.70, 0.68, 0.64), (0.84, 0.82, 0.78), scale=55, rough=0.55, bump=0.08),
    "asphalt": mat_noise_color("Asfalto", (0.18, 0.18, 0.17), (0.28, 0.27, 0.25), scale=30, rough=0.7, bump=0.06),
    "water": mat("Agua", color=(0.14, 0.66, 0.70), rough=0.06, trans=0.0, ior=1.33, emit=0.28, alpha=1.0),
    "tile": mat("Azulejo", color=(0.18, 0.62, 0.66), rough=0.18, spec=0.85),
    "roof": mat("TelhadoBege", color=(0.72, 0.60, 0.44), rough=0.48),
    "roof2": mat("TelhadoEscuro", color=(0.50, 0.38, 0.24), rough=0.52),
    "plaster": mat("Argamassa", color=(0.80, 0.74, 0.64), rough=0.58),
    "wood": mat("Madeira", color=(0.42, 0.26, 0.13), rough=0.4),
    "wood_light": mat("MadeiraClara", color=(0.66, 0.48, 0.28), rough=0.42),
    "wood_deck": mat("Deck", color=(0.62, 0.44, 0.24), rough=0.5),
    "hedge": mat("CercaViva", color=(0.12, 0.28, 0.09), rough=0.88, spec=0.05),
    "leaf": mat("Folha", color=(0.18, 0.46, 0.12), rough=0.62),
    "leaf2": mat("Folha2", color=(0.28, 0.52, 0.10), rough=0.6),
    "leaf3": mat("Folha3", color=(0.14, 0.34, 0.08), rough=0.7),
    "trunk": mat("Tronco", color=(0.28, 0.18, 0.10), rough=0.78),
    "cane": mat("Palha", color=(0.70, 0.56, 0.34), rough=0.58),
    "white": mat("Branco", color=(0.92, 0.91, 0.88), rough=0.4),
    "linen": mat("Linho", color=(0.88, 0.84, 0.74), rough=0.7),
    "ceramic": mat("Ceramica", color=(0.94, 0.93, 0.90), rough=0.22, spec=0.7),
    "chrome": mat("Cromo", color=(0.72, 0.74, 0.76), rough=0.08, metal=1),
    "black": mat("Preto", color=(0.03, 0.03, 0.03), rough=0.3, metal=0.7),
    "glass": mat("Vidro", color=(0.7, 0.82, 0.88), rough=0.04, trans=0.9, ior=1.45, alpha=0.22),
    "line": mat("Faixa", color=(0.92, 0.92, 0.90), rough=0.4),
    "soil": mat("Terra", color=(0.22, 0.14, 0.08), rough=0.9),
    "concrete": mat("Concreto", color=(0.52, 0.50, 0.47), rough=0.62),
    "car_w": mat("CarroBranco", color=(0.86, 0.86, 0.84), rough=0.28, spec=0.7, metal=0.15),
    "car_s": mat("CarroPrata", color=(0.55, 0.56, 0.58), rough=0.22, metal=0.45),
    "car_d": mat("CarroEscuro", color=(0.12, 0.13, 0.14), rough=0.25, metal=0.4),
    "car_b": mat("CarroBege", color=(0.62, 0.54, 0.42), rough=0.32, metal=0.1),
}


def box(name, size, loc, col, material, rot=(0, 0, 0)):
    sx, sy, sz = size
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts:
        v.co.x *= sx
        v.co.y *= sy
        v.co.z *= sz
    me = D.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = D.objects.new(name, me)
    ob.location = loc
    ob.rotation_euler = Euler(rot)
    if material:
        ob.data.materials.append(material)
    return link(ob, col)


def cyl(name, r, depth, loc, col, material, rot=(0, 0, 0), verts=24):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=verts, radius1=r, radius2=r, depth=depth)
    me = D.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = D.objects.new(name, me)
    ob.location = loc
    ob.rotation_euler = Euler(rot)
    if material:
        ob.data.materials.append(material)
    return link(ob, col)


def cone(name, r1, r2, depth, loc, col, material, verts=16):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=verts, radius1=r1, radius2=r2, depth=depth)
    me = D.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = D.objects.new(name, me)
    ob.location = loc
    if material:
        ob.data.materials.append(material)
    return link(ob, col)


def ico(name, r, loc, col, material, subdiv=2):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=r)
    me = D.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = D.objects.new(name, me)
    ob.location = loc
    if material:
        ob.data.materials.append(material)
    return shade_smooth(link(ob, col))


def ngon(name, verts_xy, z, thick, col, material):
    bm = bmesh.new()
    vs = [bm.verts.new((x, y, 0.0)) for x, y in verts_xy]
    bm.faces.new(vs)
    bm.faces.ensure_lookup_table()
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=thick)
    me = D.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = D.objects.new(name, me)
    ob.location = (0, 0, z)
    if material:
        ob.data.materials.append(material)
    return link(ob, col)


def blob_mesh(name, loc, sx, sy, *, segments=40, seed=1, amp=0.16, z=0.0, thick=0.08, col=None, material=None):
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=segments, radius=1.0)
    for v in bm.verts:
        a = math.atan2(v.co.y, v.co.x)
        n = amp * math.sin(3 * a + seed) + amp * 0.55 * math.sin(5 * a + seed * 0.7)
        n += amp * 0.25 * math.sin(7 * a)
        v.co.x *= (sx / 2) * (1 + n)
        v.co.y *= (sy / 2) * (1 + n)
        v.co.z = 0
    bm.faces.ensure_lookup_table()
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=thick)
    me = D.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = D.objects.new(name, me)
    ob.location = (loc[0], loc[1], z)
    if material:
        ob.data.materials.append(material)
    return shade_smooth(link(ob, col))


def ribbon(name, pts, width, z, col, material):
    curve = D.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 12
    spline = curve.splines.new("NURBS")
    spline.points.add(len(pts) - 1)
    for i, (x, y) in enumerate(pts):
        spline.points[i].co = (x, y, z, 1)
    spline.order_u = min(4, len(pts))
    spline.use_endpoint_u = True
    bevel = D.curves.new(name + "_bev", "CURVE")
    bevel.dimensions = "2D"
    sp = bevel.splines.new("POLY")
    sp.points.add(1)
    sp.points[0].co = (-width / 2, 0, 0, 1)
    sp.points[1].co = (width / 2, 0, 0, 1)
    bev_ob = D.objects.new(name + "_bev", bevel)
    link(bev_ob, col)
    bev_ob.hide_set(True)
    bev_ob.hide_render = True
    curve.bevel_mode = "OBJECT"
    curve.bevel_object = bev_ob
    curve.use_fill_caps = True
    ob = D.objects.new(name, curve)
    if material:
        ob.data.materials.append(material)
    return link(ob, col)


def proto_col(name):
    c = D.collections.new(name)
    root.children.link(c)
    return c


# ---------------------------------------------------------------------------
# lote irregular (aproxima a implantação)
# ---------------------------------------------------------------------------
LOT = [
    (0.0, 10.0),
    (0.0, 128.0),
    (14.0, 152.0),
    (52.0, 160.0),
    (88.0, 148.0),
    (118.0, 118.0),
    (132.0, 78.0),
    (130.0, 38.0),
    (118.0, 8.0),
    (72.0, 0.0),
    (28.0, 2.0),
    (8.0, 6.0),
]

ngon("Lote", LOT, -0.06, 0.12, cols["Terreno"], M["grass"])

BEACH = [
    (-2.0, 8.0),
    (-2.0, 132.0),
    (14.5, 148.0),
    (15.0, 12.0),
]
ngon("Praia", BEACH, 0.01, 0.10, cols["Terreno"], M["sand"])

box("MuroPraia", (0.35, 122.0, 0.55), (13.4, 80.0, 0.28), cols["Terreno"], M["concrete"], rot=(0, 0, math.radians(-3)))

PARK = [
    (13.6, 20.0),
    (13.2, 140.0),
    (22.8, 142.0),
    (23.2, 22.0),
]
ngon("Estacionamento", PARK, 0.03, 0.08, cols["Terreno"], M["asphalt"])

for i in range(14):
    y = 26.0 + i * 8.15
    box(f"Vaga_{i}", (7.2, 0.06, 0.02), (18.4, y, 0.08), cols["Terreno"], M["line"])
    box(f"VagaL_{i}", (0.06, 2.4, 0.02), (14.9, y - 2.0, 0.08), cols["Terreno"], M["line"])
    box(f"VagaR_{i}", (0.06, 2.4, 0.02), (21.9, y - 2.0, 0.08), cols["Terreno"], M["line"])

box("CalcadaEst", (1.1, 118.0, 0.05), (23.9, 80.0, 0.06), cols["Caminhos"], M["path"])


# caminhos principais (NURBS)
PATHS = [
    ("P_oeste", [(24, 28), (25, 52), (24, 78), (26, 108), (25, 132)], 4.6),
    ("P_entreN", [(26, 124), (42, 122), (62, 118), (84, 122), (104, 114), (118, 98)], 4.8),
    ("P_entreM", [(25, 90), (40, 92), (58, 88), (78, 84), (98, 88), (114, 80)], 5.0),
    ("P_entreS", [(24, 52), (42, 50), (64, 48), (86, 50), (106, 46), (118, 34)], 4.8),
    ("P_leste", [(118, 34), (122, 52), (124, 74), (120, 96), (112, 114)], 4.2),
    ("P_recep", [(25, 132), (32, 140), (42, 144), (54, 142)], 4.8),
    ("P_quadra", [(106, 46), (112, 32), (114, 18)], 4.0),
]
for n, pts, w in PATHS:
    ribbon(n, pts, w, 0.05, cols["Caminhos"], M["path"])

cyl("Praca", 11.8, 0.08, (36.5, 132.5, 0.06), cols["Caminhos"], M["path"], verts=64)
cyl("PracaAnel", 4.6, 0.06, (36.5, 132.5, 0.10), cols["Lazer"], M["grass2"], verts=48)
cyl("PracaCentro", 2.2, 0.12, (36.5, 132.5, 0.14), cols["Lazer"], M["soil"], verts=32)


# piscinas comuns
def pool(name, loc, sx, sy, rot=0.0, seed=1, amp=0.18):
    basin = blob_mesh(name + "_casco", loc, sx + 1.1, sy + 1.1, seed=seed, amp=amp, z=-0.08, thick=0.55, col=cols["Piscinas"], material=M["tile"])
    basin.rotation_euler.z = rot
    water = blob_mesh(name + "_agua", loc, sx, sy, seed=seed, amp=amp, z=0.04, thick=0.14, col=cols["Piscinas"], material=M["water"])
    water.rotation_euler.z = rot
    deck = blob_mesh(name + "_borda", loc, sx + 2.4, sy + 2.4, seed=seed + 1, amp=amp * 0.7, z=0.02, thick=0.06, col=cols["Caminhos"], material=M["path"])
    deck.rotation_euler.z = rot
    return water


pool("PiscN1", (62.0, 116.0), 20.0, 9.0, math.radians(-22), 2, 0.20)
pool("PiscN2", (84.0, 122.0), 16.0, 8.0, math.radians(18), 3, 0.22)
pool("PiscM1", (60.0, 80.0), 14.0, 7.5, math.radians(-14), 4, 0.16)
pool("PiscCentral", (74.0, 66.0), 18.0, 10.0, math.radians(10), 5, 0.24)
pool("PiscSul", (66.0, 50.0), 24.0, 7.5, math.radians(-8), 6, 0.12)
pool("PiscLeste", (106.0, 74.0), 12.0, 9.0, math.radians(24), 7, 0.18)

cyl("FogueiraAnel", 3.4, 0.08, (70.5, 54.5, 0.08), cols["Lazer"], M["path"], verts=48)
cyl("FogueiraAreia", 2.4, 0.06, (70.5, 54.5, 0.12), cols["Lazer"], M["sand"], verts=32)
cyl("FogueiraPedra", 0.85, 0.35, (70.5, 54.5, 0.28), cols["Lazer"], M["concrete"], verts=16)


# ---------------------------------------------------------------------------
# protótipo da unidade (vista aérea)
# ---------------------------------------------------------------------------
ucol = proto_col("Proto_Unidade")


def build_unit_proto():
    y = 0.0
    box("U_Laje", (UL + 0.3, UW + 0.28, 0.14), (UL / 2, y, 0.02), ucol, M["plaster"])
    box("U_Corpo0", (UL - 0.1, UW - 0.12, H0 - 0.1), (UL / 2, y, H0 / 2), ucol, M["plaster"])
    box("U_Corpo1", (UL - 0.4, UW - 0.18, H1 - 0.1), (UL / 2 + 0.1, y, H0 + H1 / 2), ucol, M["plaster"])
    box("U_VidroS", (UL - 0.8, 0.04, 2.1), (UL / 2, y - UW / 2 + 0.04, 1.4), ucol, M["glass"])
    box("U_VidroN", (UL - 0.8, 0.04, 2.1), (UL / 2, y + UW / 2 - 0.04, 1.4), ucol, M["glass"])
    box("U_Telhado", (UL + 0.55, UW + 0.45, 0.20), (UL / 2, y, ROOF_Z), ucol, M["roof"])
    box("U_TelhadoIn", (UL - 1.6, UW - 0.7, 0.08), (UL / 2 - 0.15, y, ROOF_Z + 0.12), ucol, M["roof2"])
    box("U_Claraboia", (0.55, 0.40, 0.10), (UL / 2 + 1.6, y, ROOF_Z + 0.18), ucol, M["black"])
    box("U_Deck", (1.85, UW - 0.35, 0.05), (UL + 0.85, y, 0.06), ucol, M["wood_deck"])
    for i in range(8):
        box(f"U_Rip{i}", (1.7, 0.08, 0.015), (UL + 0.85, y - 1.2 + i * 0.34, 0.10), ucol, M["wood_light"])
    px = UL + POOL_L / 2 + 1.55
    box("U_PiscinaCasco", (POOL_L + 0.22, POOL_W + 0.22, 0.55), (px, y, -0.12), ucol, M["tile"])
    w = box("U_Agua", (POOL_L - 0.08, POOL_W - 0.12, 0.12), (px, y, 0.06), ucol, M["water"])
    shade_smooth(w)
    box("U_Borda", (POOL_L + 0.45, POOL_W + 0.5, 0.05), (px, y, 0.04), ucol, M["ceramic"])
    box("U_HedgeS", (UL + POOL_L + 1.6, 0.62, 1.05), (UL / 2 + 1.2, y - UW / 2 - 0.38, 0.52), ucol, M["hedge"])
    box("U_HedgeN", (UL + POOL_L + 1.6, 0.62, 1.05), (UL / 2 + 1.2, y + UW / 2 + 0.38, 0.52), ucol, M["hedge"])
    box("U_HedgeW", (0.55, UW + 0.5, 0.95), (-0.15, y, 0.48), ucol, M["hedge"])
    cyl("U_Mesa", 0.42, 0.05, (UL + 0.7, y, 0.74), ucol, M["wood"], verts=16)
    cyl("U_MesaPe", 0.05, 0.68, (UL + 0.7, y, 0.38), ucol, M["wood"])
    for i, ang in enumerate((0.6, 2.7, 4.5)):
        cx = UL + 0.7 + math.cos(ang) * 0.55
        cy = y + math.sin(ang) * 0.55
        box(f"U_Cad{i}", (0.32, 0.32, 0.07), (cx, cy, 0.46), ucol, M["cane"])
        box(f"U_CadE{i}", (0.32, 0.05, 0.32), (cx + math.cos(ang) * 0.12, cy + math.sin(ang) * 0.12, 0.64), ucol, M["cane"])
    ico("U_VasoA", 0.16, (0.45, y - 1.05, 0.28), ucol, M["leaf"], 1)
    ico("U_VasoB", 0.14, (0.55, y + 1.05, 0.26), ucol, M["leaf2"], 1)


build_unit_proto()


def instance(col, name, loc, rot_z=0.0, parent_col=None):
    ob = D.objects.new(name, None)
    ob.instance_type = "COLLECTION"
    ob.instance_collection = col
    ob.location = loc
    ob.rotation_euler = Euler((0, 0, rot_z))
    return link(ob, parent_col or cols["Unidades"])


def place_block(name, cx, cy, n, yaw_deg, pitch=PITCH, arc=0.0, pool_shift=0.0):
    yaw = math.radians(yaw_deg)
    ly = (-math.sin(yaw), math.cos(yaw))
    lx = (math.cos(yaw), math.sin(yaw))
    start = -(n - 1) / 2 * pitch
    for i in range(n):
        t = start + i * pitch
        extra = (i - (n - 1) / 2) * arc
        x = cx + ly[0] * t + lx[0] * pool_shift
        y = cy + ly[1] * t + lx[1] * pool_shift
        instance(ucol, f"{name}_{i:02d}", (x, y, 0.0), yaw + extra)


# 60 módulos = 120 unidades. Blocos se encaram com a piscina comum no meio.
place_block("N_L", 50.0, 124.0, 10, -80, arc=0.014)
place_block("N_R", 94.0, 132.0, 10, 100, arc=-0.012)
place_block("M_L", 48.0, 78.0, 12, -72, arc=0.010)
place_block("M_R", 96.0, 90.0, 8, 108, arc=-0.010)
place_block("S_L", 44.0, 32.0, 10, 94, arc=0.006)
place_block("S_R", 98.0, 36.0, 10, 86, arc=-0.006)


# ---------------------------------------------------------------------------
# recepção / restaurante
# ---------------------------------------------------------------------------
def building_l(name, loc, yaw=0.0):
    x, y = loc
    box(f"{name}_A", (14.5, 7.2, 3.4), (x, y, 1.7), cols["Lazer"], M["plaster"], rot=(0, 0, yaw))
    box(f"{name}_B", (6.4, 11.0, 3.4), (x - 4.0, y - 6.5, 1.7), cols["Lazer"], M["plaster"], rot=(0, 0, yaw))
    box(f"{name}_RoofA", (15.2, 7.8, 0.22), (x, y, 3.52), cols["Lazer"], M["roof"], rot=(0, 0, yaw))
    box(f"{name}_RoofB", (7.0, 11.6, 0.22), (x - 4.0, y - 6.5, 3.52), cols["Lazer"], M["roof"], rot=(0, 0, yaw))
    box(f"{name}_RoofIn", (8.5, 4.2, 0.08), (x + 0.4, y, 3.68), cols["Lazer"], M["roof2"], rot=(0, 0, yaw))
    for i in range(3):
        box(f"{name}_Div{i}", (0.12, 6.2, 3.2), (x - 4 + i * 4.2, y, 1.6), cols["Lazer"], M["plaster"])


building_l("Recepcao", (29.5, 138.0), math.radians(-8))

# mesas da praça
for i in range(12):
    a = i * (math.pi * 2 / 12) + 0.2
    tx = 36.5 + math.cos(a) * 7.4
    ty = 132.5 + math.sin(a) * 7.4
    cyl(f"MesaPraca_{i}", 0.38, 0.04, (tx, ty, 0.72), cols["Lazer"], M["wood"], verts=12)
    cyl(f"MesaPracaPe_{i}", 0.045, 0.66, (tx, ty, 0.36), cols["Lazer"], M["wood"])
    for k, da in enumerate((0.5, 2.6, 4.5)):
        cx = tx + math.cos(a + da) * 0.52
        cy = ty + math.sin(a + da) * 0.52
        box(f"CadPraca_{i}_{k}", (0.28, 0.28, 0.06), (cx, cy, 0.44), cols["Lazer"], M["cane"])

# academia / deck de madeira
box("GymDeck", (11.5, 8.2, 0.08), (56.5, 136.5, 0.08), cols["Lazer"], M["wood_deck"])
box("GymRoof", (8.4, 5.6, 0.12), (56.5, 136.5, 3.15), cols["Lazer"], M["wood"])
for i in range(4):
    box(f"GymPilar_{i}", (0.18, 0.18, 3.0), (53.2 + (i % 2) * 6.6, 134.0 + (i // 2) * 5.0, 1.55), cols["Lazer"], M["wood"])
for i in range(6):
    box(f"GymAparelho_{i}", (1.35, 0.55, 0.85), (52.6 + (i % 3) * 2.6, 134.6 + (i // 3) * 3.4, 0.55), cols["Lazer"], M["black"])

# late checkout / apoio sul
box("Apoio", (7.2, 6.4, 3.1), (28.5, 32.5, 1.55), cols["Lazer"], M["plaster"])
box("ApoioRoof", (7.8, 7.0, 0.18), (28.5, 32.5, 3.22), cols["Lazer"], M["roof"])
cyl("ApoioPraca", 3.6, 0.06, (28.5, 38.8, 0.06), cols["Caminhos"], M["path"], verts=32)

# playground
box("PlayAreia", (8.5, 7.0, 0.08), (114.0, 102.0, 0.06), cols["Lazer"], M["sand"])
cyl("PlayCoco", 1.1, 0.08, (114.0, 102.0, 0.22), cols["Lazer"], M["wood"], verts=12)
box("PlayEscorrega", (0.45, 2.8, 0.08), (111.8, 100.6, 0.85), cols["Lazer"], M["wood_light"], rot=(0.55, 0, 0.4))
ico("PlayBola", 0.28, (116.2, 103.4, 0.35), cols["Lazer"], M["linen"], 1)

# kiosques de palha
for i, (x, y) in enumerate(((118.0, 86.0), (116.5, 48.0), (108.0, 18.5))):
    cyl(f"KioPoste_{i}", 0.12, 2.4, (x, y, 1.2), cols["Lazer"], M["trunk"], verts=8)
    cone(f"KioTeto_{i}", 2.4, 0.08, 1.15, (x, y, 2.85), cols["Lazer"], M["cane"], verts=12)

# quadra de futevôlei
box("Quadra", (16.5, 9.2, 0.10), (112.0, 20.5, 0.06), cols["Lazer"], M["sand"])
box("QuadraBorda", (17.2, 9.9, 0.04), (112.0, 20.5, 0.04), cols["Lazer"], M["wood"])
box("Rede", (0.04, 8.2, 1.05), (112.0, 20.5, 1.15), cols["Lazer"], M["white"])
box("PosteA", (0.08, 0.08, 1.7), (112.0, 16.5, 0.85), cols["Lazer"], M["wood"])
box("PosteB", (0.08, 0.08, 1.7), (112.0, 24.5, 0.85), cols["Lazer"], M["wood"])

# espreguiçadeiras na piscina leste
for i in range(8):
    x = 108.5 + (i % 2) * 2.2
    y = 66.0 + (i // 2) * 2.6
    box(f"Chaise_{i}", (0.62, 1.85, 0.08), (x, y, 0.32), cols["Lazer"], M["linen"])
    box(f"ChaiseE_{i}", (0.62, 0.48, 0.08), (x, y - 0.72, 0.48), cols["Lazer"], M["linen"], rot=(0.45, 0, 0))


# ---------------------------------------------------------------------------
# palmeira (boa de cima: coroa em estrela)
# ---------------------------------------------------------------------------
pcol = proto_col("Proto_Palmeira")


def build_palm_proto(col, tag, height=7.2, fronds=14):
    cone(f"{tag}_tronco", 0.18, 0.10, height, (0, 0, height / 2), col, M["trunk"], verts=10)
    for i in range(fronds):
        a = i * (math.pi * 2 / fronds)
        tilt = 0.55 + (i % 3) * 0.12
        length = 3.8 + (i % 4) * 0.28
        leaf = box(f"{tag}_f{i}", (length, 0.28, 0.04), (
            math.cos(a) * length * 0.38,
            math.sin(a) * length * 0.38,
            height - 0.15 + math.sin(i) * 0.08,
        ), col, M["leaf"] if i % 3 else M["leaf2"])
        leaf.rotation_euler = Euler((tilt * 0.15, tilt, a))
        for j in range(5):
            t = 0.25 + j * 0.15
            box(f"{tag}_f{i}s{j}", (length * 0.18, 0.07, 0.02), (
                math.cos(a) * length * t,
                math.sin(a) * length * t,
                height - 0.2 - j * 0.04,
            ), col, M["leaf3"] if j % 2 else M["leaf"])
    ico(f"{tag}_coroa", 0.35, (0, 0, height + 0.05), col, M["leaf"], 1)


build_palm_proto(pcol, "P", 7.4, 16)

pcol2 = proto_col("Proto_PalmeiraP")
build_palm_proto(pcol2, "Pp", 5.2, 12)


PALMS = [
    (20, 128, 0), (22, 118, 1), (19, 108, 0), (21, 96, 1), (20, 84, 0),
    (19, 70, 1), (21, 56, 0), (20, 42, 1), (18, 30, 0),
    (32, 146, 0), (44, 148, 1), (58, 146, 0), (48, 140, 1),
    (36, 122, 0), (28, 124, 1), (42, 126, 0),
    (64, 130, 1), (74, 126, 0), (98, 118, 1), (108, 112, 0),
    (118, 98, 1), (122, 80, 0), (120, 62, 1), (118, 44, 0),
    (108, 12, 1), (98, 10, 0), (86, 8, 1), (64, 10, 0), (50, 12, 1),
    (38, 16, 0), (70, 50, 1), (78, 58, 0), (64, 68, 1),
    (52, 58, 0), (84, 92, 1), (60, 98, 0), (74, 108, 1),
    (100, 88, 0), (54, 28, 1), (76, 24, 0), (96, 36, 1),
    (110, 54, 0), (40, 90, 1), (34, 66, 0), (102, 128, 1),
    (88, 140, 0), (26, 50, 1), (30, 88, 0),
]
for i, (x, y, k) in enumerate(PALMS):
    col = pcol2 if k else pcol
    inst = instance(col, f"Palmeira_{i:02d}", (x, y, 0), rng.uniform(0, 6.28), cols["Paisagismo"])
    s = 1.55 if k == 0 else 1.25
    inst.scale = (s, s, s)


def bush(name, loc, s=1.0):
    ico(name, 0.55 * s, (loc[0], loc[1], 0.45 * s), cols["Paisagismo"], M["leaf"] if hash(name) % 2 else M["leaf2"], 1)
    ico(name + "b", 0.38 * s, (loc[0] + 0.25 * s, loc[1] - 0.15 * s, 0.32 * s), cols["Paisagismo"], M["leaf3"], 1)


BUSHES = []
for x, y in [(34, 118), (50, 122), (68, 116), (80, 108), (96, 102),
             (40, 96), (58, 92), (76, 88), (94, 84),
             (38, 52), (62, 50), (84, 48), (100, 44),
             (34, 24), (58, 22), (82, 18), (100, 16),
             (108, 96), (112, 78), (106, 60), (24, 100), (26, 74)]:
    BUSHES.append((x, y, rng.uniform(0.8, 1.35)))
for i, (x, y, s) in enumerate(BUSHES):
    bush(f"Arbusto_{i}", (x, y), s)

# bananeiras (folhas largas)
for i, (x, y) in enumerate([(33, 142), (41, 144), (27, 134), (52, 52), (66, 40), (90, 52), (104, 96)]):
    box(f"BanCaule_{i}", (0.12, 0.12, 1.6), (x, y, 0.8), cols["Paisagismo"], M["trunk"])
    for k, ang in enumerate((0.3, 1.4, 2.5, 3.7, 5.0)):
        lf = box(f"BanF_{i}_{k}", (1.15, 0.28, 0.04), (x + math.cos(ang) * 0.45, y + math.sin(ang) * 0.45, 1.35 + (k % 2) * 0.2), cols["Paisagismo"], M["leaf"])
        lf.rotation_euler = Euler((0.4, 0.15, ang))


# ---------------------------------------------------------------------------
# carros
# ---------------------------------------------------------------------------
ccol = proto_col("Proto_Carro")


def build_car_proto():
    box("Car_body", (4.15, 1.72, 0.62), (0, 0, 0.48), ccol, M["car_w"])
    box("Car_cabin", (2.05, 1.58, 0.58), (-0.15, 0, 1.02), ccol, M["car_w"])
    box("Car_glassF", (0.04, 1.40, 0.42), (0.92, 0, 1.02), ccol, M["glass"])
    box("Car_glassB", (0.04, 1.40, 0.38), (-1.18, 0, 1.00), ccol, M["glass"])
    box("Car_glassS", (1.7, 0.04, 0.38), (-0.1, 0.80, 1.00), ccol, M["glass"])
    box("Car_glassS2", (1.7, 0.04, 0.38), (-0.1, -0.80, 1.00), ccol, M["glass"])
    for i, (x, y) in enumerate(((-1.25, 0.78), (1.15, 0.78), (-1.25, -0.78), (1.15, -0.78))):
        cyl(f"Car_w{i}", 0.32, 0.22, (x, y, 0.32), ccol, M["black"], rot=(math.pi / 2, 0, 0), verts=12)


build_car_proto()
CAR_MATS = [M["car_w"], M["car_s"], M["car_d"], M["car_b"]]
for i in range(13):
    y = 28.5 + i * 8.15
    inst = instance(ccol, f"Carro_{i:02d}", (18.3, y, 0.0), math.radians(90 if i % 2 == 0 else -90), cols["Veiculos"])
    # variação de cor via overlay simples no corpo não é trivial em instance; rotaciona basta
    inst.scale = (1, 1, 1)

# dois carros extras
instance(ccol, "Carro_sul", (18.0, 22.0, 0.0), math.radians(88), cols["Veiculos"])


# guarda-sóis na orla leste
for i, (x, y) in enumerate([(120.5, 78), (122.0, 72), (121.2, 66), (119.8, 60)]):
    cyl(f"SolPoste_{i}", 0.04, 2.1, (x, y, 1.05), cols["Lazer"], M["chrome"])
    cone(f"SolTeto_{i}", 1.35, 0.05, 0.28, (x, y, 2.18), cols["Lazer"], M["white"], verts=10)
    box(f"SolCadeira_{i}", (0.55, 1.6, 0.08), (x + 1.1, y, 0.28), cols["Lazer"], M["linen"])


# ---------------------------------------------------------------------------
# luz + câmera aérea (encaixa o recorte da implantação)
# ---------------------------------------------------------------------------
sun = D.lights.new("Sol", "SUN")
sun.energy = 5.2
sun.angle = math.radians(3.5)
sun.color = (1.0, 0.96, 0.90)
sun_ob = D.objects.new("Sol", sun)
sun_ob.location = (40, -30, 80)
sun_ob.rotation_euler = Euler((math.radians(42), math.radians(8), math.radians(28)))
link(sun_ob, cols["Luz_Camera"])

world = D.worlds[0] if D.worlds else D.worlds.new("World")
scene.world = world
world.use_nodes = True
nt = world.node_tree
nt.nodes.clear()
out = nt.nodes.new("ShaderNodeOutputWorld")
bg = nt.nodes.new("ShaderNodeBackground")
bg.inputs["Color"].default_value = (1.0, 1.0, 1.0, 1)
bg.inputs["Strength"].default_value = 1.0
nt.links.new(bg.outputs["Background"], out.inputs["Surface"])

cam_data = D.cameras.new("CamAerea")
cam_data.type = "ORTHO"
cam_data.ortho_scale = 168.0
cam_data.clip_start = 0.1
cam_data.clip_end = 400
cam = D.objects.new("CamAerea", cam_data)
cam.location = (64.0, 78.0, 140.0)
cam.rotation_euler = Euler((0, 0, 0))
link(cam, cols["Luz_Camera"])
scene.camera = cam

cam2 = D.cameras.new("CamObliqua")
cam2.lens = 35
cam2.clip_end = 500
p = D.objects.new("CamObliqua", cam2)
p.location = (64.0, -8.0, 95.0)
p.rotation_euler = Euler((math.radians(48), 0, 0))
link(p, cols["Luz_Camera"])

# fundo branco (MATERIAL view ignora o world)
box("FundoBranco", (420, 420, 0.2), (64, 78, -2.5), cols["Terreno"], M["white"])

# tira os protótipos da cena — instâncias continuam visíveis
for pcol_ in (ucol, pcol, pcol2, ccol):
    pcol_.hide_viewport = False
    pcol_.hide_render = False
    if pcol_.name in [c.name for c in root.children]:
        root.children.unlink(pcol_)
    if pcol_.name in [c.name for c in C.scene.collection.children]:
        C.scene.collection.children.unlink(pcol_)

# viewport
for area in C.screen.areas:
    if area.type == "VIEW_3D":
        sp = area.spaces[0]
        sp.region_3d.view_perspective = "CAMERA"
        sp.shading.type = "MATERIAL"
        sp.shading.use_scene_lights = True
        sp.shading.use_scene_world = True
        sp.clip_end = 500
        sp.overlay.show_floor = False
        sp.overlay.show_axis_x = False
        sp.overlay.show_axis_y = False
        sp.overlay.show_overlays = False

print("Sopro implantação:", len(D.objects), "objetos,", len(D.materials), "materiais")
