# Sopro — detailed cutaway models

## Source and scope

`sopro-ambientes.blend` contains the preserved exterior scene and two new scenes:
`Sopro Interior / Terreo` and `Sopro Interior / Superior`. Collections group architecture,
bedroom, living, bathroom, veranda, pool/garden and studio equipment. Meshes are joined
by room and material to keep the file organized without excessive web draw calls.

These are **interpretive commercial models, not measured architectural/BIM models**.
The official book establishes the room arrangement and major features, but does not
supply a complete set of executive dimensions or an as-built specification. The roof
is omitted and selected walls are lowered to expose the rooms. This is also explained
in the website interface.

| Model | Primary layout source | Visual references |
| --- | --- | --- |
| Ground, type 01 | `public/books/sopro.pdf`, page 35; `planta-terreo.webp` | `galeria-16.webp` bedroom/closet, `galeria-17.webp` living, `galeria-18.webp` gourmet balcony |
| Upper, type 03 | `public/books/sopro.pdf`, page 39; `planta-superior.webp` | The same official room perspectives guide ambiance, not an exact finish schedule |

Image filenames above live in `public/images/sopro/`. The plans contain paired units;
each detailed scene depicts **one** unit, not both halves. The exterior remains in
`public/models/sopro-v2.glb` and retains its existing source `sopro-v2.blend`.

Furniture dimensions, textiles, wood tones, shelves, hangers, bathroom fittings,
pool depth/edges and plant species are illustrative. No furniture-delivery promises,
technical dimensions or unverified leisure-room layouts were added. Bathroom details
use the plan as a location reference, not a nonexistent bathroom render.

## Web deliverables

| File in `public/models/` | Bytes | Meshes | Triangles before compression |
| --- | ---: | ---: | ---: |
| `sopro-terreo-detalhado.glb` | 1,051,648 | 61 | 75,112 |
| `sopro-superior-detalhado.glb` | 939,968 | 57 | 47,764 |

Each GLB contains only its active scene (not other Blender scenes). Geometry uses
Draco level 6. Packed generated textures travel with the model;
the browser needs no external texture URLs. Local decoder files are in
`public/vendor/draco/`, loaded on demand, with their Apache 2.0 license.
Only the explicitly opened scene is requested. The browser may cache prior scenes.

## Regeneration

Use **Blender MCP**, as requested by the project owner. With `sopro-v2.blend` open,
execute the contents of `scripts/blender_sopro_interiors.py` through the MCP
`execute_blender_code` tool. The script locates this project from the open blend,
creates two scenes without deleting existing scenes, saves this source file and
exports both compressed GLBs. Rerunning adds new scenes rather than deleting edits;
start from the exterior source to avoid duplicate interior scenes.

The script also renders inspection PNGs into ignored `tmp/sopro-interiors/`.
Do not replace geometry with guessed executive measurements. Obtain the architect's
source model/dimensioned plans before making exact-fidelity claims.

## Website and verification

- `src/data/sopro-explorer.ts`: scenes, point positions, explanatory copy and source links.
- `src/components/SoproExplorer.astro`: responsive viewer, toolbar and information panel.
- `src/scripts/sopro-explorer.ts`: lazy loading, decoder, selection, cameras and retry.
- `.project/verify-sopro-explorer.mjs`: desktop/mobile loading and interaction checks.

Blender coordinates `(x,y,z)` become glTF `(x,z,-y)`. Point coordinates are therefore
expressed in glTF space. Run the verifier with `SOPRO_TEST_ALL_MODELS=1` to cover both
actual interior GLBs in addition to the exterior and error-handling paths.
