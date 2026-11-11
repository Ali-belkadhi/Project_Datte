"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const net = require("node:net");
const { spawn } = require("node:child_process");
const { setTimeout: delay } = require("node:timers/promises");

const HOST = "127.0.0.1";

function runtimePaths(resourcesDir, userDataDir) {
  const data = path.join(userDataDir, "data");
  return {
    server: path.join(resourcesDir, "server"),
    node: path.join(resourcesDir, "runtime", "node.exe"),
    mongo: path.join(resourcesDir, "mongodb", "mongod.exe"),
    seed: path.join(resourcesDir, "seed", "catalogue.json"),
    seedMedia: path.join(resourcesDir, "seed", "media"),
    data,
    db: path.join(data, "mongo"),
    media: path.join(data, "media"),
    marker: path.join(data, ".initialized-v1.json"),
  };
}

function serverEnvironment(base, { mongoPort, port, media }) {
  const env = {
    ...base,
    NODE_ENV: "production",
    HOSTNAME: HOST,
    PORT: String(port),
    MONGODB_URI: `mongodb://${HOST}:${mongoPort}/degla`,
    DEGLA_MEDIA_ROOT: media,
    DEGLA_DESKTOP: "1",
    NEXT_TELEMETRY_DISABLED: "1",
  };
  // Les identifiants de la machine de développement ne sont pas transmis à l'application.
  for (const name of ["HF_TOKEN", "MESHY_API_KEY", "DATABASE_URL", "AUTH_SECRET", "NODE_OPTIONS", "ELECTRON_RUN_AS_NODE"]) {
    delete env[name];
  }
  return env;
}

function isLocalNavigation(target, origin) {
  if (!origin) return false;
  try {
    return new URL(target).origin === origin;
  } catch {
    return false;
  }
}

function isExternalLink(target) {
  try {
    const url = new URL(target);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

async function probePort(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen({ host: HOST, port, exclusive: true }, () => {
      const address = server.address();
      server.close((error) => error ? reject(error) : resolve(address.port));
    });
  });
}

async function availablePort() {
  return probePort(0);
}

async function persistentServerPort(userDataDir, mongoPort) {
  const config = path.join(userDataDir, "http-port.json");
  let preferred;
  try {
    const saved = JSON.parse(await fs.readFile(config, "utf8"));
    if (Number.isInteger(saved?.port) && saved.port >= 1024 && saved.port <= 65535 && saved.port !== mongoPort) {
      preferred = saved.port;
    }
  } catch { /* Première ouverture ou configuration endommagée : choisir un port libre. */ }

  if (preferred !== undefined) {
    try { return await probePort(preferred); } catch { /* Port occupé par une autre application. */ }
  }
  let port = await availablePort();
  while (port === mongoPort) port = await availablePort();
  await fs.mkdir(userDataDir, { recursive: true });
  await fs.writeFile(config, JSON.stringify({ port }), "utf8");
  return port;
}

function throwIfStopped(signal, child, label) {
  if (signal?.aborted) throw new Error("Démarrage annulé.");
  if (child?.startupError) throw child.startupError;
  if (child && (child.exitCode !== null || child.signalCode !== null)) {
    throw new Error(`${label} s'est arrêté pendant le démarrage (code ${child.exitCode ?? child.signalCode}).`);
  }
}

async function waitForPort(port, { child, signal, timeout = 30_000 } = {}) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    throwIfStopped(signal, child, "MongoDB");
    const ready = await new Promise((resolve) => {
      const socket = net.connect({ host: HOST, port });
      const finish = (value) => { socket.destroy(); resolve(value); };
      socket.setTimeout(500, () => finish(false));
      socket.once("connect", () => finish(true));
      socket.once("error", () => finish(false));
    });
    if (ready) return;
    await delay(150);
  }
  throw new Error("MongoDB n'a pas démarré dans le délai prévu.");
}

async function waitForHealth(origin, { child, signal, timeout = 90_000 } = {}) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    throwIfStopped(signal, child, "Le serveur DEGLA");
    try {
      const response = await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(1500) });
      if (response.ok && (await response.json()).ok === true) return;
    } catch { /* Le serveur démarre encore. */ }
    await delay(200);
  }
  throw new Error("Le serveur DEGLA n'a pas démarré dans le délai prévu.");
}

async function exists(target) {
  try { await fs.access(target); return true; } catch { return false; }
}

async function initializeData(paths, runSeed) {
  await fs.mkdir(paths.db, { recursive: true });
  await fs.mkdir(paths.media, { recursive: true });
  if (await exists(paths.marker)) return false;

  if (await exists(paths.seedMedia)) {
    await fs.cp(paths.seedMedia, paths.media, {
      recursive: true,
      force: false,
      errorOnExist: false,
    });
  }
  await runSeed();
  // Un échec laisse le marqueur absent : la prochaine ouverture pourra réessayer.
  await fs.writeFile(paths.marker, JSON.stringify({ version: 1, initializedAt: new Date().toISOString() }), "utf8");
  return true;
}

function launch(executable, args, options, log, label) {
  const child = spawn(executable, args, { ...options, shell: false, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  child.on("error", (error) => { child.startupError = error; log(`[${label}] ${error.message}`); });
  child.stdout.on("data", (chunk) => log(`[${label}] ${chunk.toString().trimEnd()}`));
  child.stderr.on("data", (chunk) => log(`[${label}] ${chunk.toString().trimEnd()}`));
  child.on("exit", (code, signal) => log(`[${label}] arrêt : ${code ?? signal}`));
  return child;
}

async function waitForExit(child, timeout) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return true;
  return new Promise((resolve) => {
    const timer = setTimeout(() => { child.removeListener("close", onExit); resolve(false); }, timeout);
    const onExit = () => { clearTimeout(timer); resolve(true); };
    child.once("close", onExit);
  });
}

async function stopChild(child, timeout = 4000) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  child.kill("SIGTERM");
  if (!(await waitForExit(child, timeout))) {
    child.kill("SIGKILL");
    await waitForExit(child, 1500);
  }
}

async function runSeedProcess(paths, env, signal, log) {
  throwIfStopped(signal);
  const child = launch(paths.node, [path.join(paths.server, "desktop-seed.cjs")], {
    cwd: paths.server,
    env: { ...env, DEGLA_SEED_FILE: paths.seed },
  }, log, "initialisation");
  let aborted = false;
  const abort = () => { aborted = true; child.kill(); };
  signal?.addEventListener("abort", abort, { once: true });
  try {
    const finished = await waitForExit(child, 60_000);
    if (!finished) { await stopChild(child); throw new Error("L'initialisation du catalogue a dépassé le délai prévu."); }
    if (aborted) throw new Error("Démarrage annulé.");
    if (child.startupError) throw child.startupError;
    if (child.exitCode !== 0) throw new Error("L'initialisation du catalogue local a échoué. Consultez le journal DEGLA.");
  } finally {
    signal?.removeEventListener("abort", abort);
  }
}

async function stopServices(state) {
  if (!state || state.stopping) return;
  state.stopping = true;
  await stopChild(state.server);
  if (state.mongo && state.mongo.exitCode === null && state.mongo.signalCode === null) {
    // Arrêt MongoDB par sa commande d'administration : fermeture propre des fichiers de données.
    const shutdown = `const m=require('mongoose');m.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:2000}).then(async()=>{try{await m.connection.db.admin().command({shutdown:1,timeoutSecs:3})}catch{}process.exit(0)}).catch(()=>process.exit(1));`;
    const child = launch(state.paths.node, ["-e", shutdown], { cwd: state.paths.server, env: state.env }, state.log, "arrêt MongoDB");
    if (!(await waitForExit(child, 5000))) await stopChild(child, 1000);
    if (!(await waitForExit(state.mongo, 5000))) await stopChild(state.mongo, 2000);
  }
}

async function startServices({ resourcesDir, userDataDir, signal, log = () => {}, onStage = () => {} }) {
  const paths = runtimePaths(resourcesDir, userDataDir);
  for (const target of [paths.node, paths.mongo, path.join(paths.server, "server.js"), path.join(paths.server, "desktop-seed.cjs"), paths.seed]) {
    if (!(await exists(target))) throw new Error(`Fichier nécessaire absent : ${target}. Réinstallez DEGLA.`);
  }
  await fs.mkdir(paths.db, { recursive: true });
  const mongoPort = await availablePort();
  // Une origine HTTP stable conserve le thème et les autres préférences du navigateur.
  const port = await persistentServerPort(userDataDir, mongoPort);
  const env = serverEnvironment(process.env, { mongoPort, port, media: paths.media });
  const state = { paths, env, log, origin: `http://${HOST}:${port}`, mongo: null, server: null, stopping: false };
  try {
    throwIfStopped(signal);
    onStage("Démarrage de la base de données locale…");
    state.mongo = launch(paths.mongo, ["--dbpath", paths.db, "--bind_ip", HOST, "--port", String(mongoPort), "--quiet"], { cwd: paths.data, env }, log, "MongoDB");
    await waitForPort(mongoPort, { child: state.mongo, signal });
    onStage("Préparation du catalogue et des médias…");
    await initializeData(paths, () => runSeedProcess(paths, env, signal, log));
    throwIfStopped(signal);
    onStage("Démarrage de DEGLA…");
    state.server = launch(paths.node, [path.join(paths.server, "server.js")], { cwd: paths.server, env }, log, "Next.js");
    await waitForHealth(state.origin, { child: state.server, signal });
    throwIfStopped(signal);
    return state;
  } catch (error) {
    await stopServices(state);
    throw error;
  }
}

module.exports = {
  runtimePaths, serverEnvironment, isLocalNavigation, isExternalLink,
  availablePort, persistentServerPort, waitForPort, waitForHealth, initializeData, startServices, stopServices,
};
