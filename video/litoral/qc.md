# Film QA — 2026-09-13

## Factual and asset checks

- Final compositions reference only the four `*-real-1280.webp` destination photographs. No AI-generated assets are used in either MP4.
- Porto de Galinhas and Muro Alto are explicitly named in their photographic cards. Carneiros and Tamandaré are identified in their scene credits.
- Photographer names and license identifiers are embedded in the film, with the CC BY 2.0 URL where applicable.
- The destination line is labelled as an editorial illustration, not a navigation route.
- No rates, inventory availability, distances, travel times or rental-property amenity claims are made.

## Visual review

- Eight Remotion stills rendered at frames 75, 270, 435 and 585, for landscape and portrait.
- Main headline, supporting text, labels, disclaimer and credits remain inside the frame.
- Portrait has a vertically arranged itinerary and stacked photographic cards; no cropped landscape UI.
- Text has a dark contrast overlay on photography and sufficient separation from credits.
- Motion is restrained crop/scale plus text rise and chapter crossfade; no generated or replaced landscape elements.

## Export verification

| File | Dimensions | Duration | Size |
|---|---|---|---|
| `public/videos/litoral-landscape.mp4` | 1280 × 720 | 22 s, 30 fps | 1,873,981 bytes |
| `public/videos/litoral-portrait.mp4` | 720 × 960 | 22 s, 30 fps | 1,480,877 bytes |

- Actual Remotion `renderMedia` exports, H.264, silent.
- Media metadata confirms HTML video playback and seeking support.
- MP4 atom verification confirms `moov` is before `mdat` in both outputs (fast start).
- Portuguese WebVTT text alternatives accompany each aspect ratio.
- Local compatible Chromium was installed automatically by Remotion for rendering. No runtime player dependencies are sent to the coastal page by these files.

Web playback, responsive source selection, keyboard operation and reduced-motion behavior belong to the page integration and are checked by the parent task's end-to-end tests.
