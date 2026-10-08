"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";

import { normalizeEmbedURL } from "@/lib/youtube";

type ApiProduct = {
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
  isFeatured: boolean;
};

type LicenseItem = {
  id: string;
  licenseKey: string;
  createdAt: string;
  expiresAt: string | null;
};

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString();
}

export default function ProductDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id || "";

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());
  const [license, setLicense] = useState<LicenseItem | null>(null);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    if (!id) return;

    setHasLoaded(false);
    fetch(`/api/products/${id}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Request failed");

        return r.json();
      })
      .then((data) => setProduct(data as ApiProduct))
      .catch(() => setProduct(null))
      .finally(() => setHasLoaded(true));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (!session?.user) {
      setLicense(null);

      return;
    }

    fetch(`/api/me/licenses?productId=${encodeURIComponent(id)}`, {
      cache: "no-store",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("Request failed");

        return r.json();
      })
      .then((data) => {
        const first = Array.isArray(data) ? data[0] : null;

        if (first && typeof first.licenseKey === "string") {
          setLicense(first as LicenseItem);
        } else {
          setLicense(null);
        }
      })
      .catch(() => setLicense(null));
  }, [id, session?.user]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart_product_ids");
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      const ids = Array.isArray(parsed)
        ? parsed.filter((x) => typeof x === "string")
        : [];

      setCartIds(new Set(ids));
    } catch {
      setCartIds(new Set());
    }
  }, []);

  const addToCart = (productId: string) => {
    setCartIds((prev) => {
      const next = new Set(prev);

      next.add(productId);
      try {
        localStorage.setItem(
          "cart_product_ids",
          JSON.stringify(Array.from(next)),
        );
      } catch {
        return next;
      }

      return next;
    });
  };

  const embedURL = useMemo(() => {
    if (!product) return "";

    return normalizeEmbedURL(product.embedURL) || "";
  }, [product]);

  if (!id) {
    return (
      <div className="w-full max-w-6xl mx-auto py-12">
        <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10">
          <CardBody className="py-12 text-center text-default-500">
            ไม่พบสินค้า
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!hasLoaded) {
    return (
      <div className="w-full max-w-6xl mx-auto py-12">
        <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10">
          <CardBody className="py-12 text-center text-default-500">
            กำลังโหลด...
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full max-w-6xl mx-auto py-12">
        <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10">
          <CardBody className="py-12 text-center text-default-500">
            สินค้านี้ถูกปิดขายหรือไม่มีอยู่
          </CardBody>
        </Card>
      </div>
    );
  }

  const inCart = cartIds.has(product.id);
  const detailText = product.detailText || "";
  const featuresA = product.featuresA || "";
  const featuresB = product.featuresB || "";
  const expiresText = formatDateTime(license?.expiresAt ?? null);

  return (
    <div className="w-full max-w-6xl mx-auto py-10 flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Chip size="sm" variant="flat">
              สินค้า
            </Chip>
            <Chip size="sm" variant="flat">
              {product.category}
            </Chip>
            {product.isFeatured ? (
              <Chip
                className="bg-warning/20 text-warning-600 dark:text-warning-400 border border-warning/30"
                size="sm"
                variant="flat"
              >
                แนะนำ
              </Chip>
            ) : null}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
        </div>
        <Button variant="bordered" onPress={() => router.push("/products")}>
          กลับ
        </Button>
      </div>

      <Card
        className="bg-default-50/20 border border-default-100 rounded-[24px]"
        shadow="none"
      >
        <CardBody className="p-4 md:p-6 gap-6">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-default-200/50 dark:bg-black/20">
            {product.imageURL ? (
              <img
                alt=""
                className="w-full h-full object-cover"
                src={product.imageURL}
              />
            ) : embedURL ? (
              <iframe
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                className="w-full h-full object-cover"
                src={embedURL}
                title={`Video review for ${product.name}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-default-500 text-sm">
                ไม่มีวิดีโอตัวอย่าง
              </div>
            )}
            <Chip
              className="absolute bottom-3 right-3 z-10 bg-white/60 dark:bg-black/60 backdrop-blur-md border border-black/10 dark:border-white/20 text-black dark:text-white font-medium"
              radius="lg"
              size="sm"
            >
              {product.version || "-"}
            </Chip>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h2 className="text-lg font-semibold">รายละเอียดสินค้า</h2>
              <p className="text-sm text-default-500 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
              {detailText ? (
                <Card
                  className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10"
                  shadow="none"
                >
                  <CardBody className="text-sm text-default-500 leading-relaxed whitespace-pre-wrap">
                    {detailText}
                  </CardBody>
                </Card>
              ) : null}
              <Divider />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                  className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10"
                  shadow="none"
                >
                  <CardBody className="gap-2">
                    <div className="text-sm font-semibold">
                      General Features
                    </div>
                    <div className="text-sm text-default-500 whitespace-pre-wrap">
                      {featuresA || "-"}
                    </div>
                  </CardBody>
                </Card>
                <Card
                  className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10"
                  shadow="none"
                >
                  <CardBody className="gap-2">
                    <div className="text-sm font-semibold">
                      Performance & Security
                    </div>
                    <div className="text-sm text-default-500 whitespace-pre-wrap">
                      {featuresB || "-"}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Card
                className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10"
                shadow="none"
              >
                <CardBody className="gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-500">Version</span>
                    <span className="text-sm font-semibold">
                      {product.version || "-"}
                    </span>
                  </div>
                  <Divider />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-500">ราคา</span>
                    <span className="text-2xl font-bold">
                      {product.points.toLocaleString()} Points
                    </span>
                  </div>
                  {license ? (
                    <div className="rounded-2xl border border-default-200/70 dark:border-white/10 bg-default-100/30 dark:bg-white/5 p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-default-500">
                          License
                        </span>
                        <Button
                          size="sm"
                          variant="bordered"
                          onPress={() =>
                            navigator.clipboard.writeText(license.licenseKey)
                          }
                        >
                          คัดลอก
                        </Button>
                      </div>
                      <div className="text-sm font-mono truncate">
                        {license.licenseKey}
                      </div>
                      <div className="text-xs text-default-500">
                        หมดอายุ:{" "}
                        <span className="text-default-600 dark:text-default-400">
                          {expiresText}
                        </span>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2 pt-2">
                    {status === "loading" ? (
                      <Button isLoading className="flex-1" variant="bordered">
                        กำลังโหลด...
                      </Button>
                    ) : session?.user ? (
                      <>
                        <Button
                          className="flex-1"
                          isDisabled={inCart}
                          variant="bordered"
                          onPress={() => addToCart(product.id)}
                        >
                          {inCart ? "อยู่ในตะกร้าแล้ว" : "เพิ่มเข้าตะกร้า"}
                        </Button>
                        <Button
                          className="flex-1"
                          color="secondary"
                          isDisabled={!!license}
                          isLoading={isBuying}
                          variant="solid"
                          onPress={async () => {
                            if (license) return;
                            setIsBuying(true);
                            try {
                              const res = await fetch("/api/me/purchase", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ productId: product.id }),
                              });

                              if (!res.ok) throw new Error("Request failed");
                              const data = (await res.json()) as any;

                              if (data?.license?.licenseKey) {
                                setLicense(data.license as LicenseItem);
                              }
                              router.push("/profile?tab=scripts");
                            } catch {
                              setIsBuying(false);
                            }
                          }}
                        >
                          {license ? "ซื้อแล้ว" : "ซื้อสินค้า"}
                        </Button>
                      </>
                    ) : (
                      <Button isDisabled className="flex-1" variant="bordered">
                        โปรดเข้าสู่ระบบก่อน
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
