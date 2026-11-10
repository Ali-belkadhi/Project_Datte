
import { expect } from "chai";
import { describe, it } from "mocha";
import hre from "hardhat";

describe("DateTraceability - A1, A2 & A3", function () {

  // ==========================================
  // TEST 1 : Création d'un lot (A1)
  // ==========================================
  it("doit créer un lot de dattes", async function () {
    const { ethers } = await hre.network.create();
    const [, producer] = await ethers.getSigners();

    const factory =
      await ethers.getContractFactory("DateTraceability");

    const contract = await factory.deploy();
    await contract.waitForDeployment();

    await contract.createLot(
      "LOT-TN-2026-001",
      producer.address,
      "Tozeur",
      "Deglet Nour",
      1767225600n
    );

    expect(
      await contract.lotExists("LOT-TN-2026-001")
    ).to.equal(true);

    const lot = await contract.getLot("LOT-TN-2026-001");

    expect(lot.lotId).to.equal("LOT-TN-2026-001");
    expect(lot.region).to.equal("Tozeur");
    expect(lot.variety).to.equal("Deglet Nour");
    expect(lot.producer).to.equal(producer.address);
    expect(lot.harvestDate).to.equal(1767225600n);
    expect(lot.exists).to.equal(true);
  });

  // ==========================================
  // TEST 2 : Historique de traçabilité (A2)
  // ==========================================
  it("doit ajouter et récupérer les étapes de traçabilité", async function () {
    const { ethers } = await hre.network.create();

    const [, producer, transporter] =
      await ethers.getSigners();

    const factory =
      await ethers.getContractFactory("DateTraceability");

    const contract = await factory.deploy();
    await contract.waitForDeployment();

    await contract.createLot(
      "LOT-TN-2026-002",
      producer.address,
      "Kebili",
      "Deglet Nour",
      1767225600n
    );

    // Étape 1 : Récolte
    await contract.addTraceabilityStep(
      "LOT-TN-2026-002",
      0, // Harvest
      1767225600n,
      "Oasis de Kebili",
      producer.address,
      "QmHashRecolte123"
    );

    // Étape 2 : Transport
    await contract.addTraceabilityStep(
      "LOT-TN-2026-002",
      3, // Transport
      1767312000n,
      "Route Kebili - Rades",
      transporter.address,
      ""
    );

    const history =
      await contract.getTraceabilityHistory(
        "LOT-TN-2026-002"
      );

    expect(history.length).to.equal(2);

    // Vérifier la récolte
    expect(history[0].stepType).to.equal(0n);
    expect(history[0].location)
      .to.equal("Oasis de Kebili");
    expect(history[0].responsibleActor)
      .to.equal(producer.address);
    expect(history[0].documentHash)
      .to.equal("QmHashRecolte123");

    // Vérifier le transport
    expect(history[1].stepType).to.equal(3n);
    expect(history[1].location)
      .to.equal("Route Kebili - Rades");
    expect(history[1].responsibleActor)
      .to.equal(transporter.address);
    expect(history[1].documentHash).to.equal("");
  });

  // ==========================================
  // TEST 3 : Refus des doublons (A1)
  // ==========================================
  it("doit refuser un identifiant de lot dupliqué", async function () {
    const { ethers } = await hre.network.create();
    const [, producer] = await ethers.getSigners();

    const factory =
      await ethers.getContractFactory("DateTraceability");

    const contract = await factory.deploy();
    await contract.waitForDeployment();

    // Première création : autorisée
    await contract.createLot(
      "LOT-TN-2026-001",
      producer.address,
      "Tozeur",
      "Deglet Nour",
      1767225600n
    );

    // Deuxième création : refusée
    await expect(
      contract.createLot(
        "LOT-TN-2026-001",
        producer.address,
        "Kebili",
        "Alig",
        1767225600n
      )
    ).to.be.revertedWith("Lot already exists");
  });

  // ==========================================
  // TEST 4 : Autorisation de créer un lot (A3)
  // ==========================================
  it("doit refuser la création par un utilisateur non autorisé", async function () {
    const { ethers } = await hre.network.create();

    const [, producer, unauthorizedUser] =
      await ethers.getSigners();

    const factory =
      await ethers.getContractFactory("DateTraceability");

    const contract = await factory.deploy();
    await contract.waitForDeployment();

    await expect(
      contract.connect(unauthorizedUser).createLot(
        "LOT-TN-2026-003",
        producer.address,
        "Tozeur",
        "Deglet Nour",
        1767225600n
      )
    )
      .to.be.revertedWithCustomError(
        contract,
        "AccessControlUnauthorizedAccount"
      )
      .withArgs(
        unauthorizedUser.address,
        await contract.LOT_CREATOR_ROLE()
      );

    // Vérifier que le lot n'a pas été créé
    expect(
      await contract.lotExists("LOT-TN-2026-003")
    ).to.equal(false);
  });

  // ==========================================
  // TEST 5 : Autorisation d'ajouter une étape (A3)
  // ==========================================
  it("doit refuser l'ajout d'une étape par un utilisateur non autorisé", async function () {
    const { ethers } = await hre.network.create();

    const [, producer, unauthorizedUser] =
      await ethers.getSigners();

    const factory =
      await ethers.getContractFactory("DateTraceability");

    const contract = await factory.deploy();
    await contract.waitForDeployment();

    // L'administrateur crée un lot
    await contract.createLot(
      "LOT-TN-2026-004",
      producer.address,
      "Tozeur",
      "Deglet Nour",
      1767225600n
    );

    // Un utilisateur sans STEP_ADDER_ROLE
    // tente d'ajouter une étape de transport
    await expect(
      contract.connect(unauthorizedUser).addTraceabilityStep(
        "LOT-TN-2026-004",
        3, // Transport
        1767312000n,
        "Route Tozeur - Tunis",
        unauthorizedUser.address,
        ""
      )
    )
      .to.be.revertedWithCustomError(
        contract,
        "AccessControlUnauthorizedAccount"
      )
      .withArgs(
        unauthorizedUser.address,
        await contract.STEP_ADDER_ROLE()
      );

    // Vérifier que l'historique reste vide
    const history =
      await contract.getTraceabilityHistory(
        "LOT-TN-2026-004"
      );

    expect(history.length).to.equal(0);
  });

});
