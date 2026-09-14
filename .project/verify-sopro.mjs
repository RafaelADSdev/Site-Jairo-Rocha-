import { chromium } from 'playwright';

// User journeys covered by this focused verification:
// 1. As a buyer, I can compare the official ground-floor and upper-floor plans.
// 2. As a visitor, I choose when the 3D model downloads and see loading feedback.
// 3. As a visitor on an unreliable connection, I get a useful fallback and can retry.
// 4. As a mobile visitor, I receive responsive Sopro images instead of desktop originals.
// 5. As a buyer, I can move through guided exterior, ground-floor and upper-floor 3D views.

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

  await page.close();
  // Expanded 3D journeys are covered in verify-sopro-explorer.mjs.


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

  console.log(JSON.stringify({ typologies: 2, threeD: 'covered by verify-sopro-explorer.mjs', responsiveImages: imageState.count }));
} finally {
  await browser.close();
}
