/**
 * Module A - Adaptateur MongoDB Auth.js (partagé)
 *
 * Un seul MongoClient pour l'adaptateur Auth.js ET la création manuelle de
 * sessions (connexion email / mot de passe).
 *
 * Collections utilisées (valeurs par défaut de l'adaptateur) :
 *  - `users`               → également utilisée par le modèle Mongoose `Utilisateur`
 *  - `accounts`            → comptes OAuth liés
 *  - `sessions`            → sessions persistées en base (EF-01)
 *  - `verification_tokens` → jetons Auth.js
 */

import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function creerClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(process.env.MONGODB_URI!);
  return client.connect();
}

const clientPromise: Promise<MongoClient> =
  globalThis._mongoClientPromise ?? creerClientPromise();

if (process.env.NODE_ENV !== 'production') {
  globalThis._mongoClientPromise = clientPromise;
}

export { clientPromise };

export const adapter = MongoDBAdapter(clientPromise);
