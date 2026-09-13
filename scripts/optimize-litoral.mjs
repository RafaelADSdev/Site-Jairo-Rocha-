import sharp from 'sharp';
import {existsSync, mkdirSync} from 'node:fs';
mkdirSync('public/images/litoral-experience',{recursive:true});
for(const stem of ['porto-real','muro-real','carneiros-real','tamandare-real','coast-hero']) {
 const input=`assets/litoral/photos/${stem==='coast-hero'?'porto-real':stem}.jpg`;
 if(!existsSync(input)) continue;
 for(const width of [480,768,1280,1600]) {
  const result=await sharp(input).resize({width}).webp({quality:82,effort:5}).toFile(`public/images/litoral-experience/${stem}-${width}.webp`);
  console.log(`${stem}-${width}: ${result.size} bytes`);
 }
}
