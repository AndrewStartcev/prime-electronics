export type ProductAttributeLike = {
  name: string;
  value: string;
};

const POSITIVE_VALUES = new Set(["+", "1", "true", "yes", "да", "есть"]);

export const normalizeSimEsimText = (value: string) =>
  value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();

export const isEsimText = (value: string) => {
  const text = normalizeSimEsimText(value);

  return (
    text.includes("esim") ||
    text.includes("e-sim") ||
    text.includes("e sim") ||
    text.includes("eсим") ||
    text.includes("еsim") ||
    text.includes("е-sim") ||
    text.includes("е sim") ||
    text.includes("есим")
  );
};

export const isSimText = (value: string) => {
  const text = normalizeSimEsimText(value);
  const withoutEsim = text.replace(/e[\s-]*sim|е[\s-]*sim|eсим|есим/g, " ");

  return /\bsim\b/.test(withoutEsim) || withoutEsim.includes("сим");
};

export const isSimAttribute = (attr: ProductAttributeLike) =>
  isSimText(`${attr.name} ${attr.value}`) ||
  isEsimText(`${attr.name} ${attr.value}`);

const isPositiveValue = (value: string) =>
  POSITIVE_VALUES.has(normalizeSimEsimText(value));

const unique = (values: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const key = normalizeSimEsimText(value);
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(value.trim());
  });

  return result;
};

const getAttributeDisplayValue = (attr: ProductAttributeLike) => {
  const name = attr.name.trim();
  const value = attr.value.trim();
  if (!value) return "";

  const nameHasSim = isSimText(name);
  const nameHasEsim = isEsimText(name);
  const valueHasSim = isSimText(value);
  const valueHasEsim = isEsimText(value);

  if (valueHasSim || valueHasEsim) return value;
  if (nameHasSim && nameHasEsim) return "SIM + eSIM";
  if (nameHasEsim && isPositiveValue(value)) return "eSIM";
  if (nameHasSim && /^\d+$/.test(value)) return `${value} SIM`;
  if (nameHasSim && isPositiveValue(value)) return "SIM";

  return value;
};

export function getSimEsimDisplay({
  attributes,
  title,
}: {
  attributes?: ProductAttributeLike[];
  title?: string;
}) {
  const attributeValues = unique(
    (attributes || [])
      .filter(isSimAttribute)
      .map(getAttributeDisplayValue)
      .filter(Boolean),
  );

  const combinedAttribute = attributeValues.find(
    (value) => isSimText(value) && isEsimText(value),
  );

  if (combinedAttribute) return combinedAttribute;
  if (attributeValues.length > 0) return attributeValues.join(" + ");

  const titleHasSim = title ? isSimText(title) : false;
  const titleHasEsim = title ? isEsimText(title) : false;

  if (titleHasSim && titleHasEsim) return "SIM + eSIM";
  if (titleHasEsim) return "eSIM";
  if (titleHasSim) return "SIM";

  return null;
}
