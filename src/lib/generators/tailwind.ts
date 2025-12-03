import { NormalizedTokens, GeneratorResult, ColorTokens } from '../types/tokens';

export function generateTailwind(tokens: NormalizedTokens): GeneratorResult[] {
  const results: GeneratorResult[] = [];

  // colors.ts 생성
  results.push({
    filename: 'colors.ts',
    language: 'typescript',
    content: generateColorsFile(tokens.colors),
  });

  // typography.ts 생성
  if (Object.keys(tokens.typography).length > 0) {
    results.push({
      filename: 'typography.ts',
      language: 'typescript',
      content: generateTypographyFile(tokens.typography),
    });
  }

  // tailwind.config.ts 생성
  results.push({
    filename: 'tailwind.config.ts',
    language: 'typescript',
    content: generateTailwindConfig(tokens),
  });

  return results;
}

function generateColorsFile(colors: ColorTokens): string {
  const timestamp = new Date().toISOString();
  
  return `/**
 * 🎨 Design Token Colors
 * 
 * 자동 생성된 파일입니다. 직접 수정하지 마세요!
 * 생성일: ${timestamp}
 */

export const colors = ${JSON.stringify(colors, null, 2)} as const;

export type ColorToken = typeof colors;
`;
}

function generateTypographyFile(typography: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();

  return `/**
 * 📝 Design Token Typography
 * 
 * 자동 생성된 파일입니다. 직접 수정하지 마세요!
 * 생성일: ${timestamp}
 */

export const typography = ${JSON.stringify(typography, null, 2)} as const;

export type TypographyToken = typeof typography;

// 타이포그래피 유틸리티 타입
export type DeviceType = keyof typeof typography;
export type LocaleType<D extends DeviceType> = keyof typeof typography[D];
`;
}

function generateTailwindConfig(tokens: NormalizedTokens): string {
  const timestamp = new Date().toISOString();

  // fontFamily 추출
  const fontFamilies = extractFontFamilies(tokens.typography);

  return `/**
 * Tailwind CSS Configuration
 * 
 * 자동 생성된 파일입니다. 직접 수정하지 마세요!
 * 생성일: ${timestamp}
 */

import type { Config } from 'tailwindcss';
import { colors } from './colors';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors,
      fontFamily: ${JSON.stringify(fontFamilies, null, 8).replace(/^/gm, '      ').trim()},
    },
  },
  plugins: [],
};

export default config;
`;
}

function extractFontFamilies(typography: Record<string, unknown>): Record<string, string[]> {
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

  const result: Record<string, string[]> = {};
  families.forEach(family => {
    const key = family
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    result[key] = [family, 'sans-serif'];
  });

  return result;
}
