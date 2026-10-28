/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from "dotenv";
import crypto from "node:crypto";
dotenv.config({ path: ".env.local" });
dotenv.config();

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import bcrypt from "bcryptjs";

async function main() {
  const { connectMongoose } = await import("../src/server/db/mongoose");
  await connectMongoose();
  const { User, Client, Fournisseur, Adresse, DocumentFournisseur, Conversation, Message, Signalement, Notification, JournalAudit, ParametresPlateforme } = await import("../src/server/models");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  function saveFile(buf: Buffer, name: string) { fs.writeFileSync(path.join(uploadsDir, name), buf); return `/uploads/${name}`; }
  function encryptRib(rib: string) {
    // crypto already imported
    const k = process.env.RIB_ENCRYPTION_KEY || "dev-rib-key-change-me";
    const key = /^[0-9a-fA-F]{64}$/.test(k) ? Buffer.from(k, "hex") : crypto.createHash("sha256").update(k).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const enc = Buffer.concat([cipher.update(rib, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return { iv: iv.toString("hex"), tag: tag.toString("hex"), data: enc.toString("hex"), last4: rib.slice(-4) };
  }

  const SEED_PASSWORD = process.env.SEED_PASSWORD || "SeedPass123!";

  // reset
  const isReset = process.argv.includes("--reset");
  if (isReset || process.argv.includes("--force")) {
    const cols = [User, Client, Fournisseur, Adresse, DocumentFournisseur, Conversation, Message, Signalement, Notification, JournalAudit, ParametresPlateforme];
    for (const c of cols) await (c as any).deleteMany({});
    console.log("Collections cleared.");
  }

  // Ensure seed image dir
  const seedDir = path.join(process.cwd(), "public", "seed");
  if (!fs.existsSync(seedDir)) fs.mkdirSync(seedDir, { recursive: true });

  async function makeImage(text: string, file: string, w = 400, h = 300) {
    const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f5f0e8"/><text x="50%" y="50%" font-size="24" text-anchor="middle" fill="#333">${text}</text></svg>`;
    await sharp(Buffer.from(svg)).png().toFile(path.join(seedDir, file));
    return `/seed/${file}`;
  }

  // placeholder images (documents volontairement illisibles : dossiers non vérifiés)
  await makeImage("SPECIMEN CIN", "cin.png");
  await makeImage("SPECIMEN RNE", "rne.png");
  await makeImage("SPECIMEN PATENTE", "patente.png");
  await makeImage("LOGO BOUTIQUE", "logo.png", 200, 200);
  await makeImage("BANNIERE", "banner.png", 1200, 400);
  await makeImage("BLURRY DOC", "blurry.png");

  /** Document synthétique lisible : les champs existent réellement dans l'image, donc l'analyse IA les retrouve. */
  function documentLegalSvg(type: string, d: { titulaire: string; numero: string; expiration: string }): Buffer {
    const font = "DejaVu Sans, Arial, Helvetica, sans-serif";
    const titres: Record<string, [string, string]> = {
      CIN: ["CARTE NATIONALE D'IDENTITÉ", "MINISTÈRE DE L'INTÉRIEUR · DIRECTION GÉNÉRALE DE LA SÛRETÉ NATIONALE"],
      RNE: ["EXTRAIT DU REGISTRE NATIONAL DES ENTREPRISES", "CENTRE NATIONAL DU REGISTRE DES ENTREPRISES"],
      PATENTE: ["PATENTE", "MINISTÈRE DES FINANCES · DIRECTION GÉNÉRALE DES IMPÔTS"],
    };
    const champs: Record<string, [string, string][]> = {
      CIN: [["TITULAIRE", d.titulaire], ["N° CIN", d.numero], ["DATE D'EXPIRATION", d.expiration]],
      RNE: [["RAISON SOCIALE", d.titulaire], ["N° RNE", d.numero], ["DATE D'EXPIRATION", d.expiration]],
      PATENTE: [["TITULAIRE", d.titulaire], ["N° DE PATENTE", d.numero], ["VALIDITÉ JUSQU'AU", d.expiration]],
    };
    const [titre, sousTitre] = titres[type];
    const rows = champs[type]
      .map(
        ([label, value], i) => `<text x="60" y="${270 + i * 110}" font-family="${font}" font-size="16" fill="#7a6f5a" letter-spacing="1">${label}</text>
    <text x="60" y="${304 + i * 110}" font-family="${font}" font-size="30" font-weight="bold" fill="#10261d">${value}</text>`,
      )
      .join("\n");
    const svg = `<svg width="1000" height="640" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#fbf8f0"/>
  <rect width="100%" height="96" fill="#0f3d2e"/>
  <text x="40" y="42" font-family="${font}" font-size="26" font-weight="bold" fill="#ffffff">RÉPUBLIQUE TUNISIENNE</text>
  <text x="40" y="72" font-family="${font}" font-size="16" fill="#cfe6dc">${sousTitre}</text>
  <text x="40" y="160" font-family="${font}" font-size="32" font-weight="bold" fill="#123a2c">${titre}</text>
  <line x1="40" y1="180" x2="960" y2="180" stroke="#b9a97f" stroke-width="2"/>
  ${rows}
  <text x="40" y="606" font-family="${font}" font-size="15" fill="#6b6252">Document synthétique de démonstration — aucune valeur légale.</text>
</svg>`;
    return Buffer.from(svg);
  }

  function dateFr(iso: string) {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  const hash = await bcrypt.hash(SEED_PASSWORD, 12);

  // Admin
  const admin = await (User as any).findOneAndUpdate(
    { email: "admin@degla.test" },
    { $set: { email: "admin@degla.test", motDePasseHash: hash, prenom: "Admin", nom: "DEGLA", role: "ADMIN", langue: "FR", emailVerifie: true, statut: "ACTIF", tokenVersion: 0 } },
    { upsert: true, new: true },
  );

  // Moderateur
  const moderateur = await (User as any).findOneAndUpdate(
    { email: "moderateur@degla.test" },
    { $set: { email: "moderateur@degla.test", motDePasseHash: hash, prenom: "Mod", nom: "DEGLA", role: "ADMIN", langue: "FR", emailVerifie: true, statut: "ACTIF", tokenVersion: 0 } },
    { upsert: true, new: true },
  );

  // Clients
  const langs = ["FR", "AR", "EN"];
  const clientData = [
    { prenom: "Sarra", nom: "Mejri", tel: "+216 22 345 678", ville: "Tunis", gouv: "TUNIS", cp: "1053", rue: "12, rue du Lac Léman" },
    { prenom: "Youssef", nom: "Trabelsi", tel: "+216 24 118 902", ville: "Sousse", gouv: "SOUSSE", cp: "4000", rue: "Avenue Habib Bourguiba 5" },
    { prenom: "Ines", nom: "Ben Salah", tel: "+216 55 760 341", ville: "Sfax", gouv: "SFAX", cp: "3000", rue: "Rue de la République 18" },
    { prenom: "Mehdi", nom: "Gharbi", tel: "+216 98 442 117", ville: "Tozeur", gouv: "TOZEUR", cp: "2200", rue: "Rue Ibn Chabbat 7" },
    { prenom: "Nour", nom: "Bouazizi", tel: "+216 27 905 663", ville: "Kébili", gouv: "KEBILI", cp: "4200", rue: "Avenue de la Palestine 3" },
  ];
  const clients: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const c = clientData[i - 1];
    const u = await (User as any).findOneAndUpdate(
      { email: `client${i}@degla.test` },
      {
        $set: {
          email: `client${i}@degla.test`,
          motDePasseHash: hash,
          prenom: c.prenom,
          nom: c.nom,
          telephone: c.tel,
          telephoneVerifie: i <= 3,
          role: "CLIENT",
          langue: langs[(i - 1) % 3],
          emailVerifie: true,
          statut: "ACTIF",
          tokenVersion: 0,
          notificationsPrefs: { commandes: true, avis: true, stock: true, modeles3d: true, newsletter: i === 1 },
        },
      },
      { upsert: true, new: true },
    );
    await (Client as any).findOneAndUpdate({ userId: u._id }, { $set: { userId: u._id } }, { upsert: true });
    // addresses
    await (Adresse as any).deleteMany({ userId: u._id });
    await (Adresse as any).create({
      userId: u._id,
      libelle: "Maison",
      destinataire: `${c.prenom} ${c.nom}`,
      ligne1: c.rue,
      ville: c.ville,
      gouvernorat: c.gouv,
      codePostal: c.cp,
      telephone: c.tel,
      parDefaut: true,
    });
    if (i % 2 === 0) {
      await (Adresse as any).create({
        userId: u._id,
        libelle: "Bureau",
        destinataire: `${c.prenom} ${c.nom}`,
        ligne1: "Immeuble Le Palace, 3e étage",
        ville: c.ville,
        gouvernorat: c.gouv,
        codePostal: c.cp,
        telephone: c.tel,
        parDefaut: false,
      });
    }
    clients.push(u);
  }

  // Suppliers
  const supplierData = [
    {
      email: "fournisseur1@degla.test",
      state: "VERIFIE",
      region: "TOZEUR",
      shop: "Palmeraie Ben Amor",
      prenom: "Hédi",
      nom: "Ben Amor",
      tel: "+216 76 452 118",
      rue: "Route de la palmeraie, km 3",
      description:
        "Trois générations de phœniciculteurs au cœur de la palmeraie de Tozeur. Récolte à la main, tri sur place, expédition sous 24 h.",
      couleur: "amber",
      delai: "Expédition sous 24 h",
      varietes: ["deglet-nour", "medjool", "alig", "kenta"],
      note: 4.8,
      ventes: 1860,
      avis: 214,
    },
    {
      email: "fournisseur2@degla.test",
      state: "VERIFIE",
      region: "KEBILI",
      shop: "Coopérative Oasis de Douz",
      prenom: "Mabrouka",
      nom: "Jlidi",
      tel: "+216 75 221 640",
      rue: "Avenue du Sahara, Douz",
      description:
        "62 petits producteurs du Nefzaoua réunis pour vendre en direct : Deglet Nour, Medjool et café de noyaux artisanal.",
      couleur: "palm",
      delai: "Expédition sous 48 h",
      varietes: ["deglet-nour", "medjool", "khouat-alig"],
      note: 4.7,
      ventes: 1120,
      avis: 138,
    },
    {
      email: "fournisseur3@degla.test",
      state: "EN_ATTENTE",
      region: "GABES",
      shop: "Oasis Gabès",
      prenom: "Karim",
      nom: "Jlassi",
      tel: "+216 75 330 219",
      rue: "Route de Matmata, km 2",
      description: "Petite exploitation familiale spécialisée dans les dattes Kentichi et les produits dérivés.",
      couleur: "clay",
      delai: "Expédition sous 48 h",
      varietes: ["kentichi", "deglet-nour"],
      note: 0,
      ventes: 0,
      avis: 0,
    },
    {
      email: "fournisseur4@degla.test",
      state: "EN_ATTENTE",
      region: "GAFSA",
      shop: "Dattes Gafsa",
      prenom: "Amel",
      nom: "Bouzid",
      tel: "+216 76 881 507",
      rue: "Cité El Guettar, Gafsa",
      description: "Dattes Alig et Kenta conditionnées à la ferme, sans traitement après récolte.",
      couleur: "date",
      delai: "Expédition sous 72 h",
      varietes: ["alig", "kenta"],
      note: 0,
      ventes: 0,
      avis: 0,
    },
    {
      email: "fournisseur5@degla.test",
      state: "REFUSE",
      region: "SFAX",
      shop: "Dattes Sfax",
      prenom: "Tarek",
      nom: "Mansour",
      tel: "+216 74 220 983",
      rue: "Rue Mongi Slim, Sfax",
      description: "Négoce de dattes en gros, principalement destiné aux pâtisseries de la région.",
      couleur: "night",
      delai: "Expédition sous 48 h",
      varietes: ["deglet-nour"],
      note: 0,
      ventes: 0,
      avis: 0,
    },
    {
      email: "fournisseur6@degla.test",
      state: "SUSPENDU",
      region: "MEDENINE",
      shop: "Dattes Médenine",
      prenom: "Rania",
      nom: "Khelifi",
      tel: "+216 75 640 112",
      rue: "Avenue de l'Environnement, Médenine",
      description: "Coopérative de conditionnement de dattes biologiques dans le sud-est tunisien.",
      couleur: "date",
      delai: "Expédition sous 48 h",
      varietes: ["deglet-nour", "medjool"],
      note: 4.1,
      ventes: 340,
      avis: 37,
    },
  ];
  const suppliers: any[] = [];
  for (let i = 0; i < supplierData.length; i++) {
    const sd = supplierData[i];
    const u = await (User as any).findOneAndUpdate(
      { email: sd.email },
      {
        $set: {
          email: sd.email,
          motDePasseHash: hash,
          prenom: sd.prenom,
          nom: sd.nom,
          telephone: sd.tel,
          telephoneVerifie: true,
          role: "FOURNISSEUR",
          langue: "FR",
          emailVerifie: true,
          statut: "ACTIF",
          tokenVersion: 0,
          notificationsPrefs: { commandes: true, avis: true, stock: true, modeles3d: true, newsletter: false },
        },
      },
      { upsert: true, new: true },
    );
    await (Fournisseur as any).deleteMany({ userId: u._id });
    const slug = sd.shop.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const f = await (Fournisseur as any).create({
      userId: u._id,
      nomBoutique: sd.shop,
      slug,
      type: i === 1 ? "COOPERATIVE" : "PRODUCTEUR",
      region: sd.region,
      adresseExploitation: sd.rue,
      description: sd.description,
      couleur: sd.couleur,
      delaiExpedition: sd.delai,
      varietes: sd.varietes,
      statutVerification: sd.state,
      onboardingComplete: true,
      onboardingStep: 3,
      noteMoyenne: sd.note,
      nombreVentes: sd.ventes,
      nombreAvis: sd.avis,
      createdAt: new Date(Date.now() - (420 + i * 55) * 86400000),
      soumisLe: new Date(
        Date.now() -
          (sd.state === "VERIFIE" ? 45 : sd.state === "SUSPENDU" ? 20 : sd.state === "REFUSE" ? 12 : 3) * 86400000,
      ),
      ...(sd.state === "VERIFIE" ? { verifieLe: new Date(Date.now() - 40 * 86400000) } : {}),
      ...(sd.state === "REFUSE" ? { motifRefus: "Documents illisibles. Merci de renvoyer des photos nettes de la patente et du RNE." } : {}),
      ...(sd.state === "SUSPENDU" ? { motifRefus: "Activité suspendue : contrôle qualité en cours." } : {}),
      ...(sd.state === "VERIFIE" ? { logoUrl: "/seed/logo.png", bannerUrl: "/seed/banner.png" } : {}),
    });
    const verifie = sd.state === "VERIFIE";
    f.ribEncrypted = encryptRib(verifie ? "12345678901234567890" : "98765432109876543210");
    if (verifie) f.analyseIALe = new Date(Date.now() - (400 + i * 55) * 86400000 + 86400000);
    await f.save();
    // documents (tous les dossiers, validés pour les boutiques vérifiées)
    const confiances: Record<string, number> = { CIN: 0.96, RNE: 0.91, PATENTE: 0.89 };
    const documentsLegaux: Record<string, { nom: string; numero: string; expiration: string }> = {
      CIN: { nom: `${sd.prenom} ${sd.nom}`, numero: "09" + String(12000000 + i * 13579), expiration: "2031-06-30" },
      RNE: { nom: sd.shop, numero: `B0${1200000 + i * 37}2024`, expiration: "2029-12-31" },
      PATENTE: { nom: sd.shop, numero: `P${4500000 + i * 211}`, expiration: "2027-09-30" },
    };
    for (const t of ["CIN", "RNE", "PATENTE"]) {
      const legal = documentsLegaux[t];
      const specimen = t === "CIN" ? "cin.png" : t === "RNE" ? "rne.png" : "patente.png";
      const nomFichier = verifie ? `document-${t.toLowerCase()}.png` : specimen;
      const buf = verifie
        ? await sharp(documentLegalSvg(t, { titulaire: legal.nom, numero: legal.numero, expiration: dateFr(legal.expiration) })).png().toBuffer()
        : fs.readFileSync(path.join(seedDir, specimen));
      const url = saveFile(buf, `seed-${f._id}-${t}.png`);
      await (DocumentFournisseur as any).create({
        fournisseurId: f._id,
        type: t,
        fichierUrl: url,
        nomFichier,
        valide: verifie ? true : null,
        scoreConfianceIA: verifie ? confiances[t] : 0,
        analyseIA: verifie
          ? {
              typeDocument: t,
              nomTitulaire: legal.nom,
              numero: legal.numero,
              dateExpiration: dateFr(legal.expiration),
              lisible: true,
              incoherences: [],
              confiance: confiances[t],
            }
          : null,
      });
    }
    suppliers.push({ user: u, fournisseur: f });
  }

  // Shared catalog: 10 produits for verified suppliers
  const sharedModelsDir = path.join(process.cwd(), "src", "server", "models", "shared");
  if (!fs.existsSync(sharedModelsDir)) fs.mkdirSync(sharedModelsDir, { recursive: true });

  // Define a simple Produit model if not exists
  const mg = await import("mongoose");
  const Schema = mg.Schema || mg.default.Schema;
  const model = mg.model || mg.default.model;
  const models = mg.models || mg.default.models;
  const S = new Schema({ nom: String, typeProduit: String, fournisseurId: Schema.Types.ObjectId, statut: String, prixParKg: Number, stockGrammes: Number, slug: String, description: String }, { timestamps: true });
  const Produit = (models && models.Produit) ? models.Produit : model("Produit", S);

  const verifiedSuppliers = suppliers.filter((s) => s.fournisseur.statutVerification === "VERIFIE");
  const products: any[] = [];
  const productNames = ["Deglet Nour Extra", "Deglet Nour Standard", "Alig Premium", "Kentichi Bio", "Sirop de datte", "Pâte de datte", "Rob de datte", "Confiture de datte", "Miel de datte", "Café de noyaux"];
  const productDescriptions: Record<string, string> = {
    "Deglet Nour Extra": "Dattes Deglet Nour charnues et translucides, récoltées à pleine maturité dans la palmeraie de Tozeur.",
    "Deglet Nour Standard": "Deglet Nour de calibre courant, idéale pour la table familiale et la pâtisserie.",
    "Alig Premium": "Alig tendre et sucrée, à la peau fine, conditionnée en caissettes de 5 kg.",
    "Kentichi Bio": "Variété Kentichi cultivée sans intrant chimique, séchée naturellement au soleil.",
    "Sirop de datte": "Sirop de datte artisanal, sans sucre ajouté, issu de dattes invendues valorisées.",
    "Pâte de datte": "Pâte de datte nature, broyée à froid, sans conservateur.",
    "Rob de datte": "Rob de datte pressé à froid, parfait pour les marinades et les desserts.",
    "Confiture de datte": "Confiture de dattes cuite au chaudron avec une pointe de citron.",
    "Miel de datte": "Miel de datte récolté dans les oasis du Djérid, texture sirupeuse.",
    "Café de noyaux": "Café de noyaux de datte torréfiés, une spécialité du Nefzaoua sans caféine.",
  };
  for (let i = 0; i < 10; i++) {
    const sup = verifiedSuppliers[i % verifiedSuppliers.length];
    const isDerive = i >= 5;
    const p = await (Produit as any).create({
      nom: productNames[i],
      slug: productNames[i].toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      typeProduit: isDerive ? "DERIVE" : "DATTE",
      fournisseurId: sup.fournisseur._id,
      statut: i === 9 ? "BROUILLON" : "PUBLIE",
      description: productDescriptions[productNames[i]],
      prixParKg: 15000 + i * 1000,
      stockGrammes: 5000 + i * 500,
      creeLe: new Date(),
    });
    products.push(p);
  }

  // 15 avis
  // Avis model created locally (not in src models)
  const mg2 = await import("mongoose");
  const Schema2 = mg2.Schema || mg2.default.Schema;
  const model2 = mg2.model || mg2.default.model;
  const models2 = mg2.models || mg2.default.models;
  const SA = new Schema2({ produitId: Schema2.Types.ObjectId, fournisseurId: Schema2.Types.ObjectId, auteur: String, note: Number, commentaire: String, achatVerifie: Boolean, statutModeration: String, creeLe: Date }, { timestamps: true });
  const AvisModel = (models2 && models2.Avis) ? models2.Avis : model2("Avis", SA);
  const avisAuteurs = ["Sarra M.", "Youssef T.", "Ines B.", "Mehdi G.", "Nour B."];
  const avisTextes = [
    "Dattes reçues en parfait état, très charnues. L'emballage protège bien les fruits.",
    "Bonne qualité pour le prix, livraison rapide à Sousse.",
    "Le sirop est délicieux, moins sucré que celui du commerce. Je recommande.",
    "Quelques dattes abîmées dans le carton, mais le vendeur a répondu tout de suite.",
    "Parfait pour le Ramadan, la famille a adoré. Commande renouvelée.",
    "Le café de noyaux a un goût surprenant, très agréable sans caféine.",
  ];
  for (let i = 0; i < 15; i++) {
    const p = products[i % products.length];
    await (AvisModel as any).create({
      produitId: p._id,
      fournisseurId: p.fournisseurId,
      auteur: avisAuteurs[i % avisAuteurs.length],
      note: i % 7 === 3 ? 3 : i % 5 === 0 ? 5 : 4,
      commentaire: avisTextes[i % avisTextes.length],
      achatVerifie: i % 2 === 0,
      statutModeration: i % 4 === 0 ? "MASQUE" : "VISIBLE",
      creeLe: new Date(Date.now() - i * 86400000),
    });
  }

  // Messaging: 4 conversations with realistic exchanges
  const convs: any[] = [];
  const dialogues = [
    [
      "Bonjour, la récolte de Deglet Nour Extra est-elle bien de cette saison ?",
      "Bonjour Sarra, oui, récolte de la semaine dernière dans notre palmeraie de Tozeur.",
      "Parfait. Vous expédiez sous quel délai vers Tunis ?",
      "Sous 24 h en colis protégé. Livraison généralement en 48 h.",
      "Très bien, je viens de commander 2 kg. Merci !",
      "Merci à vous, nous préparons le colis dès demain matin.",
    ],
    [
      "Bonjour, le sirop de datte contient-il du sucre ajouté ?",
      "Bonjour Youssef, non, uniquement le sucre naturel des dattes.",
      "Et le café de noyaux, il est torréfié sur place ?",
      "Oui, torréfaction artisanale chaque semaine à Douz.",
      "Je prendrai les deux produits alors. Merci pour vos réponses.",
      "Avec plaisir, n'hésitez pas si vous avez d'autres questions.",
      "Colis bien reçu, tout était parfait. Merci !",
    ],
    [
      "Bonjour, avez-vous de l'Alig Premium en caissette de 5 kg ?",
      "Bonjour Ines, oui, stock disponible. La caissette est à 62 DT.",
      "Est-ce possible de livrer à Sfax avant vendredi ?",
      "Oui, expédition demain matin, réception jeudi.",
      "Parfait, je passe commande aujourd'hui.",
    ],
    [
      "Bonjour, le miel de datte est-il filtré ?",
      "Bonjour Mehdi, il est filtré grossièrement pour garder le goût de l'oasis.",
      "D'accord. Quelle est la date de récolte ?",
      "Récolte de septembre, pot de 500 g. Nous pouvons vous envoyer une photo du lot.",
      "Oui, volontiers. Merci beaucoup.",
      "Photo envoyée par e-mail. Bonne dégustation !",
      "Bien reçue, commande passée. Merci.",
    ],
  ];
  for (let i = 0; i < 4; i++) {
    const client = clients[i % clients.length];
    const sup = verifiedSuppliers[i % verifiedSuppliers.length];
    const produit = products[i % products.length];
    const debut = Date.now() - (i + 1) * 86400000;
    const lignes = dialogues[i];
    const conv = await (Conversation as any).create({
      clientId: client._id,
      fournisseurId: sup.fournisseur._id,
      produitId: produit._id,
      dernierMessageLe: new Date(debut + lignes.length * 3600000),
    });
    convs.push(conv);
    for (let j = 0; j < lignes.length; j++) {
      const fromClient = j % 2 === 0;
      await (Message as any).create({
        conversationId: conv._id,
        expediteurId: fromClient ? client._id : sup.user._id,
        contenu: lignes[j],
        lu: j < lignes.length - 1,
        creeLe: new Date(debut + j * 3600000),
      });
    }
  }

  // Signalements: 8 with realistic targets
  const signalementsData = [
    { cible: "PRODUIT", motif: "NON_CONFORME", texte: "La marchandise reçue ne correspond pas au calibre annoncé sur la fiche." },
    { cible: "AVIS", motif: "INAPPROPRIE", texte: "Cet avis contient des propos insultants envers le producteur." },
    { cible: "FOURNISSEUR", motif: "FRAUDE", texte: "La boutique affiche un numéro de patente qui ne correspond pas au registre." },
    { cible: "MESSAGE", motif: "SPAM", texte: "Le vendeur envoie des messages promotionnels répétés hors commande." },
    { cible: "PRODUIT", motif: "AUTRE", texte: "Photos non représentatives : les dattes sont beaucoup plus petites en réalité." },
    { cible: "AVIS", motif: "SPAM", texte: "Avis suspect, publié plusieurs fois par le même compte." },
    { cible: "FOURNISSEUR", motif: "NON_CONFORME", texte: "Le vendeur ne répond plus depuis une semaine malgré une commande en cours." },
    { cible: "MESSAGE", motif: "INAPPROPRIE", texte: "Message contenant des menaces après une demande de remboursement." },
  ];
  for (let i = 0; i < 8; i++) {
    const sd = signalementsData[i];
    const cibleId =
      sd.cible === "PRODUIT"
        ? String(products[i % products.length]._id)
        : sd.cible === "FOURNISSEUR"
          ? String(suppliers[i % suppliers.length].fournisseur._id)
          : sd.cible === "MESSAGE"
            ? String(convs[i % convs.length]._id)
            : `avis-${i + 1}`;
    const cibleLibelle =
      sd.cible === "PRODUIT"
        ? products[i % products.length].nom
        : sd.cible === "FOURNISSEUR"
          ? suppliers[i % suppliers.length].fournisseur.nomBoutique
          : sd.cible === "MESSAGE"
            ? `Conversation avec ${verifiedSuppliers[i % verifiedSuppliers.length].fournisseur.nomBoutique}`
            : `Avis de ${avisAuteurs[i % avisAuteurs.length]}`;
    await (Signalement as any).create({
      auteurId: clients[i % clients.length]._id,
      cibleType: sd.cible,
      cibleId,
      cibleLibelle,
      motif: sd.motif,
      texteLibre: sd.texte,
      statut: ["OUVERT", "TRAITE", "REJETE"][i % 3],
      traiteParId: i % 3 !== 0 ? admin._id : undefined,
      noteAdmin: i % 3 === 1 ? "Contenu masqué, vendeur averti." : i % 3 === 2 ? "Signalement infondé après vérification." : undefined,
      creeLe: new Date(Date.now() - i * 86400000),
    });
  }

  // Notifications: 20 messages fonctionnels (clients + vendeurs)
  const notificationsData: Array<{ dest: "CLIENT" | "FOURNISSEUR"; type: string; titre: string; contenu: string; lien: string }> = [
    {
      dest: "CLIENT",
      type: "COMMANDE_STATUT",
      titre: "Commande expédiée",
      contenu: "Votre commande DGL-2026-000123 a été expédiée par Palmeraie Ben Amor. Livraison prévue sous 48 h.",
      lien: "/compte/commandes",
    },
    {
      dest: "FOURNISSEUR",
      type: "NOUVELLE_COMMANDE",
      titre: "Nouvelle commande reçue",
      contenu: "Commande DGL-2026-000124 de Youssef Trabelsi : 3 kg de Deglet Nour Extra.",
      lien: "/vendeur/commandes",
    },
    {
      dest: "CLIENT",
      type: "NOUVEAU_MESSAGE",
      titre: "Nouveau message de Palmeraie Ben Amor",
      contenu: "Votre colis part demain matin, le numéro de suivi vous sera transmis dès l'expédition.",
      lien: "/compte/messages",
    },
    {
      dest: "FOURNISSEUR",
      type: "NOUVEL_AVIS",
      titre: "Nouvel avis client",
      contenu: "Sarra M. a laissé un avis 5/5 sur votre Deglet Nour Extra.",
      lien: "/vendeur/avis",
    },
    {
      dest: "CLIENT",
      type: "COMMANDE_STATUT",
      titre: "Commande livrée",
      contenu: "La commande DGL-2026-000119 a été livrée. Vous pouvez maintenant laisser un avis au producteur.",
      lien: "/compte/commandes",
    },
    {
      dest: "FOURNISSEUR",
      type: "STOCK_BAS",
      titre: "Stock bas sur Alig Premium",
      contenu: "Il reste moins de 2 kg en stock. Pensez à réapprovisionner votre fiche produit.",
      lien: "/vendeur/produits",
    },
    {
      dest: "CLIENT",
      type: "NOUVEAU_MESSAGE",
      titre: "Nouveau message de Coopérative Oasis de Douz",
      contenu: "Le sirop de datte est de nouveau disponible, en pots de 500 g.",
      lien: "/compte/messages",
    },
    {
      dest: "FOURNISSEUR",
      type: "CREDITS_3D_BAS",
      titre: "Crédits Studio 3D bientôt épuisés",
      contenu: "Il vous reste 2 crédits. Rechargez pour continuer à générer vos modèles 3D.",
      lien: "/vendeur/credits",
    },
    {
      dest: "CLIENT",
      type: "COMMANDE_STATUT",
      titre: "Commande en préparation",
      contenu: "Votre commande DGL-2026-000126 est en cours de préparation chez le producteur.",
      lien: "/compte/commandes",
    },
    {
      dest: "FOURNISSEUR",
      type: "ACHAT_CREDITS_CONFIRME",
      titre: "Achat de crédits confirmé",
      contenu: "10 crédits Studio 3D ont été ajoutés à votre compte vendeur.",
      lien: "/vendeur/credits",
    },
    {
      dest: "CLIENT",
      type: "COMMANDE_STATUT",
      titre: "Colis en cours de livraison",
      contenu: "Votre colis est en tournée de livraison à Tunis. Le livreur vous contactera avant 17 h.",
      lien: "/compte/commandes",
    },
    {
      dest: "FOURNISSEUR",
      type: "FOURNISSEUR_VALIDE",
      titre: "Boutique validée",
      contenu: "Votre boutique Palmeraie Ben Amor est validée : elle est désormais visible dans le catalogue DEGLA.",
      lien: "/vendeur",
    },
    {
      dest: "CLIENT",
      type: "NOUVEAU_MESSAGE",
      titre: "Nouveau message de Dattes Gafsa",
      contenu: "Nous avons reçu votre question sur les dattes Alig, la récolte arrive la semaine prochaine.",
      lien: "/compte/messages",
    },
    {
      dest: "FOURNISSEUR",
      type: "NOUVELLE_COMMANDE",
      titre: "Nouvelle commande reçue",
      contenu: "Commande DGL-2026-000127 de Ines Ben Salah : 1 caissette d'Alig Premium (5 kg).",
      lien: "/vendeur/commandes",
    },
    {
      dest: "CLIENT",
      type: "COMMANDE_STATUT",
      titre: "Commande confirmée",
      contenu: "Votre commande DGL-2026-000128 est confirmée. Expédition sous 24 h depuis Tozeur.",
      lien: "/compte/commandes",
    },
    {
      dest: "FOURNISSEUR",
      type: "NOUVEL_AVIS",
      titre: "Nouvel avis client",
      contenu: "Mehdi G. a signalé quelques dattes abîmées. Vous pouvez lui répondre depuis vos messages.",
      lien: "/vendeur/avis",
    },
    {
      dest: "CLIENT",
      type: "COMMANDE_STATUT",
      titre: "Commande remboursée",
      contenu: "La commande DGL-2026-000117 a été remboursée sur votre moyen de paiement d'origine.",
      lien: "/compte/commandes",
    },
    {
      dest: "FOURNISSEUR",
      type: "STOCK_BAS",
      titre: "Stock bas sur Sirop de datte",
      contenu: "Il reste 6 flacons de 500 ml. Le seuil d'alerte configuré est de 10.",
      lien: "/vendeur/produits",
    },
    {
      dest: "CLIENT",
      type: "NOUVEAU_MESSAGE",
      titre: "Nouveau message de Palmeraie Ben Amor",
      contenu: "Merci pour votre commande, nous préparons le colis dès demain matin.",
      lien: "/compte/messages",
    },
    {
      dest: "FOURNISSEUR",
      type: "ANALYSE_IA_PRETE",
      titre: "Analyse IA de vos documents terminée",
      contenu: "Les documents de votre dossier ont été analysés. Score de confiance : 92 %.",
      lien: "/vendeur/onboarding",
    },
    {
      dest: "CLIENT",
      type: "COMMANDE_STATUT",
      titre: "Paiement confirmé",
      contenu: "Le paiement de votre commande DGL-2026-000129 a bien été enregistré. Merci de votre confiance.",
      lien: "/compte/commandes",
    },
    {
      dest: "CLIENT",
      type: "NOUVEAU_MESSAGE",
      titre: "Nouveau message de Palmeraie Ben Amor",
      contenu: "Votre colis de Medjool est prêt, il part demain matin par transporteur.",
      lien: "/compte/messages",
    },
    {
      dest: "CLIENT",
      type: "COMMANDE_STATUT",
      titre: "Commande en attente de confirmation",
      contenu: "Le producteur doit confirmer la disponibilité de votre commande DGL-2026-000130 sous 24 h.",
      lien: "/compte/commandes",
    },
    {
      dest: "CLIENT",
      type: "COMMANDE_STATUT",
      titre: "Retour enregistré",
      contenu: "Votre demande de retour pour la commande DGL-2026-000115 a été prise en compte.",
      lien: "/compte/commandes",
    },
    {
      dest: "FOURNISSEUR",
      type: "NOUVELLE_COMMANDE",
      titre: "Nouvelle commande reçue",
      contenu: "Commande DGL-2026-000131 de Nour Bouazizi : 2 kg de Deglet Nour Standard.",
      lien: "/vendeur/commandes",
    },
    {
      dest: "FOURNISSEUR",
      type: "NOUVEL_AVIS",
      titre: "Nouvel avis client",
      contenu: "Nour B. a laissé un avis 4/5 : « Très bon rapport qualité-prix, livraison rapide ».",
      lien: "/vendeur/avis",
    },
  ];
  for (let i = 0; i < notificationsData.length; i++) {
    const n = notificationsData[i];
    const u = n.dest === "CLIENT" ? clients[i % clients.length] : verifiedSuppliers[i % verifiedSuppliers.length].user;
    await (Notification as any).create({
      userId: u._id,
      type: n.type,
      titre: n.titre,
      contenu: n.contenu,
      lien: n.lien,
      lue: i % 3 === 0,
      creeLe: new Date(Date.now() - i * 3600000),
    });
  }

  // Audit log: 30 entries over 30 days
  const auditData: Array<{ action: string; entite: string; details: Record<string, unknown> }> = [
    { action: "FOURNISSEUR_VALIDE", entite: "Fournisseur", details: { nomBoutique: "Palmeraie Ben Amor", statutAvant: "EN_ATTENTE", statutApres: "VERIFIE" } },
    { action: "SIGNALEMENT_TRAITE", entite: "Signalement", details: { motif: "NON_CONFORME", statutApres: "TRAITE" } },
    { action: "CONNEXION", entite: "Utilisateur", details: { methode: "credentials" } },
    { action: "FOURNISSEUR_REFUSE", entite: "Fournisseur", details: { nomBoutique: "Dattes Sfax", motif: "Documents illisibles" } },
    { action: "PARAMETRES_MODIFIES", entite: "ParametresPlateforme", details: { champ: "tauxCommission", avant: 0.07, apres: 0.08 } },
    { action: "MODIFICATION_PROFIL", entite: "Utilisateur", details: { champ: "telephone" } },
    { action: "ANALYSE_IA", entite: "Fournisseur", details: { documents: 3, scoreConfiance: 92 } },
    { action: "SIGNALEMENT_TRAITE", entite: "Signalement", details: { motif: "SPAM", statutApres: "REJETE" } },
    { action: "FOURNISSEUR_VALIDE", entite: "Fournisseur", details: { nomBoutique: "Coopérative Oasis de Douz", statutAvant: "EN_ATTENTE", statutApres: "VERIFIE" } },
    { action: "PARAMETRES_MODIFIES", entite: "ParametresPlateforme", details: { champ: "fraisLivraisonDefaut", avant: 6000, apres: 5000 } },
  ];
  for (let i = 0; i < 30; i++) {
    const a = auditData[i % auditData.length];
    const entiteId =
      a.entite === "Fournisseur"
        ? String(suppliers[i % suppliers.length].fournisseur._id)
        : a.entite === "Signalement"
          ? `sig-${(i % 8) + 1}`
          : a.entite === "ParametresPlateforme"
            ? "global"
            : String(i % 2 === 0 ? admin._id : moderateur._id);
    await (JournalAudit as any).create({
      action: a.action,
      entite: a.entite,
      entiteId,
      details: a.details,
      ip: "127.0.0.1",
      utilisateurId: i % 2 === 0 ? admin._id : moderateur._id,
      creeLe: new Date(Date.now() - i * 86400000),
    });
  }

  // ParametresPlateforme
  await (ParametresPlateforme as any).deleteMany({});
  await (ParametresPlateforme as any).create({
    tauxCommission: 0.08,
    fraisLivraisonDefaut: 5000,
    livraisonGratuiteDes: 50000,
    creditsOffertsInscription: 5,
    coutCreditsImage: 1,
    coutCreditsMultiImage: 2,
    seuilCreditsBas: 3,
    delaiMax3DMinutes: 15,
  });

  console.log("\n=== Seeded accounts ===");
  console.log("Password for all:", SEED_PASSWORD);
  console.table([
    { email: "admin@degla.test", role: "ADMIN (SUPER_ADMIN)" },
    { email: "moderateur@degla.test", role: "ADMIN (MODERATEUR)" },
    ...Array.from({ length: 5 }, (_, i) => ({ email: `client${i + 1}@degla.test`, role: "CLIENT" })),
    ...Array.from({ length: 6 }, (_, i) => ({ email: `fournisseur${i + 1}@degla.test`, role: "FOURNISSEUR" })),
  ]);
  console.log("\nSeed complete.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });