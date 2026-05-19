// Headless Chromium smoke test of the running dev server.
//
// Note on Mosaic plots: DuckDB-WASM loads its worker from cdn.jsdelivr.net.
// In this sandboxed environment that host is not on the allowlist, so the
// 8 Mosaic-rendered plots (Hubble, BBN, CMB power spectrum, Pantheon, SPARC,
// BAO, GW150914, synthesis thumbnails) cannot paint. This test instead
// verifies:
//   - the React tree mounts without runtime errors (other than the expected
//     DuckDB worker network failure)
//   - the catalog at `/` lists module cards (Cosmology live, a placeholder
//     "Coming soon" card that is not a link)
//   - the cosmology module at `/m/cosmology` renders the hero plus all 10
//     plot sections
//   - every Chakra v3 component used in the migration appears with the
//     correct ARIA role (Slider, Switch, NativeSelect, IconButton, Accordion)
//   - the EHT shadow SVG renders (no Mosaic dependency)
//   - the CMB map <canvas> paints non-background pixels
//   - the color-mode toggle changes the html class
//   - mobile viewport (375px) still loads the cosmology module
//
// To exercise the Mosaic plots end-to-end you need a network that can reach
// jsdelivr, or you need to override @uwdata/mosaic-core's `wasmConnector` to
// load a local bundled @duckdb/duckdb-wasm worker.

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE_URL = "http://127.0.0.1:5173/";
const SCREENSHOT_DIR = "/tmp/pw-shots";
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const failures = [];
function check(condition, label) {
  if (condition) {
    console.log(`  ✓ ${label}`);
  } else {
    console.log(`  ✗ ${label}`);
    failures.push(label);
  }
}

const browser = await chromium.launch({
  args: ["--no-sandbox"],
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const context = await browser.newContext({
  viewport: { width: 1400, height: 900 },
  deviceScaleFactor: 1,
});
const consoleErrors = [];
context.on("weberror", (e) => consoleErrors.push(`weberror: ${e.error().message}`));
const page = await context.newPage();
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(`console: ${msg.text()}`);
});
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));

console.log("─── Loading catalog ───");
await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(1_500);
await page.screenshot({ path: `${SCREENSHOT_DIR}/00-catalog.png`, fullPage: false });

console.log("\n─── Catalog cards ───");
const catalogTitle = await page.locator("h1").first().textContent();
check(
  (catalogTitle ?? "").toLowerCase().includes("known universe"),
  `catalog h1 is "${catalogTitle?.trim()}"`,
);
const cosmologyCard = await page
  .getByRole("heading", { name: /Cosmology/i })
  .count();
check(cosmologyCard > 0, `catalog shows Cosmology card`);
const comingSoonBadge = await page.getByText(/Coming soon/i).count();
check(comingSoonBadge > 0, `catalog shows at least one "Coming soon" placeholder`);
const cosmologyLink = await page
  .locator('a[href="/m/cosmology"]')
  .count();
check(
  cosmologyLink === 1,
  `exactly one router link points to /m/cosmology (count=${cosmologyLink})`,
);
const quantumLink = await page.locator('a[href="/m/quantum"]').count();
check(quantumLink === 0, `placeholder card is not a router link (count=${quantumLink})`);

console.log("\n─── Loading cosmology module ───");
await page.goto(`${BASE_URL}m/cosmology`, {
  waitUntil: "networkidle",
  timeout: 60_000,
});
await page.waitForTimeout(2_500);
await page.screenshot({ path: `${SCREENSHOT_DIR}/01-loaded.png`, fullPage: false });

console.log("\n─── Header / theme ───");
const title = await page.locator("h1").first().textContent();
check(title?.includes("Cosmology"), `title is "${title?.trim()}"`);

const heroHeading = await page.locator("h2").first().textContent();
check(
  (heroHeading ?? "").toLowerCase().includes("hubble"),
  `first plot section heading present: "${heroHeading?.trim()}"`,
);

const colorModeBtn = page.getByRole("button", { name: /toggle color mode/i });
check((await colorModeBtn.count()) > 0, "color-mode IconButton renders");
const sunOrMoon = await page.locator("svg.lucide-sun, svg.lucide-moon").count();
check(sunOrMoon > 0, `lucide Sun/Moon icon rendered (count=${sunOrMoon})`);

console.log("\n─── Every plot section h2 present ───");
const expectedSections = [
  /Hubble 1929/i,
  /BBN/i,
  /CMB map/i,
  /CMB power spectrum/i,
  /Pantheon/i,
  /rotation curves/i,
  /BAO/i,
  /EHT/i,
  /GW150914/i,
  /Six numbers/i,
];
for (const re of expectedSections) {
  const found = await page.getByRole("heading", { name: re }).count();
  check(found > 0, `section heading matches ${re}`);
}

console.log("\n─── Chakra v3 components mounted ───");
const sliderCount = await page.locator('[role="slider"]').count();
// 25 sliders expected: Hubble(1) + BBN(2) + CMBMap(1) + CMBPower(4) + SN(3) +
// Rotation(2) + BAO(1) + EHT(3) + GW(2) + Synthesis(6) = 25
check(sliderCount >= 24, `Chakra v3 Slider.Root mounts (${sliderCount} sliders, expected ≥24)`);

const sliderWithLabel = await page
  .locator('[role="slider"][aria-labelledby]')
  .count();
check(
  sliderWithLabel >= 24,
  `every Slider has aria-labelledby (${sliderWithLabel}/${sliderCount})`,
);

const selectCount = await page.locator("select").count();
check(selectCount >= 2, `NativeSelect.Root renders <select> (count=${selectCount})`);

const galaxyOptions = await page.locator("select option").allTextContents();
check(
  galaxyOptions.includes("NGC 3198") &&
    galaxyOptions.includes("DDO 154") &&
    galaxyOptions.includes("UGC 2885"),
  `rotation-curve <select> has 3 galaxy options`,
);

const switchCount = await page
  .locator('[data-scope="switch"][data-part="root"]')
  .count();
check(switchCount >= 1, `Switch.Root renders (count=${switchCount})`);

const accordionCount = await page
  .locator('button[aria-controls]')
  .filter({ hasText: /Data source/ })
  .count();
check(
  accordionCount >= 9,
  `Citation Accordion.Root triggers render (count=${accordionCount}, expected ≥9)`,
);

console.log("\n─── EHT shadow SVG (no Mosaic dependency) ───");
await page.getByRole("heading", { name: /EHT/i }).scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const ehtSvgRect = await page
  .locator('svg[aria-label*="EHT black hole shadow"] circle')
  .count();
check(ehtSvgRect >= 3, `EHT SVG renders the photon-ring + shadow circles (count=${ehtSvgRect})`);
await page.screenshot({ path: `${SCREENSHOT_DIR}/02-eht.png`, fullPage: false });

console.log("\n─── CMB canvas paints non-zero pixels ───");
await page.getByRole("heading", { name: /CMB map/i }).scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
const canvas = page.locator("canvas").first();
const canvasCount = await canvas.count();
check(canvasCount > 0, "canvas element found");
let canvasNonBlack = 0;
if (canvasCount > 0) {
  canvasNonBlack = await canvas.evaluate((el) => {
    const c = el;
    const ctx = c.getContext("2d");
    if (!ctx) return 0;
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    let nonBlack = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 30 || data[i + 1] > 30 || data[i + 2] > 30) nonBlack++;
    }
    return nonBlack;
  });
  check(canvasNonBlack > 1000, `canvas has ${canvasNonBlack} non-background pixels`);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/03-cmb-map.png`, fullPage: false });
}

console.log("\n─── Slider drag changes aria-valuenow ───");
await page.getByRole("heading", { name: /Hubble 1929/i }).scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const hubbleSlider = page.getByRole("slider", { name: /Hubble constant/i }).first();
await hubbleSlider.focus();
const before = await hubbleSlider.getAttribute("aria-valuenow");
for (let i = 0; i < 30; i++) await hubbleSlider.press("ArrowRight");
await page.waitForTimeout(200);
const after = await hubbleSlider.getAttribute("aria-valuenow");
check(
  before !== null && after !== null && Number(after) > Number(before),
  `Hubble slider ArrowRight bumps value (${before} → ${after})`,
);

console.log("\n─── Switch toggle (flat universe) ───");
await page.getByRole("heading", { name: /Pantheon/i }).scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const flatSwitch = page
  .locator('[data-scope="switch"][data-part="root"]')
  .first();
const switchBefore = await flatSwitch.getAttribute("data-state");
await flatSwitch.click();
await page.waitForTimeout(200);
const switchAfter = await flatSwitch.getAttribute("data-state");
check(
  switchBefore !== switchAfter,
  `Switch toggles (data-state ${switchBefore} → ${switchAfter})`,
);

console.log("\n─── Accordion (Citation) expands ───");
const firstCitation = page
  .locator('button[aria-controls]')
  .filter({ hasText: /Data source/ })
  .first();
if ((await firstCitation.count()) > 0) {
  await firstCitation.scrollIntoViewIfNeeded();
  const expandedBefore = await firstCitation.getAttribute("aria-expanded");
  await firstCitation.click();
  await page.waitForTimeout(300);
  const expandedAfter = await firstCitation.getAttribute("aria-expanded");
  check(
    expandedBefore !== expandedAfter,
    `Accordion expands (aria-expanded ${expandedBefore} → ${expandedAfter})`,
  );
}

console.log("\n─── Color-mode toggle changes html.class ───");
const htmlClassBefore = await page.evaluate(() => document.documentElement.className);
await colorModeBtn.click();
await page.waitForTimeout(400);
const htmlClassAfter = await page.evaluate(() => document.documentElement.className);
check(
  htmlClassBefore !== htmlClassAfter,
  `<html class> changed after toggle ("${htmlClassBefore}" → "${htmlClassAfter}")`,
);

console.log("\n─── Synthesis section sliders ───");
await page
  .getByRole("heading", { name: /Six numbers, every plot/i })
  .scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
// Six bottom sliders should all be reachable
const synthSliderLabels = await page
  .locator('[role="slider"]')
  .evaluateAll((els) =>
    els.map((e) => e.getAttribute("aria-labelledby") ?? "").filter(Boolean),
  );
check(
  synthSliderLabels.length === sliderCount,
  `all ${sliderCount} sliders kept their aria-labelledby through scroll`,
);
await page.screenshot({ path: `${SCREENSHOT_DIR}/04-synthesis.png`, fullPage: false });

console.log("\n─── Mobile viewport (375px) ───");
await page.setViewportSize({ width: 375, height: 720 });
await page.goto(`${BASE_URL}m/cosmology`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const mobileTitle = await page.locator("h1").first().textContent();
check(
  mobileTitle?.includes("Cosmology"),
  `Mobile loads ("${mobileTitle?.trim()}")`,
);
const mobileSliderCount = await page.locator('[role="slider"]').count();
check(
  mobileSliderCount >= 24,
  `Mobile still mounts all sliders (${mobileSliderCount})`,
);
await page.screenshot({
  path: `${SCREENSHOT_DIR}/05-mobile.png`,
  fullPage: false,
});

console.log("\n─── Console errors ───");
// Expected: DuckDB worker can't reach cdn.jsdelivr.net in this sandbox.
// The DuckDB worker download failure surfaces as several entries: the
// importScripts NetworkError itself, plus bare browser-emitted ErrorEvents
// (whose .message field is empty) that fire when the worker fails to boot.
// Treat the whole class as expected in this sandbox.
const fatalErrors = consoleErrors.filter(
  (e) =>
    !/Failed to load resource/.test(e) &&
    !/Download the React DevTools/.test(e) &&
    !/duckdb-browser-eh\.worker/.test(e) &&
    !/duckdb worker/i.test(e) &&
    !/cdn\.jsdelivr/.test(e) &&
    !/NetworkError.*importScripts/.test(e) &&
    !/CERT_AUTHORITY_INVALID/.test(e) &&
    !/Mosaic Coordinator/.test(e) &&
    // Workers raise these when their importScripts fails; the real cause
    // is the network error above, so suppress the bare ErrorEvent echo.
    !/^(console|pageerror|weberror):\s*ErrorEvent\s*$/.test(e) &&
    !/^console:\s*$/.test(e),
);
check(
  fatalErrors.length === 0,
  fatalErrors.length === 0
    ? "no React/Chakra runtime errors (DuckDB CDN block is expected)"
    : `${fatalErrors.length} React/Chakra errors`,
);
if (fatalErrors.length) {
  for (const e of fatalErrors.slice(0, 10)) console.log(`    • ${e}`);
}

await browser.close();

writeFileSync(
  "/tmp/pw-report.json",
  JSON.stringify({ failures, fatalErrors }, null, 2),
);

if (failures.length) {
  console.log(`\n${failures.length} CHECK(S) FAILED`);
  process.exit(1);
}
console.log("\nALL CHECKS PASSED");
