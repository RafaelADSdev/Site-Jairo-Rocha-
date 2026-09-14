import {chromium} from 'playwright';
import assert from 'node:assert/strict';

// Headless Chrome may disable WebGL after repeated parallel browser runs.
// SwiftShader makes model-viewer readiness deterministic in local and CI checks.
const browser = await chromium.launch({channel: 'chrome', headless: true, args: ['--enable-unsafe-swiftshader']});
const base = process.env.SOPRO_TEST_URL || 'http://localhost:4322/sopro';
try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const requests = [];
  page.on('request', request => { if (request.url().includes('/models/')) requests.push(request.url()); });
  await page.goto(base, {waitUntil:'networkidle'});
  await page.locator('#modelo').scrollIntoViewIfNeeded();
  assert.equal(requests.length, 0, '3D downloads only after explicit open');
  await page.locator('[data-explorer-scene="terreo"]').click();
  assert.equal(requests.length, 0, 'Scene selection remains lightweight');
  assert.equal(await page.locator('[data-scene-title]').textContent(), 'Térreo com garden');
  await page.locator('[data-explorer-points] button').nth(2).click();
  assert.equal(await page.locator('[data-point-title]').textContent(), 'Banheiro');
  assert.match(await page.locator('[data-scene-book]').getAttribute('href'), /#page=35$/);
  await page.locator('[data-explorer-scene="terreo"]').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#sopro-viewer').getAttribute('data-scene'), 'superior');
  assert.equal(await page.locator('[data-explorer-scene="superior"]').getAttribute('aria-selected'), 'true');
  await page.locator('[data-explorer-scene="bloco"]').click();
  await page.route('**/models/sopro-v2.glb*', route => route.abort());
  await page.locator('#sopro-model-load').click();
  await page.waitForSelector('#sopro-viewer[data-model-state="error"]', {timeout:60000});
  assert(await page.locator('#sopro-model-retry').isVisible(), 'Useful retry after failed request');
  assert(await page.locator('[data-scene-plan]').isVisible(), 'Official plan remains available on error');
  await page.unroute('**/models/sopro-v2.glb*');
  await page.locator('#sopro-model-retry').click();
  await page.waitForSelector('#sopro-viewer[data-model-state="ready"]', {timeout:60000});
  assert.equal(await page.locator('.sx-hotspot').count(), 6, 'All six annotations exist on model');
  await page.locator('[data-explorer-points] button').nth(4).click();
  assert.equal(await page.locator('.sx-hotspot[aria-pressed="true"]').textContent(), '05');
  await page.locator('[data-explorer-top]').click();
  assert.equal(await page.locator('[data-explorer-top]').getAttribute('aria-pressed'), 'true');
  await page.locator('[data-explorer-reset]').click();
  assert.equal(await page.locator('[data-explorer-top]').getAttribute('aria-pressed'), 'false');
  await page.waitForTimeout(650);
  await page.locator('#modelo').screenshot({style: '.site-header,.skip{visibility:hidden!important}', path:'tmp/sopro-explorer-desktop.png'});

  // Delay a scene, select another, then release the old response: stale events must not restore it.
  await page.route('**/models/sopro-terreo-detalhado.glb', async route => { await new Promise(resolve => setTimeout(resolve, 1800)); await route.continue(); });
  await page.locator('[data-explorer-scene="terreo"]').click();
  await page.locator('#sopro-model-load').click();
  await page.locator('[data-explorer-scene="superior"]').click();
  await page.waitForTimeout(2100);
  assert.equal(await page.locator('#sopro-viewer').getAttribute('data-scene'), 'superior');
  assert.equal(await page.locator('#sopro-viewer').getAttribute('data-model-state'), 'idle');
  assert.equal(await page.locator('#sopro-model').count(), 0, 'Cancelled model cannot appear in another scene');
  await page.unroute('**/models/sopro-terreo-detalhado.glb');

  // Full asset validation can run once the Blender export has completed.
  if (process.env.SOPRO_TEST_ALL_MODELS === '1') {
    for (const id of ['terreo', 'superior']) {
      await page.locator(`[data-explorer-scene="${id}"]`).click();
      await page.locator('#sopro-model-load').click();
      await page.waitForSelector('#sopro-viewer[data-model-state="ready"]', {timeout:60000});
      assert.match(await page.locator('#sopro-model').getAttribute('src'), new RegExp(`sopro-${id}-detalhado`));
      await page.waitForTimeout(650);
      await page.locator('#modelo').screenshot({style: '.site-header,.skip{visibility:hidden!important}', path:`tmp/sopro-explorer-${id}.png`});
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.locator('[data-explorer-scene="bloco"]').click();
  await page.locator('#sopro-model-load').click();
  await page.waitForSelector('#sopro-viewer[data-model-state="ready"]', {timeout:60000});
  const canvas = await page.locator('.sx-canvas').boundingBox();
  const controls = await page.locator('.sx-toolbar').boundingBox();
  const detail = await page.locator('.sx-details').boundingBox();
  assert(controls.y >= canvas.y + canvas.height - 1, 'Mobile controls do not occlude the scene');
  assert(detail.y >= controls.y + controls.height, 'Mobile details sit below canvas and controls');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal mobile overflow');
  await page.waitForTimeout(650);
  await page.locator('#modelo').screenshot({style: '.site-header,.skip{visibility:hidden!important}', path:'tmp/sopro-explorer-mobile.png'});
  if (process.env.SOPRO_TEST_ALL_MODELS === '1') {
    for (const id of ['terreo', 'superior']) {
      await page.locator(`[data-explorer-scene="${id}"]`).click();
      await page.locator('#sopro-model-load').click();
      await page.waitForSelector('#sopro-viewer[data-model-state="ready"]', {timeout:60000});
      assert.equal(await page.locator('.sx-hotspot').count(), 7);
      await page.locator('[data-explorer-points] button').last().click();
      assert.equal(await page.locator('[data-point-title]').textContent(), 'Armário e apoio');
      await page.locator('[data-explorer-focus]').click();
      assert.equal(await page.locator('#sopro-model').getAttribute('camera-target'), '2.95m 1.5m -1.2m');
      await page.locator('[data-explorer-reset]').click();
      await page.waitForTimeout(650);
      await page.locator('#modelo').screenshot({style: '.site-header,.skip{visibility:hidden!important}', path:`tmp/sopro-explorer-mobile-${id}.png`});
    }
  }
  console.log('PASS: lazy loading, scene keyboard, point details, source links, error/retry, annotations, camera controls, cancelled-load race and mobile layout.');
} finally { await browser.close(); }
