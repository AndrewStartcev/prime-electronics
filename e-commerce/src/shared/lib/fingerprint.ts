/**
 * Generate a simple device fingerprint based on browser characteristics
 * This is a lightweight implementation that doesn't require external libraries
 */

interface FingerprintComponents {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  cookieEnabled: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  colorDepth: number;
  hardwareConcurrency: number;
  deviceMemory: number | undefined;
  touchSupport: boolean;
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("Fingerprint", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("Fingerprint", 4, 17);

    return canvas.toDataURL();
  } catch {
    return "";
  }
}

function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "";

    const webgl = gl as WebGLRenderingContext;
    const debugInfo = webgl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "";

    const vendor = webgl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return `${vendor}~${renderer}`;
  } catch {
    return "";
  }
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getComponents(): FingerprintComponents {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookieEnabled: navigator.cookieEnabled,
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    colorDepth: screen.colorDepth,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as Navigator & { deviceMemory?: number })
      .deviceMemory,
    touchSupport: "ontouchstart" in window || navigator.maxTouchPoints > 0,
  };
}

/**
 * Generate a device fingerprint
 * Returns a hash string that should be relatively stable for the same device/browser
 */
export async function generateFingerprint(): Promise<string> {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const components = getComponents();
    const canvas = getCanvasFingerprint();
    const webgl = getWebGLFingerprint();

    const fingerprintData = JSON.stringify({
      ...components,
      canvas,
      webgl,
    });

    const hash = await hashString(fingerprintData);
    return hash;
  } catch (error) {
    console.error("Error generating fingerprint:", error);
    // Fallback to a simple fingerprint
    const fallback = `${navigator.userAgent}-${screen.width}x${
      screen.height
    }-${Date.now()}`;
    return hashString(fallback);
  }
}

/**
 * Get a stored fingerprint or generate a new one
 * Stores the fingerprint in localStorage for consistency
 */
export async function getOrCreateFingerprint(): Promise<string> {
  if (typeof window === "undefined") {
    return "";
  }

  const STORAGE_KEY = "device_fingerprint";

  try {
    // Check if we already have a stored fingerprint
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }

    // Generate new fingerprint
    const fingerprint = await generateFingerprint();

    // Store for future use
    localStorage.setItem(STORAGE_KEY, fingerprint);

    return fingerprint;
  } catch (error) {
    console.error("Error with fingerprint:", error);
    // Generate without storing
    return generateFingerprint();
  }
}
