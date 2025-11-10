export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

/*
Note: The "__ssr__" class hydration warnings in development are a known Next.js issue
when using Tailwind CSS. These warnings don't affect production builds and can be safely ignored.
The warnings occur due to development server optimizations that add temporary class names.
*/
