/**
 * @/components/ui/MyComponent.tsx
 *
 * This is a template for a modern, accessible, and performant React component
 * using Next.js App Router conventions.
 *
 * - Uses 'use client' for interactivity, but can be a Server Component if no hooks/events are needed.
 * - Types props with TypeScript.
 * - Uses Tailwind CSS for styling (assumes Tailwind is set up).
 * - Includes basic accessibility (aria-roles, etc.).
 * - Ready for extension with state management, data fetching, etc.
 */
"use client";

import { useState, useCallback } from "react";

// A utility for conditionally joining class names.
// You can use a library like `clsx` or `tailwind-merge`.
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

interface MyComponentProps {
  /** The main title to display in the component. */
  title: string;
  /** Optional additional CSS classes to apply to the component. */
  className?: string;
  /** A callback function to be invoked when the button is clicked. */
  onAction?: () => void;
}

export function MyComponent({ title, className, onAction }: MyComponentProps) {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount((prev) => prev + 1);
    onAction?.();
  }, [onAction]);

  return (
    <div
      className={cn(
        "p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md",
        className,
      )}
      role="region"
      aria-labelledby="component-title"
    >
      <h2
        id="component-title"
        className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
      >
        {title}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        This is a sample component. The button has been clicked {count} times.
      </p>
      <button
        onClick={handleClick}
        className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        aria-label="Perform an action"
      >
        Click Me
      </button>
    </div>
  );
}
