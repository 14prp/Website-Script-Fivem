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
      issuer: "https://discord.com",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Sync Discord profile picture & name on every login
      // PrismaAdapter only saves these on first sign-up, so old URLs become 404
      // user.image contains the OLD DB value, so we must build the fresh URL from profile
      if (account?.provider === "discord" && user.id) {
        try {
          const discordProfile = profile as any;
          const freshImage = discordProfile?.avatar
            ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
            : null;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              image: freshImage,
              name:
                discordProfile?.global_name ||
                discordProfile?.username ||
                user.name ||
                null,
            },
          });
        } catch {
          // User might not exist yet (first login), adapter will create it
        }
      }

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
