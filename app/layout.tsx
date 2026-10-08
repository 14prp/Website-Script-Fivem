import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { lineSeed } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import prisma from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  let name = siteConfig.name;
  let description = siteConfig.description;

  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: ["site_name", "site_description"] } },
      select: { key: true, value: true },
    });

    const map = new Map(rows.map((r) => [r.key, r.value]));

    name = map.get("site_name") ?? name;
    description = map.get("site_description") ?? description;
  } catch {
    name = siteConfig.name;
    description = siteConfig.description;
  }

  return {
    title: {
      default: name,
      template: `%s - ${name}`,
    },
    description,
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          lineSeed.className,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full relative  border-default-200 dark:border-white/10 bg-default-50/50 dark:bg-black/20 backdrop-blur-lg mt-auto pt-16 pb-8">
              <div className="container mx-auto max-w-7xl px-6 flex flex-col gap-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {/* Brand & Description */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-tr from-blue-600/20 to-purple-600/20 border border-default-200 dark:border-white/10 shadow-inner">
                        <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 text-xs">
                          CX
                        </span>
                      </div>
                      <p className="font-bold text-lg tracking-wide uppercase">
                        CODEX DEVELOPER
                      </p>
                    </div>
                    <p className="text-default-500 text-sm max-w-xs leading-relaxed">
                      มิติใหม่ในการเขียนสคริปต์สำหรับเซิร์ฟเวอร์ของคุณ
                      มุ่งเน้นการใช้งานที่ง่าย รวดเร็ว และปลอดภัย
                      พร้อมส่งมอบคุณภาพระดับพรีเมียม
                    </p>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex flex-col gap-4">
                    <h4 className="font-semibold tracking-wider uppercase text-sm">
                      Quick Links
                    </h4>
                    <ul className="flex flex-col gap-2">
                      <li>
                        <Link
                          className="text-sm text-default-500 hover:text-default-500 transition-colors"
                          color="foreground"
                          href="/"
                        >
                          หน้าหลัก
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="text-sm text-default-500 hover:text-default-500 transition-colors"
                          color="foreground"
                          href="/products"
                        >
                          สินค้าทั้งหมด
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="text-sm text-default-500 hover:text-default-500 transition-colors"
                          color="foreground"
                          href="/discord"
                        >
                          ดิสคอร์ด
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Contact / Social */}
                  <div className="flex flex-col gap-4">
                    <h4 className="font-semibold tracking-wider uppercase text-sm">
                      Community
                    </h4>
                    <p className="text-default-500 text-sm leading-relaxed">
                      เข้าร่วม Discord ของเราเพื่อติดตามข่าวสาร
                      อัปเดตสคริปต์ใหม่ๆ และสอบถามปัญหาต่างๆ
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <Link
                        isExternal
                        aria-label="Discord Server"
                        className="w-10 h-10 rounded-full bg-default-100 dark:bg-white/5 border border-default-200 dark:border-white/10 flex items-center justify-center text-default-400 hover:text-default-500 transition-all shadow-lg "
                        href="https://discord.gg/msc-fivem"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Copyright Line */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-default-200 dark:border-white/10">
                  <p className="text-sm text-default-500">
                    © {new Date().getFullYear()} CodeX Developer. All rights
                    reserved.
                  </p>
                  <p className="text-sm text-default-400 flex items-center gap-1">
                    Powered by{" "}
                    <span className="text-primary font-medium">
                      MithG - NxiZ
                    </span>
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
