import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // 匹配所有路径除了以下开头的路径：
  // - api (API 路由)
  // - _next/static (静态文件)
  // - _next/image (图片优化)
  // - favicon.ico (favicon)
  // - public (公共静态资源)
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
