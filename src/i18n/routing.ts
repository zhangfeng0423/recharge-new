import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // 支持的语言列表
  locales: ["en", "zh"],

  // 默认语言
  defaultLocale: "en",

  // 路径配置：所有URL都包含语言前缀（always 策略）
  localePrefix: "always",
});
