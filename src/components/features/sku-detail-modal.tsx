"use client";

import { X } from "lucide-react"; // Using lucide-react for icons, common in shadcn/ui
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { createCheckoutSession } from "@/actions/payment.actions";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useSkuModalStore } from "@/stores/useSkuModalStore";

export function SkuDetailModal() {
  const t = useTranslations("purchase");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { isOpen, sku, closeModal } = useSkuModalStore();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!sku) return;

    setError(null);
    startTransition(async () => {
      try {
        const result = await createCheckoutSession({
          skuId: sku.id,
          locale: locale as "en" | "zh",
        });

        if (result.data?.success && result.data.checkoutUrl) {
          // Redirect to Stripe Checkout
          window.location.href = result.data.checkoutUrl;
        } else {
          setError(result.data?.message || tCommon("checkoutSessionError"));
        }
      } catch (error) {
        console.error("Checkout error:", error);
        setError(tCommon("purchaseError"));
      }
    });
  };

  if (!isOpen || !sku) {
    return null;
  }

  const skuName = sku.name[locale as keyof typeof sku.name] || sku.name.en;
  const skuDescription =
    sku.description?.[locale as keyof typeof sku.description] ||
    sku.description?.en ||
    "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="relative m-4 w-full max-w-md transform-gpu rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>

        {/* SKU Image - Following PRD prototype */}
        <div className="relative mb-6 aspect-square w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
          {sku.image_url ? (
            <Image
              src={sku.image_url}
              alt={skuName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 90vw, 400px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <div className="text-6xl">💎</div>
                <p className="mt-2 text-sm text-gray-500">
                  {tCommon("noImage")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bonus Badge - Following PRD prototype */}
        <div className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold text-center">
          3x In-Game Bonus!
        </div>

        {/* SKU Details */}
        <h3 className="mb-4 text-2xl font-bold text-center text-gray-900 dark:text-white">
          {skuName}
        </h3>

        {/* Item Breakdown - Following PRD prototype */}
        <div className="mb-6 text-center space-y-2">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold">32</span> Base Crystals
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold">4</span> Bonus Crystals
          </p>
        </div>

        {/* Price - Following PRD prototype */}
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Price:
          </p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatPrice(sku.prices.usd, "usd", locale)}
          </p>
        </div>

        {/* Purchase Button - Following PRD prototype */}
        <Button
          className="w-full py-4 text-lg font-semibold"
          onClick={handlePurchase}
          disabled={isPending}
        >
          {isPending ? t("processing") : t("purchase")}
        </Button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-center text-sm text-red-500">{error}</div>
        )}
      </div>
    </div>
  );
}
