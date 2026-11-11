import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { create } from "zustand";
import { jsx, jsxs } from "react/jsx-runtime";
import mongoose from "mongoose";
import ts from "typescript";

function evaluate(relative, require) {
  const context = { exports: {}, require, console };
  const source = ts.transpileModule(readFileSync(new URL(relative, import.meta.url), "utf8"), {
    fileName: relative,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  vm.runInNewContext(source, context, { filename: relative });
  return context.exports;
}

function newStore() {
  return evaluate("../src/stores/favorites-store.ts", (name) => {
    assert.equal(name, "zustand");
    return { create };
  }).useFavoritesStore;
}

function buttonHarness(action) {
  const store = newStore();
  const jobs = [];
  const notices = [];
  const toast = Object.assign((message) => notices.push({ type: "success", message }), {
    error: (message) => notices.push({ type: "error", message }),
  });
  const { FavoriteButton } = evaluate("../src/components/shared/favorite-button.tsx", (name) => {
    if (name === "react") return { startTransition: (callback) => jobs.push(callback()) };
    if (name === "react/jsx-runtime") return { jsx, jsxs };
    if (name === "lucide-react") return { Heart: "heart" };
    if (name === "motion/react") return { motion: { span: "span" }, useReducedMotion: () => false };
    if (name === "sonner") return { toast };
    if (name === "@/lib/utils") return { cn: (...values) => values.filter(Boolean).join(" ") };
    if (name === "@/stores/favorites-store")
      return { useFavoritesStore: (selector) => selector(store.getState()) };
    if (name === "@/hooks/use-mounted") return { useMounted: () => true };
    assert.equal(name, "@/server/modules/catalogue/actions");
    return { basculerFavori: action };
  });
  const render = () => FavoriteButton({ produitId: "product-a", nom: "Dattes" });
  const click = () => render().props.onClick({ preventDefault() {} });
  return { store, jobs, notices, render, click };
}

test("favorites synchronize with new server data after the initial hydration", () => {
  const store = newStore();
  store.getState().initialiser(["old"]);
  store.getState().initialiser(["new"]);
  assert.deepEqual(Array.from(store.getState().ids), ["new"]);
});

test("server hydration preserves pending additions and removals", () => {
  const store = newStore();
  store.getState().initialiser(["remove"]);
  for (const id of ["add", "remove"]) {
    assert.equal(store.getState().commencer(id), true);
    store.getState().basculer(id);
  }
  store.getState().initialiser(["remove", "other"]);
  assert.deepEqual(Array.from(store.getState().ids).sort(), ["add", "other"]);
});

test("a failed database write restores the heart without displaying a success toast", async () => {
  const h = buttonHarness(async () => ({
    ok: false,
    error: { message: "Enregistrement impossible" },
  }));
  h.click();
  assert.equal(h.store.getState().ids.includes("product-a"), true);
  assert.equal(h.render().props.disabled, true);
  await Promise.all(h.jobs);
  assert.equal(h.store.getState().ids.includes("product-a"), false);
  assert.equal(h.render().props.disabled, false);
  assert.deepEqual(h.notices, [{ type: "error", message: "Enregistrement impossible" }]);
});

test("a network failure restores the previous favorite", async () => {
  const h = buttonHarness(async () => {
    throw new Error("Network offline");
  });
  h.store.getState().initialiser(["product-a"]);
  h.click();
  await Promise.all(h.jobs);
  assert.equal(h.store.getState().ids.includes("product-a"), true);
  assert.equal(h.notices[0].type, "error");
});

test("rapid repeated clicks produce only one mutation and respect the confirmed server state", async () => {
  let resolve;
  let requests = 0;
  const response = new Promise((done) => {
    resolve = done;
  });
  const h = buttonHarness(() => {
    requests++;
    return response;
  });
  h.click();
  h.click();
  assert.equal(requests, 1);
  resolve({ ok: true, data: { produitId: "product-a", ajoute: false } });
  await Promise.all(h.jobs);
  assert.equal(h.store.getState().ids.includes("product-a"), false);
  assert.equal(h.notices[0].message, "Retiré de vos favoris");
});

test("the server action saves favorites for the authenticated user", async () => {
  const calls = [];
  const refreshed = [];
  const { basculerFavori } = evaluate("../src/server/modules/catalogue/actions.ts", (name) => {
    if (name === "next/cache") return { revalidatePath: (...args) => refreshed.push(args) };
    if (name === "@/server/core/action")
      return { runAction: (_schema, input, _roles, handler) => handler(input) };
    if (name === "@/server/contracts/comptes")
      return { getUtilisateurCourant: async () => ({ id: "current-user" }) };
    if (name === "@/server/core/errors") return { NotFoundError: class extends Error {} };
    if (name === "./repositories")
      return {
        produitRepository: { parId: async () => ({ statut: "PUBLIE" }) },
        favoriRepository: {
          basculer: async (...args) => {
            calls.push(args);
            return true;
          },
        },
      };
    return {};
  });
  const result = await basculerFavori({ produitId: "product-a" });
  assert.equal(result.ajoute, true);
  assert.deepEqual(calls, [["current-user", "product-a"]]);
  assert.deepEqual(refreshed, [["/", "layout"]]);
});

test("an empty favorites list stays empty instead of recreating demo products", async () => {
  let present = true;
  let writes = 0;
  const model = {
    findOne: async () => (present ? { _id: "favorite" } : null),
    deleteOne: async () => {
      present = false;
    },
    create: async () => {
      writes++;
    },
    find: () => ({ select: () => ({ lean: async () => [] }) }),
  };
  const { favoriRepositoryMongo: repository } = evaluate(
    "../src/server/modules/catalogue/repositories/favori.repository.mongo.ts",
    (name) => {
      if (name === "server-only") return {};
      if (name === "@/server/core/mongo") return { connectMongo: async () => undefined };
      assert.equal(name, "./favori.model");
      return { FavoriModel: model };
    },
  );
  assert.equal(await repository.basculer("current-user", "product-a"), false);
  assert.equal((await repository.produitIds("current-user")).length, 0);
  assert.equal((await repository.fournisseurIds("current-user")).length, 0);
  assert.equal(writes, 0);
});

test("product and shop uniqueness only applies to documents with the corresponding field", () => {
  const { FavoriModel } = evaluate(
    "../src/server/modules/catalogue/repositories/favori.model.ts",
    (name) => {
      assert.equal(name, "mongoose");
      return {
        __esModule: true,
        default: { models: {}, model: (_name, schema) => ({ schema }) },
        Schema: mongoose.Schema,
      };
    },
  );
  const indexes = FavoriModel.schema.indexes().filter(([, options]) => options.unique);
  assert.equal(indexes.length, 2);
  for (const [key, options] of indexes) {
    const field = Object.keys(key).find((name) => name !== "clientId");
    assert.equal(options.sparse, undefined);
    assert.equal(options.partialFilterExpression[field].$type, "string");
  }
});
