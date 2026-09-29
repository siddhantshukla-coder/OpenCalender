

import { chromium } from "playwright";

const URL =
  "https://summerofcode.withgoogle.com/programs/2026";

const browser = await chromium.launch({
  headless: true
});

const page = await browser.newPage();

console.log("Opening GSoC...");

await page.goto(URL, {
  waitUntil: "networkidle"
});

await page.waitForTimeout(2000);

const milestones = page.locator(
  "app-program-timeline .milestone"
);

const count = await milestones.count();

console.log(`Found ${count} milestones.\n`);

const events = [];

for (let i = 0; i < count; i++) {
  const text = await milestones.nth(i).innerText();

  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  // Find the date line
  const dateIndex = lines.findIndex(line =>
    /^[A-Z]+\s+\d{2},\s+\d{4}/i.test(line)
  );

  if (dateIndex === -1) {
    continue;
  }

  const date = lines[dateIndex];

  // The title is immediately after the date
  const title = lines[dateIndex + 1];

  events.push({
    title,
    date,
    source: URL
  });
}

console.log("===== EXTRACTED EVENTS =====\n");

console.log(
  JSON.stringify(events, null, 2)
);

await browser.close();