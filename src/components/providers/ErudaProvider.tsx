"use client";

import { useEffect } from "react";

export default function ErudaProvider() {
  useEffect(() => {
    // Only load Eruda in development mode or when ?eruda=true is in the URL
    if (
      process.env.NODE_ENV === "development" ||
      /eruda=true/.test(window.location.href) ||
      localStorage.getItem("active-eruda") === "true"
    ) {
      import("eruda").then((eruda) => {
        if (!window.eruda) {
          window.eruda = eruda.default;
          const erudaInstance = eruda.default as {
            init: (config?: { defaults?: { displaySize?: number; transparency?: number } }) => void;
          };
          erudaInstance.init({
            defaults: {
              displaySize: 40,
              transparency: 0.9,
            },
          });
          console.log("Eruda initialized for debugging");
        }
      });
    }
  }, []);

  return null;
}

// Add type declaration for window.eruda
declare global {
  interface Window {
    eruda?: unknown;
  }
} 