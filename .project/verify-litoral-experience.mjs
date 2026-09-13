import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let tileRequests=0;page.on('request',r=>{if(r.url().includes('tile.openstreetmap.org'))tileRequests++;});
 await page.goto('http://localhost:4322/litoral',{waitUntil:'networkidle'});
 assert.equal(tileRequests,0);
 assert.equal(await page.locator('[data-coast-film]').getAttribute('src'),null);
 assert.equal(await page.locator('[data-coast-destination]').count(),4);
 for(const [id,name] of [['porto','Porto'],['muro','Muro'],['carneiros','Carneiros'],['tamandare','Tamandaré']]) {
  await page.locator('[data-coast-destination="'+id+'"]').click();
  assert.match(await page.locator('[data-destination-title]').textContent(),new RegExp(name));
  assert.match(await page.locator('[data-trip-image]').getAttribute('src'),new RegExp(id+'-real-'));
  assert.match(await page.locator('[data-trip-photo-credit]').textContent(),new RegExp(name));
  assert.match(await page.locator('[data-route-link]').getAttribute('href'),/google.*maps/);
 }
 await page.selectOption('#trip-profile','familia');await page.selectOption('#trip-nights','5');
 assert.match(await page.locator('[data-trip-summary]').textContent(),/5 noites/);
 await page.locator('#trip-daily').fill('0');assert(await page.locator('[data-trip-copy]').isDisabled());
 await page.locator('#trip-daily').fill('450');
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('Test denial'))},configurable:true}));
 await page.locator('[data-trip-copy]').click();
 assert(await page.locator('[data-trip-brief]').isVisible());
 assert.match(await page.locator('[data-trip-brief]').inputValue(),/Tamandaré/);
 await page.locator('[data-load-map]').click();await page.waitForSelector('.leaflet-marker-icon');
 assert.equal(await page.locator('.leaflet-marker-icon').count(),5);
 await page.waitForFunction(()=>/Amplie pelos controles|indisponível/.test(document.querySelector('[data-map-status]').textContent));
 console.log('Live map:',await page.locator('[data-map-status]').textContent());assert(tileRequests>0);
 await page.locator('[data-map-reset]').click();
 for(const width of [375,768,1440]) {
  await page.setViewportSize({width,height:950});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow at '+width);
  await page.locator('#temporada').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('[data-trip-image]').naturalWidth>0);
  await page.screenshot({path:'tmp/litoral-final-'+width+'-planner.png'});
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'tmp/litoral-final-'+width+'-hero.png'});
 }
 await page.locator('[data-play-film]').click();
 await page.waitForFunction(()=>document.querySelector('[data-coast-film]').currentTime>0);
 assert.match(await page.locator('[data-coast-film]').getAttribute('src'),/landscape/);
 assert.equal(await page.locator('[data-coast-film] track').getAttribute('src'),'/videos/litoral-landscape.vtt');
 assert.equal(await page.locator('[data-coast-film]').evaluate(v=>v.duration),22);
 const mobile=await browser.newPage({viewport:{width:375,height:812},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 mobile.on('pageerror',e=>errors.push(e.message));
 await mobile.goto('http://localhost:4322/litoral');
 await mobile.locator('[data-play-film]').click();
 await mobile.waitForFunction(()=>document.querySelector('[data-coast-film]').currentTime>0);
 assert.match(await mobile.locator('[data-coast-film]').getAttribute('src'),/portrait/);
 assert.equal(await mobile.locator('[data-coast-film]').evaluate(v=>v.videoWidth),720);
 await mobile.screenshot({path:'tmp/litoral-final-mobile-film.png'});
 const fallback=await browser.newPage();
 await fallback.route('https://tile.openstreetmap.org/**',r=>r.abort());
 await fallback.goto('http://localhost:4322/litoral');await fallback.locator('[data-load-map]').click();
 await fallback.locator('[data-map-retry]').waitFor({state:'visible'});
 assert.match(await fallback.locator('[data-map-status]').textContent(),/indisponível/);
 await fallback.unroute('https://tile.openstreetmap.org/**');
 await fallback.route('https://tile.openstreetmap.org/**',r=>r.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6Z1EAAAAASUVORK5CYII=','base64')}));
 await fallback.locator('[data-map-retry]').click();
 await fallback.waitForFunction(()=>document.querySelector('[data-map-status]').textContent.includes('Amplie pelos controles'));
 assert.equal(await fallback.locator('[data-map-retry]').isVisible(),false);
 assert.deepEqual(errors,[]);
 console.log('PASS real photos/credits, routes, budget, clipboard fallback, lazy map/retry, 3 breakpoints and both 22s films.');
} finally {await browser.close();}
