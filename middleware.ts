import { routing } from "./src/i18n/routing";
import createIntlMiddleware from "next-intl/middleware";

// Create internationalization middleware
const intlMiddleware = createIntlMiddleware(routing);

export default createIntlMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `api`, `_next/static`, `_next/image`, or `favicon.ico`
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
