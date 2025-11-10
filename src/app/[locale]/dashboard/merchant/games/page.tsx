import { format } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { getMerchantGames } from "@/actions/merchant.actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Game {
  id: string;
  name: { en: string; zh: string };
  description?: { en: string; zh: string } | null;
  banner_url?: string | null;
  created_at: string;
  updated_at: string;
  analytics?: {
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    totalSkus: number;
  };
}

export default async function MerchantGamesPage() {
  const t = await getTranslations();
  const locale = await getLocale();

  // 在服务器端获取数据
  const gamesResult = await getMerchantGames();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateLocale = locale === "en" ? enUS : zhCN;
    return format(date, "MMM d, yyyy", { locale: dateLocale });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (!gamesResult.success) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("merchant.games")}
            </h1>
            <p className="text-gray-600">{t("merchant.manageProducts")}</p>
          </div>
          {/* 临时禁用创建游戏按钮 */}
          <Button disabled={true}>
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
            {t("merchant.createNewGame")}
          </Button>
        </div>

        <Alert variant="destructive">
          <p>{gamesResult.message}</p>
        </Alert>
      </div>
    );
  }

  const games = gamesResult.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("merchant.games")}
          </h1>
          <p className="text-gray-600">{t("merchant.manageProducts")}</p>
        </div>
        {/* 临时禁用创建游戏按钮 */}
        <Button disabled={true}>
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
          {t("merchant.createNewGame")}
        </Button>
      </div>

      {/* Games List */}
      {games.length === 0 ? (
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t("merchant.noGamesYet")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t("merchant.noGamesYet")}
          </p>
          <div className="mt-6">
            {/* 临时禁用创建游戏按钮 */}
            <Button disabled={true}>
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
              {t("merchant.createNewGame")}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {games.map((game: Game) => (
            <Card key={game.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {game.name.en}
                    </h3>
                    <span className="text-sm text-gray-500">
                      ({game.name.zh})
                    </span>
                  </div>

                  {game.description && (
                    <p className="text-gray-600 mb-4">{game.description.en}</p>
                  )}

                  {/* Game Banner */}
                  {game.banner_url && (
                    <div className="mb-4">
                      <img
                        src={game.banner_url}
                        alt={game.name.en}
                        className="h-32 w-auto rounded-md object-cover"
                      />
                    </div>
                  )}

                  {/* Analytics */}
                  {game.analytics && (
                    <div className="flex space-x-6 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">
                          {t("merchant.totalOrders")}:{" "}
                        </span>
                        {game.analytics.totalOrders.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">
                          {t("merchant.totalRevenue")}:{" "}
                        </span>
                        {formatCurrency(game.analytics.totalRevenue)}
                      </div>
                      <div>
                        <span className="font-medium">
                          {t("merchant.totalSkus")}:{" "}
                        </span>
                        {game.analytics.totalSkus.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex space-x-6 text-xs text-gray-500">
                    <div>
                      {t("common.createdAt")}: {formatDate(game.created_at)}
                    </div>
                    <div>
                      {t("common.updatedAt")}: {formatDate(game.updated_at)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 ml-4">
                  {/* 临时禁用按钮 */}
                  <Button variant="outline" size="sm" disabled={true}>
                    {t("merchant.skus")}
                  </Button>
                  <Button variant="outline" size="sm" disabled={true}>
                    {t("common.edit")}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
