import { Card, CardBody, CardHeader } from "@heroui/card";

import AdminClient from "./admin-client";

export default function AdminPage() {
  return (
    <div className="w-full max-w-7xl mx-auto py-10">
      <Card className="bg-default-50/40 dark:bg-black/20 border border-default-200/70 dark:border-white/10 backdrop-blur-lg" shadow="none">
        <CardHeader className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold">หลังบ้านแอดมิน</h1>
          <p className="text-sm text-default-500">
            จัดการชื่อเว็บ ผู้ใช้งาน และสินค้าแบบรวดเร็ว
          </p>
        </CardHeader>
        <CardBody>
          <AdminClient />
        </CardBody>
      </Card>
    </div>
  );
}
