"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/actions/auth.actions";
import { GameForm } from "@/components/features/game-form";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

interface Game {
  id: string;
  name: { en: string; zh: string };
  description?: { en: string; zh: string } | null;
  banner_url?: string | null;
  merchant_id: string;
  created_at: string;
  updated_at: string;
}

export default function EditGamePage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<Game | null>(null);
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
      setLoading(true);
      setError(null);

      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("games")
        .select("*")
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGameData();
    loadCurrentUser();
  }, [loadCurrentUser, loadGameData]);

  const handleSuccess = (_data: any) => {
    // Redirect to the games list after successful update
    router.push(`/${locale}/dashboard/merchant/games`);
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="animate-pulse">
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </Card>
      </div>
    );
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

  // Check if user has permission to edit this game
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
            {t("merchant.editGame")}
          </h1>
          <p className="text-gray-600">
            {t("merchant.editGame")}: {game.name.en}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <GameForm
          initialData={{
            id: game.id,
            name: game.name,
            description: game.description,
            banner_url: game.banner_url,
          }}
          mode="edit"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Card>
    </div>
  );
}
