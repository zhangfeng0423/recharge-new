import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  // 确保 locale 有值，如果没有则使用默认语言
  const safeLocale = locale || "en";

  return {
    locale: safeLocale,
    messages: (await import(`../messages/${safeLocale}.json`)).default,
  };
});
