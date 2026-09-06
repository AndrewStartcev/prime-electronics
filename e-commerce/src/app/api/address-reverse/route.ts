import { NextRequest, NextResponse } from "next/server";

const PHOTON_REVERSE_ENDPOINT = "https://photon.komoot.io/reverse";

type PhotonFeature = {
  properties?: {
    city?: unknown;
    country?: unknown;
    countrycode?: unknown;
    county?: unknown;
    district?: unknown;
    housenumber?: unknown;
    name?: unknown;
    postcode?: unknown;
    state?: unknown;
    street?: unknown;
  };
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

const toText = (value: unknown): string =>
  typeof value === "string"
    ? value
        .replace(/\s+/g, " ")
        .replace(/\s+,/g, ",")
        .replace(/,\s*/g, ", ")
        .trim()
    : "";

const uniqueParts = (items: string[]) => {
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

const buildAddress = (feature: PhotonFeature): string | null => {
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

  return uniqueParts([primary, city, district, county, state, postcode, country])
    .filter(Boolean)
    .join(", ");
};

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lon = Number(request.nextUrl.searchParams.get("lon"));

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return NextResponse.json(
      { address: null, message: "Invalid coordinates" },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    limit: "1",
  });

  try {
    const response = await fetch(
      `${PHOTON_REVERSE_ENDPOINT}?${params.toString()}`,
      {
        headers: {
          "accept-language": "ru-RU,ru;q=0.9",
          "user-agent": "PrimeElectronicsAddressReverse/1.0",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      },
    );

    if (!response.ok) {
      return NextResponse.json({ address: null });
    }

    const payload = (await response.json()) as PhotonResponse;
    const features = Array.isArray(payload.features) ? payload.features : [];

    for (const feature of features) {
      const address = buildAddress(feature);
      if (address) return NextResponse.json({ address });
    }

    return NextResponse.json({ address: null });
  } catch (error) {
    console.error("Ошибка reverse geocoding:", error);
    return NextResponse.json({ address: null });
  }
}
