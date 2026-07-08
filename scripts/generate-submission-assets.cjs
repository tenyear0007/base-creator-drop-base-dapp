const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "base-submission");
const port = 4110;
const baseUrl = `http://127.0.0.1:${port}`;

async function waitForServer(url, timeoutMs = 45_000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          resolve();
          return;
        }
      } catch {}

      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }

      setTimeout(tick, 500);
    };

    tick();
  });
}

function startServer() {
  const child = spawn("npm", ["run", "dev", "--", "--port", String(port)], {
    cwd: root,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));

  return child;
}

async function generateIcon() {
  const svg = `
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" rx="228" fill="#171310"/>
      <rect x="214" y="230" width="596" height="536" rx="52" fill="#fffaf1"/>
      <rect x="214" y="230" width="596" height="154" rx="52" fill="#ffcf5a"/>
      <rect x="214" y="330" width="596" height="60" fill="#ffcf5a"/>
      <circle cx="810" cy="230" r="76" fill="#ff5a3d"/>
      <circle cx="214" cy="766" r="76" fill="#0052ff"/>
      <path d="M330 520h360" stroke="#171310" stroke-width="44" stroke-linecap="round"/>
      <path d="M330 632h236" stroke="#171310" stroke-width="44" stroke-linecap="round"/>
    </svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(path.join(outDir, "app-icon.jpg"));
  await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, "app-icon.png"));
}

async function generateThumbnail() {
  const svg = `
    <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" x2="1">
          <stop offset="0" stop-color="#f7f1e8"/>
          <stop offset="0.52" stop-color="#fffaf1"/>
          <stop offset="1" stop-color="#dce8ff"/>
        </linearGradient>
      </defs>
      <rect width="1910" height="1000" fill="url(#bg)"/>
      <g opacity="0.18" stroke="#171310">
        ${Array.from({ length: 54 }, (_, i) => `<path d="M${i * 38} 0v1000"/>`).join("")}
        ${Array.from({ length: 30 }, (_, i) => `<path d="M0 ${i * 38}h1910"/>`).join("")}
      </g>
      <rect x="1040" y="128" width="520" height="690" rx="68" fill="#171310"/>
      <rect x="1088" y="176" width="424" height="594" rx="44" fill="#fffaf1"/>
      <rect x="1088" y="176" width="424" height="150" rx="44" fill="#ffcf5a"/>
      <circle cx="1512" cy="176" r="58" fill="#ff5a3d"/>
      <circle cx="1088" cy="770" r="58" fill="#0052ff"/>
      <path d="M1168 470h270" stroke="#171310" stroke-width="34" stroke-linecap="round"/>
      <path d="M1168 570h186" stroke="#171310" stroke-width="34" stroke-linecap="round"/>
      <text x="170" y="330" font-family="Arial, sans-serif" font-size="46" font-weight="800" fill="#0052ff" letter-spacing="8">BASE CREATOR DROP</text>
      <text x="170" y="500" font-family="Georgia, serif" font-size="132" font-weight="900" fill="#171310">Claim the</text>
      <text x="170" y="638" font-family="Georgia, serif" font-size="132" font-weight="900" fill="#171310">studio pass.</text>
      <text x="176" y="730" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#6d6256">Limited pass, zero-value claim, shareable receipt.</text>
    </svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(path.join(outDir, "app-thumbnail.jpg"));
  await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, "app-thumbnail.png"));
}

async function generateScreenshots() {
  const server = startServer();
  const browser = await chromium.launch({ headless: true });

  try {
    await waitForServer(baseUrl);

    const states = [
      {
        file: "screenshot-1.png",
        setup: async (page) => {
          await page.addInitScript(() => {
            window.localStorage.removeItem("base-drop-pass-claim");
          });
        },
      },
      {
        file: "screenshot-2.png",
        setup: async (page) => {
          await page.addInitScript(() => {
            window.localStorage.removeItem("base-drop-pass-claim");
          });
        },
        afterLoad: async (page) => {
          await page.getByPlaceholder("Base collector").fill("Koala collector");
          await page.evaluate(() => window.scrollTo(0, 420));
        },
      },
      {
        file: "screenshot-3.png",
        setup: async (page) => {
          await page.addInitScript(() => {
            window.localStorage.setItem(
              "base-drop-pass-claim",
              JSON.stringify({
                claimed: true,
                edition: 188,
                date: "May 10, 2026",
                hash: "0x8f2b6a4b8d2e74e76f1d5a0f7c5d1b9bca458d3b74d6680b57b8d8d7c4f93321",
              }),
            );
          });
        },
        afterLoad: async (page) => {
          await page.getByPlaceholder("Base collector").fill("Koala collector");
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        },
      },
    ];

    for (const state of states) {
      const context = await browser.newContext({
        viewport: { width: 428, height: 926 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      });
      const page = await context.newPage();
      await state.setup(page);
      await page.goto(baseUrl, { waitUntil: "networkidle" });
      await state.afterLoad?.(page);
      await page.screenshot({
        path: path.join(outDir, state.file),
        fullPage: false,
      });
      await context.close();
      console.log(`Captured ${state.file}`);
    }
  } finally {
    await browser.close();
    server.kill("SIGTERM");
  }
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  await generateIcon();
  await generateThumbnail();
  await generateScreenshots();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
