import { describe, expect, it } from "vitest";
import { compareInCode, parseDateSouple } from "@/server/services/AnalyseDocumentsService";

function futur() {
  return `${new Date().getFullYear() + 3}-12-31`;
}

describe("parseDateSouple", () => {
  it("lit une date française JJ/MM/AAAA", () => {
    const d = parseDateSouple("31/12/2020");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2020);
    expect(d!.getMonth()).toBe(11);
    expect(d!.getDate()).toBe(31);
  });

  it("lit une date ISO", () => {
    const d = parseDateSouple("2029-12-31T00:00:00.000Z");
    expect(d!.getFullYear()).toBe(2029);
  });

  it("lit un mois/année en fin de mois", () => {
    const d = parseDateSouple("02/2027");
    expect(d!.getFullYear()).toBe(2027);
    expect(d!.getMonth()).toBe(1);
    expect(d!.getDate()).toBe(28);
  });

  it("renvoie null sur une valeur illisible", () => {
    expect(parseDateSouple("date inconnue")).toBeNull();
  });
});

describe("compareInCode", () => {
  const base = { nomBoutique: "Oasis Gabès", nomGerant: "Karim Jlassi" };

  it("signale un document expiré au format français", () => {
    const issues = compareInCode(
      "CIN",
      "CIN",
      { typeDocument: "CIN", nomTitulaire: "Karim Jlassi", dateExpiration: "31/12/2020" },
      base,
    );
    expect(issues).toContain("Document expiré");
  });

  it("ne signale rien pour un document valide et cohérent", () => {
    const issues = compareInCode(
      "CIN",
      "CIN",
      { typeDocument: "CIN", nomTitulaire: "Karim Jlassi", dateExpiration: "30/06/2031" },
      base,
    );
    expect(issues).toEqual([]);
  });

  it("signale un type déclaré différent du type extrait", () => {
    const issues = compareInCode("PATENTE", "CIN", { typeDocument: "PATENTE" }, base);
    expect(issues.some((i) => i.includes("CIN") && i.includes("PATENTE"))).toBe(true);
  });

  it("compare une CIN au gérant, pas à la boutique", () => {
    const issues = compareInCode(
      "CIN",
      "CIN",
      { typeDocument: "CIN", nomTitulaire: "Karim Jlassi" },
      { ...base, nomGerant: "Karim Jlassi" },
    );
    expect(issues).toEqual([]);
    const mismatch = compareInCode(
      "CIN",
      "CIN",
      { typeDocument: "CIN", nomTitulaire: "Autre Personne" },
      base,
    );
    expect(mismatch.some((i) => i.includes("gérant"))).toBe(true);
  });

  it("compare un RNE à la raison sociale", () => {
    const ok = compareInCode(
      "RNE",
      "RNE",
      { typeDocument: "RNE", nomTitulaire: "Oasis Gabès", dateExpiration: futur() },
      base,
    );
    expect(ok).toEqual([]);
    const ko = compareInCode(
      "RNE",
      "RNE",
      { typeDocument: "RNE", nomTitulaire: "Autre Société", dateExpiration: futur() },
      base,
    );
    expect(ko.some((i) => i.includes("raison sociale"))).toBe(true);
  });

  it("ignore les accents et la casse", () => {
    const issues = compareInCode(
      "RNE",
      "RNE",
      { typeDocument: "RNE", nomTitulaire: "OASIS GABES", dateExpiration: futur() },
      base,
    );
    expect(issues).toEqual([]);
  });
});
