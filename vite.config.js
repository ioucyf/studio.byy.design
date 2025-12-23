import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';
import postcssImport from 'postcss-import';
import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';


export default defineConfig({
  root: 'src',

  publicDir: '../public',
  css: {
    postcss: {
      plugins: [postcssImport(), autoprefixer()],
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    assetsDir: 'lib',

    rollupOptions: {
      input: path.resolve(__dirname, 'src/index.html'),
    },
    minify: 'esbuild',
    target: 'baseline-widely-available',
    // lib: {
    //   entry: path.resolve(__dirname, 'src/index.js'),
    //   name: 'PrintsByyDesign',
    //   formats: ['es'],
    //   fileName: (format) => `prints-byy-design.${format}.js`,
    // }
  },
  server: {
    port: 20284,
  },
  plugins: [
    {
      name: 'inject-sha-and-assets',
      closeBundle() {
        const sha = execSync('git rev-parse --short HEAD').toString().trim();
        const distDir = path.resolve(__dirname, 'dist');
        const swTemplatePath = path.resolve(__dirname, 'src/service-worker.js');
        const swOutputPath = path.resolve(distDir, 'service-worker.js');
        const htmlTemplatePath = path.resolve(__dirname, 'src/index.html');
        const htmlOutputPath = path.resolve(distDir, 'index.html');

        // Collect all asset paths
        const assetFiles = [];
        function walk(dir) {
          for (const file of fs.readdirSync(dir)) {
            const full = path.join(dir, file);
            if (fs.statSync(full).isDirectory()) walk(full);
            else if (file !== 'service-worker.js') {
              assetFiles.push(full.replace(distDir, '').replace(/\\/g, '/'));
            }
          }
        }
        walk(distDir);

        // Inject
        let swContent = fs.readFileSync(swTemplatePath, 'utf8');
        swContent = swContent
          .replace(/__BUILD_SHA__/g, sha)
          .replace(/__ASSETS__/g, JSON.stringify(assetFiles, null, 2));

        fs.writeFileSync(swOutputPath, swContent);
        console.log(`[vite] ✅ Injected SHA (${sha}) and assets into service-worker.js`);

        let htmlContent = fs.readFileSync(htmlOutputPath, 'utf8');
        htmlContent = htmlContent
          .replace(/__VERSION__/g, sha);
        fs.writeFileSync(htmlOutputPath, htmlContent);
        console.log(`[vite] ✅ Injected SHA (VERSION) (${sha}) into index.html`);
      }
    }
  ]
});
