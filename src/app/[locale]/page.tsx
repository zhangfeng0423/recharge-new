import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getGames } from "@/actions/games.actions";

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

  // Fetch games from database (with fallback to mock data)
  const gamesResult = await getGames();
  const games = (gamesResult.success && gamesResult.data?.games) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
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
                  className={`px-2 py-1 rounded ${locale === "en" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"}`}
                >
                  EN
                </Link>
                <span className="text-gray-400">/</span>
                <Link
                  href="/zh"
                  className={`px-2 py-1 rounded ${locale === "zh" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"}`}
                >
                  ZH
                </Link>
              </div>

              {/* Login/User */}
              <Link
                href={`/${locale}/auth`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Game List */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6 max-w-4xl mx-auto">
          {games.map((game: any) => {
            // Get localized game name
            const gameName =
              game.name[locale as keyof typeof game.name] || game.name.en;

            return (
              <Link
                key={game.id}
                href={`/${locale}/games/${game.id}`}
                className="block group"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  {/* Game Banner */}
                  <div className="relative aspect-video bg-gray-100">
                    {game.banner_url ? (
                      <Image
                        src={game.banner_url}
                        alt={gameName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">
                          {gameName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Game Title */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      &gt; {gameName}
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
