/**
 * Module A - Instance NextAuth (Auth.js v5)
 * Sessions en base de données + adaptateur MongoDB (EF-01)
 */

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { adapter } from './auth-adapter';
import connectDB from './mongoose';
import Utilisateur from '@/domain/models/Utilisateur';
import Client from '@/domain/models/Client';
import { AuditService } from '@/server/services/AuditService';
import { Role, Langue, StatutCompte } from '@/domain/enums';

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
  session: {
    // Sessions persistées en base (EF-01)
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    ...authConfig.callbacks,
    /**
     * Première connexion Google : l'adaptateur vient de créer un document
     * minimal dans `users`. On y ajoute le profil métier DEGLA.
     */
    async signIn({ user, account }) {
      if (account?.provider !== 'google' || !user?.id) return true;

      try {
        await connectDB();
        const existant = await Utilisateur.findById(user.id).select('role');

        // Déjà enrichi (inscription mot de passe ou passage précédent)
        if (!existant || existant.role) return true;

        const [prenom, ...reste] = (user.name ?? '').trim().split(/\s+/);
        const nom = reste.join(' ') || prenom || 'Membre';

        await Utilisateur.findByIdAndUpdate(user.id, {
          $set: {
            prenom: prenom || 'Membre',
            nom: nom || 'Membre',
            name: user.name ?? null,
            image: user.image ?? null,
            avatarUrl: user.image ?? null,
            role: Role.CLIENT,
            langue: Langue.FR,
            statut: StatutCompte.ACTIF,
            emailVerifie: true,
            emailVerified: new Date(),
          },
        });

        if (!(await Client.findOne({ utilisateurId: user.id }))) {
          await Client.create({ utilisateurId: user.id });
        }

        await AuditService.log({
          utilisateurId: user.id,
          action: 'INSCRIPTION_GOOGLE',
          entite: 'Utilisateur',
          entiteId: user.id,
        });
      } catch (err) {
        console.error('[auth] Enrichissement du compte Google échoué :', err);
      }

      return true;
    },
  },
});
