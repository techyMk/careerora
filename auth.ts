import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { seedUserContent } from "@/lib/sample-data";
import authConfig from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Build provider list dynamically — Google is only enabled when both env vars are set.
const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(creds) {
      const parsed = credentialsSchema.safeParse(creds);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) return null; // OAuth-only accounts have no password
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        image: user.avatar ?? undefined,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // For Google OAuth: upsert user into our DB and seed starter content
      // on first sign-in. Credentials sign-in skips this since authorize()
      // already returned a DB user.
      if (account?.provider === "google" && user.email) {
        const dbUser = await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name ?? undefined,
            avatar: user.image ?? undefined,
          },
          create: {
            email: user.email,
            name: user.name ?? null,
            avatar: user.image ?? null,
            password: null,
          },
        });
        // Seed starter content if this user has nothing yet
        const existingResumes = await prisma.resume.count({
          where: { userId: dbUser.id },
        });
        if (existingResumes === 0) {
          await seedUserContent(prisma, dbUser);
        }
        // Pass DB id forward to the jwt callback
        user.id = dbUser.id;
      }
      return true;
    },
  },
});
