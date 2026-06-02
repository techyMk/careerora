import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config. No Node-only imports (Prisma, bcrypt).
 * Consumed by middleware (Edge runtime) and extended in auth.ts for
 * actual login (Node runtime).
 */
export default {
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/sign-in" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user && (user as { id?: string }).id) {
        token.id = (user as { id: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
