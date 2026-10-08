"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
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
  description: string;
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

  const [settings, setSettings] = useState<SiteSettings>({
    name: "",
    description: "",
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

    try {
      const updated = await apiJson<SiteSettings>("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });

      setSettings(updated);
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
        <Card className="border border-danger/30 bg-danger/10">
          <CardBody className="text-danger text-sm">{errorText}</CardBody>
        </Card>
      ) : null}

      {tab === "settings" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10">
            <CardBody className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">ข้อมูลเว็บไซต์</h2>
                <Button
                  color="primary"
                  isLoading={isLoading}
                  onPress={onSaveSettings}
                >
                  บันทึก
                </Button>
              </div>
              <Divider />
              <Input
                label="ชื่อเว็บ"
                placeholder="เช่น CODEX DEVELOPER"
                value={settings.name}
                variant="bordered"
                onValueChange={(v) => setSettings((p) => ({ ...p, name: v }))}
              />
              <Input
                label="คำอธิบายเว็บ"
                placeholder="คำอธิบายสั้นๆ"
                value={settings.description}
                variant="bordered"
                onValueChange={(v) =>
                  setSettings((p) => ({ ...p, description: v }))
                }
              />
            </CardBody>
          </Card>

          <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10">
            <CardBody className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">การตั้งค่าแอดมิน</h2>
              <Divider />
              <div className="text-sm text-default-500 space-y-1">
                <p>
                  กำหนด Discord ID ของแอดมินได้ด้วยตัวแปร{" "}
                  <span className="font-medium text-default-600 dark:text-default-400">
                    ADMIN_DISCORD_ID
                  </span>
                </p>
                <p>
                  เมื่อผู้ใช้งาน Discord ID ตรงกัน จะถูกตั้งเป็น admin อัตโนมัติ
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === "users" ? (
        <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10">
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
        <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10">
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
        <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10">
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
                        className="flex-1"
                        color={editUserRole === "user" ? "primary" : "default"}
                        variant={editUserRole === "user" ? "solid" : "bordered"}
                        onPress={() => setEditUserRole("user")}
                      >
                        user
                      </Button>
                      <Button
                        className="flex-1"
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
