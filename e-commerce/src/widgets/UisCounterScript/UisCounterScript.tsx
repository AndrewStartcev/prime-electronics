"use client";

import { useEffect } from "react";

const UIS_SCRIPT_ID = "uis-counter-script";
const UIS_SRC =
  "https://app.uiscom.ru/static/cs.min.js?k=nxD0gNHd8AoheYvUuSm2YyftFIUZUI9Z";
const UIS_DELAY_MS = 6000;
const USER_EVENTS = ["pointerdown", "keydown", "touchstart"] as const;

export const UisCounterScript = () => {
  useEffect(() => {
    if (document.getElementById(UIS_SCRIPT_ID)) return;

    let loaded = false;
    let timeoutId: number | undefined;

    const loadScript = () => {
      if (loaded || document.getElementById(UIS_SCRIPT_ID)) return;

      loaded = true;

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      const script = document.createElement("script");
      script.id = UIS_SCRIPT_ID;
      script.src = UIS_SRC;
      script.async = true;
      document.head.appendChild(script);
    };

    const scheduleScript = () => {
      if (loaded) return;
      timeoutId = window.setTimeout(loadScript, UIS_DELAY_MS);
    };

    if (document.readyState === "complete") {
      scheduleScript();
    } else {
      window.addEventListener("load", scheduleScript, { once: true });
    }

    USER_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, loadScript, {
        once: true,
        passive: true,
      });
    });

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      window.removeEventListener("load", scheduleScript);
      USER_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, loadScript);
      });
    };
  }, []);

  return null;
};
