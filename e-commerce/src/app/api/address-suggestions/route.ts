import { NextRequest, NextResponse } from "next/server";

const PHOTON_ENDPOINT = "https://photon.komoot.io/api/";
const MOSCOW_LON = 37.6176;
const MOSCOW_LAT = 55.7558;
const MOSCOW_BBOX = "35.8,55.1,38.5,56.2";
const MAX_SUGGESTIONS = 6;

type PhotonFeature = {
  geometry?: {
    coordinates?: unknown;
  };
  properties?: {
    name?: unknown;
    street?: unknown;
    housenumber?: unknown;
    city?: unknown;
    district?: unknown;
    county?: unknown;
    state?: unknown;
    postcode?: unknown;
    country?: unknown;
    countrycode?: unknown;
  };
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

type AddressSuggestion = {
  value: string;
  title: string;
  subtitle?: string;
  coords?: [number, number];
};

const toText = (value: unknown): string =>
  typeof value === "string"
    ? value
        .replace(/\s+/g, " ")
        .replace(/\s+,/g, ",")
        .replace(/,\s*/g, ", ")
        .trim()
    : "";

const uniqueParts = (items: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  items.forEach((item) => {
    const normalized = item.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return;

    seen.add(normalized);
    result.push(item.trim());
  });

  return result;
};

const buildSuggestion = (feature: PhotonFeature): AddressSuggestion | null => {
  const props = feature.properties || {};

  const countryCode = toText(props.countrycode).toUpperCase();
  const country = toText(props.country);
  if (countryCode && countryCode !== "RU") return null;
  if (!countryCode && country && country !== "Россия") return null;

  const name = toText(props.name);
  const street = toText(props.street);
  const house = toText(props.housenumber);
  const city = toText(props.city);
  const district = toText(props.district);
  const county = toText(props.county);
  const state = toText(props.state);
  const postcode = toText(props.postcode);

  const primary =
    street && house
      ? `${street}, ${house}`
      : street || name || city || district || county || state;
  if (!primary) return null;

  const locality = uniqueParts([city, district, county, state]);
  const titleParts = uniqueParts([primary, ...locality.slice(0, 2), country]);
  const title = titleParts.join(", ");

  const subtitleParts = uniqueParts([postcode, ...locality.slice(2)]);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(", ") : undefined;

  const coordinates = feature.geometry?.coordinates;
  let coords: [number, number] | undefined;
  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    const lon = Number(coordinates[0]);
    const lat = Number(coordinates[1]);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      // Yandex map expects [lat, lon]
      coords = [lat, lon];
    }
  }

  return {
    value: title,
    title,
    subtitle,
    coords,
  };
};

const fetchPhotonSuggestions = async (
  query: string,
): Promise<AddressSuggestion[]> => {
  const params = new URLSearchParams({
    q: query,
    limit: "12",
    lon: MOSCOW_LON.toString(),
    lat: MOSCOW_LAT.toString(),
    bbox: MOSCOW_BBOX,
  });

  const response = await fetch(`${PHOTON_ENDPOINT}?${params.toString()}`, {
    headers: {
      "user-agent": "PrimeElectronicsAddressSuggest/1.0",
      "accept-language": "ru-RU,ru;q=0.9",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) return [];

  const payload = (await response.json()) as PhotonResponse;
  if (!Array.isArray(payload.features)) return [];

  return payload.features
    .map(buildSuggestion)
    .filter(Boolean) as AddressSuggestion[];
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const queryVariants = query.toLowerCase().includes("москв")
    ? [query]
    : [`${query}, Москва`, query];

  const deduped = new Map<string, AddressSuggestion>();

  for (const variant of queryVariants) {
    if (deduped.size >= MAX_SUGGESTIONS) break;

    const suggestions = await fetchPhotonSuggestions(variant).catch(() => []);
    for (const suggestion of suggestions) {
      const key = suggestion.value.trim().toLowerCase();
      if (!key || deduped.has(key)) continue;

      deduped.set(key, suggestion);
      if (deduped.size >= MAX_SUGGESTIONS) break;
    }
  }

  return NextResponse.json({ suggestions: Array.from(deduped.values()) });
}

