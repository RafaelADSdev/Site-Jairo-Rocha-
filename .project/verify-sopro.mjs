import { chromium } from 'playwright';

// User journeys covered by this focused verification:
// 1. As a buyer, I can compare the official ground-floor and upper-floor plans.
// 2. As a visitor, I choose when the 3D model downloads and see loading feedback.
// 3. As a visitor on an unreliable connection, I get a useful fallback and can retry.
// 4. As a mobile visitor, I receive responsive Sopro images instead of desktop originals.

const url = 'http://localhost:4322/sopro';
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const modelRequests = [];
  page.on('request', (request) => {
    if (request.url().endsWith('/models/sopro.glb')) modelRequests.push(request.url());
  });

  await page.goto(url, { waitUntil: 'networkidle' });

  const typeCards = page.locator('[data-sopro-type]');
  assert(await typeCards.count() === 2, 'Sopro typology comparison should show two official options');
  assert(await typeCards.nth(0).getByRole('heading', { name: 'Térreo com garden', exact: true }).isVisible(), 'Ground-floor typology label');
  assert(await typeCards.nth(1).getByRole('heading', { name: 'Superior', exact: true }).isVisible(), 'Upper-floor typology label');
  assert(await typeCards.nth(0).getByText(/34 m²/i).isVisible(), 'Ground-floor area from the official book');
  assert(await typeCards.nth(1).getByText(/29 m²/i).isVisible(), 'Upper-floor area from the official book');
  assert(await typeCards.locator('img').count() === 2, 'Both typologies should include an official floor plan');

  await page.locator('#modelo').scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  assert(modelRequests.length === 0, 'The GLB must not download before explicit interaction');
  assert(await page.locator('#sopro-model-load').isVisible(), '3D cover action should be visible');

  await page.route('**/models/sopro.glb', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 450));
    await route.continue();
  });
  await page.locator('#sopro-model-load').click();
  await page.waitForSelector('[data-model-state="loading"]');
  assert(await page.locator('.sopro-model-loading').isVisible(), '3D loading feedback should remain visible while downloading');
  await page.waitForSelector('[data-model-state="ready"]', { timeout: 15_000 });
  assert(modelRequests.length === 1, 'The GLB should download once after the visitor asks for 3D');
  assert(await page.locator('model-viewer').isVisible(), 'Loaded 3D viewer should become visible');
  await page.close();

  const fallbackPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await fallbackPage.route('**/models/sopro.glb', (route) => route.abort('failed'));
  await fallbackPage.goto(url, { waitUntil: 'networkidle' });
  await fallbackPage.locator('#modelo').scrollIntoViewIfNeeded();
  await fallbackPage.locator('#sopro-model-load').click();
  await fallbackPage.waitForSelector('[data-model-state="error"]', { timeout: 15_000 });
  assert(await fallbackPage.getByRole('alert').isVisible(), '3D fallback should be announced as an alert');
  assert(await fallbackPage.getByRole('button', { name: /tentar novamente/i }).isVisible(), '3D fallback should offer retry');
  assert(await fallbackPage.getByRole('link', { name: /ver a implantação/i }).isVisible(), '3D fallback should preserve a useful non-3D path');
  await fallbackPage.close();

  const imagePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await imagePage.goto(url, { waitUntil: 'networkidle' });
  const documentHeight = await imagePage.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < documentHeight; y += 580) {
    await imagePage.evaluate((top) => scrollTo(0, top), y);
    await imagePage.waitForTimeout(60);
  }
  await imagePage.waitForFunction(() =>
    [...document.querySelectorAll('[data-sopro-responsive]')]
      .every((image) => image.complete && image.naturalWidth > 0),
    { timeout: 15_000 }
  );
  const imageState = await imagePage.locator('[data-sopro-responsive]').evaluateAll((images) => ({
    count: images.length,
    missingSrcset: images.filter((image) => !image.srcset).map((image) => image.src),
    unoptimized: images.filter((image) => !image.currentSrc.includes('/images/sopro/optimized/')).map((image) => image.currentSrc),
  }));
  assert(imageState.count >= 30, 'All meaningful Sopro photography should use the responsive image pipeline');
  assert(imageState.missingSrcset.length === 0, `Images without srcset: ${imageState.missingSrcset.join(', ')}`);
  assert(imageState.unoptimized.length === 0, `Mobile selected original images: ${imageState.unoptimized.join(', ')}`);
  await imagePage.close();

  console.log(JSON.stringify({ typologies: 2, threeD: 'idle -> loading -> ready; error fallback', responsiveImages: imageState.count }));
} finally {
  await browser.close();
}
