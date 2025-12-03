import {
  NormalizedTokens,
  ColorTokens,
  TypographyTokens,
  TypographyToken,
  GradientTokens,
} from "../types/tokens";

/**
 * Figma Design Tokens 플러그인에서 export한 JSON을 파싱
 */
export function parseFigmaTokens(
  json: Record<string, unknown>
): NormalizedTokens {
  const result: NormalizedTokens = {
    colors: {},
    typography: {},
  };

  // Colors 파싱
  if (json.color) {
    result.colors = parseColors(json.color as Record<string, unknown>);
  }

  // Typography 파싱
  if (json.font) {
    result.typography = parseTypography(json.font as Record<string, unknown>);
  }

  // Gradients 파싱
  if (json.gradient) {
    result.gradients = parseGradients(json.gradient as Record<string, unknown>);
  }

  return result;
}

/**
 * 색상 토큰 파싱
 */
function parseColors(
  colorObj: Record<string, unknown>,
  prefix: string = ""
): ColorTokens {
  const result: ColorTokens = {};

  for (const [key, value] of Object.entries(colorObj)) {
    const currentKey = prefix ? `${prefix}-${key}` : key;

    if (isColorValue(value)) {
      // 8자리 hex에서 alpha 제거 (ff로 끝나는 경우)
      const colorValue = (value as { value: string }).value;
      const cleanColor = cleanHexColor(colorValue);

      // 키를 kebab-case로 변환하고 저장
      const normalizedKey = toKebabCase(currentKey);
      setNestedValue(result, normalizedKey.split("-"), cleanColor);
    } else if (typeof value === "object" && value !== null) {
      // 중첩된 객체 재귀 처리
      const nested = parseColors(value as Record<string, unknown>, currentKey);
      mergeDeep(result, nested);
    }
  }

  return result;
}

/**
 * 타이포그래피 토큰 파싱
 */
function parseTypography(fontObj: Record<string, unknown>): TypographyTokens {
  const result: TypographyTokens = {};

  for (const [device, deviceValue] of Object.entries(fontObj)) {
    if (typeof deviceValue !== "object" || deviceValue === null) continue;

    result[device] = {};

    for (const [locale, localeValue] of Object.entries(
      deviceValue as Record<string, unknown>
    )) {
      // display6, display8 같은 특수 케이스 처리
      if (isTypographyValue(localeValue)) {
        if (!result[device]["default"]) {
          result[device]["default"] = {};
        }
        result[device]["default"][locale] = extractTypographyToken(
          localeValue as { value: TypographyValue }
        );
        continue;
      }

      if (typeof localeValue !== "object" || localeValue === null) continue;

      result[device][locale] = {};

      for (const [styleName, styleValue] of Object.entries(
        localeValue as Record<string, unknown>
      )) {
        if (isTypographyValue(styleValue)) {
          result[device][locale][styleName] = extractTypographyToken(
            styleValue as { value: TypographyValue }
          );
        }
      }
    }
  }

  return result;
}

/**
 * 그라디언트 토큰 파싱
 */
function parseGradients(gradientObj: Record<string, unknown>): GradientTokens {
  const result: GradientTokens = {};

  function processGradient(obj: Record<string, unknown>, prefix: string = "") {
    for (const [key, value] of Object.entries(obj)) {
      const currentKey = prefix ? `${prefix}-${key}` : key;

      if (isGradientValue(value)) {
        const gradientValue = (value as { value: GradientValue }).value;
        const normalizedKey = toKebabCase(currentKey);
        const parts = normalizedKey.split("-");
        const category = parts.slice(0, -1).join("-") || "default";
        const name = parts[parts.length - 1];

        if (!result[category]) {
          result[category] = {};
        }

        result[category][name] = {
          type: gradientValue.gradientType,
          rotation: gradientValue.rotation,
          stops: gradientValue.stops.map((stop) => ({
            position: stop.position,
            color: stop.color,
          })),
        };
      } else if (typeof value === "object" && value !== null) {
        processGradient(value as Record<string, unknown>, currentKey);
      }
    }
  }

  processGradient(gradientObj);
  return result;
}

// ============ 유틸리티 함수들 ============

interface TypographyValue {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: number;
}

interface GradientValue {
  gradientType: string;
  rotation: number;
  stops: Array<{ position: number; color: string }>;
}

function isColorValue(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    "type" in value &&
    (value as { type: string }).type === "color"
  );
}

function isTypographyValue(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    "type" in value &&
    (value as { type: string }).type === "custom-fontStyle"
  );
}

function isGradientValue(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    "type" in value &&
    (value as { type: string }).type === "custom-gradient"
  );
}

function extractTypographyToken(obj: {
  value: TypographyValue;
}): TypographyToken {
  const { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } =
    obj.value;
  return {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing: letterSpacing || 0,
  };
}

function cleanHexColor(color: string): string {
  // #rrggbbaa 형식에서 alpha가 ff인 경우 제거
  if (color.length === 9 && color.toLowerCase().endsWith("ff")) {
    return color.slice(0, 7);
  }
  return color;
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .toLowerCase()
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function setNestedValue(
  obj: Record<string, unknown>,
  keys: string[],
  value: string
): void {
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

function mergeDeep(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): void {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) {
        target[key] = {};
      }
      mergeDeep(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      );
    } else {
      target[key] = source[key];
    }
  }
}
