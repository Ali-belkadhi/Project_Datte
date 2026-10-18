/**
 * Module A - Configuration Auth.js (edge-safe)
 * Aucun import Mongoose / bcrypt ici : ce fichier peut être chargé
 * dans n'importe quel runtime.
 */

import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { Role } from '@/domain/enums';

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Autorise la liaison automatique quand l'email existe déjà
      // (compte créé via mot de passe puis connexion Google).
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: '/connexion',
    error: '/connexion',
  },
  callbacks: {
    // Stratégie "database" : `user` provient du document `users`
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id;
        session.user.role = (user as { role?: Role }).role ?? Role.CLIENT;
      }
      return session;
    },
  },
};
