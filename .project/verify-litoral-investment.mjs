import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4322/litoral');
 assert.equal(await page.locator('[data-investor]').count(),1,'Evidence-backed investor experience exists');
 for(const destination of ['porto','muro','carneiros','tamandare']) {
  await page.selectOption('#investor-destination',destination);
  assert.equal(await page.locator('[data-purchase-offer]:visible').count(),3);
  assert.equal(await page.locator('[data-rental-offer]:visible').count(),2);
 }
 await page.locator('[data-scenario="conservative"]').click();
 assert.match(await page.locator('[data-investor-output="annualResult"]').textContent(),/767,25/);
 assert.match(await page.locator('[data-result-status]').textContent(),/negativo/i);
 await page.locator('[data-scenario="intermediate"]').click();
 assert.match(await page.locator('[data-investor-output="annualResult"]').textContent(),/13\.317,19/);
 await page.locator('#daily').fill('0');
 assert(await page.locator('[data-investor-results]').isHidden());
 assert(await page.locator('[data-investor-copy]').isDisabled());
 await page.locator('#daily').fill('325');
 assert(await page.locator('[data-investor-results]').isVisible());
 await page.locator('#daily').fill('10');
 assert.match(await page.locator('[data-break-even]').textContent(),/não cobre/i);
 await page.locator('[data-scenario="intermediate"]').click();
 await page.locator('[data-investor-costs] > summary').click();
 await page.locator('#inv-blockedNights').fill('365');
 assert.match(await page.locator('[data-break-even]').textContent(),/nenhuma noite/i);
 await page.locator('#inv-blockedNights').fill('0');
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('denied'))},configurable:true}));
 await page.locator('[data-investor-copy]').click();
 assert(await page.locator('[data-investor-brief]').isVisible());
 assert.match(await page.locator('[data-investor-brief]').inputValue(),/antes de IR/);
 for(const width of [375,768,1440]) {
  await page.setViewportSize({width,height:950});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow '+width);
  await page.locator('#investir').scrollIntoViewIfNeeded();
  await page.screenshot({path:'tmp/litoral-investor-'+width+'.png'});
  await page.locator('#simulador').scrollIntoViewIfNeeded();
  await page.screenshot({path:'tmp/litoral-investor-calculator-'+width+'.png'});
 }
 const staticPage=await browser.newPage({javaScriptEnabled:false});
 await staticPage.goto('http://localhost:4322/litoral');
 assert.equal(await staticPage.locator('[data-purchase-offer]').count(),12);
 assert(await staticPage.locator('[data-investor-noscript]').isVisible());
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('Investor E2E passed: 4 destinations, financial states, fallback, no-JS, 3 widths.');
} finally {await browser.close();}
