#!/usr/bin/env node
/**
 * Screenshot a route of the running dev server in headless Chrome and report runtime errors.
 * The only way to see your screen: use it after every meaningful change, then Read the PNG.
 *
 *   node scripts/snap.mjs /app/radar
 *   node scripts/snap.mjs /app/pipeline --plan free --out .snap/pipeline-free.png
 *   node scripts/snap.mjs / --full --mobile
 *   node scripts/snap.mjs /app/radar --click "text=Scanner la zone" --wait 4000
 *
 * Options
 *   --out <file>      PNG path (default .snap/<route>.png)
 *   --w <px> --h <px> viewport, default 1440 × 900 (app pages scroll inside <main>: raise --h to see more)
 *   --mobile          390 × 844, touch
 *   --full            full-page capture (marketing pages and mockups, which scroll the window)
 *   --wait <ms>       pause before the capture, default 1200
 *   --plan <id>       free | solo | pro | agency (demo state is seeded as Pro by default)
 *   --state <json>    merged into the persisted demo state, e.g. '{"onboarded":false}'
 *   --click <sel>     Playwright selector to click before the capture (repeatable, in order)
 *   --select <s=v>    picks the option of value v in the native <select> matched by s (repeatable)
 *   --type <text>     text typed after the clicks (into the focused element)
 *   --press <key>     key pressed after typing, e.g. Enter or Meta+k (repeatable)
 *   --scroll <px>     scrolls the window and the app's <main> before the capture
 *   --selector <sel>  capture only this element
 *   --reduced         emulate prefers-reduced-motion
 *   --overflow        list the elements that stick out of the viewport on the right (horizontal scroll hunters)
 *   --axe             run the axe-core accessibility audit (WCAG 2.1 A and AA) and print the violations
 */
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const route = args.find((arg) => arg.startsWith("/")) ?? "/";
const has = (name) => args.includes(`--${name}`);
const one = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const many = (name) => args.flatMap((arg, index) => (arg === `--${name}` ? [args[index + 1]] : []));

const base = process.env.PIGNON_URL ?? "http://localhost:3000";
const mobile = has("mobile");
const viewport = mobile
  ? { width: 390, height: 844 }
  : { width: Number(one("w", 1440)), height: Number(one("h", 900)) };
const slug = route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "accueil";
const out = resolve(one("out", `.snap/${slug}${mobile ? "-mobile" : ""}.png`));
const wait = Number(one("wait", 1200));
const plan = one("plan");
const statePatch = one("state");

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport,
  isMobile: mobile,
  hasTouch: mobile,
  locale: "fr-FR",
  reducedMotion: has("reduced") ? "reduce" : "no-preference",
});
const page = await context.newPage();

const problems = [];
page.on("console", (message) => {
  if (message.type() === "error" || message.type() === "warning") {
    problems.push(`[console.${message.type()}] ${message.text()}`);
  }
});
page.on("pageerror", (error) => problems.push(`[page error] ${error.message}`));
page.on("requestfailed", (request) => {
  const reason = request.failure()?.errorText ?? "";
  if (!reason.includes("ERR_ABORTED")) problems.push(`[request failed] ${request.url()} ${reason}`);
});
page.on("response", (response) => {
  if (response.status() >= 400) problems.push(`[http ${response.status()}] ${response.url()}`);
});

if (plan || statePatch) {
  // Let the store seed itself first, then patch what it persisted.
  await page.goto(`${base}/app`, { waitUntil: "load" });
  await page.waitForFunction(() => localStorage.getItem("pignon-demo") !== null, null, { timeout: 15000 });
  await page.evaluate(
    ({ plan, statePatch }) => {
      const saved = JSON.parse(localStorage.getItem("pignon-demo"));
      if (plan) {
        saved.state.plan = plan;
        if (plan === "free") saved.state.unlocked = saved.state.unlocked.slice(0, 2);
      }
      if (statePatch) Object.assign(saved.state, JSON.parse(statePatch));
      localStorage.setItem("pignon-demo", JSON.stringify(saved));
    },
    { plan, statePatch },
  );
  problems.length = 0;
}

const response = await page.goto(base + route, { waitUntil: "load" });
await page.waitForTimeout(wait);

for (const selector of many("click")) {
  await page.locator(selector).first().click({ timeout: 8000 });
  await page.waitForTimeout(450);
}
for (const pair of many("select")) {
  const cut = pair.lastIndexOf("=");
  await page.locator(pair.slice(0, cut)).first().selectOption(pair.slice(cut + 1));
  await page.waitForTimeout(450);
}
const typed = one("type");
if (typed) await page.keyboard.type(typed, { delay: 20 });
for (const key of many("press")) {
  await page.keyboard.press(key);
  await page.waitForTimeout(450);
}
const scroll = Number(one("scroll", 0));
if (scroll) {
  await page.evaluate((y) => {
    window.scrollTo(0, y);
    document.querySelector("main")?.scrollTo(0, y);
  }, scroll);
  await page.waitForTimeout(500);
}
if (many("click").length || many("select").length || typed || many("press").length) await page.waitForTimeout(wait);

mkdirSync(dirname(out), { recursive: true });
const selector = one("selector");
if (selector) await page.locator(selector).first().screenshot({ path: out });
else await page.screenshot({ path: out, fullPage: has("full") });

let overflowReport = "";
if (has("overflow")) {
  const found = await page.evaluate(() => {
    const limit = document.documentElement.clientWidth;
    const rows = [];
    for (const element of document.querySelectorAll("body *")) {
      const box = element.getBoundingClientRect();
      if (box.width === 0 || box.right <= limit + 1) continue;
      // Skip what an ancestor already clips.
      let clipped = false;
      for (let parent = element.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        if ((style.overflowX === "hidden" || style.overflowX === "clip") && parent.getBoundingClientRect().right <= limit + 1) {
          clipped = true;
          break;
        }
      }
      if (!clipped) rows.push(`${element.tagName.toLowerCase()}.${String(element.className).slice(0, 70)} right=${Math.round(box.right)}`);
    }
    // A scroll container that scrolls sideways without having asked for it (no overflow-x-auto class).
    for (const element of document.querySelectorAll("body *")) {
      const style = getComputedStyle(element);
      if (!/auto|scroll/.test(style.overflowX) || /overflow-x-(auto|scroll)/.test(String(element.className))) continue;
      if (element.scrollWidth > element.clientWidth + 1) {
        rows.unshift(`scrolls sideways: ${element.tagName.toLowerCase()}.${String(element.className).slice(0, 60)} ${element.scrollWidth}>${element.clientWidth}`);
      }
    }
    return { limit, scroll: document.documentElement.scrollWidth, rows: rows.slice(0, 12) };
  });
  overflowReport =
    found.scroll <= found.limit && found.rows.length === 0
      ? "overflow: nothing sticks out."
      : `overflow: page is ${found.scroll}px wide for a ${found.limit}px viewport\n` + found.rows.map((row) => `- ${row}`).join("\n");
}

let axeReport = "";
if (has("axe")) {
  await page.addScriptTag({ path: createRequire(import.meta.url).resolve("axe-core/axe.min.js") });
  const { violations } = await page.evaluate(() =>
    // eslint-disable-next-line no-undef
    axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } }),
  );
  axeReport =
    violations.length === 0
      ? "axe: no WCAG A/AA violation detected."
      : `axe: ${violations.length} rule(s) violated\n` +
        violations
          .map(
            (v) =>
              `- [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} element(s))\n` +
              v.nodes
                .slice(0, 3)
                .map((n) => `    ${n.target.join(" ")} :: ${(n.failureSummary ?? "").split("\n").slice(1, 2).join(" ").trim()}`)
                .join("\n"),
          )
          .join("\n");
}

await browser.close();

console.log(`${response?.status() ?? "?"} ${route} -> ${out} (${viewport.width}x${viewport.height})`);
if (problems.length === 0) console.log("No console error, no failed request.");
else console.log(`${problems.length} problem(s):\n${[...new Set(problems)].slice(0, 30).join("\n")}`);
if (overflowReport) console.log(overflowReport);
if (axeReport) console.log(axeReport);
