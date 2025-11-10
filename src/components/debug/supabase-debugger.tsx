"use client";

import { useState } from "react";

interface SupabaseDebuggerProps {
  children?: React.ReactNode;
}

export function SupabaseDebugger({ children }: SupabaseDebuggerProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-2 py-1 rounded text-xs z-50"
      >
        Debug
      </button>
      {isVisible && (
        <div className="fixed bottom-12 right-4 bg-white border border-gray-200 rounded p-4 text-xs z-50 max-w-sm">
          <h4 className="font-bold mb-2">Supabase Debug Info</h4>
          <p>Environment: {process.env.NODE_ENV}</p>
          <p>Client: Available</p>
          <p>Auth: Check console for details</p>
        </div>
      )}
    </div>
  );
}