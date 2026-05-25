"use client";

import { useEffect } from "react";

export function ScrollToBottom() {
  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, []);

  return null;
}
