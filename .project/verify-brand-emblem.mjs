import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({channel: 'chrome', headless: true, args: ['--enable-unsafe-swiftshader']});
const url = process.env.BRAND_TEST_URL || 'http://localhost:4322/';
try {
  const desktop = await browser.newPage({viewport: {width: 1440, height: 1000}});
  const errors = [];
  desktop.on('pageerror', error => errors.push(error.message));
  await desktop.goto(url, {waitUntil: 'networkidle'});
  assert.equal(await desktop.locator('[data-brand-emblem]').count(), 1, 'Home provides the brand emblem');
  await desktop.waitForFunction(() => document.querySelector('[data-brand-emblem]').dataset.brandState === 'ready');
  assert.equal(await desktop.locator('[data-brand-canvas]').getAttribute('aria-hidden'), 'true');
  await desktop.getByRole('button', {name: 'Pausar giro 3D', exact: true}).click();
  assert.equal(await desktop.locator('[data-brand-emblem]').getAttribute('data-brand-state'), 'paused');
  const paused = await desktop.locator('[data-brand-canvas]').screenshot();
  await desktop.waitForTimeout(250);
  assert.deepEqual(await desktop.locator('[data-brand-canvas]').screenshot(), paused, 'Paused geometry does not move');
  await desktop.getByRole('button', {name: 'Retomar giro 3D', exact: true}).click();
  await desktop.waitForTimeout(300);
  assert.notDeepEqual(await desktop.locator('[data-brand-canvas]').screenshot(), paused, 'Resumed geometry moves');
  await desktop.emulateMedia({reducedMotion: 'reduce'});
  await desktop.waitForFunction(() => document.querySelector('[data-brand-emblem]').dataset.brandState === 'paused');
  await desktop.emulateMedia({reducedMotion: 'no-preference'});
  assert.equal(await desktop.locator('[data-brand-emblem]').getAttribute('data-brand-state'), 'paused', 'Preference changes do not override a pause');

  for (const options of [
    {viewport: {width: 375, height: 812}, isMobile: true, hasTouch: true},
    {viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'},
  ]) {
    const page = await browser.newPage(options);
    await page.goto(url, {waitUntil: 'networkidle'});
    assert.equal(await page.locator('[data-brand-emblem]').getAttribute('data-brand-state'), 'fallback');
    assert.equal(await page.locator('[data-brand-canvas]').count(), 0, 'No WebGL renderer before opt-in');
    assert(await page.locator('[data-brand-fallback]').isVisible());
    const button = page.getByRole('button', {name: 'Ativar símbolo 3D', exact: true});
    assert((await button.boundingBox()).height >= 44);
    await button.click();
    await page.waitForFunction(() => ['ready', 'paused'].includes(document.querySelector('[data-brand-emblem]').dataset.brandState));
    if (options.reducedMotion) assert.equal(await page.locator('[data-brand-emblem]').getAttribute('data-brand-state'), 'paused', 'Reduced-motion opt-in shows a static 3D emblem');
    await page.close();
  }

  const fallback = await browser.newPage({viewport: {width: 375, height: 812}});
  await fallback.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      return type === 'webgl' || type === 'webgl2' ? null : getContext.call(this, type, ...args);
    };
  });
  await fallback.goto(url, {waitUntil: 'networkidle'});
  await fallback.getByRole('button', {name: 'Ativar símbolo 3D', exact: true}).click();
  await fallback.waitForFunction(() => document.querySelector('[data-brand-emblem]').dataset.brandState === 'error');
  assert(await fallback.locator('[data-brand-fallback]').isVisible());
  assert(await fallback.getByRole('button', {name: 'Tentar símbolo 3D novamente', exact: true}).isVisible());
  assert.deepEqual(errors, []);
  console.log('PASS emblem: desktop rotation/pause, preference changes, mobile/reduced-motion opt-in, WebGL fallback.');
} finally {
  await browser.close();
}
