import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto('http://localhost:4322/litoral',{waitUntil:'networkidle'});
 assert.equal(await page.locator('[data-coast-destination]').count(),4,'Four interactive coastal destinations must exist');
 await page.locator('[data-coast-destination="carneiros"]').click();
 assert.match(await page.locator('[data-destination-title]').textContent(),/Carneiros/);
 assert.match(await page.locator('[data-route-link]').getAttribute('href'),/google.*maps/);
 assert.equal(await page.locator('#trip-profile').count(),1,'Seasonal trip builder exists');
 await page.selectOption('#trip-profile','familia');
 await page.selectOption('#trip-nights','5');
 assert.match(await page.locator('[data-trip-summary]').textContent(),/5 noites/);
 assert.equal(await page.locator('[data-coast-film]').count(),1,'Remotion film available');
 for(const width of [375,768,1440]) {
  await page.setViewportSize({width,height:950});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No overflow at ${width}`);
 }
 console.log('PASS litoral destination, routes, seasonal planner, film and responsive layout');
} finally {await browser.close();}
