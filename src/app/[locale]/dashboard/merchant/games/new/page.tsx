"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { createGameAction } from "@/actions/merchant.actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function CreateGamePage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const [formData, setFormData] = useState({
    name: { en: "", zh: "" },
    description: { en: "", zh: "" },
    bannerUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.en.trim() || !formData.name.zh.trim()) {
      setError("Game name is required in both English and Chinese");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await createGameAction({
        name: {
          en: formData.name.en.trim(),
          zh: formData.name.zh.trim(),
        },
        description: {
          en: formData.description.en?.trim() || "",
          zh: formData.description.zh?.trim() || "",
        },
        bannerUrl: formData.bannerUrl.trim() || undefined,
      });

      if (result.serverError) {
        setError(
          typeof result.serverError === "string"
            ? result.serverError
            : "Unknown error",
        );
      } else {
        setSuccess("Game created successfully!");
        setTimeout(() => {
          router.push(`/${locale}/dashboard/merchant/games`);
        }, 1500);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, lang: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field as keyof typeof prev] as Record<string, string>),
        [lang]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/${locale}/dashboard/merchant/games`}>
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Game</h1>
          <p className="mt-2 text-gray-600">Add a new game to your portfolio</p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error/Success Messages */}
          {error && <Alert variant="destructive">{error}</Alert>}
          {success && <Alert variant="default">{success}</Alert>}

          {/* Game Names */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Game Name</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                English Name *
              </label>
              <input
                type="text"
                value={formData.name.en}
                onChange={(e) =>
                  handleInputChange("name", "en", e.target.value)
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#359EFF] focus:ring-[#359EFF]"
                placeholder="Enter game name in English"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chinese Name *
              </label>
              <input
                type="text"
                value={formData.name.zh}
                onChange={(e) =>
                  handleInputChange("name", "zh", e.target.value)
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#359EFF] focus:ring-[#359EFF]"
                placeholder="输入游戏中文名称"
                required
              />
            </div>
          </div>

          {/* Game Descriptions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Description (Optional)
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                English Description
              </label>
              <textarea
                value={formData.description.en}
                onChange={(e) =>
                  handleInputChange("description", "en", e.target.value)
                }
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#359EFF] focus:ring-[#359EFF]"
                placeholder="Describe your game in English"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chinese Description
              </label>
              <textarea
                value={formData.description.zh}
                onChange={(e) =>
                  handleInputChange("description", "zh", e.target.value)
                }
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#359EFF] focus:ring-[#359EFF]"
                placeholder="描述您的游戏"
              />
            </div>
          </div>

          {/* Banner URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner URL (Optional)
            </label>
            <input
              type="url"
              value={formData.bannerUrl}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  bannerUrl: e.target.value,
                }))
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#359EFF] focus:ring-[#359EFF]"
              placeholder="https://example.com/banner.jpg"
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter a valid URL for your game banner image
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href={`/${locale}/dashboard/merchant/games`}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? "Creating..." : "Create Game"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
