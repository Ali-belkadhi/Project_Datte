/**
 * Module A - Augmentation des types Auth.js
 * Ajoute `id` et `role` sur la session et l'utilisateur.
 */

import type { DefaultSession } from 'next-auth';
import type { Role } from '@/domain/enums';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }

  interface User {
    role?: Role;
  }
}
