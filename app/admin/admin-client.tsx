"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Input, Textarea } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Tab, Tabs } from "@heroui/tabs";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";

type SiteSettings = {
  name: string;
  shortName: string;
  description: string;
  logoUrl: string;
  discordUrl: string;
  contactButtonText: string;
  heroTitle: string;
  heroSubtitle: string;
  footerCopyright: string;
  footerPoweredBy: string;
  teamName: string;
  teamRole: string;
  teamDescription: string;
  teamAvatar: string;
  bankAccountName: string;
  bankPromptpayNo: string;
  bankName: string;
  promptpayQrUrl: string;
};

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string | null;
  points: number;
};

type AdminProduct = {
  id: string;
  name: string;
  description: string;
  detailText: string | null;
  featuresA: string | null;
  featuresB: string | null;
  category: string;
  version: string | null;
  points: number;
  imageURL: string | null;
  embedURL: string | null;
  downloadURL: string | null;
  isActive: boolean;
  isFeatured: boolean;
};

type AdminLicense = {
  id: string;
  licenseKey: string;
  boundIP: string | null;
  expiresAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  product: {
    id: string;
    name: string;
    category: string;
    version: string | null;
  };
};

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");

    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

function normalizeRole(role: string | null | undefined) {
  return role === "admin" ? "admin" : "user";
}

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString();
}

export default function AdminClient() {
  const [tab, setTab] = useState<string>("settings");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const [settings, setSettings] = useState<SiteSettings>({
    name: "",
    shortName: "",
    description: "",
    logoUrl: "",
    discordUrl: "",
    contactButtonText: "",
    heroTitle: "",
    heroSubtitle: "",
    footerCopyright: "",
    footerPoweredBy: "",
    teamName: "",
    teamRole: "",
    teamDescription: "",
    teamAvatar: "",
    bankAccountName: "",
    bankPromptpayNo: "",
    bankName: "",
    promptpayQrUrl: "",
  });

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [licenses, setLicenses] = useState<AdminLicense[]>([]);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editUserPoints, setEditUserPoints] = useState<string>("");
  const [editUserRole, setEditUserRole] = useState<"user" | "admin">("user");

  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    detailText: "",
    featuresA: "",
    featuresB: "",
    category: "",
    version: "",
    points: "",
    imageURL: "",
    embedURL: "",
    downloadURL: "",
    isActive: true,
    isFeatured: false,
  });
  const [productImagePreview, setProductImagePreview] = useState("");
  const productImageInputRef = useRef<HTMLInputElement | null>(null);

  const [editingLicense, setEditingLicense] = useState<AdminLicense | null>(
    null,
  );
  const [licenseForm, setLicenseForm] = useState({
    userId: "",
    productId: "",
    licenseKey: "",
    expiresAt: "",
  });

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setErrorText(null);

    try {
      const [s, u, p, l] = await Promise.all([
        apiJson<SiteSettings>("/api/admin/settings"),
        apiJson<AdminUser[]>("/api/admin/users"),
        apiJson<AdminProduct[]>("/api/admin/products"),
        apiJson<AdminLicense[]>("/api/admin/licenses"),
      ]);

      setSettings(s);
      setUsers(u);
      setProducts(p);
      setLicenses(l);
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const onSaveSettings = useCallback(async () => {
    setIsLoading(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      const updated = await apiJson<SiteSettings>("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });

      setSettings(updated);
      setSuccessText("บันทึกการตั้งค่าเว็บไซต์เรียบร้อยแล้ว");
      setTimeout(() => setSuccessText(null), 3500);
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  const openEditUser = useCallback((u: AdminUser) => {
    setEditingUser(u);
    setEditUserPoints(String(u.points ?? 0));
    setEditUserRole(normalizeRole(u.role));
    setIsUserModalOpen(true);
  }, []);

  const onSaveUser = useCallback(async () => {
    if (!editingUser) return;

    setIsLoading(true);
    setErrorText(null);

    const points = Number(editUserPoints);

    try {
      const updated = await apiJson<AdminUser>(
        `/api/admin/users/${editingUser.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            points: Number.isFinite(points) ? points : editingUser.points,
            role: editUserRole,
          }),
        },
      );

      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setIsUserModalOpen(false);
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [editUserPoints, editUserRole, editingUser]);

  const resetProductForm = useCallback(() => {
    setProductForm({
      name: "",
      description: "",
      detailText: "",
      featuresA: "",
      featuresB: "",
      category: "",
      version: "",
      points: "",
      imageURL: "",
      embedURL: "",
      downloadURL: "",
      isActive: true,
      isFeatured: false,
    });
    setEditingProduct(null);
    setProductImagePreview("");
  }, []);

  const openCreateProduct = useCallback(() => {
    resetProductForm();
    setIsProductModalOpen(true);
  }, [resetProductForm]);

  const openEditProduct = useCallback((p: AdminProduct) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description,
      detailText: p.detailText ?? "",
      featuresA: p.featuresA ?? "",
      featuresB: p.featuresB ?? "",
      category: p.category,
      version: p.version ?? "",
      points: String(p.points),
      imageURL: p.imageURL ?? "",
      embedURL: p.embedURL ?? "",
      downloadURL: p.downloadURL ?? "",
      isActive: p.isActive,
      isFeatured: p.isFeatured,
    });
    setProductImagePreview(p.imageURL ?? "");
    setIsProductModalOpen(true);
  }, []);

  const onSaveProduct = useCallback(async () => {
    setIsLoading(true);
    setErrorText(null);

    const points = Number(productForm.points);

    try {
      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        detailText: productForm.detailText.trim() || null,
        featuresA: productForm.featuresA.trim() || null,
        featuresB: productForm.featuresB.trim() || null,
        category: productForm.category.trim(),
        version: productForm.version.trim() || null,
        points: Number.isFinite(points) ? points : 0,
        imageURL: productForm.imageURL.trim() || null,
        embedURL: productForm.embedURL.trim() || null,
        downloadURL: productForm.downloadURL.trim() || null,
        isActive: productForm.isActive,
        isFeatured: productForm.isFeatured,
      };

      if (editingProduct) {
        const updated = await apiJson<AdminProduct>(
          `/api/admin/products/${editingProduct.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        );

        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
      } else {
        const created = await apiJson<AdminProduct>("/api/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setProducts((prev) => [created, ...prev]);
      }

      setIsProductModalOpen(false);
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [editingProduct, productForm]);

  const onUploadProductImage = useCallback(async (file: File | null) => {
    if (!file) return;

    setIsLoading(true);
    setErrorText(null);

    try {
      const form = new FormData();

      form.append("file", file);

      const res = await fetch("/api/admin/upload/product-image", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");

        throw new Error(text || `Upload failed: ${res.status}`);
      }

      const data = (await res.json()) as { url?: unknown };
      const url = typeof data.url === "string" ? data.url : "";

      if (!url) {
        throw new Error("Upload failed");
      }

      setProductForm((p) => ({ ...p, imageURL: url }));
      setProductImagePreview(url);
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onDeleteProduct = useCallback(async (p: AdminProduct) => {
    setIsLoading(true);
    setErrorText(null);

    try {
      await apiJson<{ ok: true }>(`/api/admin/products/${p.id}`, {
        method: "DELETE",
      });
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "ลบไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openCreateLicense = useCallback(() => {
    setEditingLicense(null);
    setLicenseForm({
      userId: "",
      productId: "",
      licenseKey: "",
      expiresAt: "",
    });
    setIsLicenseModalOpen(true);
  }, []);

  const openEditLicense = useCallback((l: AdminLicense) => {
    setEditingLicense(l);
    setLicenseForm({
      userId: l.user.id,
      productId: l.product.id,
      licenseKey: l.licenseKey,
      expiresAt: toDateTimeLocal(l.expiresAt),
    });
    setIsLicenseModalOpen(true);
  }, []);

  const onSaveLicense = useCallback(async () => {
    setIsLoading(true);
    setErrorText(null);

    const payload = {
      userId: licenseForm.userId.trim(),
      productId: licenseForm.productId.trim(),
      licenseKey: licenseForm.licenseKey.trim() || undefined,
      expiresAt: licenseForm.expiresAt
        ? new Date(licenseForm.expiresAt).toISOString()
        : null,
    };

    try {
      if (editingLicense) {
        const updated = await apiJson<AdminLicense>(
          `/api/admin/licenses/${editingLicense.id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              licenseKey: payload.licenseKey || editingLicense.licenseKey,
              expiresAt: payload.expiresAt,
            }),
          },
        );

        setLicenses((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x)),
        );
      } else {
        const created = await apiJson<AdminLicense>("/api/admin/licenses", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setLicenses((prev) => [created, ...prev]);
      }
      setIsLicenseModalOpen(false);
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, [editingLicense, licenseForm]);

  const onDeleteLicense = useCallback(async (l: AdminLicense) => {
    setIsLoading(true);
    setErrorText(null);

    try {
      await apiJson<{ ok: true }>(`/api/admin/licenses/${l.id}`, {
        method: "DELETE",
      });
      setLicenses((prev) => prev.filter((x) => x.id !== l.id));
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "ลบไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onResetLicenseIP = useCallback(async (l: AdminLicense) => {
    setIsLoading(true);
    setErrorText(null);
    try {
      const updated = await apiJson<AdminLicense>(
        `/api/admin/licenses/${l.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ resetIP: true }),
        },
      );

      setLicenses((prev) =>
        prev.map((x) => (x.id === updated.id ? updated : x)),
      );
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "รี IP ไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRegenerateLicense = useCallback(async (l: AdminLicense) => {
    setIsLoading(true);
    setErrorText(null);
    try {
      const updated = await apiJson<AdminLicense>(
        `/api/admin/licenses/${l.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ regenerate: true }),
        },
      );

      setLicenses((prev) =>
        prev.map((x) => (x.id === updated.id ? updated : x)),
      );
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "รี License ไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const usersCount = users.length;
  const productsCount = products.length;

  const canSaveProduct = useMemo(() => {
    const points = Number(productForm.points);

    return (
      productForm.name.trim().length > 0 &&
      productForm.category.trim().length > 0 &&
      productForm.description.trim().length > 0 &&
      Number.isFinite(points) &&
      points >= 0
    );
  }, [productForm]);

  const canSaveLicense = useMemo(() => {
    if (editingLicense) return licenseForm.licenseKey.trim().length > 0;

    return (
      licenseForm.userId.trim().length > 0 &&
      licenseForm.productId.trim().length > 0
    );
  }, [editingLicense, licenseForm]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          selectedKey={tab}
          variant="underlined"
          onSelectionChange={(key) => setTab(String(key))}
        >
          <Tab key="settings" title="ตั้งค่าเว็บ" />
          <Tab key="users" title={`ผู้ใช้ (${usersCount})`} />
          <Tab key="licenses" title={`ไลเซนส์ (${licenses.length})`} />
          <Tab key="products" title={`สินค้า (${productsCount})`} />
        </Tabs>
        <div className="flex items-center gap-2">
          <Button isLoading={isLoading} variant="bordered" onPress={refreshAll}>
            รีเฟรช
          </Button>
          {tab === "licenses" ? (
            <Button color="primary" onPress={openCreateLicense}>
              เพิ่ม License
            </Button>
          ) : null}
          {tab === "products" ? (
            <Button color="primary" onPress={openCreateProduct}>
              เพิ่มสินค้า
            </Button>
          ) : null}
        </div>
      </div>

      {errorText ? (
        <Card className="border border-danger/30 bg-danger/10" shadow="none">
          <CardBody className="text-danger text-sm">{errorText}</CardBody>
        </Card>
      ) : null}

      {successText ? (
        <Card className="border border-success/30 bg-success/10" shadow="none">
          <CardBody className="text-success text-sm flex items-center gap-2">
            <svg
              className="w-4 h-4 text-success"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {successText}
          </CardBody>
        </Card>
      ) : null}

      {tab === "settings" ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-default-50/50 dark:bg-white/[0.03] border border-default-200/70 dark:border-white/10">
            <div>
              <h2 className="text-base sm:text-lg font-bold">จัดการการตั้งค่าเว็บไซต์</h2>
              <p className="text-xs sm:text-sm text-default-500">
                กำหนดชื่อเว็บ โลโก้ ข้อความ ส่วนหัว ลิงก์ Discord ข้อมูลทีมงาน และบัญชีธนาคารได้ที่นี่
              </p>
            </div>
            <Button
              color="primary"
              size="sm"
              className="font-medium shadow-none px-4 shrink-0"
              isLoading={isLoading}
              onPress={onSaveSettings}
            >
              บันทึกการตั้งค่า
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. แบรนด์และชื่อเว็บ */}
            <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10" shadow="none">
              <CardBody className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">ข้อมูลแบรนด์ & ชื่อเว็บไซต์</h3>
                    <p className="text-xs text-default-500">แสดงใน Navbar, Footer และ Tab Browser</p>
                  </div>
                </div>
                <Divider />

                <Input
                  label="ชื่อเว็บไซต์ (Site Name)"
                  placeholder="เช่น CODEX DEVELOPER"
                  value={settings.name}
                  variant="bordered"
                  description="ชื่อหลักของเว็บไซต์ที่จะแสดงในส่วนต่างๆ"
                  onValueChange={(v) => setSettings((p) => ({ ...p, name: v }))}
                />

                <Input
                  label="ตัวย่อ / สัญลักษณ์โลโก้ (Short Name)"
                  placeholder="เช่น CX"
                  value={settings.shortName}
                  variant="bordered"
                  description="ตัวอักษรย่อที่แสดงในกล่องสัญลักษณ์ไอคอน (1-3 ตัวอักษร)"
                  onValueChange={(v) => setSettings((p) => ({ ...p, shortName: v }))}
                />

                <Textarea
                  label="คำอธิบายเว็บไซต์ (Site Description)"
                  placeholder="คำอธิบายโดยย่อของเว็บไซต์..."
                  value={settings.description}
                  variant="bordered"
                  minRows={3}
                  description="แสดงใน Footer และ SEO Meta Description"
                  onValueChange={(v) => setSettings((p) => ({ ...p, description: v }))}
                />

                {/* Preview Badge */}
                <div className="p-3 rounded-xl bg-default-100/50 dark:bg-white/[0.02] border border-default-200/40 dark:border-white/5 flex items-center gap-3">
                  <span className="text-xs text-default-400 font-medium">ตัวอย่าง Navbar Brand:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-white/10 flex items-center justify-center">
                      <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 uppercase">
                        {settings.shortName || "CX"}
                      </span>
                    </div>
                    <span className="text-xs font-bold uppercase text-foreground">
                      {settings.name || "CODEX DEVELOPER"}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 2. ส่วนหัวหน้าแรก (Hero Section) */}
            <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10" shadow="none">
              <CardBody className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">ส่วนหัวหน้าแรก (Hero Section)</h3>
                    <p className="text-xs text-default-500">ข้อความตัวใหญ่ต้อนรับผู้ใช้งานที่หน้าแรก</p>
                  </div>
                </div>
                <Divider />

                <Input
                  label="หัวข้อหลักหน้าแรก (Hero Title)"
                  placeholder="เช่น CODEX DEVELOPER (เว้นว่างเพื่อใช้ชื่อเว็บ)"
                  value={settings.heroTitle}
                  variant="bordered"
                  onValueChange={(v) => setSettings((p) => ({ ...p, heroTitle: v }))}
                />

                <Textarea
                  label="คำอธิบายย่อยหน้าแรก (Hero Subtitle)"
                  placeholder="เช่น มิติใหม่ในการเขียนสคริปต์สำหรับเซิร์ฟเวอร์ของคุณ..."
                  value={settings.heroSubtitle}
                  variant="bordered"
                  minRows={3}
                  onValueChange={(v) => setSettings((p) => ({ ...p, heroSubtitle: v }))}
                />

                <Input
                  label="ข้อความปุ่มติดต่อ (Contact Button Text)"
                  placeholder="เช่น Contact Us หรือ ติดต่อเรา"
                  value={settings.contactButtonText}
                  variant="bordered"
                  onValueChange={(v) =>
                    setSettings((p) => ({ ...p, contactButtonText: v }))
                  }
                />
              </CardBody>
            </Card>

            {/* 3. ลิงก์ & ข้อมูลท้ายเว็บ (Links & Footer) */}
            <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10" shadow="none">
              <CardBody className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-success/10 text-success">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">ลิงก์ & ข้อมูลท้ายเว็บ (Footer)</h3>
                    <p className="text-xs text-default-500">ลิงก์ดิสคอร์ดและข้อมูลลิขสิทธิ์</p>
                  </div>
                </div>
                <Divider />

                <Input
                  label="ลิงก์ Discord (Discord URL)"
                  placeholder="เช่น https://discord.gg/..."
                  value={settings.discordUrl}
                  variant="bordered"
                  description="ใช้สำหรับปุ่มใน Navbar, ปุ่ม Contact Us และลิงก์ใน Footer"
                  onValueChange={(v) => setSettings((p) => ({ ...p, discordUrl: v }))}
                />

                <Input
                  label="ข้อความลิขสิทธิ์ (Footer Copyright)"
                  placeholder="เช่น CodeX Developer"
                  value={settings.footerCopyright}
                  variant="bordered"
                  description="จะแสดงในรูปแบบ: © 2026 [ข้อความลิขสิทธิ์]. All rights reserved."
                  onValueChange={(v) =>
                    setSettings((p) => ({ ...p, footerCopyright: v }))
                  }
                />

                <Input
                  label="Powered By"
                  placeholder="เช่น d14"
                  value={settings.footerPoweredBy}
                  variant="bordered"
                  description="แสดงที่มุมขวาล่างของ Footer"
                  onValueChange={(v) =>
                    setSettings((p) => ({ ...p, footerPoweredBy: v }))
                  }
                />
              </CardBody>
            </Card>

            {/* 4. ข้อมูลทีมงาน / ผู้พัฒนา (Team Developer Card) */}
            <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10" shadow="none">
              <CardBody className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-warning/10 text-warning">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">ข้อมูลทีมงาน / ผู้พัฒนา</h3>
                    <p className="text-xs text-default-500">การ์ดแนะนำทีมงานที่แสดงด้านล่างของหน้าแรก</p>
                  </div>
                </div>
                <Divider />

                <Input
                  label="ชื่อทีมงาน / ผู้พัฒนา (Team Name)"
                  placeholder="เช่น CodeX System"
                  value={settings.teamName}
                  variant="bordered"
                  onValueChange={(v) => setSettings((p) => ({ ...p, teamName: v }))}
                />

                <Input
                  label="ตำแหน่ง / บทบาท (Role)"
                  placeholder="เช่น UI / Website / Script Developer"
                  value={settings.teamRole}
                  variant="bordered"
                  onValueChange={(v) => setSettings((p) => ({ ...p, teamRole: v }))}
                />

                <Input
                  label="คำอธิบายทีมงาน (Description)"
                  placeholder="เช่น ออกแบบ UI ที่ดูสะอาดและเข้าใจง่าย"
                  value={settings.teamDescription}
                  variant="bordered"
                  onValueChange={(v) =>
                    setSettings((p) => ({ ...p, teamDescription: v }))
                  }
                />

                <Input
                  label="URL รูปโปรไฟล์ทีมงาน (Avatar URL)"
                  placeholder="https://..."
                  value={settings.teamAvatar}
                  variant="bordered"
                  onValueChange={(v) => setSettings((p) => ({ ...p, teamAvatar: v }))}
                />

                {/* Team Card Preview */}
                <div className="p-4 rounded-xl bg-default-100/50 dark:bg-white/[0.02] border border-default-200/40 dark:border-white/5 flex items-center gap-4">
                  <Avatar
                    isBordered
                    className="w-14 h-14"
                    color="primary"
                    name={settings.teamName || "Team"}
                    src={settings.teamAvatar || undefined}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">
                      {settings.teamName || "CodeX System"}
                    </span>
                    <span className="text-xs text-primary font-medium">
                      {settings.teamRole || "UI / Website / Script Developer"}
                    </span>
                    <span className="text-xs text-default-500 mt-0.5 line-clamp-1">
                      {settings.teamDescription || "คำอธิบายทีมงาน..."}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 5. บัญชีรับเงิน / พร้อมเพย์ (Payment / Top-up) */}
            <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10" shadow="none">
              <CardBody className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-danger/10 text-danger">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">ข้อมูลบัญชีชำระเงิน (หน้า Profile เติมเงิน)</h3>
                    <p className="text-xs text-default-500">แสดงข้อมูลและ QR Code สำหรับให้ลูกค้าโอนเงิน</p>
                  </div>
                </div>
                <Divider />

                <Input
                  label="ชื่อบัญชี (Account Name)"
                  placeholder="เช่น CODEX Developer"
                  value={settings.bankAccountName}
                  variant="bordered"
                  onValueChange={(v) =>
                    setSettings((p) => ({ ...p, bankAccountName: v }))
                  }
                />

                <Input
                  label="หมายเลขพร้อมเพย์ (PromptPay No.)"
                  placeholder="เช่น 08x-xxx-xxxx หรือ เลขบัตร/เบอร์"
                  value={settings.bankPromptpayNo}
                  variant="bordered"
                  onValueChange={(v) =>
                    setSettings((p) => ({ ...p, bankPromptpayNo: v }))
                  }
                />

                <Input
                  label="ชื่อธนาคาร (Bank Name)"
                  placeholder="เช่น กสิกรไทย (KBank)"
                  value={settings.bankName}
                  variant="bordered"
                  onValueChange={(v) => setSettings((p) => ({ ...p, bankName: v }))}
                />

                <Input
                  label="URL รูป QR Code พร้อมเพย์ (PromptPay QR Image URL)"
                  placeholder="https://... หรือ /images/qr.png (เว้นว่างเพื่อใช้ QR ตัวอย่าง)"
                  value={settings.promptpayQrUrl}
                  variant="bordered"
                  onValueChange={(v) =>
                    setSettings((p) => ({ ...p, promptpayQrUrl: v }))
                  }
                />
              </CardBody>
            </Card>

            {/* 6. ข้อมูลแอดมิน */}
            <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10" shadow="none">
              <CardBody className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-default-100 text-default-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">การตั้งค่าสิทธิ์แอดมิน</h3>
                    <p className="text-xs text-default-500">การเข้าถึงระบบจัดการหลังบ้าน</p>
                  </div>
                </div>
                <Divider />
                <div className="text-sm text-default-500 space-y-2">
                  <p>
                    กำหนด Discord ID ของแอดมินผ่านตัวแปรในไฟล์ <code className="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded">.env</code>:
                  </p>
                  <p className="font-mono text-xs p-2 rounded-lg bg-black/30 text-default-400">
                    ADMIN_DISCORD_ID=1286014014438113362
                  </p>
                  <p className="text-xs text-default-400">
                    เมื่อผู้ใช้งานล็อกอินด้วย Discord ID ที่ตรงกัน จะได้รับสิทธิ์ admin ทันที
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "users" ? (
        <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10" shadow="none">
          <CardBody>
            <Table removeWrapper aria-label="Users">
              <TableHeader>
                <TableColumn>ชื่อ</TableColumn>
                <TableColumn>อีเมล</TableColumn>
                <TableColumn>พ้อยท์</TableColumn>
                <TableColumn>สิทธิ์</TableColumn>
                <TableColumn>จัดการ</TableColumn>
              </TableHeader>
              <TableBody emptyContent="ยังไม่มีผู้ใช้งาน">
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover border border-default-200 dark:border-white/10"
                          src={u.image || "/favicon.ico"}
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {u.name || "ไม่ระบุชื่อ"}
                          </span>
                          <span className="text-xs text-default-500">
                            {u.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{u.email || "-"}</TableCell>
                    <TableCell>{u.points.toLocaleString()}</TableCell>
                    <TableCell>{normalizeRole(u.role)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="bordered"
                        onPress={() => openEditUser(u)}
                      >
                        แก้ไข
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      ) : null}

      {tab === "licenses" ? (
        <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10" shadow="none">
          <CardBody>
            <Table removeWrapper aria-label="Licenses">
              <TableHeader>
                <TableColumn>สินค้า</TableColumn>
                <TableColumn>ผู้ใช้</TableColumn>
                <TableColumn>License</TableColumn>
                <TableColumn>IP</TableColumn>
                <TableColumn>หมดอายุ</TableColumn>
                <TableColumn>จัดการ</TableColumn>
              </TableHeader>
              <TableBody emptyContent="ยังไม่มีไลเซนส์">
                {licenses.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{l.product.name}</span>
                        <span className="text-xs text-default-500">
                          {l.product.category} • {l.product.version || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover border border-default-200 dark:border-white/10"
                          src={l.user.image || "/favicon.ico"}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold line-clamp-1">
                            {l.user.name || "ไม่ระบุชื่อ"}
                          </span>
                          <span className="text-xs text-default-500 line-clamp-1">
                            {l.user.email || l.user.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{l.licenseKey}</span>
                    </TableCell>
                    <TableCell>{l.boundIP || "-"}</TableCell>
                    <TableCell>{formatDateTime(l.expiresAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="bordered"
                          onPress={() => openEditLicense(l)}
                        >
                          แก้ไข
                        </Button>
                        <Button
                          size="sm"
                          variant="bordered"
                          onPress={() => onResetLicenseIP(l)}
                        >
                          รี IP
                        </Button>
                        <Button
                          size="sm"
                          variant="bordered"
                          onPress={() => onRegenerateLicense(l)}
                        >
                          รี License
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          variant="flat"
                          onPress={() => onDeleteLicense(l)}
                        >
                          ลบ
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      ) : null}

      {tab === "products" ? (
        <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10" shadow="none">
          <CardBody>
            <Table removeWrapper aria-label="Products">
              <TableHeader>
                <TableColumn>ชื่อสินค้า</TableColumn>
                <TableColumn>หมวดหมู่</TableColumn>
                <TableColumn>เวอร์ชัน</TableColumn>
                <TableColumn>พ้อยท์</TableColumn>
                <TableColumn>แนะนำ</TableColumn>
                <TableColumn>สถานะ</TableColumn>
                <TableColumn>จัดการ</TableColumn>
              </TableHeader>
              <TableBody emptyContent="ยังไม่มีสินค้า">
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-xs text-default-500 line-clamp-1">
                          {p.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>{p.version || "-"}</TableCell>
                    <TableCell>{p.points.toLocaleString()}</TableCell>
                    <TableCell>{p.isFeatured ? "แนะนำ" : "-"}</TableCell>
                    <TableCell>{p.isActive ? "เปิดขาย" : "ปิดขาย"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="bordered"
                          onPress={() => openEditProduct(p)}
                        >
                          แก้ไข
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          variant="flat"
                          onPress={() => onDeleteProduct(p)}
                        >
                          ลบ
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      ) : null}

      <Modal
        backdrop="blur"
        classNames={{
          base: "shadow-none border border-default-200/70 dark:border-white/10",
        }}
        isOpen={isLicenseModalOpen}
        size="lg"
        onOpenChange={setIsLicenseModalOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {editingLicense ? "แก้ไข License" : "เพิ่ม License"}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    isDisabled={!!editingLicense}
                    label="User ID"
                    placeholder="cuid ของผู้ใช้งาน"
                    value={licenseForm.userId}
                    variant="bordered"
                    onValueChange={(v) =>
                      setLicenseForm((p) => ({ ...p, userId: v }))
                    }
                  />
                  <Input
                    isDisabled={!!editingLicense}
                    label="Product ID"
                    placeholder="cuid ของสินค้า"
                    value={licenseForm.productId}
                    variant="bordered"
                    onValueChange={(v) =>
                      setLicenseForm((p) => ({ ...p, productId: v }))
                    }
                  />
                  <Input
                    label="License Key"
                    placeholder="เช่น ABC-1234-XXXX-YYYY"
                    value={licenseForm.licenseKey}
                    variant="bordered"
                    onValueChange={(v) =>
                      setLicenseForm((p) => ({ ...p, licenseKey: v }))
                    }
                  />
                  <Input
                    label="วันหมดอายุ"
                    placeholder="ไม่ใส่ = ไม่มีวันหมดอายุ"
                    type="datetime-local"
                    value={licenseForm.expiresAt}
                    variant="bordered"
                    onValueChange={(v) =>
                      setLicenseForm((p) => ({ ...p, expiresAt: v }))
                    }
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="bordered" onPress={onClose}>
                  ปิด
                </Button>
                <Button
                  color="primary"
                  isDisabled={!canSaveLicense}
                  isLoading={isLoading}
                  onPress={onSaveLicense}
                >
                  บันทึก
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        backdrop="blur"
        classNames={{
          base: "shadow-none border border-default-200/70 dark:border-white/10",
        }}
        isOpen={isUserModalOpen}
        size="lg"
        onOpenChange={setIsUserModalOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                แก้ไขผู้ใช้งาน
              </ModalHeader>
              <ModalBody>
                {editingUser ? (
                  <div className="flex flex-col gap-4">
                    <div className="text-sm text-default-500">
                      {editingUser.name || "ไม่ระบุชื่อ"} ({editingUser.id})
                    </div>
                    <Input
                      label="พ้อยท์"
                      type="number"
                      value={editUserPoints}
                      variant="bordered"
                      onValueChange={setEditUserPoints}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        className="flex-1 shadow-none"
                        color={editUserRole === "user" ? "primary" : "default"}
                        variant={editUserRole === "user" ? "solid" : "bordered"}
                        onPress={() => setEditUserRole("user")}
                      >
                        user
                      </Button>
                      <Button
                        className="flex-1 shadow-none"
                        color={editUserRole === "admin" ? "primary" : "default"}
                        variant={
                          editUserRole === "admin" ? "solid" : "bordered"
                        }
                        onPress={() => setEditUserRole("admin")}
                      >
                        admin
                      </Button>
                    </div>
                  </div>
                ) : null}
              </ModalBody>
              <ModalFooter>
                <Button variant="bordered" onPress={onClose}>
                  ปิด
                </Button>
                <Button
                  color="primary"
                  className="shadow-none"
                  isLoading={isLoading}
                  onPress={onSaveUser}
                >
                  บันทึก
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        backdrop="blur"
        classNames={{
          base: "shadow-none border border-default-200/70 dark:border-white/10",
        }}
        isOpen={isProductModalOpen}
        size="2xl"
        onOpenChange={(open) => {
          if (!open) resetProductForm();
          setIsProductModalOpen(open);
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    label="ชื่อสินค้า"
                    placeholder="เช่น ระบบร้านค้า 3.0.0"
                    value={productForm.name}
                    variant="bordered"
                    onValueChange={(v) =>
                      setProductForm((p) => ({ ...p, name: v }))
                    }
                  />
                  <Input
                    label="คำอธิบาย"
                    placeholder="รายละเอียดสินค้า"
                    value={productForm.description}
                    variant="bordered"
                    onValueChange={(v) =>
                      setProductForm((p) => ({ ...p, description: v }))
                    }
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-1 flex flex-col gap-2">
                      <div className="text-sm font-medium text-foreground">
                        รายละเอียดเพิ่มเติม
                      </div>
                      <textarea
                        className="min-h-32 w-full rounded-xl border border-default-200 bg-default-50 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 dark:bg-black/20 dark:border-white/10"
                        placeholder="ใส่รายละเอียดเพิ่มเติม (รองรับขึ้นบรรทัดใหม่)"
                        value={productForm.detailText}
                        onChange={(e) => {
                          const value =
                            e?.currentTarget?.value ??
                            (e as any)?.target?.value ??
                            "";

                          setProductForm((p) => ({ ...p, detailText: value }));
                        }}
                      />
                    </div>
                    <div className="lg:col-span-1 flex flex-col gap-2">
                      <div className="text-sm font-medium text-foreground">
                        General Features
                      </div>
                      <textarea
                        className="min-h-32 w-full rounded-xl border border-default-200 bg-default-50 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 dark:bg-black/20 dark:border-white/10"
                        placeholder="- ข้อ 1\n- ข้อ 2\n- ข้อ 3"
                        value={productForm.featuresA}
                        onChange={(e) => {
                          const value =
                            e?.currentTarget?.value ??
                            (e as any)?.target?.value ??
                            "";

                          setProductForm((p) => ({ ...p, featuresA: value }));
                        }}
                      />
                    </div>
                    <div className="lg:col-span-1 flex flex-col gap-2">
                      <div className="text-sm font-medium text-foreground">
                        Performance & Security
                      </div>
                      <textarea
                        className="min-h-32 w-full rounded-xl border border-default-200 bg-default-50 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 dark:bg-black/20 dark:border-white/10"
                        placeholder="- ข้อ 1\n- ข้อ 2\n- ข้อ 3"
                        value={productForm.featuresB}
                        onChange={(e) => {
                          const value =
                            e?.currentTarget?.value ??
                            (e as any)?.target?.value ??
                            "";

                          setProductForm((p) => ({ ...p, featuresB: value }));
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="หมวดหมู่"
                      placeholder="เช่น ระบบทั่วไป"
                      value={productForm.category}
                      variant="bordered"
                      onValueChange={(v) =>
                        setProductForm((p) => ({ ...p, category: v }))
                      }
                    />
                    <Input
                      label="เวอร์ชัน"
                      placeholder="เช่น v1.0.0"
                      value={productForm.version}
                      variant="bordered"
                      onValueChange={(v) =>
                        setProductForm((p) => ({ ...p, version: v }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="ราคา (พ้อยท์)"
                      placeholder="เช่น 1500"
                      type="number"
                      value={productForm.points}
                      variant="bordered"
                      onValueChange={(v) =>
                        setProductForm((p) => ({ ...p, points: v }))
                      }
                    />
                    <Input
                      label="ลิงก์วิดีโอ (Embed URL)"
                      placeholder="https://www.youtube.com/embed/..."
                      value={productForm.embedURL}
                      variant="bordered"
                      onValueChange={(v) =>
                        setProductForm((p) => ({ ...p, embedURL: v }))
                      }
                    />
                  </div>
                  <Input
                    label="ลิงก์โหลด (Download URL)"
                    placeholder="https://... (ไฟล์ zip/rar) หรือ ลิงก์ Google Drive"
                    value={productForm.downloadURL}
                    variant="bordered"
                    onValueChange={(v) =>
                      setProductForm((p) => ({ ...p, downloadURL: v }))
                    }
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="รูปภาพสินค้า (Image URL)"
                      placeholder="/uploads/products/xxx.png หรือ https://..."
                      value={productForm.imageURL}
                      variant="bordered"
                      onValueChange={(v) => {
                        setProductForm((p) => ({ ...p, imageURL: v }));
                        setProductImagePreview(v.trim());
                      }}
                    />
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-foreground">
                          อัปโหลดรูปภาพ
                        </span>
                        <Button
                          size="sm"
                          variant="bordered"
                          onPress={() => productImageInputRef.current?.click()}
                        >
                          เลือกไฟล์
                        </Button>
                      </div>
                      <input
                        ref={productImageInputRef}
                        accept="image/*"
                        className="hidden"
                        type="file"
                        onChange={(e) => {
                          const file = e.currentTarget.files?.[0] ?? null;

                          e.currentTarget.value = "";
                          void onUploadProductImage(file);
                        }}
                      />
                      {productImagePreview ? (
                        <img
                          alt=""
                          className="w-full h-24 rounded-xl object-cover border border-default-200 dark:border-white/10"
                          src={productImagePreview}
                        />
                      ) : (
                        <div className="w-full h-24 rounded-xl border border-dashed border-default-300 dark:border-white/15 flex items-center justify-center text-sm text-default-500">
                          ยังไม่มีรูปภาพ
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      className="flex-1"
                      color={productForm.isFeatured ? "warning" : "default"}
                      variant={productForm.isFeatured ? "solid" : "bordered"}
                      onPress={() =>
                        setProductForm((p) => ({
                          ...p,
                          isFeatured: !p.isFeatured,
                        }))
                      }
                    >
                      {productForm.isFeatured ? "สินค้าแนะนำ" : "ไม่แนะนำ"}
                    </Button>
                    <Button
                      className="flex-1"
                      color={productForm.isActive ? "primary" : "default"}
                      variant={productForm.isActive ? "solid" : "bordered"}
                      onPress={() =>
                        setProductForm((p) => ({ ...p, isActive: true }))
                      }
                    >
                      เปิดขาย
                    </Button>
                    <Button
                      className="flex-1"
                      color={!productForm.isActive ? "primary" : "default"}
                      variant={!productForm.isActive ? "solid" : "bordered"}
                      onPress={() =>
                        setProductForm((p) => ({ ...p, isActive: false }))
                      }
                    >
                      ปิดขาย
                    </Button>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="bordered" onPress={onClose}>
                  ปิด
                </Button>
                <Button
                  color="primary"
                  isDisabled={!canSaveProduct}
                  isLoading={isLoading}
                  onPress={onSaveProduct}
                >
                  บันทึก
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
