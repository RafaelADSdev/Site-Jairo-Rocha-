import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia, renderStill} from '@remotion/renderer';
import {existsSync, mkdirSync, statSync} from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = ['carneiros-real-1280.webp', 'porto-real-1280.webp', 'muro-real-1280.webp', 'tamandare-real-1280.webp'];
for (const image of required) {
  const file = path.join(root, 'public/images/litoral-experience', image);
  if (!existsSync(file)) throw new Error(`Missing approved film asset: ${file}`);
}
const previewOnly = process.argv.includes('--stills');
mkdirSync(path.join(root, 'public/videos'), {recursive: true});
mkdirSync(path.join(root, 'tmp/litoral-film'), {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'video/litoral/index.tsx'), publicDir: path.join(root, 'public')});
const compositions = await getCompositions(serveUrl);
for (const composition of compositions) {
  const format = composition.id === 'LitoralLandscape' ? 'landscape' : 'portrait';
  for (const frame of [75, 270, 435, 585]) {
    await renderStill({serveUrl, composition, output: path.join(root, `tmp/litoral-film/${format}-${frame}.png`), frame});
  }
  if (previewOnly) continue;
  const outputLocation = path.join(root, `public/videos/litoral-${format}.mp4`);
  await renderMedia({serveUrl, composition, codec: 'h264', crf: 25, pixelFormat: 'yuv420p', outputLocation, concurrency: 3, onProgress: ({progress}) => {if (Math.round(progress * 100) % 20 === 0) process.stdout.write('.');}});
  console.log(`\n${format}: ${composition.width}x${composition.height}, ${composition.durationInFrames / composition.fps}s, ${(statSync(outputLocation).size / 1e6).toFixed(2)} MB`);
}
