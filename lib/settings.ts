import prisma from "@/lib/prisma";

export interface SiteSettings {
  // 1. ข้อมูลเว็บไซต์ & แบรนด์
  name: string;
  shortName: string;
  description: string;
  logoUrl: string;

  // 2. ลิงก์ & การติดต่อ
  discordUrl: string;
  contactButtonText: string;

  // 3. หน้าแรก (Hero Section)
  heroTitle: string;
  heroSubtitle: string;

  // 4. ส่วนท้ายเว็บ (Footer)
  footerCopyright: string;
  footerPoweredBy: string;

  // 5. ข้อมูลทีมงาน / ผู้พัฒนา (Developer Card)
  teamName: string;
  teamRole: string;
  teamDescription: string;
  teamAvatar: string;

  // 6. ข้อมูลการชำระเงิน / เติมเงิน (หน้า Profile)
  bankAccountName: string;
  bankPromptpayNo: string;
  bankName: string;
  promptpayQrUrl: string;
}

export const SETTING_KEYS: Record<keyof SiteSettings, string> = {
  name: "site_name",
  shortName: "site_short_name",
  description: "site_description",
  logoUrl: "site_logo_url",
  discordUrl: "site_discord_url",
  contactButtonText: "site_contact_btn_text",
  heroTitle: "site_hero_title",
  heroSubtitle: "site_hero_subtitle",
  footerCopyright: "site_footer_copyright",
  footerPoweredBy: "site_footer_powered_by",
  teamName: "site_team_name",
  teamRole: "site_team_role",
  teamDescription: "site_team_desc",
  teamAvatar: "site_team_avatar",
  bankAccountName: "bank_account_name",
  bankPromptpayNo: "bank_promptpay_no",
  bankName: "bank_name",
  promptpayQrUrl: "bank_promptpay_qr",
};

export const DEFAULT_SETTINGS: SiteSettings = {
  name: "CODEX DEVELOPER",
  shortName: "CX",
  description:
    "มิติใหม่ในการเขียนสคริปต์สำหรับเซิร์ฟเวอร์ของคุณ มุ่งเน้นการใช้งานที่ง่าย รวดเร็ว และปลอดภัย พร้อมส่งมอบคุณภาพระดับพรีเมียม",
  logoUrl: "",
  discordUrl: "https://discord.gg/msc-fivem",
  contactButtonText: "Contact Us",
  heroTitle: "CODEX DEVELOPER",
  heroSubtitle:
    "มิติใหม่ในการเขียนสคริปต์สำหรับเซิร์ฟเวอร์ของคุณ ออกแบบมาเพื่อความง่ายในการใช้งาน ความเร็ว และความปลอดภัย พร้อมคุณภาพงานที่เราส่งมอบให้คุณ",
  footerCopyright: "CodeX Developer",
  footerPoweredBy: "d14",
  teamName: "CodeX System",
  teamRole: "UI / Website / Script Developer",
  teamDescription: "ออกแบบ UI ที่ดูสะอาดและเข้าใจง่าย",
  teamAvatar: "https://avatars.githubusercontent.com/u/86160567?s=200&v=4",
  bankAccountName: "CODEX Developer",
  bankPromptpayNo: "xxx-xxx-xxxx",
  bankName: "กสิกรไทย (KBank)",
  promptpayQrUrl: "",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map = new Map(rows.map((r) => [r.key, r.value]));

    const settings: SiteSettings = { ...DEFAULT_SETTINGS };

    for (const [prop, key] of Object.entries(SETTING_KEYS) as [
      keyof SiteSettings,
      string,
    ][]) {
      const val = map.get(key);
      if (typeof val === "string" && val.trim() !== "") {
        settings[prop] = val;
      }
    }

    return settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSiteSettings(
  input: Partial<SiteSettings>,
): Promise<SiteSettings> {
  const operations = [];

  for (const [prop, key] of Object.entries(SETTING_KEYS) as [
    keyof SiteSettings,
    string,
  ][]) {
    if (prop in input) {
      const rawVal = input[prop];
      const val = typeof rawVal === "string" ? rawVal.trim() : "";
      operations.push(
        prisma.siteSetting.upsert({
          where: { key },
          create: { key, value: val },
          update: { value: val },
        }),
      );
    }
  }

  if (operations.length > 0) {
    await prisma.$transaction(operations);
  }

  return getSiteSettings();
}
