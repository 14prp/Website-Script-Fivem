"use client";

import { useEffect, useState } from "react";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import {
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

import { ThemeSwitch } from "@/components/theme-switch";
import { DiscordIcon } from "@/components/icons";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { data: session, status } = useSession();
  const [siteSettings, setSiteSettings] = useState({
    name: "CODEX DEVELOPER",
    shortName: "CX",
    discordUrl: "https://discord.gg/msc-fivem",
  });
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setSiteSettings((prev) => ({
            name:
              typeof data.name === "string" && data.name.trim().length > 0
                ? data.name.trim()
                : prev.name,
            shortName:
              typeof data.shortName === "string" && data.shortName.trim().length > 0
                ? data.shortName.trim()
                : prev.shortName,
            discordUrl:
              typeof data.discordUrl === "string" && data.discordUrl.trim().length > 0
                ? data.discordUrl.trim()
                : prev.discordUrl,
          }));
        }
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "หน้าหลัก", href: "/" },
    { label: "สินค้า", href: "/products" },
    {
      label: "ดิสคอร์ด",
      href: siteSettings.discordUrl,
      isExternal: true,
    },
  ];

  return (
    <>
      <HeroUINavbar
        classNames={{
          base: `fixed top-0 z-50 transition-all duration-500 ${
            scrolled
              ? "bg-white/60 dark:bg-black/50 backdrop-blur-xl backdrop-saturate-150 border-b border-black/[0.06] dark:border-white/[0.08]"
              : "bg-transparent backdrop-blur-none border-b border-transparent"
          }`,
          wrapper: "max-w-7xl px-6",
        }}
        isBlurred={false}
        isMenuOpen={isMenuOpen}
        maxWidth="full"
        position="sticky"
        onMenuOpenChange={setIsMenuOpen}
      >
        {/* Brand */}
        <NavbarContent justify="start">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden text-default-500"
          />
          <NavbarBrand className="gap-3 max-w-fit">
            <Link
              className="flex items-center gap-3 group"
              color="foreground"
              href="/"
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] group-hover:bg-black/[0.08] dark:group-hover:bg-white/[0.1] transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-violet-500/20 opacity-80" />
                <span className="relative font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 text-sm tracking-tighter uppercase">
                  {siteSettings.shortName}
                </span>
              </div>
              <span className="font-bold text-sm tracking-wide uppercase text-foreground/90 group-hover:text-foreground transition-colors duration-300">
                {siteSettings.name}
              </span>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        {/* Center Nav Links */}
        <NavbarContent className="hidden sm:flex" justify="center">
          <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.04] backdrop-blur-md rounded-full px-1.5 py-1 border border-black/[0.06] dark:border-white/[0.06]">
            {navLinks.map((link) => {
              const isActive =
                !link.isExternal && pathname === link.href;

              return (
                <NavbarItem key={link.href}>
                  <Link
                    className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-foreground text-background"
                        : "text-default-500 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                    }`}
                    color="foreground"
                    href={link.href}
                    {...(link.isExternal ? { isExternal: true } : {})}
                  >
                    {link.label}
                  </Link>
                </NavbarItem>
              );
            })}
          </div>
        </NavbarContent>

        {/* Right Section */}
        <NavbarContent justify="end">
          <NavbarItem className="flex">
            <ThemeSwitch />
          </NavbarItem>
          <NavbarItem>
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-default-200 dark:bg-white/10 animate-pulse" />
            ) : session?.user ? (
              <Dropdown
                classNames={{
                  content:
                    "bg-white/80 dark:bg-black/70 backdrop-blur-xl backdrop-saturate-150 border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-1",
                }}
                placement="bottom-end"
              >
                <DropdownTrigger>
                  <Avatar
                    isBordered
                    as="button"
                    className="transition-all duration-300 hover:scale-105"
                    color="primary"
                    name={session.user.name || "User"}
                    size="sm"
                    src={session.user.image || undefined}
                  />
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Profile Actions"
                  className="min-w-[260px]"
                  variant="flat"
                  onAction={(key) => {
                    if (key === "dashboard") router.push("/profile");
                    if (key === "admin") router.push("/admin");
                  }}
                >
                  <DropdownItem
                    key="profile"
                    isReadOnly
                    className="h-auto gap-2 cursor-default py-3 mb-1 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="flex-shrink-0"
                        name={session.user.name || "User"}
                        size="md"
                        src={session.user.image || undefined}
                      />
                      <div className="flex flex-col overflow-hidden">
                        <p className="font-semibold text-sm truncate">
                          {session.user.name || "User"}
                        </p>
                        <p className="text-xs text-default-400 truncate">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="points"
                    isReadOnly
                    className="cursor-default py-1 mb-1 rounded-xl"
                  >
                    <div className="flex justify-between items-center w-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-3 py-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-amber-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                          พ้อยท์คงเหลือ
                        </span>
                      </div>
                      <span className="font-bold text-lg text-amber-600 dark:text-amber-400">
                        {(session.user as any).points || 0}
                      </span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="dashboard"
                    className="font-medium py-2.5 rounded-xl"
                    startContent={
                      <svg
                        className="w-4 h-4 text-default-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                  >
                    จัดการข้อมูลส่วนตัว
                  </DropdownItem>
                  {(session.user as any)?.role === "admin" ? (
                    <DropdownItem
                      key="admin"
                      className="font-medium py-2.5 rounded-xl"
                      startContent={
                        <svg
                          className="w-4 h-4 text-default-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      }
                    >
                      หลังบ้านแอดมิน
                    </DropdownItem>
                  ) : null}
                  <DropdownItem
                    key="logout"
                    className="text-danger font-medium py-2.5 rounded-xl mt-1"
                    color="danger"
                    startContent={
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                    onPress={() => signOut()}
                  >
                    ออกจากระบบ
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Button
                color="primary"
                startContent={<DiscordIcon className="text-white w-5 h-5" />}
                variant="solid"
                onPress={onOpen}
              >
                เข้าสู่ระบบด้วย Discord
              </Button>
            )}
          </NavbarItem>
        </NavbarContent>

        {/* Mobile Menu */}
        <NavbarMenu className="bg-white/80 dark:bg-black/80 backdrop-blur-xl pt-6 gap-2">
          {navLinks.map((link) => {
            const isActive = !link.isExternal && pathname === link.href;

            return (
              <NavbarMenuItem key={link.href}>
                <Link
                  className={`w-full px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? "bg-foreground/10 text-foreground font-semibold"
                      : "text-default-500 hover:text-foreground hover:bg-default-100"
                  }`}
                  color="foreground"
                  href={link.href}
                  size="lg"
                  {...(link.isExternal ? { isExternal: true } : {})}
                  onPress={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </NavbarMenuItem>
            );
          })}
        </NavbarMenu>
      </HeroUINavbar>

      {/* Login Modal */}
      <Modal
        backdrop="blur"
        isOpen={isOpen}
        placement="center"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                เข้าสู่ระบบ
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="flex flex-col gap-4 text-center items-center">
                  <div className="w-16 h-16 bg-[#5865F2]/20 rounded-full flex items-center justify-center">
                    <DiscordIcon className="text-[#5865F2] w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold">
                    เข้าสู่ระบบด้วยบัญชี Discord
                  </h2>
                  <p className="text-default-500 text-sm">
                    เข้าสู่ระบบเพื่อดำเนินการซื้อสคริปต์ ดูประวัติการสั่งซื้อ
                    และรับสิทธิพิเศษต่างๆ จาก {siteSettings.name}
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  startContent={<DiscordIcon className="text-white w-5 h-5" />}
                  variant="solid"
                  onPress={() => signIn("discord")}
                >
                  ดำเนินการต่อด้วย Discord
                </Button>
                <Button color="danger" variant="flat" onPress={onClose}>
                  ยกเลิก
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
