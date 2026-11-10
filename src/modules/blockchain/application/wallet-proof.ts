export function buildLotOwnershipMessage(input: { supplierId: string; lotId: string; transactionHash: string }) {
  return [
    "DEGLA - preuve de contrôle du wallet producteur",
    `Fournisseur: ${input.supplierId}`,
    `Lot: ${input.lotId}`,
    `Transaction: ${input.transactionHash}`,
  ].join("\n");
}
