"""Detailed interpretive cutaways of book type 01 and type 03. Run through Blender MCP.

The official plans define arrangement, not executive measurements. Roofs and selected
walls are cut for viewing. Decorative details interpret supplied official renders.
Creates dedicated scenes and never clears the existing exterior block scene.
"""
import bpy
import math
import json
import random
from pathlib import Path
from mathutils import Vector

ROOT = Path(bpy.data.filepath).parent
if ROOT.name == 'blender':
    ROOT = ROOT.parent.parent
assert (ROOT / 'public/books/sopro.pdf').exists(), 'Open the project Sopro blend before running.'
OUT = ROOT / 'public/models'
PREVIEWS = ROOT / 'tmp/sopro-interiors'
PREVIEWS.mkdir(parents=True, exist_ok=True)
SOURCE_OUT = ROOT / 'assets/blender'
SOURCE_OUT.mkdir(parents=True, exist_ok=True)
random.seed(73)
active_group = 'Architecture'
scene = None
groups = {}


def group(name):
    global active_group
    active_group = name
    if name not in groups:
        coll = bpy.data.collections.new(f'{scene.name} / {name}')
        scene.collection.children.link(coll)
        groups[name] = coll


def finish(obj, name, mat=None):
    obj.name = name
    for coll in list(obj.users_collection):
        coll.objects.unlink(obj)
    groups[active_group].objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    return obj


def cube(name, pos, size, mat, bevel=.015, rotation=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = bpy.context.object
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if rotation:
        obj.rotation_euler = rotation
    finish(obj, name, mat)
    if bevel:
        mod = obj.modifiers.new('Soft crafted edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        bpy.ops.object.modifier_apply(modifier=mod.name)
        mod = obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj


def cyl(name, pos, radius, depth, mat, vertices=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=pos)
    obj = finish(bpy.context.object, name, mat)
    for p in obj.data.polygons:
        p.use_smooth = len(p.vertices) == 4
    return obj


def sphere(name, pos, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, location=pos)
    obj = finish(bpy.context.object, name, mat)
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


def rod(name, start, end, radius, mat):
    vec = Vector(end) - Vector(start)
    obj = cyl(name, (Vector(start)+Vector(end))/2, radius, vec.length, mat, 10)
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = vec.to_track_quat('Z','Y')
    return obj


def ring(name, pos, radius, tube, mat, scale=(1,1,1)):
    bpy.ops.mesh.primitive_torus_add(major_segments=32, minor_segments=8, location=pos, major_radius=radius, minor_radius=tube)
    obj = finish(bpy.context.object,name,mat)
    obj.scale = scale
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


def mat(name, rgb, rough=.6, metal=0, alpha=1, texture=None):
    m = bpy.data.materials.new('INT / '+name)
    m.diffuse_color = (*rgb,alpha)
    m.use_nodes = True
    nodes=m.node_tree.nodes
    bs = next((n for n in nodes if n.type=='BSDF_PRINCIPLED'),None)
    if bs is None:
        bs=nodes.new('ShaderNodeBsdfPrincipled')
        output=nodes.new('ShaderNodeOutputMaterial')
        m.node_tree.links.new(bs.outputs['BSDF'],output.inputs['Surface'])
    bs.inputs['Base Color'].default_value = (*rgb,alpha)
    bs.inputs['Roughness'].default_value = rough
    bs.inputs['Metallic'].default_value = metal
    bs.inputs['Alpha'].default_value = alpha
    if alpha < 1:
        m.surface_render_method = 'DITHERED'
        bs.inputs['IOR'].default_value=1.45
    if texture:
        # Small deterministic material textures are packed in GLB for consistent
        # appearance in model-viewer; no external asset services are required.
        size=256
        im=bpy.data.images.new('Sopro material '+texture,width=size,height=size)
        pixels=[]
        for y in range(size):
            for x in range(size):
                a=x/size; b=y/size
                noise=random.random()-.5
                if texture=='wood':
                    wave=math.sin(180*b+6*math.sin(a*9)+2*math.sin(a*27))
                    shade=.84+.12*wave+.05*noise
                elif texture=='linen':
                    shade=.9+.045*math.sin(x*math.pi/2)+.045*math.sin(y*math.pi/2)+noise*.1
                elif texture=='rattan':
                    shade=.76+.18*(math.sin(x*math.pi/5)*math.sin(y*math.pi/5))+.06*noise
                elif texture=='water':
                    v=abs(math.sin(a*28+math.cos(b*23)*2)*math.cos(b*31+math.sin(a*15)))
                    shade=.70+(.42 if v<.12 else .15*v)
                else:
                    shade=.89+.07*noise+.04*math.sin(a*22+b*17)
                pixels.extend([min(1,c*shade) for c in rgb]+[1])
        im.pixels.foreach_set(pixels)
        im.pack()
        tex=m.node_tree.nodes.new('ShaderNodeTexImage')
        tex.image=im
        m.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
    return m


stone=mat('Limestone',(0.76,.71,.61),texture='stone')
plaster=mat('Warm plaster',(.82,.79,.71),.92)
wood=mat('Natural timber',(.46,.27,.13),texture='wood')
rattan=mat('Woven cane',(.66,.47,.25),texture='rattan')
linen=mat('Natural linen',(.87,.82,.71),texture='linen')
clay=mat('Terracotta bedding',(.40,.25,.17),texture='linen')
cream=mat('Porcelain',(.91,.9,.84),.22)
black=mat('Dark fixtures',(.045,.05,.045),.3,.45)
metal=mat('Brushed steel',(.53,.56,.53),.25,.8)
glass=mat('Clear glass',(.65,.82,.82),.1,alpha=.19)
tile=mat('Turquoise pool tile',(.085,.36,.34),.25)
water=mat('Water surface',(.12,.66,.64),.15,texture='water')
green=mat('Tropical foliage',(.13,.33,.13),.9)
greenlight=mat('Young foliage',(.31,.44,.13),.9)
soil=mat('Soil',(.14,.095,.05),.98)
lawn=mat('Garden lawn',(.30,.39,.16),.98)
light=mat('Warm lamp diffuser',(1,.79,.39),.7)
bs=next(n for n in light.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
bs.inputs['Emission Color'].default_value=(1,.65,.2,1)
bs.inputs['Emission Strength'].default_value=.5


def plant(name,x,y,z=0,scale=1,pot=True):
    if pot:
        cyl(name+' ceramic pot',(x,y,z+.17*scale),.18*scale,.34*scale,stone)
        cyl(name+' earth',(x,y,z+.34*scale),.16*scale,.015,soil)
        z+=.33*scale
    for i in range(9):
        angle=i*math.tau/9
        height=(.45+random.random()*.4)*scale
        end=(x+math.cos(angle)*.33*scale,y+math.sin(angle)*.33*scale,z+height)
        rod(name+' stem',(x,y,z),end,.012*scale,green)
        leaf=sphere(name+' leaf',end,(.115*scale,.035*scale,.32*scale),green if i%2 else greenlight)
        leaf.rotation_euler=(math.sin(angle)*.55,math.cos(angle)*.55,angle)


def lamp(name,x,y,z):
    cyl(name+' diffuser',(x,y,z),.10,.26,light)
    for i in range(16):
        a=i*math.tau/16
        rod(name+' weave',(x+.12*math.cos(a),y+.12*math.sin(a),z-.15),(x+.12*math.cos(a+.14),y+.12*math.sin(a+.14),z+.15),.008,rattan)
    ring(name+' rim',(x,y,z+.15),.12,.009,wood)
    ring(name+' rim',(x,y,z-.15),.12,.009,wood)


def bedroom():
    group('01 Bedroom and linen')
    cube('Bedroom rug',(1.42,1.42,.065),(2.26,2.72,.025),linen,.01)
    cube('Timber bed frame',(1.42,1.35,.24),(1.76,2.10,.22),wood,.035)
    for x in (.78,2.06):
        for y in (.53,2.14):
            cube('Bed foot',(x,y,.12),(.12,.12,.24),wood)
    cube('Soft mattress',(1.42,1.35,.43),(1.64,2.00,.25),linen,.09)
    cube('Folded duvet',(1.42,1.70,.60),(1.69,1.29,.12),clay,.055)
    cube('Duvet folded edge',(1.42,1.13,.68),(1.67,.18,.08),clay,.035)
    cube('Timber headboard',(1.42,.25,.92),(1.88,.09,1.22),wood,.02)
    cube('Cane headboard infill',(1.42,.307,1.09),(1.72,.018,.68),rattan,.01)
    for x in (1.00,1.83):
        pillow=cube('Linen pillow',(x,.65,.67),(.72,.47,.19),linen,.085)
        pillow.rotation_euler[0]=.12
    for x in (.28,2.58):
        cyl('Bedside table',(x,.65,.48),.20,.055,wood)
        lamp('Bedside woven lamp',x,.30,1.35)
        cyl('Ceramic cup',(x,.65,.55),.042,.095,cream)
    group('02 Open closet')
    for y in (.30,2.14):
        for x in (2.80,3.10):
            cube('Closet upright',(x,y,1.22),(.055,.055,2.36),wood,.008)
    for z in (.16,.61,2.28):
        cube('Open closet shelf',(2.95,1.22,z),(.40,1.94,.055),wood,.008)
    rod('Hanging rail',(2.95,.38,1.95),(2.95,2.05,1.95),.017,black)
    for i,y in enumerate((.60,.84,1.08,1.32)):
        rod('Hanger',(2.95,y,1.92),(2.79,y,1.78),.007,wood)
        rod('Hanger',(2.79,y,1.78),(3.11,y,1.78),.007,wood)
        rod('Hanger',(3.11,y,1.78),(2.95,y,1.92),.007,wood)
        cube('Hanging linen garment',(2.95,y,1.38),(.37,.06,.77),linen if i%2 else clay,.03)
    for i in range(3):
        cube('Folded towels',(2.94,1.70,.67+i*.075),(.33,.42,.065),linen,.025)
    cube('Woven storage basket',(2.95,1.45,2.42),(.34,.55,.22),rattan,.035)


def living():
    group('03 Living furniture')
    cyl('Round woven rug',(4.32,1.18,.067),1.05,.018,rattan,64)
    for x in (3.54,5.12):
        for y in (.28,.92):
            cube('Sofa timber leg',(x,y,.17),(.06,.06,.3),wood,.006)
    cube('Sofa platform',(4.32,.65,.32),(1.88,.92,.11),wood,.03)
    for x in (3.86,4.78):
        cube('Seat cushion',(x,.72,.49),(.89,.80,.23),linen,.095)
        cube('Back cushion',(x,.26,.81),(.88,.24,.67),linen,.07,rotation=(.1,0,0))
    for x in (3.38,5.26):
        cube('Sofa arm',(x,.65,.63),(.12,.90,.38),linen,.045)
    cube('Throw cushion',(3.73,.51,.84),(.4,.17,.38),clay,.06,rotation=(.2,.14,0))
    group('04 Media and decorative objects')
    cube('Media cabinet',(4.47,2.70,.39),(1.76,.40,.66),wood,.02)
    for x in (3.92,4.49,5.03):
        cube('Cane cabinet door',(x,2.483,.39),(.50,.016,.49),rattan,.008)
        sphere('Cabinet handle',(x+.17,2.456,.41),(.019,.023,.019),metal)
    cube('Television',(4.48,2.84,1.25),(1.24,.045,.73),black,.018)
    cube('Screen inset',(4.48,2.813,1.25),(1.17,.006,.65),mat('Screen reflection',(.10,.15,.16),.15),.007)
    for x in (4.10,4.83):
        rod('TV foot',(x,2.83,.93),(x-.1,2.67,.76),.013,black)
    for i in range(3):
        cube('Stacked book',(3.82,2.70,.76+i*.035),(.23,.19,.03),linen if i%2 else clay,.003)
    plant('Living plant',5.20,2.60,.75,.32)
    lamp('Living sconce',4.3,.12,1.86)
    group('05 Glass partition')
    for y in (.10,1.45,2.86):
        cube('Sliding door mullion',(5.59,y,1.23),(.045,.045,2.40),wood,.005)
    cube('Sliding door rail',(5.59,1.5,.07),(.10,2.90,.045),metal,.004)
    # Sliding panel partially open; clear passage from studio to veranda.
    cube('Sliding glazing',(5.59,.75,1.25),(.025,1.32,2.3),glass,.003)
    cube('Sliding door pull',(5.65,1.34,1.17),(.04,.025,.30),metal,.007)


def bathroom():
    group('06 Bathroom fixtures')
    cube('Bathroom floor',(1.30,3.78,.08),(2.6,1.45,.07),stone,.01)
    for x in (.12,2.59):
        cube('Bathroom cutaway side',(x,3.78,.61),(.10,1.54,1.12),plaster,.01)
    cube('Bathroom cutaway rear',(1.35,4.52,.61),(2.58,.10,1.12),plaster,.01)
    cube('Bathroom entry wall',(1.0,3.02,.61),(1.78,.10,1.12),plaster,.01)
    # Door opening at x1.95..2.50 is intentionally unobstructed.
    cube('Door leaf open',(2.54,3.38,.60),(.045,.65,1.1),wood,.01)
    cube('Shower tray',(.57,3.8,.13),(.91,1.24,.12),cream,.01)
    cube('Shower glass',(.99,3.8,.96),(.022,1.22,1.6),glass,.002)
    rod('Shower riser',(.28,4.45,.65),(.28,4.45,1.91),.014,metal)
    rod('Shower arm',(.28,4.45,1.91),(.28,4.17,1.91),.014,metal)
    cyl('Rain shower',(.28,4.11,1.90),.12,.024,metal)
    cyl('Shower drain',(.54,4.17,.20),.035,.008,metal)
    sphere('WC pedestal',(1.45,4.03,.29),(.22,.28,.25),cream)
    sphere('WC bowl',(1.45,3.95,.48),(.26,.35,.14),cream)
    ring('WC seat',(1.45,3.9,.58),.20,.035,cream,(1,1.30,1))
    cube('WC tank',(1.45,4.33,.59),(.43,.18,.57),cream,.045)
    cube('Flush button',(1.45,4.33,.88),(.07,.04,.008),metal,.009)
    cube('Vanity timber base',(2.17,4.20,.43),(.55,.5,.75),wood,.025)
    cube('Vanity stone top',(2.17,4.20,.85),(.61,.57,.07),stone,.01)
    # Basin constructed with separate rim and recessed interior.
    cube('Basin bottom',(2.17,4.18,.9),(.38,.33,.045),cream,.015)
    for dx,dy,w,d in ((-.20,0,.045,.4),(.20,0,.045,.4),(0,-.18,.4,.045),(0,.18,.4,.045)):
        cube('Basin rim',(2.17+dx,4.18+dy,.96),(w,d,.13),cream,.012)
    rod('Basin tap',(2.17,4.43,.9),(2.17,4.43,1.18),.016,metal)
    rod('Basin spout',(2.17,4.43,1.18),(2.17,4.28,1.18),.016,metal)
    cube('Vanity mirror',(2.17,4.455,1.55),(.50,.022,.75),metal,.02)
    cube('Folded bath towel',(1.90,3.35,.16),(.2,.34,.08),linen,.025)


def chair(name,x,y,angle):
    # Local chair frame and woven back follow the official terrace rendering.
    def pt(a,b,c):
        return (x+a*math.cos(angle)-b*math.sin(angle), y+a*math.sin(angle)+b*math.cos(angle), c)
    for a in (-.18,.18):
        for b in (-.18,.18):
            rod(name+' leg',pt(a*1.12,b*1.12,.08),pt(a,b,.52),.025,wood)
    seat=cube(name+' cushion',(x,y,.54),(.44,.43,.10),linen,.045)
    seat.rotation_euler[2]=angle
    rod(name+' back rail',pt(-.23,.23,.91),pt(.23,.23,.91),.026,wood)
    for a in (-.23,.23):
        rod(name+' back upright',pt(a,.21,.45),pt(a,.23,.91),.024,wood)
    for i in range(7):
        a=-.21+i*.07
        rod(name+' woven back',pt(a,.225,.59),pt(min(.22,a+.1),.225,.89),.009,rattan)
        rod(name+' cross weave',pt(a,.224,.89),pt(min(.22,a+.1),.224,.59),.009,rattan)


def veranda(upper):
    group('07 Gourmet veranda')
    end=7.30 if upper else 8.0
    cube('Terrace limestone',( (5.6+end)/2,1.5,.075),(end-5.6,3,.10),stone,.015)
    cx=6.37 if upper else 6.66
    cyl('Dining table top',(cx,1.17,.83),.48,.075,wood,48)
    cyl('Dining table pedestal',(cx,1.17,.44),.065,.73,black)
    cyl('Dining table base',(cx,1.17,.09),.26,.025,black)
    for i,a in enumerate((0,2.1,4.2)):
        chair('Dining chair '+str(i),cx+.72*math.cos(a),1.17+.72*math.sin(a),a-math.pi/2)
    plant('Dining centerpiece',cx,1.17,.87,.20)
    length=end-5.85
    counterx=5.85+length/2
    cube('Gourmet base',(counterx,2.68,.50),(length,.58,.90),wood,.018)
    cube('Stone counter',(counterx,2.68,.99),(length+.08,.66,.085),stone,.012)
    for i in range(3):
        doorx=5.85+(i+.5)*length/3
        cube('Cabinet inset door',(doorx,2.378,.48),(length/3-.025,.025,.76),wood,.004)
        cube('Cabinet recessed grip',(doorx,2.358,.80),(.10,.018,.012),black,.003)
    sinkx=6.1
    cube('Sink recessed bowl',(sinkx,2.68,1.037),(.38,.36,.025),metal,.035)
    cube('Sink dark well',(sinkx,2.68,1.053),(.29,.28,.008),black,.025)
    rod('Gooseneck tap',(sinkx,2.94,1.03),(sinkx,2.94,1.35),.015,metal)
    rod('Tap spout',(sinkx,2.94,1.35),(sinkx,2.74,1.35),.015,metal)
    cookx=end-.43
    cube('Black cooktop',(cookx,2.67,1.05),(.52,.43,.025),black,.016)
    for dx in (-.12,.12):
        ring('Cooktop burner',(cookx+dx,2.67,1.07),.07,.008,metal)
    cube('Cutting board',(counterx,2.94,1.28),(.22,.033,.40),wood,.027,rotation=(.06,0,0))
    lamp('Terrace wall light',end-.20,.08,1.88)
    # One low cut wall exposes the worktop in dollhouse view.
    cube('Terrace cutaway parapet',(counterx,3.06,.51),(length+.15,.12,.93),plaster,.015)


def pool_and_garden(upper):
    group('08 Pool basin and water')
    x0=7.3 if upper else 8.0
    x1=9.0 if upper else 10.8
    y0=0 if upper else 1.0
    y1=3.0
    cx=(x0+x1)/2; cy=(y0+y1)/2
    cube('Pool structural basin',(cx,cy,-.26),(x1-x0,y1-y0,.55),tile,.015)
    # Coping, steps and patterned water show the private pool explicitly.
    for pos,size in [((x0,cy,.16),(.12,y1-y0+.12,.17)),((x1,cy,.16),(.12,y1-y0+.12,.17)),((cx,y0,.16),(x1-x0,.12,.17)),((cx,y1,.16),(x1-x0,.12,.17))]:
        cube('Pool coping',pos,size,stone,.018)
    verts=[]; faces=[]; nx=45; ny=30
    for j in range(ny+1):
        for i in range(nx+1):
            x=x0+.08+(x1-x0-.16)*i/nx
            y=y0+.08+(y1-y0-.16)*j/ny
            verts.append((x,y,.08+.009*math.sin(x*15+y*9)+.005*math.cos(y*22)))
    for j in range(ny):
        for i in range(nx):
            a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
    mesh=bpy.data.meshes.new('Water ripples mesh');mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new('Private pool rippled surface',mesh);groups[active_group].objects.link(obj);obj.data.materials.append(water)
    uv=mesh.uv_layers.new(name='UVMap')
    for poly in mesh.polygons:
        poly.use_smooth=True
        for loop in poly.loop_indices:
            v=mesh.vertices[mesh.loops[loop].vertex_index].co
            uv.data[loop].uv=((v.x-x0)/(x1-x0),(v.y-y0)/(y1-y0))
    for i in range(2):
        cube('Pool entry step',(x0+.2+i*.22,cy,.025-i*.06),(.30,y1-y0-.25,.10),tile,.01)
    if upper:
        cube('Pool outer glazing',(x1+.03,cy,.63),(.025,y1-y0,1.05),glass,.003)
        for y in (y0,y1):
            rod('Pool glazing post',(x1+.03,y,.16),(x1+.03,y,1.15),.018,metal)
    else:
        group('09 Garden and planting')
        cube('Private lawn',(9.56,.42,.055),(3.12,.82,.08),lawn,.04)
        cube('Garden side strip',(11.02,1.60,.055),(.45,2.55,.08),lawn,.02)
        cube('Rear planted garden',(-.8,1.5,.035),(1.55,3.0,.10),soil,.04)
        for i in range(5):
            plant('Rear tropical planting',-.8,.3+i*.55,.08,.8,pot=False)
        for i in range(6):
            plant('Garden hedge',10.97,.2+i*.53,.10,.42,pot=False)
        for i in range(7):
            cyl('Garden timber edging',(8.1+i*.47,-.06,.30),.065,.6,wood,12)
        for i in range(12):
            cyl('Rear garden timber screen',(-1.52,.1+i*.25,.74),.05,1.50,wood,10)
        for i in range(3):
            cube('Garden stepping stone',(8.2+i*.50,.44,.115),(.38,.44,.055),stone,.015)


def architecture(upper):
    group('00 Cutaway architecture')
    end=9.0 if upper else 11.3
    cube('Studio slab',(2.8,1.5,-.10),(5.65,3.08,.28),plaster,.015)
    cube('Bathroom slab',(1.32,3.77,-.10),(2.74,1.52,.28),plaster,.015)
    cube('Terrace structural slab',((5.6+end)/2,1.5,-.18),(end-5.6,3.10,.23),plaster,.015)
    # Continuous rear wall and cut front let both side-to-side flow and fittings read.
    cube('Rear wall',(2.8,-.075,1.30),(5.72,.15,2.70),plaster,.02)
    cube('Terrace rear wall',(6.50,-.075,1.0),(1.80,.15,2.10),plaster,.02)
    cube('Front wall cut',(4.08,3.045,.32),(2.92,.12,.64),plaster,.01)
    # Bedroom window to the garden (left edge of the official floor plan).
    for y in (.08,1.50,2.92):
        cube('Garden window timber frame',(-.03,y,1.32),(.085,.055,2.65),wood,.005)
    cube('Garden window lintel',(-.03,1.50,2.64),(.085,2.91,.07),wood,.005)
    cube('Garden window sill',(-.03,1.50,.10),(.1,2.91,.07),wood,.005)
    cube('Garden window glass',(-.035,1.50,1.35),(.015,2.8,2.46),glass,.001)
    # Fine tiling with real joints visible under zoom.
    for x in range(7):
        for y in range(4):
            cube('Limestone floor tile',(.4+x*.8,.375+y*.75,.05),(.795,.745,.035),stone,.002)
    cube('Rear skirting',(2.8,.015,.11),(5.6,.025,.14),wood,.005)


def setup(name):
    global scene,groups
    scene=bpy.data.scenes.new('Sopro Interior / '+name)
    scene['sopro_generated']=True
    bpy.context.window.scene=scene
    groups={}
    scene.unit_settings.system='METRIC'
    scene.render.engine='BLENDER_EEVEE'
    scene.render.resolution_x=1600
    scene.render.resolution_y=1000
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG'
    scene.world=bpy.data.worlds.new(name+' daylight')
    scene.world.use_nodes=True
    nodes=scene.world.node_tree.nodes
    bg=next((n for n in nodes if n.type=='BACKGROUND'),None)
    if bg is None:
        bg=nodes.new('ShaderNodeBackground')
        output=nodes.new('ShaderNodeOutputWorld')
        scene.world.node_tree.links.new(bg.outputs['Background'],output.inputs['Surface'])
    bg.inputs[0].default_value=(.72,.78,.82,1)
    bg.inputs[1].default_value=.65
    scene.view_settings.view_transform='AgX'


def camera_at(pos,target,ortho=15):
    group('99 Studio lights and camera')
    bpy.ops.object.camera_add(location=pos)
    cam=finish(bpy.context.object,'Dollhouse camera')
    cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.data.type='ORTHO';cam.data.ortho_scale=ortho
    scene.camera=cam
    return cam


def optimize():
    # Join objects by room AND material. Room identity remains inspectable in
    # Blender while draw calls stay low on mobile. Modifiers already applied.
    for name,coll in list(groups.items()):
        mats={}
        for obj in list(coll.objects):
            if obj.type=='MESH':
                key=obj.data.materials[0].name if obj.data.materials else 'None'
                mats.setdefault(key,[]).append(obj)
        for key,objects in mats.items():
            bpy.ops.object.select_all(action='DESELECT')
            for obj in objects:obj.select_set(True)
            bpy.context.view_layer.objects.active=objects[0]
            if len(objects)>1:bpy.ops.object.join()
            objects[0].name=name+' | '+key
    bpy.ops.object.select_all(action='DESELECT')


def build(upper):
    label='Superior' if upper else 'Terreo'
    slug='sopro-superior-detalhado' if upper else 'sopro-terreo-detalhado'
    setup(label)
    architecture(upper);bedroom();living();bathroom();veranda(upper);pool_and_garden(upper)
    scene['source_plan']='public/images/sopro/planta-superior.webp' if upper else 'public/images/sopro/planta-terreo.webp'
    scene['source_book_page']=39 if upper else 35
    scene['source_type']='03' if upper else '01'
    scene['fidelity']='Interpretive cutaway: plan arrangement retained; dimensions, decor and material specifications inferred from commercial renders. Not an executive project.'
    scene['cutaway']='Roof omitted; front and bathroom walls lowered for inspection.'
    optimize()
    for obj in scene.objects:
        if obj.type=='MESH':obj.select_set(True)
    glb=OUT/(slug+'.glb')
    bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',use_selection=True,use_active_scene=True,export_apply=True,export_cameras=False,export_lights=False,export_yup=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6)
    bpy.ops.object.select_all(action='DESELECT')
    cam=camera_at((12,15,15),(4.4,1.4,.3),15 if not upper else 13.7)
    for loc,energy,size in [((3,3,12),1800,8),((8,-3,8),1100,7),((-3,4,6),750,6)]:
        bpy.ops.object.light_add(type='AREA', location=loc)
        ob=finish(bpy.context.object,'Soft daylight')
        ob.data.energy=energy;ob.data.shape='DISK';ob.data.size=size
        ob.rotation_euler=(Vector((4,1,0))-ob.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(PREVIEWS/(slug+'.png'))
    bpy.ops.render.render(write_still=True)
    bpy.ops.object.select_all(action='DESELECT')
    for area in bpy.context.screen.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.region_3d.view_perspective='CAMERA'
    tris=0
    for obj in scene.objects:
        if obj.type=='MESH':
            obj.data.calc_loop_triangles();tris+=len(obj.data.loop_triangles)
    return {'name':slug,'glb_bytes':glb.stat().st_size,'meshes':sum(o.type=='MESH' for o in scene.objects),'triangles':tris,'preview':scene.render.filepath}


report=[build(False),build(True)]
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE_OUT/'sopro-ambientes.blend'))
print('SOPRO_INTERIORS_RESULT '+json.dumps(report))
