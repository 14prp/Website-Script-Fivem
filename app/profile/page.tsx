"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Tab, Tabs } from "@heroui/tabs";
import { Chip } from "@heroui/chip";

type UploadState = {
  file: File | null;
};

type LicenseItem = {
  id: string;
  licenseKey: string;
  boundIP: string | null;
  createdAt: string;
  expiresAt: string | null;
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    version: string | null;
    points: number;
    imageURL: string | null;
    embedURL: string | null;
    downloadURL: string | null;
    isFeatured: boolean;
  };
};

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString();
}

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;
  const d = new Date(expiresAt);

  if (Number.isNaN(d.getTime())) return false;

  return d.getTime() <= Date.now();
}

function EmptyScripts({ onGoProducts }: { onGoProducts: () => void }) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-default-100/60 dark:bg-white/5 border border-default-200 dark:border-white/10 flex items-center justify-center">
        <svg
          className="w-7 h-7 text-default-400"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M14 3v3a2 2 0 0 0 2 2h3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <h3 className="mt-5 text-lg font-semibold">ยังไม่มีสคริปต์</h3>
      <p className="mt-1 text-sm text-default-500 text-center max-w-md">
        เมื่อคุณซื้อสินค้าแล้ว รายการจะมาแสดงที่หน้านี้ พร้อม License
        และวันหมดอายุ
      </p>
      <Button
        className="mt-6"
        color="primary"
        variant="solid"
        onPress={onGoProducts}
      >
        ไปที่หน้าสินค้า
      </Button>
    </div>
  );
}

function ScriptsContent({
  licenses,
  isLoading,
  onRefresh,
  onResetAllIP,
}: {
  licenses: LicenseItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onResetAllIP: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">สคริปต์ของฉัน</h2>
          <p className="text-sm text-default-500">รายการสินค้าที่คุณซื้อแล้ว</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            isLoading={isLoading}
            variant="bordered"
            onPress={onResetAllIP}
          >
            เปลี่ยน IP ทั้งหมด
          </Button>
          <Button isLoading={isLoading} variant="bordered" onPress={onRefresh}>
            รีเฟรช
          </Button>
        </div>
      </div>

      {licenses.length === 0 ? (
        <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10 backdrop-blur-lg">
          <CardBody>
            <EmptyScripts
              onGoProducts={() => (window.location.href = "/products")}
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {licenses.map((x) => {
            const expired = isExpired(x.expiresAt);

            return (
              <Card
                key={x.id}
                className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10 backdrop-blur-lg"
              >
                <CardBody className="gap-4">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-default-200/50 dark:bg-black/20 border border-default-200/70 dark:border-white/10">
                    {x.product.imageURL ? (
                      <img
                        alt=""
                        className="w-full h-full object-cover"
                        src={x.product.imageURL}
                      />
                    ) : x.product.embedURL ? (
                      <iframe
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        className="w-full h-full object-cover"
                        src={x.product.embedURL}
                        title={`Video review for ${x.product.name}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-default-500 text-sm">
                        ไม่มีวิดีโอตัวอย่าง
                      </div>
                    )}
                    {expired ? (
                      <Chip
                        className="absolute top-3 right-3 bg-danger/80 text-white"
                        radius="lg"
                        size="sm"
                      >
                        หมดอายุ
                      </Chip>
                    ) : (
                      <Chip
                        className="absolute top-3 right-3 bg-success/80 text-white"
                        radius="lg"
                        size="sm"
                      >
                        ใช้งานได้
                      </Chip>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-bold line-clamp-1">
                        {x.product.name}
                      </h3>
                      <Chip size="sm" variant="flat">
                        {x.product.version || "-"}
                      </Chip>
                    </div>
                    <p className="text-sm text-default-500 line-clamp-2">
                      {x.product.description}
                    </p>
                  </div>

                  <Divider />

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-default-500">วันที่ซื้อ</span>
                      <span className="font-medium">
                        {formatDateTime(x.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-default-500">หมดอายุ</span>
                      <span
                        className={
                          expired ? "font-medium text-danger" : "font-medium"
                        }
                      >
                        {formatDateTime(x.expiresAt)}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-default-500">IP</span>{" "}
                    <span className="font-medium">
                      {x.boundIP || "ยังไม่ผูก IP"}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-default-200/70 dark:border-white/10 bg-default-100/30 dark:bg-white/5 p-3 flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-xs text-default-500">License</span>
                      <span className="text-sm font-mono truncate">
                        {x.licenseKey}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="bordered"
                      onPress={() =>
                        navigator.clipboard.writeText(x.licenseKey)
                      }
                    >
                      คัดลอก
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      isDisabled={!x.product.downloadURL || expired}
                      variant="bordered"
                      onPress={() => {
                        if (!x.product.downloadURL || expired) return;
                        window.open(
                          x.product.downloadURL,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }}
                    >
                      {x.product.downloadURL ? "ดาวน์โหลด" : "ยังไม่มีไฟล์"}
                    </Button>
                    <Button
                      color="secondary"
                      isDisabled={expired}
                      variant="solid"
                      onPress={() =>
                        (window.location.href = `/product/${x.product.id}`)
                      }
                    >
                      ดูสินค้า
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function QrPlaceholder() {
  return (
    <svg
      aria-hidden="true"
      className="w-full h-full"
      role="img"
      viewBox="0 0 240 240"
    >
      <rect fill="white" height="240" rx="12" width="240" x="0" y="0" />
      <rect fill="black" height="60" width="60" x="18" y="18" />
      <rect fill="white" height="40" width="40" x="28" y="28" />
      <rect fill="black" height="20" width="20" x="38" y="38" />
      <rect fill="black" height="60" width="60" x="162" y="18" />
      <rect fill="white" height="40" width="40" x="172" y="28" />
      <rect fill="black" height="20" width="20" x="182" y="38" />
      <rect fill="black" height="60" width="60" x="18" y="162" />
      <rect fill="white" height="40" width="40" x="28" y="172" />
      <rect fill="black" height="20" width="20" x="38" y="182" />

      <g fill="black">
        <rect height="12" width="12" x="98" y="22" />
        <rect height="12" width="12" x="118" y="22" />
        <rect height="12" width="12" x="98" y="42" />
        <rect height="10" width="10" x="132" y="44" />
        <rect height="12" width="12" x="112" y="58" />
        <rect height="10" width="10" x="92" y="72" />
        <rect height="10" width="10" x="112" y="82" />
        <rect height="12" width="12" x="130" y="76" />
        <rect height="10" width="10" x="150" y="92" />
        <rect height="12" width="12" x="96" y="96" />
        <rect height="10" width="10" x="118" y="104" />
        <rect height="12" width="12" x="138" y="112" />
        <rect height="10" width="10" x="92" y="120" />
        <rect height="12" width="12" x="112" y="128" />
        <rect height="10" width="10" x="136" y="132" />
        <rect height="12" width="12" x="154" y="126" />
        <rect height="12" width="12" x="92" y="146" />
        <rect height="10" width="10" x="118" y="148" />
        <rect height="12" width="12" x="138" y="154" />
        <rect height="10" width="10" x="158" y="156" />
        <rect height="10" width="10" x="102" y="170" />
        <rect height="12" width="12" x="124" y="172" />
        <rect height="10" width="10" x="146" y="176" />
        <rect height="12" width="12" x="170" y="172" />
        <rect height="12" width="12" x="98" y="192" />
        <rect height="10" width="10" x="120" y="194" />
        <rect height="12" width="12" x="144" y="196" />
        <rect height="10" width="10" x="166" y="198" />
      </g>
    </svg>
  );
}

function EmptyHistory({ onGoTopUp }: { onGoTopUp: () => void }) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-default-100/60 dark:bg-white/5 border border-default-200 dark:border-white/10 flex items-center justify-center">
        <svg
          className="w-7 h-7 text-default-400"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M14 3v3a2 2 0 0 0 2 2h3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <h3 className="mt-5 text-lg font-semibold">No File Found</h3>
      <p className="mt-1 text-sm text-default-500 text-center max-w-md">
        ยังไม่มีประวัติการเติมเงินในขณะนี้
      </p>
      <Button
        className="mt-6"
        color="primary"
        variant="solid"
        onPress={onGoTopUp}
      >
        เริ่มเติมเงิน
      </Button>
    </div>
  );
}

function TopUpContent({
  upload,
  onSelectFile,
  onClear,
  settings,
}: {
  upload: UploadState;
  onSelectFile: (file: File | null) => void;
  onClear: () => void;
  settings?: {
    bankAccountName?: string;
    bankPromptpayNo?: string;
    bankName?: string;
    promptpayQrUrl?: string;
  };
}) {
  const fileName = upload.file?.name ?? "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10 backdrop-blur-lg">
        <CardHeader className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-default-100/70 dark:bg-white/5 border border-default-200 dark:border-white/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-default-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 12h8M8 8h5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold tracking-wide">
                THAI QR PAYMENT
              </p>
              <p className="text-xs text-default-500">สแกนเพื่อชำระเงิน</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="w-full aspect-square max-w-[360px] mx-auto rounded-2xl border border-default-200 dark:border-white/10 overflow-hidden shadow-inner flex items-center justify-center bg-white">
            {settings?.promptpayQrUrl ? (
              <img
                alt="PromptPay QR"
                className="w-full h-full object-contain p-4"
                src={settings.promptpayQrUrl}
              />
            ) : (
              <QrPlaceholder />
            )}
          </div>
          <Divider className="my-6" />
          <div className="text-sm text-default-600 dark:text-default-400 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-default-500">ชื่อบัญชี</span>
              <span className="font-medium">
                {settings?.bankAccountName || "CODEX Developer"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-default-500">PromptPay</span>
              <span className="font-medium">
                {settings?.bankPromptpayNo || "xxx-xxx-xxxx"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-default-500">ธนาคาร</span>
              <span className="font-medium">
                {settings?.bankName || "กสิกรไทย (KBank)"}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10 backdrop-blur-lg">
        <CardHeader className="flex flex-col items-start gap-1">
          <p className="text-lg font-semibold">อัปโหลดสลิป</p>
          <p className="text-sm text-default-500">
            แนบสลิปการโอนเงิน แล้วกดส่งเพื่อให้ระบบตรวจสอบ
          </p>
        </CardHeader>
        <CardBody className="pt-0 flex flex-col gap-4">
          <div className="rounded-2xl border border-default-200 dark:border-white/10 bg-default-100/30 dark:bg-white/5 p-4">
            <p className="text-sm font-semibold mb-2">ขั้นตอนการเติมเงิน</p>
            <ul className="text-sm text-default-500 space-y-1">
              <li>1) สแกน QR แล้วชำระเงินตามจำนวนที่ต้องการ</li>
              <li>2) อัปโหลดสลิปที่ได้จากธนาคาร/แอป</li>
              <li>3) รอการตรวจสอบ และรับพ้อยท์เข้าบัญชี</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-dashed border-default-300 dark:border-white/15 bg-default-50/40 dark:bg-black/20 overflow-hidden">
            <label className="block cursor-pointer p-6">
              <input
                accept="image/*"
                className="hidden"
                type="file"
                onChange={(e) =>
                  onSelectFile(e.currentTarget.files?.[0] ?? null)
                }
              />
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-default-100/70 dark:bg-white/5 border border-default-200 dark:border-white/10 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-default-400"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 16V8m0 0 3 3m-3-3-3 3"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M20 16.5A4.5 4.5 0 0 0 15.5 12H15a6 6 0 1 0-11 3.5"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7 20h10a3 3 0 0 0 3-3"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <p className="text-sm font-semibold">Upload Slip</p>
                <p className="text-xs text-default-500">
                  รองรับไฟล์รูปภาพ (JPG/PNG) ขนาดไม่เกิน 10MB
                </p>
                {fileName ? (
                  <p className="text-xs text-default-600 dark:text-default-400 mt-2 break-all">
                    {fileName}
                  </p>
                ) : null}
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button
              color="default"
              isDisabled={!upload.file}
              variant="bordered"
              onPress={onClear}
            >
              ล้างไฟล์
            </Button>
            <Button color="primary" isDisabled={!upload.file} variant="solid">
              ส่งสลิป
            </Button>
          </div>

          <Input
            classNames={{
              inputWrapper:
                "bg-default-50/50 dark:bg-black/20 border-default-200/70 dark:border-white/10",
            }}
            label="จำนวนพ้อยท์ที่ต้องการ (ไม่บังคับ)"
            placeholder="เช่น 500"
            type="number"
            variant="bordered"
          />

          <p className="text-xs text-danger">
            โปรดตรวจสอบข้อมูลก่อนส่งสลิป
            หากข้อมูลไม่ถูกต้องอาจทำให้การเติมเงินล่าช้า
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [selectedTab, setSelectedTab] = useState<string>(
    initialTab === "scripts" ? "scripts" : "topup",
  );
  const [upload, setUpload] = useState<UploadState>({ file: null });
  const [licenses, setLicenses] = useState<LicenseItem[]>([]);
  const [isLoadingLicenses, setIsLoadingLicenses] = useState(false);
  const [siteSettings, setSiteSettings] = useState<{
    bankAccountName?: string;
    bankPromptpayNo?: string;
    bankName?: string;
    promptpayQrUrl?: string;
  }>({});

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setSiteSettings(data);
      })
      .catch(() => null);
  }, []);

  const displayName = useMemo(() => {
    const name = session?.user?.name?.trim();

    return name && name.length > 0 ? name : "ผู้ใช้งาน";
  }, [session?.user?.name]);

  const userId = (session?.user as any)?.id as string | undefined;
  const points = ((session?.user as any)?.points as number | undefined) ?? 0;

  const refreshLicenses = useCallback(async () => {
    setIsLoadingLicenses(true);
    try {
      const res = await fetch("/api/me/licenses", { cache: "no-store" });

      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as unknown;

      if (Array.isArray(data)) setLicenses(data as LicenseItem[]);
    } catch {
      setLicenses([]);
    } finally {
      setIsLoadingLicenses(false);
    }
  }, []);

  const resetAllIP = useCallback(async () => {
    setIsLoadingLicenses(true);
    try {
      const res = await fetch("/api/me/licenses/reset-ip", { method: "POST" });

      if (!res.ok) throw new Error("Request failed");
      await refreshLicenses();
    } catch {
      setIsLoadingLicenses(false);
    }
  }, [refreshLicenses]);

  useEffect(() => {
    if (!session) return;
    refreshLicenses();
  }, [refreshLicenses, session]);

  if (status === "loading") {
    return (
      <div className="w-full max-w-5xl mx-auto py-12">
        <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10 backdrop-blur-lg">
          <CardBody className="py-12 text-center text-default-500">
            กำลังโหลด...
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="w-full max-w-5xl mx-auto py-12 relative">
        <div className="pointer-events-none absolute -inset-8 -z-10 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(99,102,241,0.22),transparent_70%)]" />
        <div className="pointer-events-none absolute -inset-8 -z-10 bg-[radial-gradient(45%_40%_at_10%_20%,rgba(168,85,247,0.16),transparent_70%)]" />
        <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10 backdrop-blur-lg">
          <CardBody className="py-14 flex flex-col items-center text-center gap-4">
            <p className="text-xl font-semibold">กรุณาเข้าสู่ระบบก่อน</p>
            <p className="text-sm text-default-500 max-w-md">
              เข้าสู่ระบบด้วย Discord เพื่อดูข้อมูลโปรไฟล์ เติมเงิน
              และประวัติการทำรายการ
            </p>
            <Button
              color="primary"
              variant="solid"
              onPress={() => signIn("discord")}
            >
              เข้าสู่ระบบด้วย Discord
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <section className="w-full max-w-5xl mx-auto py-10 relative">
      <div className="pointer-events-none absolute -inset-10 -z-10 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(99,102,241,0.22),transparent_70%)]" />
      <div className="pointer-events-none absolute -inset-10 -z-10 bg-[radial-gradient(45%_40%_at_10%_20%,rgba(168,85,247,0.16),transparent_70%)]" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Avatar
            className="w-20 h-20 text-large"
            name={displayName}
            src={session.user?.image ?? undefined}
          />
          <div className="flex flex-col gap-1">
            <p className="text-sm text-default-500">Dashboard</p>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome, <span className="text-primary">{displayName}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-default-500">
              <span>
                Discord ID{" "}
                {userId ? (
                  <Link
                    isExternal
                    className="text-default-500 hover:text-primary"
                    href={`https://discord.com/users/${userId}`}
                  >
                    {userId}
                  </Link>
                ) : (
                  "-"
                )}
              </span>
              <span className="flex items-center gap-2">
                <span>Points</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {points.toLocaleString()}
                </span>
              </span>
            </div>
          </div>
        </div>
        <Button color="default" variant="bordered" onPress={() => signOut()}>
          Logout
        </Button>
      </div>

      <Divider className="my-8" />

      <div className="flex justify-center">
        <Tabs
          classNames={{
            tabList:
              "bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10 backdrop-blur-lg rounded-2xl p-1",
          }}
          selectedKey={selectedTab}
          variant="bordered"
          onSelectionChange={(key) => setSelectedTab(String(key))}
        >
          <Tab key="scripts" title="สคริปต์ของฉัน" />
          <Tab key="topup" title="เติมเงิน" />
          <Tab key="history" title="ประวัติเติมเงิน" />
        </Tabs>
      </div>

      <div className="mt-8">
        {selectedTab === "scripts" ? (
          <ScriptsContent
            isLoading={isLoadingLicenses}
            licenses={licenses}
            onRefresh={refreshLicenses}
            onResetAllIP={resetAllIP}
          />
        ) : selectedTab === "topup" ? (
          <TopUpContent
            settings={siteSettings}
            upload={upload}
            onClear={() => setUpload({ file: null })}
            onSelectFile={(file) => setUpload({ file })}
          />
        ) : (
          <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10 backdrop-blur-lg">
            <CardBody>
              <EmptyHistory onGoTopUp={() => setSelectedTab("topup")} />
            </CardBody>
          </Card>
        )}
      </div>
    </section>
  );
}
