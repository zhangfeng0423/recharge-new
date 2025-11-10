import { redirect } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { getCurrentUser } from "@/actions/auth.actions";
import DashboardLayoutWrapper from "./layout-wrapper";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { locale } = await params;
  // 临时注释掉认证检查以便演示
  // const user = await getCurrentUser();

  // Protect the dashboard route
  // if (!user || (user.role !== "ADMIN" && user.role !== "MERCHANT")) {
  //   redirect(`/${locale}/auth?error=unauthorized`);
  // }

  // 临时创建一个虚拟用户用于演示
  const mockUser = {
    id: "12345678-1234-1234-1234-123456789abc",
    email: "demo@merchant.com",
    role: "MERCHANT"
  };

  // 获取国际化消息
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <DashboardLayoutWrapper user={mockUser}>{children}</DashboardLayoutWrapper>
    </NextIntlClientProvider>
  );
}
