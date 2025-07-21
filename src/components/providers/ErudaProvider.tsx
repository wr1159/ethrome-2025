"use client";

import { useEffect } from "react";

export default function ErudaProvider() {
  useEffect(() => {
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
  }, []);

  return null;
}

declare global {
  interface Window {
    eruda?: unknown;
  }
} 