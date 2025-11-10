import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/actions/auth.actions";
import { getGames } from "@/actions/games.actions";
import { GameCard } from "@/components/features/game-card";
import { UserStatus } from "@/components/features/user-status";
import type { GameWithSkus } from "@/lib/supabase-types";

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams?: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  try {
    // Fetch games from database (with fallback to mock data)
    const gamesResult = await getGames();
    const games = (gamesResult.success && gamesResult.data?.games) || [];

    const currentUser = await getCurrentUser();

    // Get all translations for GameCard components
    const t = await getTranslations("games");
    const gameCardTranslations = {
      itemsAvailable: t.raw("itemsAvailable"),
      fromPrice: t.raw("fromPrice"),
      gameDetails: t("gameDetails"),
      noGamesFound: t("noGamesFound"),
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#359EFF] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AP</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  AppPay
                </span>
              </div>

              {/* Right side controls */}
              <div className="flex items-center space-x-6">
                {/* Language Toggle */}
                <div className="flex items-center space-x-2 text-sm">
                  <Link
                    href="/en"
                    className={`px-2 py-1 rounded ${locale === "en" ? "bg-[#359EFF]/20 text-[#359EFF]" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    EN
                  </Link>
                  <span className="text-gray-400">/</span>
                  <Link
                    href="/zh"
                    className={`px-2 py-1 rounded ${locale === "zh" ? "bg-[#359EFF]/20 text-[#359EFF]" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    ZH
                  </Link>
                </div>

                {/* Login/User - Use client component for real-time status */}
                <UserStatus initialUser={currentUser} locale={locale} />
              </div>
            </div>
          </div>
        </header>

        {/* Game List */}
        <main className="container mx-auto px-4 py-8">
          {games.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {gameCardTranslations.noGamesFound}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto">
              {games.map((game: GameWithSkus) => (
                <GameCard
                  key={game.id}
                  game={game}
                  locale={locale}
                  translations={gameCardTranslations}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    );
  } catch (error) {
    console.error("HomePage error:", error);

    // Get error translations
    const tError = await getTranslations("errors");

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {tError("generic.errorOccurred")}
          </h1>
          <p className="text-gray-600 mb-6">{tError("generic.tryAgain")}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-[#359EFF] text-white rounded-lg hover:bg-[#359EFF]/90 transition-colors"
          >
            {tError("generic.tryAgain")}
          </Link>
        </div>
      </div>
    );
  }
}
