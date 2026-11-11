"use strict";

const path = require("node:path");
const { spawn } = require("node:child_process");
const root = path.resolve(__dirname, "..");

function run(script, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      cwd: root, windowsHide: true, stdio: "inherit", shell: false,
    });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`Compilation interrompue (code ${code}).`)));
  });
}

(async () => {
  if (!process.argv.includes("--skip-prepare")) await run(path.join(__dirname, "prepare-desktop.cjs"));
  const version = require("electron/package.json").version;
  await run(require.resolve("electron-builder/out/cli/cli.js"), [
    "--config", "desktop/electron-builder.yml", `--config.electronVersion=${version}`, "--publish", "never",
    ...(process.argv.includes("--dir") ? ["--dir"] : []),
  ]);
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
