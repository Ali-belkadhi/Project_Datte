import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { connectMongoose } from "@/server/db/mongoose";
import { User } from "@/server/models";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(
    async () => {
      const uri = process.env.MONGODB_URI;
      if (!uri) throw new Error("MONGODB_URI is not defined");
      const { MongoClient } = await import("mongodb");
      const client = new MongoClient(uri);
      await client.connect();
      return client;
    },
  ),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET ?? "dev-only-secret-please-set-AUTH_SECRET",
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: { email: {}, motDePasse: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        await connectMongoose();
        const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
        if (!user || !user.motDePasseHash) return null;
        if (user.statut !== "ACTIF") return null;
        if (!user.emailVerifie) return null;
        const ok = await bcrypt.compare(parsed.data.motDePasse, user.motDePasseHash);
        if (!ok) return null;
        user.derniereConnexion = new Date();
        await user.save();
        return {
          id: String(user._id),
          email: user.email,
          name: `${user.prenom} ${user.nom}`,
          role: user.role,
          langue: user.langue,
          tokenVersion: user.tokenVersion,
        } as never;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = (user as { id?: string }).id ?? token.sub;
        token.role = (user as { role?: string }).role ?? "CLIENT";
        token.langue = (user as { langue?: string }).langue ?? "FR";
        token.tokenVersion = (user as { tokenVersion?: number }).tokenVersion ?? 0;
      }
      // Google: ensure DB user exists
      if (account?.provider === "google" && token.email) {
        await connectMongoose();
        let dbUser = await User.findOne({ email: String(token.email).toLowerCase() });
        if (!dbUser) {
          const [prenom, ...rest] = String(token.name ?? "").split(" ");
          dbUser = await User.create({
            email: String(token.email).toLowerCase(),
            motDePasseHash: null,
            nom: rest.join(" ") || prenom,
            prenom: prenom || "User",
            role: "CLIENT",
            langue: "FR",
            emailVerifie: true,
            statut: "ACTIF",
            tokenVersion: 0,
          });
          await (await import("@/server/models")).Client.create({ userId: dbUser._id });
        }
        token.id = String(dbUser._id);
        token.role = dbUser.role;
        token.langue = dbUser.langue;
        token.tokenVersion = dbUser.tokenVersion;
      }
      // verify tokenVersion against DB
      if (token.id) {
        await connectMongoose();
        const dbUser = await User.findById(token.id);
        if (!dbUser || dbUser.tokenVersion !== token.tokenVersion) {
          return null as never;
        }
        if (dbUser.statut !== "ACTIF") return null as never;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = String(token.id ?? token.sub);
        (session.user as { role?: string }).role = String(token.role ?? "CLIENT");
        (session.user as { langue?: string }).langue = String(token.langue ?? "FR");
        (session.user as { tokenVersion?: number }).tokenVersion = Number(token.tokenVersion ?? 0);
      }
      return session;
    },
  },
  pages: {
    signIn: "/connexion",
  },
});