"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import type { GameWithSkus } from "@/lib/supabase-types";
import { formatPrice } from "@/lib/utils";

interface GameCardProps {
  game: GameWithSkus;
  locale: string;
}

export function GameCard({ game, locale }: GameCardProps) {
  const t = useTranslations("games");

  // Get the localized game name and description
  const gameName = game.name[locale as keyof typeof game.name] || game.name.en;
  const gameDescription = game.description
    ? game.description[locale as keyof typeof game.description] ||
      game.description.en
    : "";

  // Get the minimum price from available SKUs
  const minPrice =
    game.skus.length > 0
      ? Math.min(...game.skus.map((sku) => sku.prices.usd))
      : null;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
      {/* Game Banner */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-700">
        {game.banner_url ? (
          <Image
            src={game.banner_url}
            alt={gameName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-4xl">🎮</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No Image
              </p>
            </div>
          </div>
        )}

        {/* Overlay with quick info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute bottom-4 left-4 right-4">
            <p className="line-clamp-2 text-sm text-white">{gameDescription}</p>
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
            {gameName}
          </h3>
          {game.merchant_name && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              by {game.merchant_name}
            </p>
          )}
        </div>

        {/* Price and SKUs info */}
        <div className="mb-4">
          {game.skus.length > 0 ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {game.skus.length} {game.skus.length === 1 ? "item" : "items"}{" "}
                  available
                </p>
                {minPrice !== null && (
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    From {formatPrice(minPrice, "usd", locale)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No items available
            </p>
          )}
        </div>

        {/* Action Button */}
        <Link href={`/${locale}/games/${game.id}`}>
          <Button className="w-full" disabled={game.skus.length === 0}>
            {game.skus.length > 0 ? t("gameDetails") : t("noGamesFound")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
