"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";

export function MerchantDashboardLoadingState() {
  const t = useTranslations("common");

  return (
    <div className="col-span-full">
      <Card className="p-8 bg-[#359EFF]/10 border-[#359EFF]/30">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#359EFF]"></div>
          <div>
            <p className="text-[#359EFF] font-medium">{t("loading")}</p>
            <p className="text-[#359EFF] text-sm mt-1">
              Loading merchant analytics...
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
