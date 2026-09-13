import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const dir='.impeccable/review';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const checks=[];
for(const width of [1440,390]){
 await page.setViewportSize({width,height:width===1440?1000:844});
 for(const [name,path] of [['home','/'],['catalog','/imoveis'],['detail','/imovel/la-fleur-polinesia'],['sopro','/sopro'],['litoral','/litoral'],['admin','/admin'],['form','/admin/novo']]){
  await page.goto('http://localhost:4322'+path);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(300);
  await page.evaluate(()=>document.querySelectorAll('img').forEach(image=>image.loading='eager'));
  await page.waitForFunction(()=>[...document.images].every(image=>image.complete),{timeout:5000}).catch(()=>{});
  const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}));
  checks.push({width,path,...state});
  await page.screenshot({path:`${dir}/${name}-${width}.png`,fullPage:true});
 }
}
await page.goto('http://localhost:4322/imoveis');const initialCardCount=await page.locator('.property-card:visible').count();
await page.goto('http://localhost:4322/imoveis?tipo=locacao');if(await page.locator('.property-card:visible').count()!==1)throw Error('Rental filter');
await page.locator('input[name=local]').fill('inexistente');await page.locator('#filters').evaluate(f=>f.requestSubmit());if(!await page.locator('#empty').isVisible())throw Error('Empty filter');await page.locator('#clear').click();if(await page.locator('.property-card:visible').count()!==initialCardCount)throw Error('Clear filter');
await page.goto('http://localhost:4322/imovel/la-fleur-polinesia');for(const tab of ['video','book','tour','fotos']){await page.locator('#tab-'+tab).click();if(!await page.locator('#panel-'+tab).isVisible())throw Error('Media tab '+tab)}
await page.locator('#gallery-inline').click();if(!await page.locator('#gallery').isVisible())throw Error('Gallery');await page.locator('#gallery-close').click();
await page.goto('http://localhost:4322/litoral');await page.locator('.coast-investment-fold > summary').click();const before=await page.locator('#net-month').textContent();await page.locator('#daily').fill('900');await page.locator('#daily').dispatchEvent('input');if(before===await page.locator('#net-month').textContent())throw Error('Simulation update');
await page.locator('.chat-fab').click();await page.locator('[data-chat-prompt="Quero investir no litoral"]').click();if(!await page.locator('.message a[href="/litoral"]').isVisible())throw Error('Guided assistant');await page.locator('[data-chat-close]').click();
await page.goto('http://localhost:4322/admin/novo?editar=amura-carneiros');if(await page.locator('[name=name]').inputValue()!=='Amura Carneiros')throw Error('Edit form');await page.locator('#property-form button[type],#property-form button.btn').click();if(!(await page.locator('#save-status').textContent()).includes('Nenhum dado'))throw Error('Demo save');
await page.goto('http://localhost:4322/');if(await page.getByRole('link',{name:/Jairo Rocha Imóveis.*40.*anos/i}).count()!==1)throw Error('Brand accessible name');await page.locator('#menu-toggle').click();if(!await page.locator('#main-nav').isVisible())throw Error('Mobile menu');
await browser.close();await writeFile(`${dir}/checks.json`,JSON.stringify({checks,errors,flows:'filters, empty, reset, media tabs, gallery, simulation, guided assistant, edit, demo save, mobile menu: passed'},null,2));console.log(JSON.stringify({checks,errors}));if(checks.some(c=>c.overflow||c.broken.length)||errors.length)process.exitCode=1;
