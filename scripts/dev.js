import { resolve } from "@std/path";
import { debounce } from "https://deno.land/std@0.224.0/async/debounce.ts";

const ROOT_DIR = Deno.cwd();
const SRC_DIR = resolve(ROOT_DIR, "src");
const PUBLIC_DIR = resolve(ROOT_DIR, "public");

let serverProcess;

async function runBuild() {
  console.log("⚙️ Running dev build...");
  const buildProcess = new Deno.Command("deno", {
    args: ["run", "-A", "scripts/build.js", "--dev"],
  });
  const { code, stdout, stderr } = await buildProcess.output();
  if (code === 0) {
    console.log("✅ Build successful.");
    return true;
  } else {
    console.error("❌ Build failed:");
    console.error(new TextDecoder().decode(stderr));
    return false;
  }
}

function startServer() {
  console.log("🔄 Starting server...");
  serverProcess = new Deno.Command("deno", {
    args: ["run", "-A", "server.js"],
  }).spawn();
  console.log(`🚀 Server started. Watching for changes...`);
}

async function handleFileChange() {
    console.log("\nDetected file change. Rebuilding and restarting...");
    if (serverProcess) {
        try {
            serverProcess.kill();
            console.log("🛑 Server stopped.");
        } catch (e) {
            // Ignore errors if process is already dead
        }
    }
    const buildOk = await runBuild();
    if (buildOk) {
        startServer();
    } else {
        console.log("Build failed. Waiting for next file change.");
    }
}

// --- Main Execution ---
console.log("Starting initial build...");
const initialBuildOk = await runBuild();

if (initialBuildOk) {
    startServer();
    const watcher = Deno.watchFs([SRC_DIR, PUBLIC_DIR]);
    const debouncedHandle = debounce(handleFileChange, 300);
    for await (const event of watcher) {
        debouncedHandle();
    }
} else {
    console.error("Initial build failed. Please fix errors and restart.");
}
