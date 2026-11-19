"use client";

import { useEffect } from "react";
import { OverlayScrollbars } from "overlayscrollbars";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const osViewport = OverlayScrollbars(document.body)?.elements().viewport;
    if (osViewport) {
      osViewport.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [pathname]);

  return null;
}
