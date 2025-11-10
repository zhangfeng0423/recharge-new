"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { GameForm } from "@/components/features/game-form";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function CreateGamePage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  const handleSuccess = (_data: any) => {
    // Redirect to the games list after successful creation
    router.push(`/${locale}/dashboard/merchant/games`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/${locale}/dashboard/merchant/games`}>
          <Button variant="outline" size="sm">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t("common.back")}
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("merchant.createNewGame")}
          </h1>
          <p className="text-gray-600">{t("merchant.createGame")}</p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <GameForm
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Card>
    </div>
  );
}
