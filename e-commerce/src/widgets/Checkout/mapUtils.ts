export type YandexPair = [number, number];

type YandexEventLike = {
  get?: (key: string) => unknown;
};

type YandexProjectionLike = {
  fromGlobalPixels?: (pixels: YandexPair, zoom: unknown) => unknown;
};

type YandexMapLike = {
  converter?: {
    pageToGlobal?: (pixels: YandexPair) => unknown;
  };
  getZoom?: () => unknown;
  options?: {
    get?: (key: string) => YandexProjectionLike | undefined;
  };
};

export const normalizeYandexPair = (value: unknown): YandexPair | null => {
  if (!Array.isArray(value) || value.length < 2) return null;

  const first = Number(value[0]);
  const second = Number(value[1]);

  if (!Number.isFinite(first) || !Number.isFinite(second)) return null;

  return [first, second];
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getEventValue = (event: unknown, key: string) => {
  if (!isObject(event)) return undefined;

  const getter = (event as YandexEventLike).get;
  if (typeof getter !== "function") return undefined;

  try {
    return getter.call(event, key);
  } catch {
    return undefined;
  }
};

export const getYandexCoordsFromGlobalPixels = (
  map: YandexMapLike | null | undefined,
  globalPixels: unknown,
): YandexPair | null => {
  const pixels = normalizeYandexPair(globalPixels);
  if (!pixels) return null;

  try {
    const projection = map?.options?.get?.("projection");
    const zoom = map?.getZoom?.();
    const coords = projection?.fromGlobalPixels?.(pixels, zoom);

    return normalizeYandexPair(coords);
  } catch {
    return null;
  }
};

export const getYandexCoordsFromPagePixels = (
  map: YandexMapLike | null | undefined,
  pagePixels: unknown,
): YandexPair | null => {
  const pixels = normalizeYandexPair(pagePixels);
  if (!pixels) return null;

  try {
    const globalPixels = map?.converter?.pageToGlobal?.(pixels);
    return getYandexCoordsFromGlobalPixels(map, globalPixels);
  } catch {
    return null;
  }
};

export const getYandexEventCoords = (
  event: unknown,
  map: YandexMapLike | null | undefined,
): YandexPair | null => {
  const directCoords =
    normalizeYandexPair(getEventValue(event, "coords")) ||
    normalizeYandexPair(getEventValue(event, "coordPosition"));
  if (directCoords) return directCoords;

  const globalCoords = getYandexCoordsFromGlobalPixels(
    map,
    getEventValue(event, "globalPixels"),
  );
  if (globalCoords) return globalCoords;

  const pageCoords = getYandexCoordsFromPagePixels(
    map,
    getEventValue(event, "pagePixels") || getEventValue(event, "position"),
  );
  if (pageCoords) return pageCoords;

  const domEvent = getEventValue(event, "domEvent");
  const domEventObject = isObject(domEvent) ? domEvent : null;
  return getYandexCoordsFromPagePixels(
    map,
    getEventValue(domEvent, "pagePixels") ||
      getEventValue(domEvent, "position") ||
      domEventObject?.pagePixels ||
      domEventObject?.position,
  );
};

export const getYandexPageEventCoords = (
  map: YandexMapLike | null | undefined,
  event: Pick<MouseEvent, "pageX" | "pageY">,
): YandexPair | null =>
  getYandexCoordsFromPagePixels(map, [event.pageX, event.pageY]);

export const shouldIgnoreYandexMapDomClick = (target: EventTarget | null) => {
  if (typeof Element === "undefined" || !(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      [
        "a",
        "button",
        "input",
        "textarea",
        "select",
        '[role="button"]',
        '[class*="balloon"]',
        '[class*="copyright"]',
        '[class*="controls"]',
        '[class*="geolocation"]',
        '[class*="gotoymaps"]',
        '[class*="traffic"]',
        '[class*="zoom"]',
      ].join(","),
    ),
  );
};
