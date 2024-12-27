const { connect } = require("puppeteer-real-browser");
const fs = require("fs-extra");
const path = require("path");

// Sleep function implementation
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function takeScreenshot(url, browser, page) {
  try {
    // Navigate to the URL
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

    // Wait for any redirects to complete using sleep
    await sleep(5000);

    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(__dirname, "screenshots");
    await fs.ensureDir(screenshotsDir);

    // Generate filename from URL
    const filename = `${Date.now()}-${new URL(url).pathname.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}.png`;
    const filepath = path.join(screenshotsDir, filename);

    // Take screenshot
    await page.screenshot({
      path: filepath,
      fullPage: true,
    });

    console.log(`Screenshot saved for ${url}`);
  } catch (error) {
    console.error(`Error processing ${url}:`, error.message);
  }
}

async function main() {
  let browser;
  let page;

  try {
    // Read URLs from file
    const urls = await fs.readFile("urls", "utf-8");
    const urlList = urls
      .split("\n")
      .reverse()
      .filter((url) => url.trim());

    // Connect to browser
    const connection = await connect({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      customConfig: {},
      turnstile: true,
      connectOption: {},
      disableXvfb: false,
      ignoreAllFlags: false,
    });

    browser = connection.browser;
    page = connection.page;

    // Process each URL
    for (const url of urlList) {
      if (!url.trim()) continue;
      await takeScreenshot(url.trim(), browser, page);
    }
  } catch (error) {
    console.error("Main error:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
