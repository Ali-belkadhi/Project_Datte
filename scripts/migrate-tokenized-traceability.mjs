import mongoose from "mongoose";
import { Contract, JsonRpcProvider, getAddress, isAddress } from "ethers";

const required = (name) => {
  const value = process.env[name];
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

for (const address of [oldTraceAddress, oldCertificationAddress, newTraceAddress, newCertificationAddress]) {
  if (!isAddress(address)) throw new Error(`Invalid contract address: ${address}`);
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
  "function getCertificate(string productId) view returns (tuple(bytes32 certificateId,string productId,string lotId,address certifier,string certifierOrg,string certType,string documentHash,uint256 issuedAt,uint256 expiresAt,bool revoked,string revocationReason,bool exists))",
  "function issueCertificate(string productId,string lotId,string certifierOrg,string certType,string documentHash,uint256 expiresAt)",
  "function revokeCertificate(string productId,string reason)",
];

async function findCreationHash(contract, lotId, producer) {
  const events = await contract.queryFilter(contract.filters.LotCreated(lotId, producer), 0, "latest");
  const event = events.at(-1);
  if (!event) throw new Error(`Creation event not found for ${lotId}`);
  return event.transactionHash;
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
  const lots = await lotsCollection.find({ chainId, contractAddress: oldTraceAddress }).toArray();
  const links = await linksCollection.find({ chainId, traceabilityContract: oldTraceAddress }).toArray();

  const certificates = [];
  for (const link of links) {
    try {
      const certificate = await oldCertification.getCertificate(link.productId);
      certificates.push({
        productId: String(link.productId),
        lotId: String(certificate.lotId),
        certifierOrg: String(certificate.certifierOrg),
        certType: String(certificate.certType),
        documentHash: String(certificate.documentHash),
        expiresAt: BigInt(certificate.expiresAt),
        revoked: Boolean(certificate.revoked),
        revocationReason: String(certificate.revocationReason),
      });
    } catch {
      // Products without a certificate remain uncertified after migration.
    }
  }

  const migratedLots = [];
  const producerWallets = new Set();
  for (const record of lots) {
    const lotId = String(record.lotId);
    const lot = await oldTrace.getLot(lotId);
    const producer = getAddress(String(lot.producer));
    producerWallets.add(producer);

    if (!(await newTrace.lotExists(lotId))) {
      const transaction = await newTrace.createLot(lotId, producer, lot.region, lot.variety, lot.harvestDate);
      await transaction.wait();
    }

    const history = await oldTrace.getTraceabilityHistory(lotId);
    const migratedHistory = await newTrace.getTraceabilityHistory(lotId);
    if (migratedHistory.length === 0) {
      for (const step of history) {
        await (await newTrace.addTraceabilityStep(
          lotId,
          step.stepType,
          step.date,
          step.location,
          step.responsibleActor,
          step.documentHash,
        )).wait();
      }
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
    if (!(await newTrace.hasRole(creatorRole, wallet))) await (await newTrace.grantRole(creatorRole, wallet)).wait();
    if (!(await newTrace.hasRole(stepRole, wallet))) await (await newTrace.grantRole(stepRole, wallet)).wait();
  }

  const block = await provider.getBlock("latest");
  for (const certificate of certificates) {
    let exists = true;
    try {
      await newCertification.getCertificate(certificate.productId);
    } catch {
      exists = false;
    }
    if (!exists) {
      const minimumExpiry = BigInt((block?.timestamp ?? Math.floor(Date.now() / 1000)) + 86_400);
      const expiresAt = certificate.expiresAt > minimumExpiry ? certificate.expiresAt : minimumExpiry;
      await (await newCertification.issueCertificate(
        certificate.productId,
        certificate.lotId,
        certificate.certifierOrg,
        certificate.certType,
        certificate.documentHash,
        expiresAt,
      )).wait();
      if (certificate.revoked) {
        await (await newCertification.revokeCertificate(
          certificate.productId,
          certificate.revocationReason || "Migrated revoked certificate",
        )).wait();
      }
    }
  }

  if (migratedLots.length > 0) {
    await lotsCollection.bulkWrite(migratedLots.map((lot) => ({
      updateOne: {
        filter: { _id: lot._id },
        update: { $set: { contractAddress: getAddress(newTraceAddress), transactionHash: lot.transactionHash } },
      },
    })));
  }
  await linksCollection.updateMany(
    { chainId, traceabilityContract: oldTraceAddress },
    { $set: { traceabilityContract: getAddress(newTraceAddress) } },
  );

  console.log(JSON.stringify({
    signer: signerAddress,
    oldTraceAddress: getAddress(oldTraceAddress),
    newTraceAddress: getAddress(newTraceAddress),
    newCertificationAddress: getAddress(newCertificationAddress),
    migratedLots: migratedLots.length,
    migratedLinks: links.length,
    migratedCertificates: certificates.length,
    nftOwnersGrantedRoles: producerWallets.size,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
