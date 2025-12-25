import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import favicons from "vite-plugin-favicon2";

const source = path.resolve("src/assets/icon-1024.png"); // your high-res image
const outputDir = path.resolve("public/assets"); // or src/assets if you prefer

const config = {
  path: "/assets/",
  display: "standalone",
  display_override: ["fullscreen", "minimal-ui"],
  orientation: "portrait",
  scope: "/",
  id: "https://prints.byy.design/",
  start_url: "https://prints.byy.design/",
  appName: "Prints By Y",
  appShortName: "Prints",
  appDescription: "A micro print studio.",
  developerName: "byy.design",
  background: "#000000",
  theme_color: "#ffffff",
  protocol_handlers: [
    {
      protocol: "web+prints",
      url: "https://prints.byy.design/?%s",
    },
  ],
  icons: {
    favicons: true,
    android: true,
    appleIcon: true,
    windows: true,
    yandex: false,
  },
};

favicons(source, config)
  .then((response) => {
    mkdirSync(outputDir, { recursive: true });

    for (const image of response.images) {
      writeFileSync(path.join(outputDir, image.name), image.contents);
    }

    for (const file of response.files) {
      writeFileSync(path.join(outputDir, file.name), file.contents);
    }

    // You can manually inject response.html into your template if needed
    console.log("[favicon] ✅ Icons generated successfully.");
  })
  .catch((err) => {
    console.error("[favicon] ❌ Failed to generate icons:", err.message);
    process.exit(1);
  });
