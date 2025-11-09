import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // 支持的语言列表
  locales: ["en", "zh"],

  // 默认语言
  defaultLocale: "en",

  // 路径配置：默认语言不显示前缀（as-needed 策略）
  localePrefix: "as-needed",
});
