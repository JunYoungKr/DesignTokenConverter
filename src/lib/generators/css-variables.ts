import { NormalizedTokens, GeneratorResult, TypographyToken } from '../types/tokens';

export function generateCSSVariables(tokens: NormalizedTokens): GeneratorResult[] {
  const timestamp = new Date().toISOString();
  
  let css = `/**
 * 🎨 Design Token CSS Variables
 * 
 * 자동 생성된 파일입니다. 직접 수정하지 마세요!
 * 생성일: ${timestamp}
 */

:root {
`;

  // Colors
  css += '  /* ========== COLORS ========== */\n';
  css += generateColorVariables(tokens.colors, '');

  // Typography font families
  css += '\n  /* ========== FONT FAMILIES ========== */\n';
  const fontFamilies = extractUniqueFontFamilies(tokens.typography);
  fontFamilies.forEach(family => {
    const varName = toKebabCase(family);
    css += `  --font-family-${varName}: '${family}', sans-serif;\n`;
  });

  css += '}\n';

  // Typography utility classes
  css += '\n/* ========== TYPOGRAPHY CLASSES ========== */\n';
  css += generateTypographyClasses(tokens.typography);

  return [{
    filename: 'tokens.css',
    language: 'css',
    content: css,
  }];
}

function generateColorVariables(obj: unknown, prefix: string): string {
  let result = '';

  if (typeof obj !== 'object' || obj === null) return result;

  for (const [key, value] of Object.entries(obj)) {
    const varName = prefix ? `${prefix}-${key}` : key;

    if (typeof value === 'string') {
      result += `  --color-${toKebabCase(varName)}: ${value};\n`;
    } else if (typeof value === 'object') {
      result += generateColorVariables(value, varName);
    }
  }

  return result;
}

function generateTypographyClasses(typography: Record<string, unknown>): string {
  let css = '';

  for (const [device, deviceValue] of Object.entries(typography)) {
    if (typeof deviceValue !== 'object' || deviceValue === null) continue;

    css += `\n/* ${device.toUpperCase()} */\n`;

    for (const [locale, localeValue] of Object.entries(deviceValue as Record<string, unknown>)) {
      if (typeof localeValue !== 'object' || localeValue === null) continue;

      for (const [styleName, styleValue] of Object.entries(localeValue as Record<string, TypographyToken>)) {
        if (!isTypographyToken(styleValue)) continue;

        const className = `.typo-${device}-${locale}-${styleName}`;
        css += `${className} {\n`;
        css += `  font-family: '${styleValue.fontFamily}', sans-serif;\n`;
        css += `  font-size: ${styleValue.fontSize}px;\n`;
        css += `  font-weight: ${styleValue.fontWeight};\n`;
        css += `  line-height: ${styleValue.lineHeight}px;\n`;
        if (styleValue.letterSpacing) {
          css += `  letter-spacing: ${styleValue.letterSpacing}px;\n`;
        }
        css += '}\n\n';
      }
    }
  }

  return css;
}

function extractUniqueFontFamilies(typography: Record<string, unknown>): string[] {
  const families = new Set<string>();

  function traverse(obj: unknown) {
    if (typeof obj !== 'object' || obj === null) return;

    if ('fontFamily' in obj && typeof (obj as { fontFamily: string }).fontFamily === 'string') {
      families.add((obj as { fontFamily: string }).fontFamily);
    }

    for (const value of Object.values(obj)) {
      traverse(value);
    }
  }

  traverse(typography);
  return Array.from(families);
}

function isTypographyToken(value: unknown): value is TypographyToken {
  return (
    typeof value === 'object' &&
    value !== null &&
    'fontFamily' in value &&
    'fontSize' in value &&
    'fontWeight' in value &&
    'lineHeight' in value
  );
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}
