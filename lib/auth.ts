import type { NextAuthOptions } from "next-auth";

import { getServerSession } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";

import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const adminDiscordId = process.env.ADMIN_DISCORD_ID;

      if (
        adminDiscordId &&
        account?.provider === "discord" &&
        typeof (profile as any)?.id === "string" &&
        (profile as any).id === adminDiscordId
      ) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "admin" },
        });

        return true;
      }

      try {
        const adminCount = await prisma.user.count({
          where: { role: "admin" },
        });

        if (adminCount === 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "admin" },
          });
        }
      } catch {
        return true;
      }

      return true;
    },
    async session({ session, user }) {
      if (session.user && user) {
        (session.user as any).id = user.id;
        (session.user as any).points = (user as any).points || 0;
        (session.user as any).role = (user as any).role || "user";
      }

      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

export async function getServerAuthSession() {
  return getServerSession(authOptions);
}

export async function requireAdmin() {
  const session = await getServerAuthSession();
  const role = (session?.user as any)?.role as string | undefined;

  if (!session || role !== "admin") {
    return null;
  }

  return session;
}
