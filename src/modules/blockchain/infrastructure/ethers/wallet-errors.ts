type WalletError = Error & { code?: string | number; reason?: string; shortMessage?: string };

export function walletErrorMessage(error: unknown, fallback: string) {
  const candidate = error as WalletError | undefined;
  const code = candidate?.code;
  if (code === 4001 || code === "ACTION_REJECTED") return "Opération annulée dans MetaMask.";
  const message = candidate?.reason || candidate?.shortMessage || candidate?.message || fallback;
  if (/insufficient funds/i.test(message)) return "Solde ETH Ganache insuffisant pour payer les frais de réseau.";
  if (/Lot already exists/i.test(message)) return "Cet identifiant de lot existe déjà sur la Blockchain.";
  if (/Certificate already exists/i.test(message)) return "Cet identifiant de certificat existe déjà.";
  if (/missing revert data|CALL_EXCEPTION|execution reverted/i.test(message)) {
    return "La transaction a été refusée par le contrat. Vérifiez l'identifiant, les autorisations et les données saisies.";
  }
  return message.length > 240 ? fallback : message;
}
