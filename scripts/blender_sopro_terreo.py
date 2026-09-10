"""Sopro — térreo (Tipo 01/02, 34 m²) e superior (Tipo 03/04, 29 m²)."""
import bpy
import bmesh
import math
from mathutils import Vector, Euler

D = bpy.data
C = bpy.context
USER = "conectei o MCP Poderia fazer no blander com o maximo de detalhe possivel"

# --- medidas em metros (34 m² por unidade, garden incluso) ---
UW = 3.35
UL = 10.30
WALL = 0.12
H = 2.68
THICK = 0.12
POOL_L = 2.70
POOL_D = 1.05
GRASS_L = 1.40
GAP = 1.45  # vão da escada entre Tipo 01 e Tipo 02

X_GARDEN = 1.25
X_BED = 2.50
X_CLOSET = 1.05
X_LIVE = 2.15
X_KIT = 1.50
X_GOUR = 1.85
X_STAIR = X_GARDEN + X_BED + X_CLOSET + X_LIVE
UL_SUP = X_BED + X_CLOSET + X_LIVE + X_KIT + X_GOUR  # 29 m², sem garden
SUP_OFF = UL + POOL_L + GRASS_L + 3.4  # plantas 03/04 ao lado
COMP_X = SUP_OFF + UL_SUP + POOL_L + 6.5  # prédio completo (térreo+1º) ao lado das 4
Z_UP = H + 0.32
DOOR_W = 0.70
DOOR_H = 2.08
DOOR_T = 0.04
ZOFF = 0.0
PLACE = "plant"
TAG_PREFIX = ""

# --- limpa a cena ---
for ob in list(D.objects):
    D.objects.remove(ob, do_unlink=True)
for mesh in list(D.meshes):
    D.meshes.remove(mesh)
for mat in list(D.materials):
    D.materials.remove(mat)
for col in list(D.collections):
    if col.name not in {"Collection", "Scene Collection"}:
        D.collections.remove(col)

root = D.collections.new("Sopro_Terreo")
C.scene.collection.children.link(root)
arch = D.collections.new("Arquitetura")
furn = D.collections.new("Mobiliario")
land = D.collections.new("Paisagismo")
fx = D.collections.new("Luz_Camera")
for c in (arch, furn, land, fx):
    root.children.link(c)

scene = C.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.length_unit = "METERS"
scene.render.engine = "CYCLES"
scene.cycles.samples = 64
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080


def link(ob, col):
    col.objects.link(ob)
    return ob


def mat(name, *, color, rough=0.45, spec=0.4, metal=0.0, trans=0.0, ior=1.45, emit=0.0, alpha=1.0):
    m = D.materials.get(name) or D.materials.new(name)
    m.use_nodes = True
    m.diffuse_color = (*color, alpha)
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Specular IOR Level"].default_value = spec if "Specular IOR Level" in bsdf.inputs else spec
    if "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = spec
    bsdf.inputs["Metallic"].default_value = metal
    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = trans
    elif "Transmission" in bsdf.inputs:
        bsdf.inputs["Transmission"].default_value = trans
    if "IOR" in bsdf.inputs:
        bsdf.inputs["IOR"].default_value = ior
    if emit > 0 and "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = (*color, 1)
        bsdf.inputs["Emission Strength"].default_value = emit
    elif emit > 0 and "Emission" in bsdf.inputs:
        bsdf.inputs["Emission"].default_value = (*color, 1)
    if alpha < 1:
        if "Alpha" in bsdf.inputs:
            bsdf.inputs["Alpha"].default_value = alpha
        m.blend_method = "BLEND"
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    if trans > 0.5:
        vol = nt.nodes.new("ShaderNodeVolumeAbsorption")
        vol.inputs["Color"].default_value = (0.05, 0.35, 0.42, 1)
        vol.inputs["Density"].default_value = 0.35
        nt.links.new(vol.outputs["Volume"], out.inputs["Volume"])
    return m


M = {
    "plaster": mat("Argamassa", color=(0.72, 0.64, 0.54), rough=0.62),
    "floor": mat("PisoCimento", color=(0.55, 0.54, 0.51), rough=0.28, spec=0.55),
    "wood": mat("MadeiraTeak", color=(0.38, 0.22, 0.11), rough=0.38),
    "wood_light": mat("MadeiraClara", color=(0.62, 0.45, 0.28), rough=0.42),
    "cane": mat("Palha", color=(0.71, 0.58, 0.38), rough=0.55),
    "linen": mat("Linho", color=(0.82, 0.76, 0.66), rough=0.72, spec=0.12),
    "linen_dark": mat("LinhoEscuro", color=(0.28, 0.18, 0.12), rough=0.7),
    "fabric": mat("TecidoSofa", color=(0.86, 0.76, 0.60), rough=0.62),
    "rug": mat("TapeteJuta", color=(0.70, 0.60, 0.44), rough=0.88, spec=0.08),
    "ceramic": mat("Ceramica", color=(0.96, 0.95, 0.92), rough=0.22, spec=0.7),
    "chrome": mat("Cromo", color=(0.72, 0.74, 0.76), rough=0.08, metal=1.0, spec=1.0),
    "black": mat("MetalPreto", color=(0.03, 0.03, 0.03), rough=0.25, metal=0.85),
    "glass": mat("Vidro", color=(0.75, 0.85, 0.9), rough=0.02, trans=0.95, ior=1.45, alpha=0.18),
    "water": mat("Agua", color=(0.07, 0.42, 0.48), rough=0.04, trans=0.92, ior=1.33, alpha=0.35),
    "tile": mat("AzulejoPiscina", color=(0.12, 0.55, 0.62), rough=0.2, spec=0.8),
    "grass": mat("Grama", color=(0.22, 0.38, 0.12), rough=0.85, spec=0.08),
    "leaf": mat("Folhagem", color=(0.18, 0.42, 0.10), rough=0.7),
    "leaf2": mat("Folhagem2", color=(0.32, 0.48, 0.08), rough=0.65),
    "soil": mat("Terra", color=(0.18, 0.12, 0.07), rough=0.9),
    "sand": mat("Areia", color=(0.76, 0.68, 0.48), rough=0.8),
    "white": mat("Branco", color=(0.92, 0.91, 0.88), rough=0.4),
    "gold": mat("OuroSuave", color=(0.72, 0.55, 0.22), rough=0.28, metal=0.6, emit=0.15),
    "fachada": mat("FachadaMarrom", color=(0.22, 0.15, 0.11), rough=0.58),
    "slab": mat("LajeBege", color=(0.78, 0.72, 0.62), rough=0.45),
    "hedge": mat("CercaViva", color=(0.14, 0.28, 0.10), rough=0.85, spec=0.05),
    "curtain": mat("Cortina", color=(0.93, 0.91, 0.88), rough=0.75),
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
    ob.location = (loc[0], loc[1], loc[2] + ZOFF)
    ob.rotation_euler = Euler(rot)
    if material:
        ob.data.materials.append(material)
    return link(ob, col)


def cyl(name, r, depth, loc, col, material, rot=(0, 0, 0), verts=32):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=verts, radius1=r, radius2=r, depth=depth)
    me = D.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = D.objects.new(name, me)
    ob.location = (loc[0], loc[1], loc[2] + ZOFF)
    ob.rotation_euler = Euler(rot)
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
    ob.location = (loc[0], loc[1], loc[2] + ZOFF)
    if material:
        ob.data.materials.append(material)
    return link(ob, col)


def shade_smooth(ob):
    for p in ob.data.polygons:
        p.use_smooth = True


# ---------------------------------------------------------------------------
# Térreo: Tipo 02 sul / Tipo 01 norte. Superior: Tipo 04 sul / Tipo 03 norte.
# 01 e 03: banheiro na frente da cama. 02 e 04: banheiro na frente do sofá.
# ---------------------------------------------------------------------------
def unit_len(floor=0):
    return UL if floor == 0 else UL_SUP


def x_stair(floor=0):
    mid = X_BED + X_CLOSET + X_LIVE
    return (X_GARDEN + mid) if floor == 0 else mid


def unit_origin(which, floor=0):
    y0 = 0.0 if which == 0 else UW + GAP
    if PLACE == "stack":
        x0 = COMP_X + (X_GARDEN if floor == 1 else 0.0)
    else:
        x0 = 0.0 if floor == 0 else SUP_OFF
    return Vector((x0, y0, 0.0))


def unit_tag(which, floor=0):
    if floor == 0:
        base = "T02" if which == 0 else "T01"
    else:
        base = "T04" if which == 0 else "T03"
    return f"{TAG_PREFIX}{base}"


def x_zones(o, floor=0):
    g = 0.0 if floor == 1 else X_GARDEN
    g0 = o.x
    b0 = g0 + g
    c0 = b0 + X_BED
    l0 = c0 + X_CLOSET
    k0 = l0 + X_LIVE
    v0 = k0 + X_KIT
    return {
        "garden": (g0, b0),
        "bed": (b0, c0),
        "closet": (c0, l0),
        "live": (l0, k0),
        "kit": (k0, v0),
        "gour": (v0, v0 + X_GOUR),
    }


def bath_box(which, o, floor=0):
    """WC principal. 01/03: frente da cama. 02/04: frente do sofá."""
    z = x_zones(o, floor)
    if which == 1:
        bx = z["bed"][0] + 0.06
        by = o.y + 0.06
        bath_d, bath_w = X_BED - 0.14, 1.48
        door = "E"
    else:
        bath_d, bath_w = 1.55, 1.28
        bx = z["live"][0] + 0.06
        by = o.y + UW - bath_w - 0.06
        door = "S"
    return bx, by, bath_d, bath_w, door


def wc2_box(o, floor=0):
    """Tipo 01/03 — segundo WC na parede interna, depois do quarto."""
    z = x_zones(o, floor)
    d, w = 1.42, 1.18
    return z["closet"][0] + 0.04, o.y + 0.06, d, w


def swing_door(name, hinge_x, hinge_y, open_yaw, col=arch):
    """Folha de porta entreaberta (vista de planta)."""
    cx = hinge_x + math.cos(open_yaw) * (DOOR_W / 2)
    cy = hinge_y + math.sin(open_yaw) * (DOOR_W / 2)
    leaf = box(name, (DOOR_W, DOOR_T, DOOR_H), (cx, cy, DOOR_H / 2), col, M["wood_light"], rot=(0, 0, open_yaw))
    cyl(name + "Mac", 0.012, 0.08, (
        hinge_x + math.cos(open_yaw) * (DOOR_W - 0.08),
        hinge_y + math.sin(open_yaw) * (DOOR_W - 0.08),
        1.00,
    ), col, M["chrome"])
    return leaf


def wall_run(name, x0, y0, x1, y1, h_w=1.15):
    dx, dy = x1 - x0, y1 - y0
    length = math.hypot(dx, dy)
    if length < 0.05:
        return None
    yaw = math.atan2(dy, dx)
    return box(name, (length, WALL, h_w), ((x0 + x1) / 2, (y0 + y1) / 2, h_w / 2), arch, M["plaster"], rot=(0, 0, yaw))


def build_bath_walls(tag, bx, by, bath_d, bath_w, door="E"):
    """Paredes do WC com vão e folha de porta no lado certo."""
    h_w = 1.15
    x0, x1 = bx, bx + bath_d
    y0, y1 = by, by + bath_w
    gap = DOOR_W + 0.04
    # quatro paredes; o lado da porta fica com vão
    if door != "S":
        box(f"{tag}_BanhoS", (bath_d, WALL, h_w), ((x0 + x1) / 2, y0, h_w / 2), arch, M["plaster"])
    if door != "N":
        box(f"{tag}_BanhoN", (bath_d, WALL, h_w), ((x0 + x1) / 2, y1, h_w / 2), arch, M["plaster"])
    if door != "E":
        box(f"{tag}_BanhoE", (WALL, bath_w, h_w), (x1, (y0 + y1) / 2, h_w / 2), arch, M["plaster"])
    if door != "W":
        box(f"{tag}_BanhoW", (WALL, bath_w, h_w), (x0, (y0 + y1) / 2, h_w / 2), arch, M["plaster"])

    if door == "E":
        # vão no norte da parede leste (corredor ao lado da cama)
        rest = bath_w - gap
        box(f"{tag}_BanhoE", (WALL, rest, h_w), (x1, y0 + rest / 2, h_w / 2), arch, M["plaster"])
        swing_door(f"{tag}_PortaWC", x1, y1 - 0.04, math.radians(-55))
    elif door == "S":
        rest = bath_d - gap
        box(f"{tag}_BanhoS", (rest, WALL, h_w), (x0 + rest / 2, y0, h_w / 2), arch, M["plaster"])
        swing_door(f"{tag}_PortaWC", x1 - 0.04, y0, math.radians(-125))
    elif door == "N":
        rest = bath_d - gap
        box(f"{tag}_BanhoN", (rest, WALL, h_w), (x0 + rest / 2, y1, h_w / 2), arch, M["plaster"])
        swing_door(f"{tag}_PortaWC", x0 + 0.04, y1, math.radians(55))

    box(f"{tag}_BanhoPiso", (bath_d - 0.04, bath_w - 0.04, 0.06), ((x0 + x1) / 2, (y0 + y1) / 2, 0.08), arch, M["ceramic"])


def build_shell(which, floor=0):
    o = unit_origin(which, floor)
    tag = unit_tag(which, floor)
    ul = unit_len(floor)
    y_mid = o.y + UW / 2
    box(f"{tag}_Laje", (ul + 0.24, UW + 0.24, 0.12), (o.x + ul / 2, y_mid, -0.06), arch, M["floor"])
    box(f"{tag}_Piso", (ul - 0.04, UW - 0.04, 0.04), (o.x + ul / 2, y_mid, 0.02), arch, M["floor"])
    if floor == 0:
        box(f"{tag}_GardenPiso", (X_GARDEN - 0.08, UW - 0.2, 0.03), (o.x + X_GARDEN / 2, y_mid, 0.035), arch, M["soil"])
    for side, y_wall in (("S", o.y - WALL / 2), ("N", o.y + UW + WALL / 2)):
        box(f"{tag}_Peitoril{side}", (ul + WALL * 2, WALL, 0.42), (o.x + ul / 2, y_wall, 0.21), arch, M["plaster"])
        box(f"{tag}_Verga{side}", (ul + WALL * 2, WALL, 0.22), (o.x + ul / 2, y_wall, H - 0.11), arch, M["plaster"])
        for i in range(5):
            x = o.x + i * (ul / 4)
            box(f"{tag}_Pilar{side}{i}", (0.14, WALL + 0.02, H), (x, y_wall, H / 2), arch, M["plaster"])
        box(f"{tag}_Vidro{side}", (ul - 0.2, 0.02, H - 0.68), (o.x + ul / 2, y_wall, (H - 0.68) / 2 + 0.42), arch, M["glass"])
    x_east = o.x + ul
    box(f"{tag}_LesteBase", (WALL, UW + WALL * 2, 0.08), (x_east + WALL / 2, y_mid, 0.04), arch, M["plaster"])
    box(f"{tag}_LesteVerga", (WALL, UW + WALL * 2, 0.28), (x_east + WALL / 2, y_mid, H - 0.14), arch, M["plaster"])
    gh = H - 0.42
    gz = gh / 2 + 0.08
    leaf = (UW - 0.2) / 2
    if floor == 0:
        box(f"{tag}_OesteBase", (WALL, UW + WALL * 2, 0.08), (o.x - WALL / 2, y_mid, 0.04), arch, M["plaster"])
        box(f"{tag}_OesteVerga", (WALL, UW + WALL * 2, 0.28), (o.x - WALL / 2, y_mid, H - 0.14), arch, M["plaster"])
        box(f"{tag}_VidroGardenA", (0.02, leaf - 0.04, gh), (o.x + 0.02, o.y + 0.12 + leaf / 2, gz), arch, M["glass"])
        box(f"{tag}_VidroGardenB", (0.02, leaf - 0.04, gh), (o.x + 0.06, o.y + UW - 0.12 - leaf / 2, gz), arch, M["glass"])
        for i in range(11):
            box(f"{tag}_Estaca{i}", (0.04, 0.04, 1.35), (o.x + 0.08, o.y + 0.2 + i * ((UW - 0.4) / 10), 0.67), arch, M["wood"])
        box(f"{tag}_TraveGarden", (0.04, UW - 0.3, 0.04), (o.x + 0.08, y_mid, 1.22), arch, M["wood"])
    else:
        box(f"{tag}_OesteMuro", (WALL, UW + WALL * 2, H), (o.x - WALL / 2, y_mid, H / 2), arch, M["plaster"])
        box(f"{tag}_JanelaOeste", (0.04, UW * 0.52, 0.82), (o.x + 0.03, y_mid, 1.48), arch, M["glass"])
        box(f"{tag}_PeitorilOeste", (WALL + 0.04, UW * 0.58, 0.08), (o.x, y_mid, 1.04), arch, M["wood"])
    box(f"{tag}_VidroPiscinaA", (0.02, leaf - 0.04, gh), (x_east - 0.02, o.y + 0.12 + leaf / 2, gz), arch, M["glass"])
    box(f"{tag}_VidroPiscinaB", (0.02, leaf - 0.04, gh), (x_east - 0.06, o.y + UW - 0.12 - leaf / 2, gz), arch, M["glass"])
    west_x = o.x + 0.04 if floor == 0 else None
    for i, x in enumerate([p for p in (west_x, x_east - 0.04) if p is not None]):
        box(f"{tag}_Caixilho{i}A", (0.04, UW - 0.12, 0.04), (x, y_mid, 0.10), arch, M["wood"])
        box(f"{tag}_Caixilho{i}B", (0.04, UW - 0.12, 0.04), (x, y_mid, H - 0.30), arch, M["wood"])
        box(f"{tag}_Caixilho{i}C", (0.04, 0.04, gh), (x, o.y + 0.12, gz), arch, M["wood"])
        box(f"{tag}_Caixilho{i}D", (0.04, 0.04, gh), (x, o.y + UW - 0.12, gz), arch, M["wood"])
        box(f"{tag}_Caixilho{i}M", (0.03, 0.03, gh), (x, y_mid, gz), arch, M["wood"])
    z = x_zones(o, floor)
    gx_int = z["live"][1]
    if which == 1:
        box(f"{tag}_VidroSalaN", (0.03, UW * 0.38, H - 0.5), (gx_int, o.y + UW - UW * 0.22, (H - 0.5) / 2 + 0.08), arch, M["glass"])
        box(f"{tag}_VidroSalaS", (0.03, UW * 0.22, H - 0.5), (gx_int, o.y + UW * 0.18, (H - 0.5) / 2 + 0.08), arch, M["glass"])
    else:
        box(f"{tag}_VidroSalaN", (0.03, UW * 0.22, H - 0.5), (gx_int, o.y + UW - UW * 0.18, (H - 0.5) / 2 + 0.08), arch, M["glass"])
        box(f"{tag}_VidroSalaS", (0.03, UW * 0.38, H - 0.5), (gx_int, o.y + UW * 0.22, (H - 0.5) / 2 + 0.08), arch, M["glass"])
    bx, by, bath_d, bath_w, door = bath_box(which, o, floor)
    build_bath_walls(tag, bx, by, bath_d, bath_w, door=door)
    if which == 1:
        x2, y2, d2, w2 = wc2_box(o, floor)
        build_bath_walls(f"{tag}b", x2, y2, d2, w2, door="N")
    gx = o.x + ul - X_GOUR / 2
    box(f"{tag}_Deck", (X_GOUR - 0.1, UW - 0.16, 0.04), (gx, y_mid, 0.06), arch, M["wood"])
    for i in range(14):
        box(f"{tag}_Rip{i}", (X_GOUR - 0.16, 0.06, 0.015), (gx, o.y + 0.18 + i * ((UW - 0.36) / 13), 0.085), arch, M["wood_light"])
    px = o.x + ul + POOL_L / 2 + 0.08
    py = y_mid
    box(f"{tag}_PiscinaCasco", (POOL_L + 0.18, UW - 0.25, POOL_D + 0.12), (px, py, -POOL_D / 2 + 0.02), arch, M["tile"])
    box(f"{tag}_PiscinaCava", (POOL_L - 0.12, UW - 0.55, POOL_D), (px, py, -POOL_D / 2 + 0.04), arch, M["tile"])
    water = box(f"{tag}_Agua", (POOL_L - 0.18, UW - 0.62, 0.12), (px, py, -0.08), arch, M["water"])
    shade_smooth(water)
    box(f"{tag}_BordaN", (POOL_L + 0.3, 0.18, 0.06), (px, py + (UW - 0.25) / 2, 0.05), arch, M["ceramic"])
    box(f"{tag}_BordaS", (POOL_L + 0.3, 0.18, 0.06), (px, py - (UW - 0.25) / 2, 0.05), arch, M["ceramic"])
    box(f"{tag}_BordaE", (0.18, UW - 0.25, 0.06), (px + POOL_L / 2 + 0.06, py, 0.05), arch, M["ceramic"])
    box(f"{tag}_DegrauMolhado", (0.55, UW - 0.7, 0.28), (px - POOL_L / 2 + 0.38, py, -0.12), arch, M["tile"])
    if floor == 0:
        gx2 = o.x + ul + POOL_L + GRASS_L / 2 + 0.2
        box(f"{tag}_Grama", (GRASS_L, UW + 0.1, 0.06), (gx2, y_mid, 0.0), land, M["grass"])
    for i in range(7):
        viga = box(f"{tag}_Viga{i}", (ul - 0.4, 0.06, 0.08), (o.x + ul / 2, o.y + 0.35 + i * ((UW - 0.7) / 6), H - 0.08), arch, M["cane"])
        viga.hide_viewport = True
    return o, bx, by, bath_d, bath_w


def make_bed(tag, bed_x, bed_y, *, width=1.48, nightstand="outer", outer_sign=1):
    """Cama de casal com lençol claro visível de cima. Cabeceira a oeste."""
    length = 2.00
    box(f"{tag}_CamaBase", (length + 0.04, width + 0.04, 0.18), (bed_x, bed_y, 0.21), furn, M["wood"])
    box(f"{tag}_Colchao", (length, width, 0.16), (bed_x, bed_y, 0.38), furn, M["linen"])
    box(f"{tag}_PeCama", (0.42, width - 0.08, 0.03), (bed_x + length / 2 - 0.28, bed_y, 0.48), furn, M["linen_dark"])
    box(f"{tag}_Cabeceira", (0.07, width + 0.12, 0.68), (bed_x - length / 2 - 0.04, bed_y, 0.70), furn, M["cane"])
    for i in range(7):
        box(f"{tag}_Cana{i}", (0.03, width + 0.08, 0.035), (bed_x - length / 2 - 0.02, bed_y, 0.42 + i * 0.08), furn, M["cane"])
    for i, dy in enumerate((-width * 0.22, width * 0.22)):
        p = box(f"{tag}_Trav{i}", (0.38, 0.48, 0.12), (bed_x - length / 2 + 0.32, bed_y + dy, 0.54), furn, M["white"])
        shade_smooth(p)
    sides = (-1, 1) if nightstand == "both" else ((outer_sign,) if nightstand == "outer" else ())
    for i, s in enumerate(sides):
        ny = bed_y + s * (width / 2 + 0.22)
        box(f"{tag}_Criado{i}", (0.36, 0.36, 0.46), (bed_x - 0.55, ny, 0.29), furn, M["wood_light"])
        cyl(f"{tag}_Abajur{i}", 0.065, 0.02, (bed_x - 0.55, ny, 0.54), furn, M["ceramic"])
        cyl(f"{tag}_Cupula{i}", 0.10, 0.14, (bed_x - 0.55, ny, 0.64), furn, M["linen"])


def make_sofa(tag, lx, ly, face_sign):
    """face_sign: +1 encosto ao sul (olha para norte); -1 encosto ao norte."""
    box(f"{tag}_SofaBase", (2.05, 0.92, 0.36), (lx, ly, 0.30), furn, M["fabric"])
    box(f"{tag}_SofaEncosto", (2.05, 0.22, 0.48), (lx, ly - face_sign * 0.38, 0.62), furn, M["fabric"])
    box(f"{tag}_SofaBracoL", (0.16, 0.92, 0.42), (lx - 0.98, ly, 0.52), furn, M["fabric"])
    box(f"{tag}_SofaBracoR", (0.16, 0.92, 0.42), (lx + 0.98, ly, 0.52), furn, M["fabric"])
    for i, dx in enumerate((-0.58, 0.0, 0.58)):
        box(f"{tag}_Almofada{i}", (0.52, 0.38, 0.18), (lx + dx, ly + face_sign * 0.06, 0.56), furn, M["linen"] if i != 1 else M["cane"])
    rug_y = ly + face_sign * 0.72
    cyl(f"{tag}_TapeteSala", 0.78, 0.03, (lx, rug_y, 0.05), furn, M["rug"], verts=64)
    cyl(f"{tag}_MesaCentro", 0.32, 0.04, (lx, rug_y, 0.26), furn, M["wood"])
    cyl(f"{tag}_PeMesa", 0.045, 0.20, (lx, rug_y, 0.14), furn, M["wood"])


def make_bath_fixtures(tag, bx, by, bath_d, bath_w, *, shower=True):
    if shower:
        box(f"{tag}_BoxVidro", (0.02, min(0.95, bath_w - 0.18), 1.85), (bx + 0.62, by + bath_w * 0.48, 1.05), furn, M["glass"])
        cyl(f"{tag}_Ducha", 0.07, 0.02, (bx + 0.38, by + bath_w * 0.32, 1.85), furn, M["chrome"])
        cyl(f"{tag}_DuchaHaste", 0.01, 0.55, (bx + 0.38, by + bath_w * 0.32, 1.55), furn, M["chrome"])
    vaso = cyl(f"{tag}_Vaso", 0.17, 0.38, (bx + bath_d * 0.48, by + bath_w * 0.38, 0.26), furn, M["ceramic"])
    shade_smooth(vaso)
    box(f"{tag}_VasoCx", (0.14, 0.34, 0.26), (bx + bath_d * 0.48 - 0.16, by + bath_w * 0.38, 0.82), furn, M["ceramic"])
    box(f"{tag}_Pia", (0.44, 0.38, 0.08), (bx + bath_d - 0.38, by + bath_w * 0.62, 0.82), furn, M["ceramic"])
    box(f"{tag}_PiaGab", (0.40, 0.34, 0.70), (bx + bath_d - 0.38, by + bath_w * 0.62, 0.42), furn, M["wood_light"])
    cyl(f"{tag}_Cuba", 0.11, 0.05, (bx + bath_d - 0.38, by + bath_w * 0.62, 0.88), furn, M["ceramic"])
    cyl(f"{tag}_Torneira", 0.012, 0.15, (bx + bath_d - 0.38, by + bath_w * 0.72, 0.97), furn, M["chrome"])


def make_open_closet(tag, cx, cy, *, depth=0.42, width=1.08, open_dir="S"):
    """Guarda-roupa aberto com arara e roupas à mostra, como na planta."""
    dirs = {"S": (0, -1), "N": (0, 1), "E": (1, 0), "W": (-1, 0)}
    ox, oy = dirs[open_dir]
    if open_dir in ("S", "N"):
        box(f"{tag}_ArmarioFundo", (width, 0.04, 2.05), (cx, cy - oy * (depth / 2), 1.08), furn, M["wood"])
        box(f"{tag}_ArmarioL", (0.04, depth, 2.05), (cx - width / 2, cy, 1.08), furn, M["wood"])
        box(f"{tag}_ArmarioR", (0.04, depth, 2.05), (cx + width / 2, cy, 1.08), furn, M["wood"])
        box(f"{tag}_ArmarioTopo", (width, depth, 0.05), (cx, cy, 2.08), furn, M["wood"])
        box(f"{tag}_ArmarioGav", (width - 0.06, depth - 0.04, 0.38), (cx, cy, 0.25), furn, M["wood_light"])
        cyl(f"{tag}_Arara", 0.01, width - 0.16, (cx, cy + oy * 0.05, 1.72), furn, M["chrome"], rot=(0, math.pi / 2, 0))
        for i in range(6):
            rx = cx - width / 2 + 0.14 + i * ((width - 0.28) / 5)
            box(f"{tag}_Roupa{i}", (0.12, 0.24, 0.82), (rx, cy + oy * 0.18, 1.28), furn, M["linen"] if i % 2 == 0 else M["linen_dark"])
    else:
        box(f"{tag}_ArmarioFundo", (0.04, width, 2.05), (cx - ox * (depth / 2), cy, 1.08), furn, M["wood"])
        box(f"{tag}_ArmarioL", (depth, 0.04, 2.05), (cx, cy - width / 2, 1.08), furn, M["wood"])
        box(f"{tag}_ArmarioR", (depth, 0.04, 2.05), (cx, cy + width / 2, 1.08), furn, M["wood"])
        box(f"{tag}_ArmarioTopo", (depth, width, 0.05), (cx, cy, 2.08), furn, M["wood"])
        box(f"{tag}_ArmarioGav", (depth - 0.04, width - 0.06, 0.38), (cx, cy, 0.25), furn, M["wood_light"])
        cyl(f"{tag}_Arara", 0.01, width - 0.16, (cx + ox * 0.05, cy, 1.72), furn, M["chrome"], rot=(math.pi / 2, 0, 0))
        for i in range(6):
            ry = cy - width / 2 + 0.14 + i * ((width - 0.28) / 5)
            box(f"{tag}_Roupa{i}", (0.24, 0.12, 0.82), (cx + ox * 0.18, ry, 1.28), furn, M["linen"] if i % 2 == 0 else M["linen_dark"])


def make_kitchen(tag, kx, ky):
    box(f"{tag}_Bancada", (1.48, 0.56, 0.88), (kx, ky, 0.48), furn, M["wood"])
    box(f"{tag}_Tampo", (1.52, 0.60, 0.04), (kx, ky, 0.94), furn, M["ceramic"])
    box(f"{tag}_Cook", (0.52, 0.46, 0.03), (kx - 0.36, ky, 0.97), furn, M["black"])
    for i, (dx, dy) in enumerate(((-0.12, -0.1), (0.12, -0.1), (-0.12, 0.1), (0.12, 0.1))):
        cyl(f"{tag}_Boca{i}", 0.07, 0.01, (kx - 0.36 + dx, ky + dy, 0.99), furn, M["chrome"])
    box(f"{tag}_CubaCoz", (0.36, 0.30, 0.12), (kx + 0.40, ky, 0.90), furn, M["ceramic"])
    cyl(f"{tag}_TornCoz", 0.012, 0.22, (kx + 0.40, ky + 0.10, 1.08), furn, M["chrome"])


def make_gourmet(tag, tx, ty):
    cyl(f"{tag}_MesaGourmet", 0.58, 0.05, (tx, ty, 0.74), furn, M["wood"])
    cyl(f"{tag}_PeGourmet", 0.07, 0.70, (tx, ty, 0.37), furn, M["wood"])
    for i, ang in enumerate((0.55, 2.15, 3.70, 5.25)):
        cx_ = tx + math.cos(ang) * 0.74
        cy_ = ty + math.sin(ang) * 0.74
        box(f"{tag}_Cadeira{i}", (0.40, 0.40, 0.08), (cx_, cy_, 0.46), furn, M["cane"])
        box(f"{tag}_Encosto{i}", (0.40, 0.06, 0.40), (cx_ + math.cos(ang) * 0.15, cy_ + math.sin(ang) * 0.15, 0.68), furn, M["cane"])
        for j, (ox, oy) in enumerate(((-0.13, -0.13), (0.13, 0.13), (-0.13, 0.13), (0.13, -0.13))):
            cyl(f"{tag}_PeCad{i}{j}", 0.016, 0.42, (cx_ + ox, cy_ + oy, 0.23), furn, M["wood"])
    ico(f"{tag}_VasoMesa", 0.06, (tx, ty, 0.84), furn, M["leaf"], subdiv=2)


def build_furniture(which, o, bx, by, bath_d, bath_w, floor=0):
    tag = unit_tag(which, floor)
    z = x_zones(o, floor)
    y_mid = o.y + UW / 2
    inner_y = o.y + UW - 0.48 if which == 0 else o.y + 0.48
    sign = 1 if which == 0 else -1
    bed_x = (z["bed"][0] + z["bed"][1]) / 2 + 0.08

    if which == 1:
        make_bed(tag, bed_x, o.y + UW - 0.82, width=1.38, nightstand="outer", outer_sign=1)
        make_open_closet(tag, (z["closet"][0] + z["closet"][1]) / 2, o.y + UW - 0.58, depth=0.48, width=1.22, open_dir="S")
        make_sofa(tag, (z["live"][0] + z["live"][1]) / 2, o.y + UW - 0.62, face_sign=-1)
        make_bath_fixtures(tag, bx, by, bath_d, bath_w, shower=True)
        x2, y2, d2, w2 = wc2_box(o, floor)
        make_bath_fixtures(f"{tag}b", x2, y2, d2, w2, shower=False)
        ico(f"{tag}_PlantaSala", 0.11, (z["live"][1] - 0.2, o.y + UW * 0.42, 0.22), furn, M["leaf"], subdiv=2)
    else:
        make_bed(tag, bed_x, o.y + 1.05, width=1.55, nightstand="both", outer_sign=-1)
        make_open_closet(tag, (z["closet"][0] + z["closet"][1]) / 2 + 0.05, o.y + 0.78, depth=0.40, width=1.15, open_dir="E")
        make_sofa(tag, (z["live"][0] + z["live"][1]) / 2, o.y + 0.62, face_sign=1)
        make_bath_fixtures(tag, bx, by, bath_d, bath_w, shower=False)

    make_kitchen(tag, (z["kit"][0] + z["kit"][1]) / 2, inner_y)
    make_gourmet(tag, (z["gour"][0] + z["gour"][1]) / 2, y_mid + sign * 0.15)


def plant(name, loc, scale=1.0):
    stem = cyl(name + "_caule", 0.018 * scale, 0.55 * scale, (loc[0], loc[1], loc[2] + 0.28 * scale), land, M["wood"])
    crown = ico(name + "_copa", 0.32 * scale, (loc[0], loc[1], loc[2] + 0.62 * scale), land, M["leaf"] if hash(name) % 2 else M["leaf2"], subdiv=2)
    shade_smooth(crown)
    return stem, crown


def banana(name, loc):
    """Folha larga tipo bananeira."""
    box(name + "_caule", (0.06, 0.06, 1.15), (loc[0], loc[1], 0.57), land, M["wood"])
    for i, ang in enumerate((0.2, 1.1, 2.2, 3.4, 4.6)):
        leaf = box(name + f"_folha{i}", (0.85, 0.18, 0.03), (
            loc[0] + math.cos(ang) * 0.35,
            loc[1] + math.sin(ang) * 0.35,
            0.85 + (i % 3) * 0.12,
        ), land, M["leaf"])
        leaf.rotation_euler = Euler((0.35, 0.0, ang))


def build_landscape():
    for which in (0, 1):
        o = unit_origin(which)
        y_mid = o.y + UW / 2
        # garden plants
        banana(f"Bananeira{which}a", (o.x + 0.45, o.y + 0.55))
        banana(f"Bananeira{which}b", (o.x + 0.55, o.y + UW - 0.55))
        plant(f"Arbusto{which}a", (o.x + 0.7, y_mid, 0.0), 0.85)
        plant(f"Arbusto{which}b", (o.x + 0.35, y_mid + 0.7, 0.0), 0.55)
        # grass side plants
        gx = o.x + UL + POOL_L + 0.7
        banana(f"BananeiraL{which}", (gx, o.y + 0.45 if which == 0 else o.y + UW - 0.45))
        plant(f"ArbustoL{which}", (gx + 0.25, y_mid, 0.0), 0.7)
        # pedras no garden
        for i, (dx, dy) in enumerate(((0.25, 0.9), (0.9, 0.4), (0.55, 1.6))):
            ico(f"Pedra{which}{i}", 0.08 + i * 0.02, (o.x + dx, o.y + dy if which == 0 else o.y + UW - dy, 0.06), land, M["sand"], subdiv=1)


def build_stairs(floor=0):
    y0 = UW + GAP / 2
    ox = unit_origin(0, floor).x
    ul = unit_len(floor)
    x0 = ox + x_stair(floor)
    pref = f"{TAG_PREFIX}{'Sup' if floor else ''}"
    n = 11
    for i in range(n):
        box(f"{pref}Degrau{i}", (0.28, GAP - 0.35, 0.05), (x0 + 0.18 + i * 0.32, y0, 0.03 + i * 0.15), arch, M["wood"])
    box(f"{pref}PassarelaPiscina", (POOL_L + 0.4, GAP - 0.45, 0.05), (ox + ul + POOL_L / 2 + 0.1, y0, 0.04), arch, M["wood"])
    box(f"{pref}GuardaCorpoA", (3.6, 0.04, 0.85), (x0 + 1.7, y0 - (GAP / 2 - 0.22), 0.95), arch, M["wood"])
    box(f"{pref}GuardaCorpoB", (3.6, 0.04, 0.85), (x0 + 1.7, y0 + (GAP / 2 - 0.22), 0.95), arch, M["wood"])
    if floor == 0 and PLACE != "stack":
        box(f"{pref}GramaFundo", (GRASS_L + 0.2, UW * 2 + GAP + 0.4, 0.05), (ox + ul + POOL_L + GRASS_L / 2 + 0.25, y0, -0.02), land, M["grass"])
    elif floor == 1:
        box(f"{pref}BancoPiso", (0.42, 0.42, 0.42), (ox + ul + 0.55, y0, 0.27), furn, M["wood"])


def build_stack_stairs():
    """Escada única no vão, aberta, ligando térreo ao 1º — sem parede entre as piscinas."""
    y0 = UW + GAP / 2
    x0 = COMP_X + x_stair(0)
    run = X_KIT + X_GOUR - 0.15
    n = 16
    tread = run / n
    rise = Z_UP / n
    for i in range(n):
        box(f"C_DegrauVao{i}", (tread - 0.02, 0.92, 0.05), (x0 + (i + 0.5) * tread, y0, i * rise + 0.03), arch, M["wood"])
    # corrimãos finos, só na escada (não nas piscinas)
    box("C_CorrimaoA", (run, 0.04, 0.04), (x0 + run / 2, y0 - 0.50, Z_UP / 2 + 0.85), arch, M["wood"])
    box("C_CorrimaoB", (run, 0.04, 0.04), (x0 + run / 2, y0 + 0.50, Z_UP / 2 + 0.85), arch, M["wood"])
    for i in range(0, n, 3):
        box(f"C_PosteA{i}", (0.04, 0.04, 0.88), (x0 + i * tread, y0 - 0.50, i * rise + 0.46), arch, M["wood"])
        box(f"C_PosteB{i}", (0.04, 0.04, 0.88), (x0 + i * tread, y0 + 0.50, i * rise + 0.46), arch, M["wood"])
    # passarelas baixas entre as piscinas — só piso, sem parede
    box("C_PassarelaBaixo", (POOL_L + 0.15, 0.80, 0.05), (COMP_X + UL + POOL_L / 2 + 0.05, y0, 0.04), arch, M["wood"])
    box("C_PassarelaAlto", (POOL_L + 0.15, 0.80, 0.05), (COMP_X + UL + POOL_L / 2 + 0.05, y0, Z_UP + 0.04), arch, M["wood"])


def facade_stair(name, x, y_start, y_end, z0, z1, n=15):
    """Escada de fachada da referência: sobe ao longo da frente."""
    dy = (y_end - y_start) / n
    dz = (z1 - z0) / n
    for i in range(n):
        box(f"{name}_{i}", (1.08, abs(dy) + 0.05, 0.05), (x, y_start + dy * (i + 0.5), z0 + dz * i + 0.03), arch, M["wood"])
        if i % 2 == 0:
            box(f"{name}_p{i}", (0.04, 0.04, 0.92), (x - 0.50, y_start + dy * i, z0 + dz * i + 0.48), arch, M["wood"])
    box(f"{name}_rail", (0.04, abs(y_end - y_start), 0.05), (x - 0.50, (y_start + y_end) / 2, (z0 + z1) / 2 + 0.88), arch, M["wood"])


def hedge_row(name, x, y0, y1, step=0.52):
    i = 0
    y = y0
    while y < y1:
        box(f"{name}_{i}", (0.40, 0.46, 0.82), (x, y, 0.41), land, M["hedge"])
        y += step
        i += 1


def lounger(name, loc):
    x, y, z = loc
    box(f"{name}_base", (0.60, 1.80, 0.07), (x, y, z + 0.30), furn, M["linen"])
    box(f"{name}_enc", (0.60, 0.52, 0.07), (x, y - 0.70, z + 0.46), furn, M["linen"], rot=(0.42, 0, 0))
    for i, (dx, dy) in enumerate(((-0.22, -0.72), (0.22, -0.72), (-0.22, 0.72), (0.22, 0.72))):
        cyl(f"{name}_pe{i}", 0.018, 0.26, (x + dx, y + dy, z + 0.15), furn, M["chrome"])


def build_complete_envelope():
    y_tot = UW * 2 + GAP
    y_mid = y_tot / 2
    box("C_Cobertura", (UL_SUP + 0.75, y_tot + 0.58, 0.22), (COMP_X + X_GARDEN + UL_SUP / 2, y_mid, Z_UP + H + 0.11), arch, M["slab"])
    # varanda do 1º sobre o garden
    box("C_Varanda", (X_GARDEN + 0.40, y_tot + 0.28, 0.12), (COMP_X + X_GARDEN / 2, y_mid, Z_UP - 0.06), arch, M["slab"])
    box("C_GuardaVidro", (0.04, y_tot + 0.18, 1.08), (COMP_X - 0.10, y_mid, Z_UP + 0.54), arch, M["glass"])
    box("C_TrilhoGuarda", (0.05, y_tot + 0.18, 0.04), (COMP_X - 0.10, y_mid, Z_UP + 1.08), arch, M["chrome"])
    # lajes do meio só em cima de cada unidade — vão da escada fica aberto
    for which, yb in ((0, UW / 2), (1, UW + GAP + UW / 2)):
        box(f"C_LajeMeio{which}", (UL_SUP + 0.35, UW + 0.18, 0.18), (COMP_X + X_GARDEN + UL_SUP / 2, yb, Z_UP - 0.09), arch, M["slab"])
    # pilares só nos cantos externos (nada no vão das piscinas)
    for i, x in enumerate((COMP_X + X_GARDEN, COMP_X + X_GARDEN + UL_SUP * 0.5)):
        for j, y in enumerate((-0.10, y_tot + 0.10)):
            box(f"C_Pilar{i}{j}", (0.30, 0.30, Z_UP + H), (x, y, (Z_UP + H) / 2), arch, M["fachada"])
    for which in (0, 1):
        o = unit_origin(which, 1)
        box(f"C_Cortina{which}", (0.03, UW * 0.42, 1.75), (o.x + 0.10, o.y + UW / 2, Z_UP + 1.48), furn, M["curtain"])
    hedge_row("C_HedgeS", COMP_X - 0.58, 0.18, UW - 0.18)
    hedge_row("C_HedgeN", COMP_X - 0.58, UW + GAP + 0.18, y_tot - 0.18)
    box("C_DeckFrente", (3.6, y_tot + 2.4, 0.05), (COMP_X - 3.2, y_mid, -0.03), land, M["sand"])
    water = box("C_PiscinaComum", (2.5, y_tot + 1.6, 0.16), (COMP_X - 3.35, y_mid, -0.10), land, M["water"])
    shade_smooth(water)
    lounger("C_Chaise0", (COMP_X - 3.25, 1.15, 0.0))
    lounger("C_Chaise1", (COMP_X - 3.25, y_mid, 0.0))
    lounger("C_Chaise2", (COMP_X - 3.25, y_tot - 1.15, 0.0))
    plant("C_ArbustoL", (COMP_X - 5.1, -0.8, 0.0), 1.1)
    banana("C_BananeiraL", (COMP_X - 5.4, y_tot + 0.6))


def build_complete_building():
    global ZOFF, PLACE, TAG_PREFIX
    PLACE = "stack"
    TAG_PREFIX = "C"
    ZOFF = 0.0
    for which in (0, 1):
        o, bx, by, bath_d, bath_w = build_shell(which, 0)
        build_furniture(which, o, bx, by, bath_d, bath_w, 0)
    ZOFF = Z_UP
    for which in (0, 1):
        o, bx, by, bath_d, bath_w = build_shell(which, 1)
        build_furniture(which, o, bx, by, bath_d, bath_w, 1)
    ZOFF = 0.0
    build_stack_stairs()
    build_complete_envelope()
    PLACE = "plant"
    TAG_PREFIX = ""


def build_lights_camera():
    sun = D.lights.new("Sol", "SUN")
    sun.energy = 4.5
    sun.angle = math.radians(4)
    sun.color = (1.0, 0.95, 0.88)
    sun_ob = D.objects.new("Sol", sun)
    sun_ob.location = (6, -8, 12)
    sun_ob.rotation_euler = Euler((math.radians(48), math.radians(15), math.radians(35)))
    link(sun_ob, fx)

    world = D.worlds[0] if D.worlds else D.worlds.new("World")
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Color"].default_value = (0.55, 0.72, 0.88, 1)
    bg.inputs["Strength"].default_value = 0.85
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])

    for floor in (0, 1):
        for which in (0, 1):
            o = unit_origin(which, floor)
            y_mid = o.y + UW / 2
            ul = unit_len(floor)
            for i, t in enumerate((0.25, 0.55, 0.82)):
                light = D.lights.new(f"Area{floor}{which}{i}", "AREA")
                light.energy = 40
                light.size = 0.55
                light.color = (1.0, 0.93, 0.82)
                ob = D.objects.new(f"Area{floor}{which}{i}", light)
                ob.location = (o.x + ul * t, y_mid, H - 0.22)
                ob.rotation_euler = Euler((math.pi, 0, 0))
                link(ob, fx)

    cam_data = D.cameras.new("CamPlanta")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = 36.0
    cam_data.clip_end = 80
    cam = D.objects.new("CamPlanta", cam_data)
    total_y = UW * 2 + GAP
    total_x = SUP_OFF + UL_SUP + POOL_L + 1.2
    cam.location = (total_x / 2, total_y / 2, 18)
    cam.rotation_euler = Euler((0, 0, 0))
    link(cam, fx)
    scene.camera = cam

    cam2 = D.cameras.new("CamPerspectiva")
    cam2.lens = 32
    cam2.clip_end = 80
    p = D.objects.new("CamPerspectiva", cam2)
    p.location = (-5.2, -10.5, 8.0)
    p.rotation_euler = Euler((math.radians(62), 0, math.radians(-42)))
    link(p, fx)

    fach = D.cameras.new("CamFachada")
    fach.lens = 26
    fach.clip_end = 80
    fob = D.objects.new("CamFachada", fach)
    fob.location = (COMP_X - 13.5, (UW * 2 + GAP) / 2 - 5.5, 3.4)
    fob.rotation_euler = Euler((math.radians(80), 0, math.radians(-18)))
    link(fob, fx)

    pisc = D.cameras.new("CamPiscina")
    pisc.type = "ORTHO"
    pisc.ortho_scale = 14.5
    pisc.clip_end = 80
    pob = D.objects.new("CamPiscina", pisc)
    pob.location = (COMP_X + UL + POOL_L + 7.2, (UW * 2 + GAP) / 2, 3.6)
    pob.rotation_euler = Euler((math.radians(85.3), 0, math.radians(90)))
    link(pob, fx)

    view = D.cameras.new("CamInterior")
    view.lens = 28
    v = D.objects.new("CamInterior", view)
    o = unit_origin(1)
    v.location = (o.x + 1.6, o.y + 0.55, 1.45)
    v.rotation_euler = Euler((math.radians(82), 0, math.radians(18)))
    link(v, fx)


def labels():
    def text(name, body, loc, size=0.28):
        crv = D.curves.new(name, "FONT")
        crv.body = body
        crv.size = size
        crv.align_x = "CENTER"
        ob = D.objects.new(name, crv)
        ob.location = loc
        ob.rotation_euler = Euler((0, 0, 0))
        link(ob, fx)
        m = M["gold"]
        ob.data.materials.append(m)
        return ob

    o0 = unit_origin(0, 0)
    o1 = unit_origin(1, 0)
    s0 = unit_origin(0, 1)
    s1 = unit_origin(1, 1)
    text("LblT02", "TIPO 02   34 m²", (o0.x + 3.3, o0.y + UW / 2, 0.9), 0.22)
    text("LblT01", "TIPO 01   34 m²", (o1.x + 3.3, o1.y + UW / 2, 0.9), 0.22)
    text("LblT04", "TIPO 04   29 m²", (s0.x + 2.6, s0.y + UW / 2, 0.9), 0.22)
    text("LblT03", "TIPO 03   29 m²", (s1.x + 2.6, s1.y + UW / 2, 0.9), 0.22)
    text("LblTitulo", "SOPRO  ·  Térreo", (UL / 2 + 1.0, UW * 2 + GAP + 1.15, 0.2), 0.30)
    text("LblTituloSup", "SOPRO  ·  Superior", (SUP_OFF + UL_SUP / 2, UW * 2 + GAP + 1.15, 0.2), 0.30)
    text("LblBloco", "BLOCO COMPLETO  ·  Térreo + 1º andar", (COMP_X + UL / 2, UW * 2 + GAP + 1.15, 0.2), 0.30)


def main():
    for floor in (0, 1):
        for which in (0, 1):
            o, bx, by, bath_d, bath_w = build_shell(which, floor)
            build_furniture(which, o, bx, by, bath_d, bath_w, floor)
        build_stairs(floor)
    build_landscape()
    build_complete_building()
    build_lights_camera()
    labels()
    for ob in list(D.objects):
        if ob.type == "LIGHT":
            ob.hide_viewport = True
        ob.select_set(False)
    print("Sopro térreo+superior: objetos", len(D.objects), "materiais", len(D.materials))


main()
