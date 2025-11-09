import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // 匹配所有路径名，除了：
  // - 以 `/api`, `/trpc`, `/_next` 或 `/_vercel` 开头的路径
  // - 包含点的路径（例如 `favicon.ico`）
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
