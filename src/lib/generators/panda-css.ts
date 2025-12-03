import { NormalizedTokens, GeneratorResult, TypographyToken } from '../types/tokens';

export function generatePandaCSS(tokens: NormalizedTokens): GeneratorResult[] {
  const results: GeneratorResult[] = [];
  const timestamp = new Date().toISOString();

  // panda.config.ts
  const configContent = `/**
 * 🐼 Panda CSS Configuration
 * 
 * 자동 생성된 파일입니다. 직접 수정하지 마세요!
 * 생성일: ${timestamp}
 */

import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  // 프로젝트에서 CSS 파일을 사용하는 경로
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  
  // 제외 경로
  exclude: [],
  
  // CSS reset 사용 여부
  preflight: true,
  
  // 테마 설정
  theme: {
    extend: {
      tokens: {
        colors: ${JSON.stringify(convertColorsForPanda(tokens.colors), null, 10)},
        
        fonts: ${JSON.stringify(extractFontsForPanda(tokens.typography), null, 10)},
        
        fontSizes: ${JSON.stringify(extractFontSizesForPanda(tokens.typography), null, 10)},
        
        fontWeights: {
          regular: { value: '400' },
          medium: { value: '500' },
          bold: { value: '700' },
        },
        
        lineHeights: ${JSON.stringify(extractLineHeightsForPanda(tokens.typography), null, 10)},
      },
      
      // 텍스트 스타일 (타이포그래피 프리셋)
      textStyles: ${JSON.stringify(generateTextStyles(tokens.typography), null, 8)},
    },
  },
  
  // 출력 디렉토리
  outdir: 'styled-system',
});
`;

  results.push({
    filename: 'panda.config.ts',
    language: 'typescript',
    content: configContent,
  });

  // 사용 예시
  const exampleContent = `/**
 * 🐼 Panda CSS 사용 예시
 * 
 * 생성일: ${timestamp}
 */

// 1. 먼저 panda codegen을 실행하세요
// npx panda codegen

// 2. 컴포넌트에서 사용
import { css } from '../styled-system/css';
import { container, stack, hstack } from '../styled-system/patterns';

// 기본 스타일
export function Card() {
  return (
    <div
      className={css({
        bg: 'theme.white',
        color: 'primary.skyblueBase',
        p: '4',
        rounded: 'lg',
      })}
    >
      <h2
        className={css({
          textStyle: 'mobile.kr.title1-700',
          mb: '2',
        })}
      >
        제목
      </h2>
      <p
        className={css({
          textStyle: 'mobile.kr.body1-400',
        })}
      >
        내용
      </p>
    </div>
  );
}

// 3. 패턴 사용
export function Layout() {
  return (
    <div className={container({ maxW: '1200px' })}>
      <div className={stack({ gap: '4' })}>
        <div className={hstack({ justify: 'space-between' })}>
          {/* 내용 */}
        </div>
      </div>
    </div>
  );
}

// 4. 조건부 스타일
export function Button({ variant = 'primary' }) {
  return (
    <button
      className={css({
        bg: variant === 'primary' ? 'primary.skyblueBase' : 'gray.1',
        color: variant === 'primary' ? 'primary.white' : 'gray.8',
        px: '4',
        py: '2',
        rounded: 'md',
        _hover: {
          bg: variant === 'primary' ? 'primary.skyblue-dark' : 'gray.2',
        },
      })}
    >
      버튼
    </button>
  );
}
`;

  results.push({
    filename: 'example.tsx',
    language: 'typescript',
    content: exampleContent,
  });

  // postcss.config.js
  const postcssContent = `/**
 * PostCSS Configuration for Panda CSS
 * 
 * 생성일: ${timestamp}
 */

module.exports = {
  plugins: {
    '@pandacss/dev/postcss': {},
  },
};
`;

  results.push({
    filename: 'postcss.config.cjs',
    language: 'javascript',
    content: postcssContent,
  });

  return results;
}

function convertColorsForPanda(colors: unknown, prefix: string = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (typeof colors !== 'object' || colors === null) return result;

  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === 'string') {
      result[key] = { value };
    } else if (typeof value === 'object') {
      result[key] = convertColorsForPanda(value, key);
    }
  }

  return result;
}

function extractFontsForPanda(typography: Record<string, unknown>): Record<string, { value: string }> {
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

  const result: Record<string, { value: string }> = {};
  families.forEach(family => {
    const key = family
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    result[key] = { value: `${family}, sans-serif` };
  });

  return result;
}

function extractFontSizesForPanda(typography: Record<string, unknown>): Record<string, { value: string }> {
  const sizes = new Set<number>();

  function traverse(obj: unknown) {
    if (typeof obj !== 'object' || obj === null) return;

    if ('fontSize' in obj && typeof (obj as { fontSize: number }).fontSize === 'number') {
      sizes.add((obj as { fontSize: number }).fontSize);
    }

    for (const value of Object.values(obj)) {
      traverse(value);
    }
  }

  traverse(typography);

  const sorted = Array.from(sizes).sort((a, b) => a - b);
  const result: Record<string, { value: string }> = {};
  
  sorted.forEach((size) => {
    result[`${size}`] = { value: `${size}px` };
  });

  return result;
}

function extractLineHeightsForPanda(typography: Record<string, unknown>): Record<string, { value: string }> {
  const heights = new Set<number>();

  function traverse(obj: unknown) {
    if (typeof obj !== 'object' || obj === null) return;

    if ('lineHeight' in obj && typeof (obj as { lineHeight: number }).lineHeight === 'number') {
      heights.add((obj as { lineHeight: number }).lineHeight);
    }

    for (const value of Object.values(obj)) {
      traverse(value);
    }
  }

  traverse(typography);

  const result: Record<string, { value: string }> = {};
  heights.forEach((height) => {
    result[`${height}`] = { value: `${height}px` };
  });

  return result;
}

function generateTextStyles(typography: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [device, deviceValue] of Object.entries(typography)) {
    if (typeof deviceValue !== 'object' || deviceValue === null) continue;

    result[device] = {};

    for (const [locale, localeValue] of Object.entries(deviceValue as Record<string, unknown>)) {
      if (typeof localeValue !== 'object' || localeValue === null) continue;

      (result[device] as Record<string, unknown>)[locale] = {};

      for (const [styleName, styleValue] of Object.entries(localeValue as Record<string, TypographyToken>)) {
        if (!isTypographyToken(styleValue)) continue;

        ((result[device] as Record<string, unknown>)[locale] as Record<string, unknown>)[styleName] = {
          value: {
            fontFamily: `${styleValue.fontFamily}, sans-serif`,
            fontSize: `${styleValue.fontSize}px`,
            fontWeight: styleValue.fontWeight,
            lineHeight: `${styleValue.lineHeight}px`,
            ...(styleValue.letterSpacing ? { letterSpacing: `${styleValue.letterSpacing}px` } : {}),
          },
        };
      }
    }
  }

  return result;
}

function isTypographyToken(value: unknown): value is TypographyToken {
  return (
    typeof value === 'object' &&
    value !== null &&
    'fontFamily' in value &&
    'fontSize' in value
  );
}
