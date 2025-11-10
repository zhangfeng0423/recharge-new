"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createSkuAction, updateSkuAction } from "@/actions/merchant.actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import type { SkuDescription, SkuName } from "@/lib/supabase-types";

// Validation schema
const skuFormSchema = z.object({
  gameId: z.string().uuid("validation.required"),
  name: z.object({
    en: z.string().min(1, "validation.nameRequiredEn"),
    zh: z.string().min(1, "validation.nameRequiredZh"),
  }),
  description: z
    .object({
      en: z.string().min(1, "validation.descriptionRequiredEn"),
      zh: z.string().min(1, "validation.descriptionRequiredZh"),
    })
    .optional(),
  prices: z.object({
    usd: z.number().int().min(1, "validation.priceMin"),
  }),
  imageUrl: z
    .string()
    .url("validation.urlInvalid")
    .optional()
    .or(z.literal("")),
});

type SkuFormData = z.infer<typeof skuFormSchema>;

interface SkuFormProps {
  initialData?: {
    id?: string;
    game_id?: string;
    name?: SkuName;
    description?: SkuDescription | null;
    prices?: { usd: number };
    image_url?: string | null;
  };
  availableGames?: Array<{ id: string; name: { en: string; zh: string } }>;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

export function SkuForm({
  initialData,
  availableGames = [],
  onSuccess,
  onCancel,
  mode = "create",
}: SkuFormProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SkuFormData>({
    resolver: zodResolver(skuFormSchema),
    defaultValues: {
      gameId: initialData?.game_id || "",
      name: {
        en: initialData?.name?.en || "",
        zh: initialData?.name?.zh || "",
      },
      description: {
        en: initialData?.description?.en || "",
        zh: initialData?.description?.zh || "",
      },
      prices: {
        usd: initialData?.prices?.usd || 0,
      },
      imageUrl: initialData?.image_url || "",
    },
  });

  const watchedPrices = watch("prices");
  const selectedGameId = watch("gameId");

  const convertDollarsToCents = (dollars: string) => {
    const num = parseFloat(dollars);
    return Number.isNaN(num) ? 0 : Math.round(num * 100);
  };

  const convertCentsToDollars = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const onSubmit = async (data: SkuFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = {
        gameId: data.gameId,
        name: data.name,
        description: data.description || undefined,
        prices: {
          usd: data.prices.usd,
        },
        imageUrl: data.imageUrl || undefined,
      };

      let result;
      if (mode === "edit" && initialData?.id) {
        result = await updateSkuAction({
          skuId: initialData.id,
          ...formData,
        });
      } else {
        result = await createSkuAction(formData);
      }

      if (result.serverError) {
        setError(
          typeof result.serverError === "string"
            ? result.serverError
            : t("common.unknownError"),
        );
      } else {
        setSuccess(
          mode === "edit" ? t("merchant.skuUpdated") : t("merchant.skuCreated"),
        );
        onSuccess?.(result.data);

        // Reset form after successful creation
        if (mode === "create") {
          reset();
        }
      }
    } catch (_err) {
      setError(t("admin.errorOccurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <p>{error}</p>
        </Alert>
      )}

      {success && (
        <Alert variant="default">
          <p>{success}</p>
        </Alert>
      )}

      {/* Game Selection (only for create mode) */}
      {mode === "create" && (
        <div className="space-y-2">
          <Label htmlFor="gameId">{t("common.game")} *</Label>
          <select
            id="gameId"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#359EFF] focus:border-transparent"
            {...register("gameId")}
            disabled={isSubmitting}
          >
            <option value="">{t("merchant.selectGameForSku")}</option>
            {availableGames.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name.en} ({game.name.zh})
              </option>
            ))}
          </select>
          {errors.gameId && (
            <p className="text-sm text-red-600">
              {t(errors.gameId.message || "")}
            </p>
          )}
        </div>
      )}

      {/* English Name */}
      <div className="space-y-2">
        <Label htmlFor="name.en">{t("merchant.englishName")} *</Label>
        <Input
          id="name.en"
          placeholder={t("merchant.enterEnglishName")}
          {...register("name.en")}
          disabled={isSubmitting}
        />
        {errors.name?.en && (
          <p className="text-sm text-red-600">
            {t(errors.name.en.message || "")}
          </p>
        )}
      </div>

      {/* Chinese Name */}
      <div className="space-y-2">
        <Label htmlFor="name.zh">{t("merchant.chineseName")} *</Label>
        <Input
          id="name.zh"
          placeholder={t("merchant.enterChineseName")}
          {...register("name.zh")}
          disabled={isSubmitting}
        />
        {errors.name?.zh && (
          <p className="text-sm text-red-600">
            {t(errors.name.zh.message || "")}
          </p>
        )}
      </div>

      {/* English Description */}
      <div className="space-y-2">
        <Label htmlFor="description.en">
          {t("merchant.englishDescription")} *
        </Label>
        <textarea
          id="description.en"
          placeholder={t("merchant.enterEnglishDescription")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#359EFF] focus:border-transparent"
          rows={3}
          {...register("description.en")}
          disabled={isSubmitting}
        />
        {errors.description?.en && (
          <p className="text-sm text-red-600">
            {t(errors.description.en.message || "")}
          </p>
        )}
      </div>

      {/* Chinese Description */}
      <div className="space-y-2">
        <Label htmlFor="description.zh">
          {t("merchant.chineseDescription")} *
        </Label>
        <textarea
          id="description.zh"
          placeholder={t("merchant.enterChineseDescription")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#359EFF] focus:border-transparent"
          rows={3}
          {...register("description.zh")}
          disabled={isSubmitting}
        />
        {errors.description?.zh && (
          <p className="text-sm text-red-600">
            {t(errors.description.zh.message || "")}
          </p>
        )}
      </div>

      {/* Price in USD */}
      <div className="space-y-2">
        <Label htmlFor="priceUsd">{t("merchant.priceInUSD")} *</Label>
        <Input
          id="priceUsd"
          type="number"
          step="0.01"
          min="0.01"
          placeholder={t("merchant.enterPrice")}
          value={convertCentsToDollars(watchedPrices.usd)}
          onChange={(e) => {
            const cents = convertDollarsToCents(e.target.value);
            setValue("prices.usd", cents);
          }}
          disabled={isSubmitting}
        />
        <p className="text-sm text-gray-500">{t("merchant.enterPrice")}</p>
        {errors.prices?.usd && (
          <p className="text-sm text-red-600">
            {t(errors.prices.usd.message || "")}
          </p>
        )}
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl">{t("merchant.imageUrl")}</Label>
        <Input
          id="imageUrl"
          type="url"
          placeholder={t("merchant.enterImageUrl")}
          {...register("imageUrl")}
          disabled={isSubmitting}
        />
        {errors.imageUrl && (
          <p className="text-sm text-red-600">
            {t(errors.imageUrl.message || "")}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || (mode === "create" && !selectedGameId)}
        >
          {isSubmitting
            ? t("common.loading")
            : mode === "edit"
              ? t("common.update")
              : t("common.create")}
        </Button>
      </div>
    </form>
  );
}
