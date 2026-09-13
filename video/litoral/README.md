# Viva o litoral — Remotion source

Actual React/Remotion compositions, rendered to static H.264 files. No Remotion or React player runtime is required on the coastal page.

- `LitoralLandscape`: 1280 × 720, 30 fps, 22 seconds.
- `LitoralPortrait`: 720 × 960, 30 fps, 22 seconds; independently composed typography and stacked images, not a cropped landscape video.
- Silent editorial film: all meaning is visible in the composition. Matching WebVTT captions are in `public/videos/`.
- Manrope fonts are bundled locally from the existing `@fontsource/manrope` dependency.
- Images: four actual destination photographs in `public/images/litoral-experience/`, named `porto-real-1280.webp`, `muro-real-1280.webp`, `carneiros-real-1280.webp` and `tamandare-real-1280.webp`. AI drafts were superseded by the user's request for real local beaches and are not used in these compositions. Source/author/license details are recorded with the page's destination assets. These are beach photographs, not photographs of available rental inventory or verified property amenities.
- The chapter connecting four destination names is explicitly an editorial sequence, not GPS directions. Actual route links belong to the page map.
- No prices, availability, promised travel times or guaranteed property amenities are asserted.

## Reproduce

From the repository root, after dependencies and the four real destination assets are present:

```sh
node scripts/render-litoral.mjs --stills
node scripts/render-litoral.mjs
npx remotion studio video/litoral/index.tsx
```

Stills: `tmp/litoral-film/`, at frames 75, 270, 435 and 585 for both aspect ratios. Films: `public/videos/litoral-landscape.mp4` and `public/videos/litoral-portrait.mp4`. The renderer uses CRF 25, yuv420p and H.264 for broad browser compatibility.

Primary API references: [renderMedia](https://www.remotion.dev/docs/renderer/render-media), [renderStill](https://www.remotion.dev/docs/renderer/render-still), [bundle](https://www.remotion.dev/docs/bundler/bundle), [Composition](https://www.remotion.dev/docs/composition).

## Photograph credits

Credits are burned into each chapter so they travel with the MP4, not only with the website. Source file links and asset provenance are recorded in `assets/litoral/README.md` at the repository root.

| Destination | Photographer/source | Status |
|---|---|---|
| Porto de Galinhas | Bruno Lima / MTur, Wikimedia Commons | Public Domain Mark (PDM) |
| Muro Alto | Bruno Lima / MTur, Wikimedia Commons | Public Domain Mark (PDM) |
| Carneiros | Vi Neves, Wikimedia Commons | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Tamandaré | Joao Vicente, Wikimedia Commons | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |

Changes made to the source photographs: responsive cropping, slow animated crop/scale and dark overlays for typographic contrast. No landscape element was generated, replaced or added.
