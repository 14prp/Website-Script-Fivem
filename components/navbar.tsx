"use client";

import { useEffect, useState } from "react";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
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

export const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { data: session, status } = useSession();
  const [siteName, setSiteName] = useState("CODEX DEVELOPER");

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (
          data &&
          typeof data.name === "string" &&
          data.name.trim().length > 0
        ) {
          setSiteName(data.name.trim());
        }
      })
      .catch(() => null);
  }, []);

  return (
    <>
      <HeroUINavbar>
        <NavbarBrand>
          <AcmeLogo />
          <p className="font-bold text-inherit">{siteName}</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive={pathname === "/"}>
            <Link
              aria-current={pathname === "/" ? "page" : undefined}
              color={pathname === "/" ? "primary" : "foreground"}
              href="/"
            >
              หน้าหลัก
            </Link>
          </NavbarItem>
          <NavbarItem isActive={pathname === "/products"}>
            <Link
              aria-current={pathname === "/products" ? "page" : undefined}
              color={pathname === "/products" ? "primary" : "foreground"}
              href="/products"
            >
              สินค้า
            </Link>
          </NavbarItem>
          <NavbarItem isActive={pathname === "https://discord.gg/dTZKp6MWRy"}>
            <Link
              isExternal
              aria-current={
                pathname === "https://discord.gg/dTZKp6MWRy"
                  ? "page"
                  : undefined
              }
              color={
                pathname === "https://discord.gg/dTZKp6MWRy"
                  ? "primary"
                  : "foreground"
              }
              href="https://discord.gg/dTZKp6MWRy"
            >
              ดิสคอร์ด
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem className="hidden sm:flex">
            <ThemeSwitch />
          </NavbarItem>
          <NavbarItem>
            {status === "loading" ? (
              <Button isLoading color="primary" variant="flat">
                กำลังโหลด...
              </Button>
            ) : session?.user ? (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    isBordered
                    as="button"
                    className="transition-transform"
                    color="primary"
                    name={session.user.name || "User"}
                    size="sm"
                    src={session.user.image || ""}
                  />
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Profile Actions"
                  className="min-w-[240px]"
                  variant="flat"
                  onAction={(key) => {
                    if (key === "dashboard") router.push("/profile");
                    if (key === "admin") router.push("/admin");
                  }}
                >
                  <DropdownItem
                    key="profile"
                    isReadOnly
                    className="h-14 gap-2 cursor-default pb-2 mb-1"
                  >
                    <p className="font-semibold text-xs text-default-500">
                      เข้าสู่ระบบในชื่อ
                    </p>
                    <p className="font-bold text-sm truncate">
                      {session.user.email}
                    </p>
                  </DropdownItem>
                  <DropdownItem
                    key="points"
                    isReadOnly
                    className="cursor-default py-1"
                  >
                    <div className="flex justify-between items-center w-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
                      <div className="flex items-center gap-2">

                        <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                          พ้อยท์คงเหลือ
                        </span>
                      </div>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {(session.user as any).points || 0}
                      </span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="dashboard"
                    className="font-medium"
                  >
                    จัดการข้อมูลส่วนตัว
                  </DropdownItem>
                  {(session.user as any)?.role === "admin" ? (
                    <DropdownItem
                      key="admin"
                      className="font-medium"
                    >
                      หลังบ้านแอดมิน
                    </DropdownItem>
                  ) : null}
                  <DropdownItem
                    key="logout"
                    className="text-danger "
                    color="danger"
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
      </HeroUINavbar>

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
                    และรับสิทธิพิเศษต่างๆ จาก CodeX Developer
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
