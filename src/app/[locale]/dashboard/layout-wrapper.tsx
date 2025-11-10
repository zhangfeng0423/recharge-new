"use client";

import {
  Bars3Icon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ComputerDesktopIcon,
  CubeIcon,
  HomeIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { UserStatus } from "@/components/features/user-status";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface User {
  id: string;
  email: string;
  role: "USER" | "MERCHANT" | "ADMIN" | string;
  merchant_name?: string | null;
}

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
  user: User;
}

export default function DashboardLayoutWrapper({
  children,
  user,
}: DashboardLayoutWrapperProps) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userRole = user.role;

  const merchantNavItems = [
    {
      name: t("dashboard.navigation.overview"),
      href: `/${locale}/dashboard/merchant`,
      icon: HomeIcon,
    },
    {
      name: t("dashboard.navigation.games"),
      href: `/${locale}/dashboard/merchant/games`,
      icon: ComputerDesktopIcon,
    },
    {
      name: t("dashboard.navigation.skus"),
      href: `/${locale}/dashboard/merchant/skus`,
      icon: CubeIcon,
    },
    {
      name: t("dashboard.navigation.orders"),
      href: `/${locale}/dashboard/merchant/orders`,
      icon: ShoppingCartIcon,
    },
    {
      name: t("dashboard.navigation.analytics"),
      href: `/${locale}/dashboard/merchant/analytics`,
      icon: ChartBarIcon,
    },
  ];

  const adminNavItems = [
    {
      name: t("dashboard.navigation.overview"),
      href: `/${locale}/dashboard/admin`,
      icon: HomeIcon,
    },
    {
      name: t("dashboard.navigation.merchants"),
      href: `/${locale}/dashboard/admin/merchants`,
      icon: BuildingStorefrontIcon,
    },
    {
      name: t("dashboard.navigation.games"),
      href: `/${locale}/dashboard/admin/games`,
      icon: ComputerDesktopIcon,
    },
    {
      name: t("dashboard.navigation.orders"),
      href: `/${locale}/dashboard/admin/orders`,
      icon: ShoppingCartIcon,
    },
  ];

  // Conditionally set navItems based on userRole
  const navItems = userRole === "ADMIN" ? adminNavItems : merchantNavItems;

  const isActive = (href: string) => {
    if (
      href === `/${locale}/dashboard/merchant` ||
      href === `/${locale}/dashboard/admin`
    ) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-900/80"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {userRole === "ADMIN"
                ? t("dashboard.admin.title")
                : t("dashboard.merchant.title")}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-[#359EFF]/10 text-[#359EFF]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex h-16 items-center justify-center px-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {userRole === "ADMIN"
                ? t("dashboard.admin.title")
                : t("dashboard.merchant.title")}
            </h2>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-[#359EFF]/10 text-[#359EFF]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between bg-white px-4 shadow-sm sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </Button>

          {/* Spacer to push content to the right */}
          <div className="flex-1" />

          <div className="flex items-center space-x-4">
            <Link href={`/${locale}`}>
              <Button variant="outline" size="sm">
                {t("dashboard.backToSite")}
              </Button>
            </Link>
            <UserStatus initialUser={user} locale={locale} />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
