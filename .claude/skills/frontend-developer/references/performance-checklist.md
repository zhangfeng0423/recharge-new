# Next.js Performance Checklist

A checklist of best practices for building high-performance Next.js applications.

## 1. Rendering & Caching
- [ ] **Use Server Components by default.** Only use Client Components (`'use client'`) when interactivity is required.
- [ ] **Fetch data on the server.** Use `async` Server Components to fetch data, which can be streamed to the client.
- [ ] **Leverage Next.js Caching.** Understand and use the Data Cache for fetched data and the Full Route Cache for rendered pages.
- [ ] **Use Static Site Generation (SSG)** for pages that can be pre-rendered at build time (`generateStaticParams`).
- [ ] **Use Incremental Static Regeneration (ISR)** for pages that need to be periodically revalidated (`revalidate` option).
- [ ] **Use Streaming with `Suspense`** to show instant loading states and stream in UI as it's rendered on the server.

## 2. Code & Bundle Size
- [ ] **Analyze your bundle.** Use `@next/bundle-analyzer` to inspect what's contributing to your bundle size.
- [ ] **Use dynamic imports for large components.** Use `next/dynamic` to code-split components that are not needed on the initial page load, especially for client components.
- [ ] **Code-split third-party libraries.** If a large library is only used in one part of your app, consider dynamically importing it.
- [ ] **Minimize client-side JavaScript.** Be mindful of the code you ship in Client Components.

## 3. Media Optimization
- [ ] **Use `next/image` for all images.** It provides automatic optimization, resizing, and serving in modern formats like WebP.
- [ ] **Specify `width` and `height`** for images to prevent layout shift (CLS).
- [ ] **Use the `priority` prop** on the largest image in the initial viewport (LCP element) to preload it.
- [ ] **Lazy load below-the-fold images.** `next/image` does this by default.
- [ ] **Self-host videos and use `next/video`** (experimental) or a video hosting service. Avoid large GIFs; use short videos instead.

## 4. Font Optimization
- [ ] **Use `next/font`** to automatically host and preload your fonts. This eliminates a round-trip to Google Fonts or other services.
- [ ] **Use modern font formats** like WOFF2.
- [ ] **Use variable fonts** to reduce the number of font files needed.

## 5. Third-Party Scripts
- [ ] **Use `next/script`** to manage third-party scripts (e.g., analytics, ads).
- [ ] **Use the `strategy` prop** to control when the script loads (`beforeInteractive`, `afterInteractive`, `lazyOnload`).
- [ ] **Use `worker` strategy** for scripts that can run in a web worker (e.g., Partytown).

## 6. React Best Practices
- [ ] **Use `React.memo`** for expensive Client Components to prevent re-renders.
- [ ] **Use `useMemo` and `useCallback`** to memoize expensive calculations and functions in Client Components.
- [ ] **Avoid large component trees.** Break down large components into smaller, more manageable ones.
- [ ] **Use virtualized lists** for long lists of data (e.g., with `react-window` or `tanstack-virtual`).
