# Litoral — verification, 2026-09-13

- Unit command: `node --experimental-strip-types --test --experimental-test-coverage .project/litoral-trip.test.mjs`. 5/5 pass; planner library 100% lines, branches and functions (not whole-site coverage).
- `node .project/verify-litoral-experience.mjs`: pass. Actual OSM map and five markers; deliberate tile outage/retry; real photos linked to destination and credit; invalid budget; denied clipboard fallback; 375/768/1440 px with no overflow; both 22 s movies play; no JS errors.
- `node .project/verify.mjs`: pass across seven pages at 1440/390 px with no broken images, overflow or page errors. Existing filters, gallery, investment calculator, guided assistant and demo admin flows preserved.
- `npm run build`: 14 pages pass. Existing large lazy 3D chunk warning remains. `npm audit --omit=dev`: zero known vulnerabilities.
- Visual review: mobile hero/planner and desktop whole page, film stills in both formats by film agent and final portrait scene by main agent. Long mobile select fixed after screenshot inspection.
- Claivor detector: 22 advisory color and 3 advisory radius findings, no blocking finding. Base coastal tokens documented in DESIGN.md; overlays/hover tones intentionally scoped to the coastal chapter. Not a Lighthouse accessibility certification. Base white/burgundy and ink/soft contrast approximately 11.83:1 and 13.89:1 respectively.
- No map tile requests before activation; no film request before play. Real photos and captions preserved in both film formats. Superseded AI drafts excluded from public/.
- Local only, no deploy/push. Obsidian MCP unavailable, external sync not claimed.
