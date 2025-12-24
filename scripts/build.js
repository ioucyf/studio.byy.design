import { emptyDir, copy, ensureDir } from "@std/fs";
import { join, resolve } from "@std/path";
import postcss from "postcss";
import postcssImport from "postcss-import";
import postcssPresetEnv from "postcss-preset-env";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

// --- Configuration ---
const ROOT_DIR = Deno.cwd();
const SRC_DIR = resolve(ROOT_DIR, 'src');
const PUBLIC_DIR = resolve(ROOT_DIR, 'public');
const DIST_DIR = resolve(ROOT_DIR, 'dist');
const SW_TEMPLATE_PATH = resolve(SRC_DIR, 'service-worker.js');

async function getGitSha() {
  try {
    const command = new Deno.Command("git", {
      args: ["rev-parse", "--short", "HEAD"],
      stdout: "piped",
    });
    const { code, stdout } = await command.output();
    if (code === 0) {
      return new TextDecoder().decode(stdout).trim();
    }
  } catch (err) {
    console.warn('Could not get git sha', err);
    return 'dev';
  }
}

async function getAssetFiles(dir) {
    const assets = [];
    for await (const entry of Deno.readDir(dir)) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory) {
            assets.push(...await getAssetFiles(fullPath));
        }
        else {
            assets.push(fullPath);
        }
    }
    return assets.map(asset => asset.replace(DIST_DIR, '').replace(/\\/g, '/'));
}

async function processCss() {
    console.log('🖌️ Processing CSS...');
    const cssSrcPath = resolve(SRC_DIR, 'css', 'main.css');
    const cssDistPath = resolve(DIST_DIR, 'css', 'main.css');

    const css = await Deno.readTextFile(cssSrcPath);

    const processor = postcss([
        postcssImport(),
        postcssPresetEnv(),
        autoprefixer(),
        cssnano(),
    ]);

    const result = await processor.process(css, { from: cssSrcPath, to: cssDistPath });
    await ensureDir(resolve(DIST_DIR, 'css'));
    await Deno.writeTextFile(cssDistPath, result.css);
    console.log('✅ CSS processed successfully');
}


async function build() {
  console.log('🚀 Starting build...');

  // 1. Clean output directory
  await emptyDir(DIST_DIR);
  console.log('✅ Cleaned dist directory');

  // 2. Copy non-CSS src files and public files to dist
  await copy(SRC_DIR, DIST_DIR, { overwrite: true, filter: path => !path.includes('/css/') });
  await copy(PUBLIC_DIR, DIST_DIR, { overwrite: true });
  console.log('✅ Copied source and public files to dist');

  // 3. Process CSS
  await processCss();
  
  // 4. Get git SHA for versioning
  const sha = await getGitSha();
  console.log(`✅ Git SHA: ${sha}`);

  // 5. Collect asset paths
  const assetFiles = (await getAssetFiles(DIST_DIR))
      .filter(file => !file.endsWith('service-worker.js'));
  console.log(`✅ Collected ${assetFiles.length} asset files`);

  // 6. Inject SHA and assets into service worker
  let swContent = await Deno.readTextFile(SW_TEMPLATE_PATH);
  swContent = swContent
    .replace(/__BUILD_SHA__/g, sha)
    .replace(/__ASSETS__/g, JSON.stringify(assetFiles, null, 2));

  const swOutputPath = resolve(DIST_DIR, 'service-worker.js');
  await Deno.writeTextFile(swOutputPath, swContent);
  console.log('✅ Injected SHA and assets into service-worker.js');

  // 7. Inject version into index.html
  const htmlPath = resolve(DIST_DIR, 'index.html');
  let htmlContent = await Deno.readTextFile(htmlPath);
  htmlContent = htmlContent.replace(/__VERSION__/g, sha);
  await Deno.writeTextFile(htmlPath, htmlContent);
  console.log('✅ Injected version into index.html');
    
  // 8. copy CNAME file over to the dist directory
  await copy(resolve(ROOT_DIR, "CNAME"), resolve(DIST_DIR, 'CNAME'));
  console.log("✅ CNAME file copied to dist directory");


  console.log('🎉 Build complete!');
}

build();
