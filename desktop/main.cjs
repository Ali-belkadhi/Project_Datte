"use strict";

const { app, BrowserWindow, dialog, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { startServices, stopServices, isLocalNavigation, isExternalLink } = require("./runtime.cjs");

app.setName("DEGLA");
app.setAppUserModelId("tn.degla.desktop");
const primary = app.requestSingleInstanceLock();
let window;
let state;
let startup;
let quitting = false;
const controller = new AbortController();
const smokeMode = process.env.DEGLA_DESKTOP_SMOKE_TEST === "1";
const blockedRequests = [];
const failedRequests = [];
const consoleErrors = [];
let exitCode = 0;

function loadingPage(stage) {
  const text = stage.replace(/[&<>"']/g, (value) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[value]);
  return `data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>DEGLA</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#FAF5EC;color:#24150F;font-family:system-ui,sans-serif;text-align:center}h1{font-family:Georgia,serif;font-size:3rem;margin:0 0 1rem}p{color:#806655}small{display:block;color:#806655;margin-top:1.5rem}</style></head><body><main><h1>DEGLA.</h1><p>${text}</p><small>Vos données restent sur cet ordinateur.</small></main></body></html>`)}`;
}

function createWindow() {
  window = new BrowserWindow({
    title: "DEGLA",
    icon: path.join(__dirname, "icon.ico"),
    width: 1440,
    height: 940,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#FAF5EC",
    autoHideMenuBar: true,
    show: !smokeMode,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true, backgroundThrottling: !smokeMode },
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isLocalNavigation(url, state?.origin)) void window.loadURL(url).catch(() => {});
    else if (isExternalLink(url)) void shell.openExternal(url).catch(() => {});
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    if (!isLocalNavigation(url, state?.origin)) {
      event.preventDefault();
      if (isExternalLink(url)) void shell.openExternal(url).catch(() => {});
    }
  });
  window.webContents.session.setPermissionRequestHandler((contents, permission, callback) => {
    callback(permission === "fullscreen" && isLocalNavigation(contents.getURL(), state?.origin));
  });
  window.webContents.session.setPermissionCheckHandler((contents, permission) => {
    return permission === "fullscreen" && contents !== null && isLocalNavigation(contents.getURL(), state?.origin);
  });
  if (smokeMode) {
    window.webContents.session.webRequest.onBeforeRequest((details, callback) => {
      const remote = /^https?:/i.test(details.url) && !isLocalNavigation(details.url, state?.origin);
      if (remote) blockedRequests.push(details.url);
      callback({ cancel: remote });
    });
    window.webContents.session.webRequest.onErrorOccurred((details) => {
      if (isLocalNavigation(details.url, state?.origin)) failedRequests.push({ url: details.url, error: details.error });
    });
    window.webContents.on("console-message", (_event, details, legacyMessage) => {
      if (details && typeof details === "object" && details.level === "error") consoleErrors.push(details.message);
      else if (typeof details === "number" && details >= 3) consoleErrors.push(String(legacyMessage));
    });
  }
  window.on("closed", () => { window = null; });
  void window.loadURL(loadingPage("Démarrage de l'application locale…")).catch(() => {});
}

async function smokeTest(userDataDir) {
  await window.loadURL(`${state.origin}/catalogue`);
  await new Promise((resolve) => setTimeout(resolve, 700));
  const page = await window.webContents.executeJavaScript(`({
    title: document.title,
    heading: document.querySelector('h1')?.textContent?.trim() ?? '',
    products: [...new Set([...document.querySelectorAll('a[href^="/produit/"]')].map(a => a.getAttribute('href')))].length,
    images: [...document.images].filter(image => image.complete && image.naturalWidth > 0).length,
    url: location.href
  })`);
  const report = {
    ok: page.heading === "Catalogue" && page.products > 0 && failedRequests.length === 0 && consoleErrors.length === 0,
    date: new Date().toISOString(),
    page,
    externalNetworkBlocked: true,
    blockedRequests,
    failedRequests,
    consoleErrors,
  };
  const screenshot = await window.webContents.capturePage();
  fs.writeFileSync(path.join(userDataDir, "smoke-catalogue.png"), screenshot.toPNG());
  fs.writeFileSync(path.join(userDataDir, "smoke-report.json"), JSON.stringify(report, null, 2), "utf8");
  exitCode = report.ok ? 0 : 1;
  app.quit();
}

if (!primary) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!window) return;
    if (window.isMinimized()) window.restore();
    window.show();
    window.focus();
  });

  app.whenReady().then(() => {
    const userDataDir = app.getPath("userData");
    fs.mkdirSync(userDataDir, { recursive: true });
    const logFile = path.join(userDataDir, "degla.log");
    // Limite le journal conservé au démarrage sans toucher aux données utilisateur.
    if (fs.existsSync(logFile) && fs.statSync(logFile).size > 5 * 1024 * 1024) fs.renameSync(logFile, path.join(userDataDir, "degla-previous.log"));
    const log = (message) => {
      try { fs.appendFileSync(logFile, `${new Date().toISOString()} ${message}\n`, "utf8"); } catch { /* Le journal ne bloque pas la fermeture. */ }
    };
    createWindow();
    startup = startServices({
      resourcesDir: app.isPackaged ? process.resourcesPath : path.resolve(__dirname, "..", "desktop-resources"),
      userDataDir,
      signal: controller.signal,
      log,
      onStage: (stage) => { if (window && !window.isDestroyed()) void window.loadURL(loadingPage(stage)).catch(() => {}); },
    }).then(async (running) => {
      state = running;
      for (const [label, child] of [["Le serveur DEGLA", state.server], ["La base de données locale", state.mongo]]) {
        child.once("exit", () => {
          if (quitting) return;
          dialog.showErrorBox("DEGLA — service local arrêté", `${label} s'est arrêté. Fermez puis relancez DEGLA.\n\nJournal : ${logFile}\nVos données sont conservées dans : ${path.join(userDataDir, "data")}`);
          app.quit();
        });
      }
      if (!quitting && window && !window.isDestroyed()) {
        if (smokeMode) await smokeTest(userDataDir);
        else await window.loadURL(state.origin);
      }
      return running;
    }).catch((error) => {
      log(error.stack ?? String(error));
      if (!quitting) {
        if (smokeMode) {
          exitCode = 1;
          fs.writeFileSync(path.join(userDataDir, "smoke-report.json"), JSON.stringify({ ok: false, error: error.message, date: new Date().toISOString() }, null, 2), "utf8");
        } else dialog.showErrorBox("DEGLA — démarrage impossible", `${error.message}\n\nJournal : ${logFile}\nVos données sont conservées dans : ${path.join(userDataDir, "data")}`);
        app.quit();
      }
    });
  }).catch((error) => {
    dialog.showErrorBox("DEGLA — démarrage impossible", error.message);
    app.quit();
  });

  app.on("window-all-closed", () => app.quit());
  app.on("before-quit", (event) => {
    if (quitting) return;
    event.preventDefault();
    quitting = true;
    controller.abort();
    Promise.resolve(startup).then(() => stopServices(state)).catch(() => {}).finally(() => smokeMode ? app.exit(exitCode) : app.quit());
  });
}
