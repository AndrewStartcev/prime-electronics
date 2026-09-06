"use client";

import { useState, useEffect } from "react";

export const ScreenSizeIndicator = () => {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const getBreakpoint = () => {
    const width = screenSize.width;
    if (width >= 1920) return "min-[1920px]";
    if (width >= 1680) return "min-[1680px]";
    if (width >= 1440) return "min-[1440px]";
    if (width >= 1280) return "min-[1280px]";
    if (width >= 1024) return "lg";
    if (width >= 768) return "md";
    return "mobile";
  };

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-black/80 text-white px-3 py-2 rounded-lg font-mono text-sm backdrop-blur-sm">
      <div className="flex flex-col gap-1">
        <span className="text-green-400 font-bold">{getBreakpoint()}</span>
        <span>
          {screenSize.width} × {screenSize.height}
        </span>
      </div>
    </div>
  );
};
