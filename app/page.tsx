import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";

import prisma from "@/lib/prisma";
import { normalizeEmbedURL } from "@/lib/youtube";

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      version: true,
      name: true,
      description: true,
      points: true,
      imageURL: true,
      embedURL: true,
      isFeatured: true,
    },
    take: 6,
  });

  const features = [
    {
      title: "High Performance",
      description:
        "สคริปต์โหลดเร็ว ประหยัดทรัพยากร เพิ่มประสิทธิภาพให้เซิร์ฟเวอร์ของคุณ",
      icon: (
        <svg
          aria-hidden="true"
          className="w-10 h-10 text-primary"
          viewBox="0 0 256 256"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m213.85 125.46l-112 120a8 8 0 0 1-13.69-7l14.66-73.33l-57.63-21.64a8 8 0 0 1-3-13l112-120a8 8 0 0 1 13.69 7l-14.7 73.41l57.63 21.61a8 8 0 0 1 3 12.95Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      title: "Secure & Trusted",
      description: "ออกแบบด้วยความปลอดภัยสูง ป้องกันการโจมตีจากภายนอก",
      icon: (
        <svg
          aria-hidden="true"
          className="w-10 h-10 text-primary"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 16.59L11.41 14L10 15.41l4 4l8-8L20.59 10z"
            fill="currentColor"
          />
          <path
            d="m16 30l-6.176-3.293A10.98 10.98 0 0 1 4 17V4a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v13a10.98 10.98 0 0 1-5.824 9.707ZM6 4v13a8.99 8.99 0 0 0 4.766 7.942L16 27.733l5.234-2.79A8.99 8.99 0 0 0 26 17V4Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      title: "Modern UI",
      description:
        "ระบบของเราเป็น UI สมัยใหม่ทันสมัยและลื่นไหล ปรับแต่ง UI ได้อย่างยืดหยุ่นและสวยงาม",
      icon: (
        <svg
          aria-hidden="true"
          className="w-10 h-10 text-primary"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.58 2.125a.5.5 0 0 1 .12.598a.3.3 0 0 0-.013.09c0 .063.016.183.167.333c.073.073.129.125.19.182c.05.046.103.094.17.16c.13.124.267.27.39.453c.255.383.396.862.396 1.559C6 6.97 5.023 8 4 8S2 6.97 2 5.5c0-.326.087-.715.207-1.074s.288-.732.482-1.032c.231-.39.556-.717.808-.937a6 6 0 0 1 .432-.343l.044-.03a.5.5 0 0 1 .608.041M4 9a2.68 2.68 0 0 0 1.68-.595q.071.211.12.425c.2.87.2 1.916.2 2.645v.025c0 2.787-.379 4.368-.796 5.272c-.21.455-.433.745-.626.927a1.5 1.5 0 0 1-.258.198a1 1 0 0 1-.133.067S4.074 18 4 18s-.187-.036-.187-.036a1 1 0 0 1-.133-.067a1.5 1.5 0 0 1-.258-.198c-.193-.183-.416-.472-.626-.927C2.379 15.868 2 14.287 2 11.5v-.025c0-.73 0-1.775.2-2.645q.049-.214.12-.425A2.68 2.68 0 0 0 4 9m5 4c-.715 0-1.396-.15-2.01-.42q.02-.534.02-1.11A4 4 0 0 0 9 12v-2a2 2 0 0 1 2-2h2a4 4 0 0 0-6.082-3.416a3.3 3.3 0 0 0-.338-.96A5 5 0 0 1 14 8h2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2zm4.9-4a5.01 5.01 0 0 1-3.9 3.9V15a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1zm-1.026 0H11a1 1 0 0 0-1 1v1.874A4.01 4.01 0 0 0 12.874 9"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      title: "Ready-to-Use Scripts",
      description: "ติดตั้งง่าย ไม่ต้องเขียนเอง ใช้งานได้ทันทีภายในไม่กี่นาที",
      icon: (
        <svg
          aria-hidden="true"
          className="w-10 h-10 text-primary"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 20a1 1 0 0 0 1-1V4H8a1 1 0 0 0-1 1v11H5V5a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v1h-2V5a1 1 0 0 0-1-1a1 1 0 0 0-1 1v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-1h11a2 2 0 0 0 2 2M9 6h5v2H9zm0 4h5v2H9zm0 4h5v2H9z"
            fill="currentColor"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 flex flex-col gap-16 py-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center mt-12 gap-8">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl md:text-6xl font-bold">CODEX DEVELOPER</h1>
          <p className="text-default-500 max-w-2xl text-lg px-4 leading-relaxed">
            มิติใหม่ในการเขียนสคริปต์สำหรับเซิร์ฟเวอร์ของคุณ
            ออกแบบมาเพื่อความง่ายในการใช้งาน <br className="hidden sm:block" />{" "}
            ความเร็ว และความปลอดภัย พร้อมคุณภาพงานที่เราส่งมอบให้คุณ
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Button
            disableRipple
            isExternal
            as={Link}
            className="w-40 bg-default-500/5 border border-default-800/10 text-default-700 !font-medium group transition-all duration-300 hover:scale-[1.03]"
            href="https://discord.gg/msc-fivem"
            radius="full"
            variant="solid"
          >
            <div className="relative flex items-center justify-center gap-2 w-full h-full">
              <span className="relative inline-block overflow-hidden h-5 leading-5 w-[80px]">
                <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                  Contact Us
                </span>
                <span className="absolute inset-0 transition-transform duration-300 translate-y-full group-hover:translate-y-0 font-bold">
                  Click
                </span>
              </span>
              <svg
                className="w-4 h-4 mt-[1px] transition-transform duration-300 group-hover:rotate-45"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" fill="currentColor" r="11" />
                <path
                  d="M7.5 16.5L16.5 7.5M16.5 7.5H10.5M16.5 7.5V13.5"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </Button>
        </div>
      </section>

      {/* Products Section */}
      <section className="flex flex-col gap-6">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const embedURL = normalizeEmbedURL(product.embedURL) || "";
              const version = product.version || "-";

              return (
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
                      {product.isFeatured ? (
                        <Chip
                          className="absolute top-3 left-3 z-10 bg-warning/80 text-black font-semibold border border-black/10"
                          radius="lg"
                          size="sm"
                        >
                          แนะนำ
                        </Chip>
                      ) : null}
                      <Chip
                        className="absolute bottom-3 right-3 z-10 bg-white/60 dark:bg-black/60 backdrop-blur-md border border-black/10 dark:border-white/20 text-black dark:text-white font-medium"
                        radius="lg"
                        size="sm"
                      >
                        {version}
                      </Chip>
                    </div>
                    <div className="flex flex-col gap-1 px-1">
                      <span className="text-sm font-semibold text-primary">
                        รายการ
                      </span>
                      <h3 className="text-xl font-bold line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-default-500 line-clamp-2 mt-1 min-h-[40px]">
                        {product.description}
                      </p>
                    </div>
                    <div className="px-1 mt-2">
                      <p className="text-2xl font-bold">
                        {product.points.toLocaleString()} Points
                      </p>
                    </div>
                    <Button
                      fullWidth
                      isDisabled
                      className="mt-2 bg-default-100/50 border border-default-200 text-default-400 font-medium"
                      radius="lg"
                    >
                      โปรดเข้าสู่ระบบเพื่อซื้อสินค้า
                    </Button>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex justify-center py-10 text-default-500">
            ยังไม่มีสินค้าเปิดขาย
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="flex flex-col gap-10 mt-12 mb-8">
        <div className="text-center flex flex-col items-center gap-3">
          <h2 className="text-3xl font-bold">ทำไมถึงต้องใช้สคริปต์ของเรา?</h2>
          <p className="text-default-500 max-w-xl text-lg">
            เราออกแบบสคริปต์เพื่อเพิ่มประสิทธิภาพ ความปลอดภัย และ UI
            ที่ทันสมัยสำหรับ FiveM
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <Card
              key={idx}
              className="bg-transparent border border-default-100 hover:border-primary/50 transition-colors p-6 shadow-sm group hover:scale-[1.02]"
              radius="lg"
              shadow="none"
            >
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-default-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Statistics */}
      <section className="flex flex-col gap-10 py-16 border-t border-b border-default-100/50 my-8">
        <div className="text-center flex flex-col items-center gap-3">
          <h2 className="text-3xl font-bold">สถิติการใช้งานระบบ!</h2>
          <p className="text-default-500 max-w-xl text-lg">
            เราพร้อมให้บริการด้วยความโปร่งใส
            และแสดงข้อมูลสำคัญต่อผู้ใช้งานของเรา
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 justify-items-center mt-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-3xl bg-default-50 border border-default-100 flex items-center justify-center relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50" />
              <span className="text-4xl font-black z-10 drop-shadow-md">0</span>
            </div>
            <p className="text-xl font-semibold tracking-wide text-default-700">
              Members
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-3xl bg-default-50 border border-default-100 flex items-center justify-center relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50" />
              <span className="text-4xl font-black z-10 drop-shadow-md">0</span>
            </div>
            <p className="text-xl font-semibold tracking-wide text-default-700">
              Licenses
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-3xl bg-default-50 border border-default-100 flex items-center justify-center relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50" />
              <span className="text-4xl font-black z-10 drop-shadow-md">0</span>
            </div>
            <p className="text-xl font-semibold tracking-wide text-default-700">
              Products
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="flex flex-col gap-8 pb-16 items-center">
        <div className="text-center flex flex-col items-center gap-2">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            ทีมงานของเรา
          </span>
          <h2 className="text-3xl font-bold">ทีมงานพัฒนาระบบของเรา!</h2>
          <p className="text-default-500 max-w-xl text-lg mt-2">
            เราคือทีมที่รวมความคิดสร้างสรรค์กับเทคโนโลยีเพื่อสร้างสิ่งที่ดีกว่าให้กับผู้ใช้งานของเรา
          </p>
        </div>

        <Card
          className="max-w-[300px] w-full mt-6 bg-transparent border border-default-100 hover:border-default-300 transition-all hover:scale-[1.02]"
          radius="lg"
          shadow="sm"
        >
          <CardBody className="flex flex-col items-center text-center p-8 gap-4">
            <Avatar
              isBordered
              className="w-28 h-28 text-large shadow-xl border-4 border-default-100"
              color="primary"
              name="Fxw"
              src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
            />
            <div className="flex flex-col gap-1 mt-2">
              <h3 className="text-xl font-bold">CodeX System</h3>
              <p className="text-sm font-medium text-primary">
                UI / Website / Script Developer
              </p>
              <p className="text-sm text-default-500 mt-2">
                ออกแบบ UI ที่ดูสะอาดและเข้าใจง่าย
              </p>
            </div>
            <div className="flex gap-4 mt-2">
              {/* Dummy social icons equivalent */}
              <span className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center text-default-500 hover:text-white hover:bg-white/20 transition-colors cursor-pointer">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z" />
                </svg>
              </span>
              <span className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center text-default-500 hover:text-white hover:bg-white/20 transition-colors cursor-pointer">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2" />
                </svg>
              </span>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
