"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  createMerchantAction,
  updateMerchantRoleAction,
} from "@/actions/admin.actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

// Validation schema for creating new merchant
const createMerchantSchema = z.object({
  email: z.string().email("validation.emailInvalid"),
  merchantName: z.string().min(1, "validation.required"),
  password: z.string().min(8, "validation.passwordTooShort"),
  role: z.enum(["USER", "MERCHANT", "ADMIN"]),
});

// Validation schema for updating existing merchant
const updateMerchantSchema = z.object({
  role: z.enum(["USER", "MERCHANT", "ADMIN"]),
  merchantName: z.string().optional(),
});

type CreateMerchantData = z.infer<typeof createMerchantSchema>;
type UpdateMerchantData = z.infer<typeof updateMerchantSchema>;

interface MerchantFormProps {
  initialData?: {
    id?: string;
    email?: string;
    merchant_name?: string | null;
    role?: "USER" | "MERCHANT" | "ADMIN";
  };
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

export function MerchantForm({
  initialData,
  onSuccess,
  onCancel,
  mode = "create",
}: MerchantFormProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateMerchantData | UpdateMerchantData>({
    resolver: zodResolver(
      mode === "create" ? createMerchantSchema : updateMerchantSchema,
    ),
    defaultValues: {
      email: initialData?.email || "",
      merchantName: initialData?.merchant_name || "",
      role: initialData?.role || "MERCHANT",
      password: "",
    },
  });

  const watchedRole = watch("role");

  const onSubmit = async (data: CreateMerchantData | UpdateMerchantData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let result;

      if (mode === "edit" && initialData?.id) {
        const updateData = {
          userId: initialData.id,
          role: data.role as "USER" | "MERCHANT" | "ADMIN",
          merchantName:
            data.role === "MERCHANT"
              ? (data as UpdateMerchantData).merchantName
              : undefined,
        };

        result = await updateMerchantRoleAction(updateData);
      } else {
        const createData = data as CreateMerchantData;
        result = await createMerchantAction({
          email: createData.email,
          merchantName: createData.merchantName,
          password: createData.password,
        });
      }

      if (result.serverError) {
        setError(result.serverError.message);
      } else {
        setSuccess(
          mode === "edit" ? t("admin.updateSuccess") : t("admin.createSuccess"),
        );
        onSuccess?.(result.data);
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

      {/* Email (only for create mode) */}
      {mode === "create" && (
        <div className="space-y-2">
          <Label htmlFor="email">{t("common.email")} *</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("auth.email")}
            {...register("email")}
            disabled={isSubmitting}
          />
          {(errors as any).email?.message && (
            <p className="text-sm text-red-600">
              {t((errors as any).email.message)}
            </p>
          )}
        </div>
      )}

      {/* Password (only for create mode) */}
      {mode === "create" && (
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.password")} *</Label>
          <Input
            id="password"
            type="password"
            placeholder={t("auth.password")}
            {...register("password")}
            disabled={isSubmitting}
          />
          {(errors as any).password?.message && (
            <p className="text-sm text-red-600">
              {t((errors as any).password.message)}
            </p>
          )}
        </div>
      )}

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role">{t("auth.roleLabel")} *</Label>
        <select
          id="role"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#359EFF] focus:border-transparent"
          {...register("role")}
          disabled={isSubmitting}
        >
          <option value="USER">{t("roles.player")}</option>
          <option value="MERCHANT">{t("roles.merchant")}</option>
          <option value="ADMIN">{t("roles.admin")}</option>
        </select>
        {errors.role && (
          <p className="text-sm text-red-600">{t(errors.role.message || "")}</p>
        )}
      </div>

      {/* Merchant Name (conditional - only show when role is MERCHANT or for edit mode with existing merchant) */}
      {(watchedRole === "MERCHANT" ||
        (mode === "edit" && initialData?.merchant_name)) && (
        <div className="space-y-2">
          <Label htmlFor="merchantName">
            {t("auth.merchantNameLabel")} {watchedRole === "MERCHANT" && "*"}
          </Label>
          <Input
            id="merchantName"
            placeholder={t("auth.merchantNamePlaceholder")}
            {...register("merchantName")}
            disabled={isSubmitting}
          />
          {watchedRole === "MERCHANT" && errors.merchantName && (
            <p className="text-sm text-red-600">
              {t(errors.merchantName.message || "validation.required")}
            </p>
          )}
        </div>
      )}

      {/* Info text */}
      {watchedRole === "MERCHANT" && (
        <div className="bg-[#359EFF]/10 border border-[#359EFF]/30 rounded-md p-3">
          <p className="text-sm text-[#359EFF]">
            {t("merchant.createGame")}: {t("merchant.createGame")}
          </p>
        </div>
      )}

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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t("common.loading")
            : mode === "edit"
              ? t("admin.updateRole")
              : t("admin.createMerchant")}
        </Button>
      </div>
    </form>
  );
}
