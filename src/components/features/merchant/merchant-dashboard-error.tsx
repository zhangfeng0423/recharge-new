"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";

interface MerchantDashboardErrorProps {
  error: {
    type: string;
    message: string;
  };
}

export function MerchantDashboardError({ error }: MerchantDashboardErrorProps) {
  const t = useTranslations("merchant");

  return (
    <div className="col-span-full">
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-red-800 font-medium text-lg">
              {t("errorOccurred")}
            </h3>
            <p className="text-red-600 text-sm mt-2">{error.message}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
