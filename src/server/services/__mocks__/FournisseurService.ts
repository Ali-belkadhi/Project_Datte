export const getFournisseur = async (_id: string) => null;
export const estFournisseurVerifie = async (_id: string) => false;
export const requireFournisseurVerifie = async () => { throw new Error("NOT_VERIFIED"); };