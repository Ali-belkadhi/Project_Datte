import mongoose from "mongoose";
import { Contract, JsonRpcProvider, getAddress, isAddress } from "ethers";

const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const rpcUrl = required("BLOCKCHAIN_RPC_URL");
const chainId = Number(required("NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID"));
const mongoUri = required("MONGODB_URI");
const oldTraceAddress = required("NEXT_PUBLIC_DATE_TRACEABILITY_ADDRESS");
const oldCertificationAddress = required("NEXT_PUBLIC_PRODUCT_CERTIFICATION_ADDRESS");
const newTraceAddress = required("NEW_DATE_TRACEABILITY_ADDRESS");
const newCertificationAddress = required("NEW_PRODUCT_CERTIFICATION_ADDRESS");

if (!Number.isSafeInteger(chainId) || chainId <= 0)
  throw new Error("NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID is invalid");
for (const address of [
  oldTraceAddress,
  oldCertificationAddress,
  newTraceAddress,
  newCertificationAddress,
]) {
  if (!isAddress(address)) throw new Error(`Invalid contract address: ${address}`);
}
if (getAddress(oldTraceAddress) === getAddress(newTraceAddress)) {
  throw new Error("NEW_DATE_TRACEABILITY_ADDRESS must point to the tokenized deployment");
}
if (getAddress(oldCertificationAddress) === getAddress(newCertificationAddress)) {
  throw new Error(
    "NEW_PRODUCT_CERTIFICATION_ADDRESS must point to a contract linked to the new traceability deployment",
  );
}

const TRACE_ABI = [
  "function lotExists(string lotId) view returns (bool)",
  "function getLot(string lotId) view returns (tuple(string lotId,address producer,string region,string variety,uint256 harvestDate,bool exists))",
  "function getTraceabilityHistory(string lotId) view returns (tuple(uint8 stepType,uint256 date,string location,address responsibleActor,string documentHash)[])",
  "function createLot(string lotId,address producer,string region,string variety,uint256 harvestDate)",
  "function addTraceabilityStep(string lotId,uint8 stepType,uint256 date,string location,address responsibleActor,string documentHash)",
  "function LOT_CREATOR_ROLE() view returns (bytes32)",
  "function STEP_ADDER_ROLE() view returns (bytes32)",
  "function hasRole(bytes32 role,address account) view returns (bool)",
  "function grantRole(bytes32 role,address account)",
  "event LotCreated(string indexed lotId,address indexed producer,string region,string variety,uint256 harvestDate)",
];

const CERTIFICATION_ABI = [
  "function CERTIFIER_ROLE() view returns (bytes32)",
  "function hasRole(bytes32 role,address account) view returns (bool)",
  "function grantRole(bytes32 role,address account)",
  "function certificateExists(string certificateId) view returns (bool)",
  "function totalCertificates() view returns (uint256)",
  "function certificateIdAt(uint256 index) view returns (string)",
  "function getCertificate(string certificateId) view returns (tuple(string certificateId,string productId,string lotId,address certifier,string certifierName,string certificationType,string documentHash,uint256 issuedAt,uint256 expiresAt,bool revoked,string revocationReason,uint256 revokedAt,address revokedBy,bool exists))",
  "function issueCertificate(string certificateId,string productId,string lotId,string certifierName,string certificationType,string documentHash,uint256 expiresAt)",
  "function revokeCertificate(string certificateId,string reason)",
];

const sameAddress = (left, right) => String(left).toLowerCase() === String(right).toLowerCase();
const sameStep = (left, right) =>
  Number(left.stepType) === Number(right.stepType) &&
  BigInt(left.date) === BigInt(right.date) &&
  String(left.location) === String(right.location) &&
  sameAddress(left.responsibleActor, right.responsibleActor) &&
  String(left.documentHash) === String(right.documentHash);

async function findCreationHash(contract, lotId, producer) {
  const events = await contract.queryFilter(
    contract.filters.LotCreated(lotId, producer),
    0,
    "latest",
  );
  const event = events.at(-1);
  if (!event) throw new Error(`Creation event not found for ${lotId}`);
  return event.transactionHash;
}

async function ensureRole(contract, role, account) {
  if (!(await contract.hasRole(role, account)))
    await (await contract.grantRole(role, account)).wait();
}

async function main() {
  const provider = new JsonRpcProvider(rpcUrl, chainId, { staticNetwork: true });
  const signer = await provider.getSigner(0);
  const signerAddress = await signer.getAddress();
  const oldTrace = new Contract(oldTraceAddress, TRACE_ABI, provider);
  const newTrace = new Contract(newTraceAddress, TRACE_ABI, signer);
  const oldCertification = new Contract(oldCertificationAddress, CERTIFICATION_ABI, provider);
  const newCertification = new Contract(newCertificationAddress, CERTIFICATION_ABI, signer);

  await mongoose.connect(mongoUri, { bufferCommands: false });
  const lotsCollection = mongoose.connection.collection("traceability_lots");
  const linksCollection = mongoose.connection.collection("product_blockchain_links");
  const lots = (await lotsCollection.find({ chainId }).toArray()).filter((record) =>
    sameAddress(record.contractAddress, oldTraceAddress),
  );
  const links = (await linksCollection.find({ chainId }).toArray()).filter((record) =>
    sameAddress(record.traceabilityContract, oldTraceAddress),
  );

  const migratedLots = [];
  const producerWallets = new Set();
  for (const record of lots) {
    const lotId = String(record.lotId);
    const lot = await oldTrace.getLot(lotId);
    const producer = getAddress(String(lot.producer));
    producerWallets.add(producer);

    if (!(await newTrace.lotExists(lotId))) {
      await (
        await newTrace.createLot(lotId, producer, lot.region, lot.variety, lot.harvestDate)
      ).wait();
    }

    const [oldHistory, newHistory] = await Promise.all([
      oldTrace.getTraceabilityHistory(lotId),
      newTrace.getTraceabilityHistory(lotId),
    ]);
    if (
      newHistory.length > oldHistory.length ||
      newHistory.some((step, index) => !sameStep(step, oldHistory[index]))
    ) {
      throw new Error(`The new history is not a prefix of the old history for ${lotId}`);
    }
    for (const step of oldHistory.slice(newHistory.length)) {
      await (
        await newTrace.addTraceabilityStep(
          lotId,
          step.stepType,
          step.date,
          step.location,
          step.responsibleActor,
          step.documentHash,
        )
      ).wait();
    }

    migratedLots.push({
      _id: record._id,
      lotId,
      transactionHash: await findCreationHash(newTrace, lotId, producer),
    });
  }

  const [creatorRole, stepRole] = await Promise.all([
    newTrace.LOT_CREATOR_ROLE(),
    newTrace.STEP_ADDER_ROLE(),
  ]);
  for (const wallet of producerWallets) {
    await ensureRole(newTrace, creatorRole, wallet);
    await ensureRole(newTrace, stepRole, wallet);
  }

  await ensureRole(newCertification, await newCertification.CERTIFIER_ROLE(), signerAddress);
  const totalCertificates = Number(await oldCertification.totalCertificates());
  let migratedCertificates = 0;
  const latestBlock = await provider.getBlock("latest");
  const now = BigInt(latestBlock?.timestamp ?? Math.floor(Date.now() / 1000));
  for (let index = 0; index < totalCertificates; index += 1) {
    const certificateId = await oldCertification.certificateIdAt(index);
    if (await newCertification.certificateExists(certificateId)) continue;
    const certificate = await oldCertification.getCertificate(certificateId);
    const wasExpired = BigInt(certificate.expiresAt) <= now;
    const expiresAt = wasExpired ? now + 86_400n : certificate.expiresAt;
    await (
      await newCertification.issueCertificate(
        certificate.certificateId,
        certificate.productId,
        certificate.lotId,
        certificate.certifierName,
        certificate.certificationType,
        certificate.documentHash,
        expiresAt,
      )
    ).wait();
    if (certificate.revoked || wasExpired) {
      const reason = certificate.revoked
        ? certificate.revocationReason || "Certificat révoqué migré"
        : "Certificat expiré migré depuis l'ancien contrat";
      await (await newCertification.revokeCertificate(certificate.certificateId, reason)).wait();
    }
    migratedCertificates += 1;
  }

  if (migratedLots.length > 0) {
    await lotsCollection.bulkWrite(
      migratedLots.map((lot) => ({
        updateOne: {
          filter: { _id: lot._id },
          update: {
            $set: {
              contractAddress: getAddress(newTraceAddress),
              transactionHash: lot.transactionHash,
            },
          },
        },
      })),
    );
  }
  if (links.length > 0) {
    await linksCollection.bulkWrite(
      links.map((link) => ({
        updateOne: {
          filter: { _id: link._id },
          update: { $set: { traceabilityContract: getAddress(newTraceAddress) } },
        },
      })),
    );
  }

  console.log(
    JSON.stringify(
      {
        signer: signerAddress,
        oldTraceAddress: getAddress(oldTraceAddress),
        newTraceAddress: getAddress(newTraceAddress),
        oldCertificationAddress: getAddress(oldCertificationAddress),
        newCertificationAddress: getAddress(newCertificationAddress),
        migratedLots: migratedLots.length,
        migratedLinks: links.length,
        migratedCertificates,
        producerWalletsGrantedRoles: producerWallets.size,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
