"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { SearchIcon } from "@/components/icons";
import { normalizeEmbedURL } from "@/lib/youtube";

type ApiProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string | null;
  points: number;
  imageURL: string | null;
  embedURL: string | null;
  isFeatured: boolean;
};

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All Scripts");
  const [search, setSearch] = useState("");
  const [dbProducts, setDbProducts] = useState<ApiProduct[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Request failed");

        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setDbProducts(data as ApiProduct[]);
      })
      .catch(() => null)
      .finally(() => setHasLoaded(true));
  }, []);

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

  const products = useMemo(() => {
    return dbProducts.map((p) => ({
      id: p.id,
      version: p.version || "-",
      name: p.name,
      description: p.description,
      points: p.points.toLocaleString(),
      imageURL: p.imageURL || "",
      embedURL: normalizeEmbedURL(p.embedURL) || "",
      isFeatured: p.isFeatured,
      category: p.category,
    }));
  }, [dbProducts]);

  const categories = useMemo(() => {
    const set = new Set<string>();

    for (const p of products) set.add(p.category);

    return ["All Scripts", ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((p) => {
      const inCategory =
        activeCategory === "All Scripts" || p.category === activeCategory;

      if (!inCategory) return false;
      if (!q) return true;

      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, products, search]);

  const featuredProducts = useMemo(
    () => filteredProducts.filter((p) => p.isFeatured),
    [filteredProducts],
  );

  const regularProducts = useMemo(
    () => filteredProducts.filter((p) => !p.isFeatured),
    [filteredProducts],
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 flex flex-col gap-10 py-10 mt-6 min-h-[70vh]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-default-100/50 pb-8">
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <h1 className="text-3xl md:text-4xl font-bold">สินค้าทั้งหมด</h1>
          <p className="text-default-500 ">
            รายการสคริปต์ทั้งหมดที่พร้อมใช้งานสำหรับเซิร์ฟเวอร์ของคุณ
          </p>
        </div>

        <div className="w-full md:w-1/3">
          <Input
            classNames={{
              base: "max-w-full h-12",
              mainWrapper: "h-full",
              input: "text-small",
              inputWrapper:
                "h-full font-normal text-default-500 bg-default-50 border-default-200",
            }}
            placeholder="ค้นหาสคริปต์ (ชื่อ, รายละเอียด)..."
            size="md"
            startContent={<SearchIcon className="text-default-500" />}
            type="search"
            value={search}
            variant="bordered"
            onValueChange={setSearch}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            className={
              activeCategory !== category
                ? "bg-default-100 font-medium"
                : "font-semibold"
            }
            color={activeCategory === category ? "primary" : "default"}
            radius="full"
            size="sm"
            variant={activeCategory === category ? "solid" : "flat"}
            onPress={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {featuredProducts.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">สินค้าแนะนำ</h2>
            <Chip
              className="bg-warning/20 text-warning-600 dark:text-warning-400 border border-warning/30"
              radius="full"
              size="sm"
              variant="flat"
            >
              Featured
            </Chip>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Card
                key={product.id}
                className="bg-default-50/20 border border-warning/30 transition-all duration-300 rounded-[24px] shadow-sm hover:shadow-xl hover:scale-[1.02] group"
                shadow="none"
              >
                <CardBody className="p-4 gap-4 overflow-visible">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-default-200/50 dark:bg-black/20">
                    {product.imageURL ? (
                      <img
                        alt=""
                        className="w-full h-full object-cover"
                        src={product.imageURL}
                      />
                    ) : product.embedURL ? (
                      <iframe
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        className="w-full h-full object-cover"
                        src={product.embedURL}
                        title={`Video review for ${product.name}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-default-500 text-sm">
                        ไม่มีวิดีโอตัวอย่าง
                      </div>
                    )}
                    <Chip
                      className="absolute top-3 left-3 z-10 bg-warning/80 text-black font-semibold border border-black/10"
                      radius="lg"
                      size="sm"
                    >
                      แนะนำ
                    </Chip>
                    <Chip
                      className="absolute bottom-3 right-3 z-10 bg-white/60 dark:bg-black/60 backdrop-blur-md border border-black/10 dark:border-white/20 text-black dark:text-white font-medium"
                      radius="lg"
                      size="sm"
                    >
                      {product.version}
                    </Chip>
                  </div>
                  <div className="flex flex-col gap-1 px-1">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm font-semibold text-primary">
                        รายการ
                      </span>
                      <span className="text-xs bg-default-100 text-default-600 px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-default-500 line-clamp-2 mt-1 min-h-[40px]">
                      {product.description}
                    </p>
                  </div>
                  <div className="px-1 mt-2">
                    <p className="text-2xl font-bold">
                      {product.points} Points
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {status === "loading" ? (
                      <Button
                        isLoading
                        className="flex-1"
                        radius="lg"
                        variant="bordered"
                      >
                        กำลังโหลด...
                      </Button>
                    ) : session?.user ? (
                      <>
                        <Button
                          className="flex-1"
                          isDisabled={cartIds.has(product.id)}
                          radius="lg"
                          variant="bordered"
                          onPress={() => addToCart(product.id)}
                        >
                          {cartIds.has(product.id)
                            ? "อยู่ในตะกร้าแล้ว"
                            : "เพิ่มเข้าตะกร้า"}
                        </Button>
                        <Button
                          className="flex-1"
                          color="secondary"
                          radius="lg"
                          variant="solid"
                          onPress={() => router.push(`/product/${product.id}`)}
                        >
                          ซื้อสินค้า
                        </Button>
                      </>
                    ) : (
                      <Button
                        isDisabled
                        className="flex-1"
                        radius="lg"
                        variant="bordered"
                      >
                        โปรดเข้าสู่ระบบก่อน
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regularProducts.map((product) => (
          <Card
            key={product.id}
            className="bg-default-50/20 border border-default-100 transition-all duration-300 rounded-[24px] shadow-sm hover:shadow-xl hover:scale-[1.02] group"
            shadow="none"
          >
            <CardBody className="p-4 gap-4 overflow-visible">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-default-200/50 dark:bg-black/20">
                {product.imageURL ? (
                  <img
                    alt=""
                    className="w-full h-full object-cover"
                    src={product.imageURL}
                  />
                ) : product.embedURL ? (
                  <iframe
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    className="w-full h-full object-cover"
                    src={product.embedURL}
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
                  {product.version}
                </Chip>
              </div>
              <div className="flex flex-col gap-1 px-1">
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-semibold text-primary">
                    รายการ
                  </span>
                  <span className="text-xs bg-default-100 text-default-600 px-2 py-0.5 rounded-full">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm text-default-500 line-clamp-2 mt-1 min-h-[40px]">
                  {product.description}
                </p>
              </div>
              <div className="px-1 mt-2">
                <p className="text-2xl font-bold">{product.points} Points</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {status === "loading" ? (
                  <Button
                    isLoading
                    className="flex-1"
                    radius="lg"
                    variant="bordered"
                  >
                    กำลังโหลด...
                  </Button>
                ) : session?.user ? (
                  <>
                    <Button
                      className="flex-1"
                      isDisabled={cartIds.has(product.id)}
                      radius="lg"
                      variant="bordered"
                      onPress={() => addToCart(product.id)}
                    >
                      {cartIds.has(product.id)
                        ? "อยู่ในตะกร้าแล้ว"
                        : "เพิ่มเข้าตะกร้า"}
                    </Button>
                    <Button
                      className="flex-1"
                      color="secondary"
                      radius="lg"
                      variant="solid"
                      onPress={() => router.push(`/product/${product.id}`)}
                    >
                      ซื้อสินค้า
                    </Button>
                  </>
                ) : (
                  <Button
                    isDisabled
                    className="flex-1"
                    radius="lg"
                    variant="bordered"
                  >
                    โปรดเข้าสู่ระบบก่อน
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
        {featuredProducts.length === 0 && regularProducts.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-20 text-default-500">
            {hasLoaded && products.length === 0
              ? "ยังไม่มีสินค้าเปิดขายหรือสินค้าแนะนำ"
              : "ไม่พบสคริปต์ในหมวดหมู่นี้"}
          </div>
        )}
      </div>
    </div>
  );
}
