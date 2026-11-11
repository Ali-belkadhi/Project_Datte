
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

  it("doit émettre LotCreated avec les données du lot", async function () {
    const { ethers } = await hre.network.create();
    const [, producer] = await ethers.getSigners();
    const contract = await (await ethers.getContractFactory("DateTraceability")).deploy();
    await contract.waitForDeployment();

    await expect(
      contract.createLot("LOT-TN-2026-EVENT", producer.address, "Gabès", "Kenta", 1767225600n),
    )
      .to.emit(contract, "LotCreated")
      .withArgs("LOT-TN-2026-EVENT", producer.address, "Gabès", "Kenta", 1767225600n);
  });

  it("doit valider tous les champs obligatoires d'un lot", async function () {
    const { ethers } = await hre.network.create();
    const [, producer] = await ethers.getSigners();
    const contract = await (await ethers.getContractFactory("DateTraceability")).deploy();
    await contract.waitForDeployment();

    await expect(contract.createLot("", producer.address, "Tozeur", "Deglet Nour", 1n)).to.be.revertedWith("Empty lot ID");
    await expect(contract.createLot("LOT-ZERO", ethers.ZeroAddress, "Tozeur", "Deglet Nour", 1n)).to.be.revertedWith("Invalid producer");
    await expect(contract.createLot("LOT-REGION", producer.address, "", "Deglet Nour", 1n)).to.be.revertedWith("Empty region");
    await expect(contract.createLot("LOT-VARIETY", producer.address, "Tozeur", "", 1n)).to.be.revertedWith("Empty variety");
    await expect(contract.createLot("LOT-DATE", producer.address, "Tozeur", "Deglet Nour", 0n)).to.be.revertedWith("Invalid harvest date");
  });

  it("doit refuser les lectures et écritures sur un lot inexistant", async function () {
    const { ethers } = await hre.network.create();
    const [, actor] = await ethers.getSigners();
    const contract = await (await ethers.getContractFactory("DateTraceability")).deploy();
    await contract.waitForDeployment();

    await expect(contract.getLot("LOT-ABSENT")).to.be.revertedWith("Lot not found");
    await expect(contract.getTraceabilityHistory("LOT-ABSENT")).to.be.revertedWith("Lot not found");
    await expect(
      contract.addTraceabilityStep("LOT-ABSENT", 0, 1n, "Tozeur", actor.address, ""),
    ).to.be.revertedWith("Lot not found");
  });

  it("doit conserver les cinq types d'étapes dans leur ordre d'ajout", async function () {
    const { ethers } = await hre.network.create();
    const [, producer] = await ethers.getSigners();
    const contract = await (await ethers.getContractFactory("DateTraceability")).deploy();
    await contract.waitForDeployment();
    await contract.createLot("LOT-TN-2026-ALL-STEPS", producer.address, "Kébili", "Alig", 100n);

    const labels = ["Récolte", "Conditionnement", "Transformation", "Transport", "Distribution"];
    for (let stepType = 0; stepType < labels.length; stepType += 1) {
      await expect(
        contract.addTraceabilityStep(
          "LOT-TN-2026-ALL-STEPS",
          stepType,
          BigInt(100 + stepType),
          labels[stepType],
          producer.address,
          `hash-${stepType}`,
        ),
      )
        .to.emit(contract, "TraceabilityStepAdded")
        .withArgs(
          "LOT-TN-2026-ALL-STEPS",
          stepType,
          BigInt(100 + stepType),
          labels[stepType],
          producer.address,
          `hash-${stepType}`,
        );
    }

    const history = await contract.getTraceabilityHistory("LOT-TN-2026-ALL-STEPS");
    expect(history).to.have.length(5);
    history.forEach((step, index) => expect(step.stepType).to.equal(BigInt(index)));
  });

  it("doit valider les champs obligatoires d'une étape", async function () {
    const { ethers } = await hre.network.create();
    const [, producer] = await ethers.getSigners();
    const contract = await (await ethers.getContractFactory("DateTraceability")).deploy();
    await contract.waitForDeployment();
    await contract.createLot("LOT-TN-2026-STEP-VALIDATION", producer.address, "Tozeur", "Deglet Nour", 100n);

    await expect(
      contract.addTraceabilityStep("LOT-TN-2026-STEP-VALIDATION", 0, 0n, "Tozeur", producer.address, ""),
    ).to.be.revertedWith("Invalid step date");
    await expect(
      contract.addTraceabilityStep("LOT-TN-2026-STEP-VALIDATION", 0, 100n, "", producer.address, ""),
    ).to.be.revertedWith("Empty location");
    await expect(
      contract.addTraceabilityStep("LOT-TN-2026-STEP-VALIDATION", 0, 100n, "Tozeur", ethers.ZeroAddress, ""),
    ).to.be.revertedWith("Invalid responsible actor");
  });

  it("doit permettre à l'administrateur d'attribuer puis de révoquer les rôles", async function () {
    const { ethers } = await hre.network.create();
    const [, producer, operator] = await ethers.getSigners();
    const contract = await (await ethers.getContractFactory("DateTraceability")).deploy();
    await contract.waitForDeployment();
    const creatorRole = await contract.LOT_CREATOR_ROLE();
    const stepRole = await contract.STEP_ADDER_ROLE();

    await contract.grantRole(creatorRole, operator.address);
    await contract.grantRole(stepRole, operator.address);
    expect(await contract.hasRole(creatorRole, operator.address)).to.equal(true);
    expect(await contract.hasRole(stepRole, operator.address)).to.equal(true);

    await contract.connect(operator).createLot("LOT-TN-2026-DELEGATED", producer.address, "Tozeur", "Deglet Nour", 100n);
    await contract.connect(operator).addTraceabilityStep("LOT-TN-2026-DELEGATED", 0, 100n, "Tozeur", producer.address, "hash");

    await contract.revokeRole(creatorRole, operator.address);
    await contract.revokeRole(stepRole, operator.address);
    expect(await contract.hasRole(creatorRole, operator.address)).to.equal(false);
    expect(await contract.hasRole(stepRole, operator.address)).to.equal(false);
  });

  it("doit frapper un NFT DLOT au producteur lors de la création du lot", async function () {
    const { ethers } = await hre.network.create();
    const [, producer] = await ethers.getSigners();
    const contract = await (await ethers.getContractFactory("DateTraceability")).deploy();
    await contract.waitForDeployment();

    const lotId = "LOT-TN-2026-NFT";
    const expectedTokenId = BigInt(ethers.keccak256(ethers.toUtf8Bytes(lotId)));

    await expect(contract.createLot(lotId, producer.address, "Tozeur", "Deglet Nour", 1767225600n))
      .to.emit(contract, "LotTokenMinted")
      .withArgs(lotId, expectedTokenId, producer.address);

    expect(await contract.name()).to.equal("DEGLA Traceability Lot");
    expect(await contract.symbol()).to.equal("DLOT");
    expect(await contract.tokenIdForLot(lotId)).to.equal(expectedTokenId);
    expect(await contract.lotIdForToken(expectedTokenId)).to.equal(lotId);
    expect(await contract.ownerOf(expectedTokenId)).to.equal(producer.address);
    expect(await contract.balanceOf(producer.address)).to.equal(1n);
    expect(await contract.tokenURI(expectedTokenId)).to.equal(`degla://lot/${lotId}`);
  });

  it("doit permettre au propriétaire de transférer le NFT sans modifier le producteur historique", async function () {
    const { ethers } = await hre.network.create();
    const [, producer, buyer] = await ethers.getSigners();
    const contract = await (await ethers.getContractFactory("DateTraceability")).deploy();
    await contract.waitForDeployment();

    const lotId = "LOT-TN-2026-TRANSFER";
    await contract.createLot(lotId, producer.address, "Kebili", "Alig", 1767225600n);
    const tokenId = await contract.tokenIdForLot(lotId);

    await contract.connect(producer).transferFrom(producer.address, buyer.address, tokenId);

    expect(await contract.ownerOf(tokenId)).to.equal(buyer.address);
    expect((await contract.getLot(lotId)).producer).to.equal(producer.address);
  });

  it("doit refuser la lecture du token d'un lot inexistant", async function () {
    const { ethers } = await hre.network.create();
    const contract = await (await ethers.getContractFactory("DateTraceability")).deploy();
    await contract.waitForDeployment();

    await expect(contract.tokenIdForLot("LOT-ABSENT")).to.be.revertedWith("Lot not found");
  });

});
