import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export default function TestPage() {
  const t = useTranslations("common"); // Specify common namespace

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          {t("testPageTitle")}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          {t("testPageDescription")}
        </p>
        <div className="space-y-4">
          <Link href="/">
            <Button size="lg">
              {t("back")} {t("toHome")}{" "}
              {/* Assuming 'toHome' is a new key or part of 'back' */}
            </Button>
          </Link>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("testPageWorkingMessage")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
