"use client";

import { format } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/actions/auth.actions";
import { getGameSkus } from "@/actions/merchant.actions";
import { SkusListSkeleton } from "@/components/features/dashboard-skeletons";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

interface Game {
  id: string;
  name: { en: string; zh: string };
  description?: { en: string; zh: string } | null;
  merchant_id: string;
}

interface Sku {
  id: string;
  name: { en: string; zh: string };
  description?: { en: string; zh: string } | null;
  prices: { usd: number };
  image_url?: string | null;
  game_id: string;
  created_at: string;
  updated_at: string;
  analytics?: {
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
  };
}

export default function GameSkusPage() {
  const t = useTranslations();
  const params = useParams();
  const _router = useRouter();
  const locale = useLocale();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<Game | null>(null);
  const [skus, setSkus] = useState<Sku[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const loadCurrentUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      // Error handling without console output
    }
  };

  const loadGameData = async () => {
    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("games")
        .select("id, name, description, merchant_id")
        .eq("id", gameId)
        .single();

      if (error) {
        setError(t("admin.errorOccurred"));
        return;
      }

      if (!data) {
        setError("Game not found");
        return;
      }

      setGame(data as Game);
    } catch (_err) {
      setError(t("admin.errorOccurred"));
    }
  };

  const loadSkusData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getGameSkus(gameId);

      if (result.success) {
        setSkus(result.data || []);
      } else {
        setError(result.message);
      }
    } catch (_err) {
      setError(t("admin.errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGameData();
    loadSkusData();
    loadCurrentUser();
  }, [loadCurrentUser, loadGameData, loadSkusData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = t("common.loading") === "Loading..." ? enUS : zhCN;
    return format(date, "MMM d, yyyy", { locale });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return <SkusListSkeleton />;
  }

  if (error || !game) {
    return (
      <div className="space-y-6">
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
        </div>
        <Card className="p-6">
          <Alert variant="destructive">
            <p>{error || t("admin.errorOccurred")}</p>
          </Alert>
        </Card>
      </div>
    );
  }

  // Check if user has permission to view this game's SKUs
  if (user && game.merchant_id !== user.id && user.role !== "ADMIN") {
    return (
      <div className="space-y-6">
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
        </div>
        <Card className="p-6">
          <Alert variant="destructive">
            <p>{t("admin.validationError")}</p>
          </Alert>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
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
              {game.name.en} - {t("merchant.skus")}
            </h1>
            <p className="text-gray-600">
              {t("merchant.manageProducts")} ({game.name.zh})
            </p>
          </div>
        </div>
        <Link
          href={`/${locale}/dashboard/merchant/games/${gameId}/skus/create`}
        >
          <Button>
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            {t("merchant.createNewSku")}
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <p>{error}</p>
        </Alert>
      )}

      {/* SKUs List */}
      {skus.length === 0 ? (
        <Card className="p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t("merchant.noSkusYet")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t("merchant.noSkusYet")}
          </p>
          <div className="mt-6">
            <Link
              href={`/${locale}/dashboard/merchant/games/${gameId}/skus/create`}
            >
              <Button>
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                {t("merchant.createNewSku")}
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {skus.map((sku) => (
            <Card key={sku.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* SKU Image */}
                  {sku.image_url && (
                    <img
                      src={sku.image_url}
                      alt={sku.name.en}
                      className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {sku.name.en}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({sku.name.zh})
                      </span>
                    </div>

                    {sku.description && (
                      <p className="text-gray-600 mb-2">{sku.description.en}</p>
                    )}

                    {/* Price */}
                    <div className="text-lg font-bold text-green-600 mb-2">
                      {formatCurrency(sku.prices.usd)}
                    </div>

                    {/* Analytics */}
                    {sku.analytics && (
                      <div className="flex space-x-6 text-sm text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">
                            {t("merchant.totalOrders")}:{" "}
                          </span>
                          {sku.analytics.totalOrders.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">
                            {t("merchant.totalRevenue")}:{" "}
                          </span>
                          {formatCurrency(sku.analytics.totalRevenue)}
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="flex space-x-6 text-xs text-gray-500">
                      <div>
                        {t("common.createdAt")}: {formatDate(sku.created_at)}
                      </div>
                      <div>
                        {t("common.updatedAt")}: {formatDate(sku.updated_at)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 ml-4">
                  <Link
                    href={`/${locale}/dashboard/merchant/games/${gameId}/skus/${sku.id}/edit`}
                  >
                    <Button variant="outline" size="sm">
                      {t("common.edit")}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
