import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4322/');
 assert.equal(await page.locator('[data-home-opening]').count(),1,'New homepage opening exists');
 assert.equal(await page.locator('h1').count(),1);
 assert.match(await page.locator('h1').textContent(),/Seu lugar em Pernambuco/);
 await page.locator('[data-home-feature="sopro"]').click();
 assert.match(await page.locator('h1').textContent(),/Sopro/);
 assert.equal(await page.locator('[data-home-feature-link]').getAttribute('href'),'/sopro');
 assert.match(await page.locator('[data-home-photo-note]').textContent(),/Perspectiva/);
 await page.locator('[data-home-feature="litoral"]').click();
 assert.equal(await page.locator('[data-home-invest]').getAttribute('href'),'/litoral#investir');
 await page.locator('[data-home-intent="locacao"]').click();
 assert.equal(await page.locator('#home-type').inputValue(),'locacao');
 assert.match(await page.locator('[data-home-price-label]').textContent(),/mensal/);
 await page.locator('[data-home-submit]').click();
 await page.waitForURL('**/imoveis?**');
 assert.equal(await page.locator('.property-card:visible').count(),1);
 await page.goto('http://localhost:4322/');
 await page.locator('[data-home-submit]').click();await page.waitForURL('**/imoveis?**');
 assert.equal(await page.locator('.property-card[data-category="locacao"]:visible').count(),0);
 assert((await page.locator('.property-card:visible').count())>1);
 await page.goto('http://localhost:4322/');
 for(const width of [375,768,1440]) {
  await page.setViewportSize({width,height:900});
  await page.evaluate(()=>scrollTo(0,0));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow '+width);
  assert.equal(await page.locator('#place-home').evaluate(el=>getComputedStyle(el).fontSize),'16px');
  await page.screenshot({path:'tmp/home-opening-'+width+'.png',fullPage:false});
 }
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:375,height:900}});
 await nojs.goto('http://localhost:4322/');
 assert(await nojs.locator('h1').isVisible());
 assert(await nojs.locator('[data-home-submit]').isVisible());
 assert.equal(await nojs.locator('#home-type').inputValue(),'venda');
 await nojs.setViewportSize({width:1440,height:1000});
 assert(await nojs.locator('#home-type').isVisible(),'Desktop filters available without JS');
 assert(await nojs.locator('#home-price').isDisabled(),'No mismatched purchase/rental prices without JS');
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS homepage: manual features, purchase/rent routing, investor link, no-JS, 3 widths.');
} finally {await browser.close();}
