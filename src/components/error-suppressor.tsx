"use client";

import { useEffect } from "react";

export function ErrorSuppressor() {
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (
        e.message.includes(
          'Permission denied to access property "correspondingUseElement"',
        )
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);
  return null;
}
