"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateOrderStatusAction } from "@/actions/admin.actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

// Validation schema
const orderStatusFormSchema = z.object({
  status: z.enum(["pending", "completed", "failed", "refunded"]),
  refundAmount: z.number().int().min(0).optional(),
});

type OrderStatusFormData = z.infer<typeof orderStatusFormSchema>;

interface OrderStatusFormProps {
  initialData?: {
    id: string;
    status: string;
    amount: number;
  };
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export function OrderStatusForm({
  initialData,
  onSuccess,
  onCancel,
}: OrderStatusFormProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<OrderStatusFormData>({
    resolver: zodResolver(orderStatusFormSchema),
    defaultValues: {
      status: (initialData?.status as any) || "pending",
      refundAmount: undefined,
    },
  });

  const watchedStatus = watch("status");

  const convertDollarsToCents = (dollars: string) => {
    const num = parseFloat(dollars);
    return Number.isNaN(num) ? 0 : Math.round(num * 100);
  };

  const convertCentsToDollars = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const onSubmit = async (data: OrderStatusFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData: any = {
        orderId: initialData?.id,
        status: data.status,
      };

      // Only include refund amount if status is refunded and amount is provided
      if (data.status === "refunded" && data.refundAmount !== undefined) {
        formData.refundAmount = data.refundAmount;
      }

      const result = await updateOrderStatusAction(formData);

      if (result.serverError) {
        setError(result.serverError.message);
      } else {
        setSuccess(t("admin.updateSuccess"));
        onSuccess?.(result.data);
      }
    } catch (_err) {
      setError(t("admin.errorOccurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: "pending", label: t("common.pending") },
    { value: "completed", label: t("common.completed") },
    { value: "failed", label: t("common.failed") },
    { value: "refunded", label: t("common.refunded") },
  ];

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

      {/* Current Order Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h3 className="font-medium mb-2">{t("admin.orderInfo")}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">{t("admin.orderAmount")}: </span>$
            {(initialData?.amount || 0) / 100}
          </div>
          <div>
            <span className="font-medium">{t("admin.orderStatus")}: </span>
            <span
              className={`px-2 py-1 rounded text-xs ${
                initialData?.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : initialData?.status === "failed"
                    ? "bg-red-100 text-red-800"
                    : initialData?.status === "refunded"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {t(`common.${initialData?.status}`)}
            </span>
          </div>
        </div>
      </div>

      {/* Status Update */}
      <div className="space-y-2">
        <Label htmlFor="status">{t("admin.updateOrderStatus")} *</Label>
        <select
          id="status"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#359EFF] focus:border-transparent"
          {...register("status")}
          disabled={isSubmitting}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.status && (
          <p className="text-sm text-red-600">
            {t(errors.status.message || "")}
          </p>
        )}
      </div>

      {/* Refund Amount (only show when status is refunded) */}
      {watchedStatus === "refunded" && (
        <div className="space-y-2">
          <Label htmlFor="refundAmount">{t("admin.refundAmount")}</Label>
          <Input
            id="refundAmount"
            type="number"
            step="0.01"
            min="0"
            max={convertCentsToDollars(initialData?.amount || 0)}
            placeholder={convertCentsToDollars(initialData?.amount || 0)}
            {...register("refundAmount", {
              onChange: (e) => {
                const cents = convertDollarsToCents(e.target.value);
                setValue("refundAmount", cents);
              },
            })}
            disabled={isSubmitting}
          />
          <p className="text-sm text-gray-500">
            {t("admin.orderAmount")}: $
            {convertCentsToDollars(initialData?.amount || 0)}
          </p>
          {errors.refundAmount && (
            <p className="text-sm text-red-600">
              {t(errors.refundAmount.message || "")}
            </p>
          )}
        </div>
      )}

      {/* Warning for status changes */}
      {watchedStatus !== initialData?.status && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800">
            {watchedStatus === "refunded"
              ? t("common.refundWarning")
              : watchedStatus === "completed"
                ? t("common.orderStatusChangeWarning")
                : t("common.orderStatusChangeInfo")}
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
        <Button
          type="submit"
          disabled={isSubmitting || watchedStatus === initialData?.status}
        >
          {isSubmitting ? t("common.loading") : t("admin.updateOrderStatus")}
        </Button>
      </div>
    </form>
  );
}
