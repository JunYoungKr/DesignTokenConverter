import { NormalizedTokens, GeneratorResult, TypographyToken } from '../types/tokens';

export function generateVanillaExtract(tokens: NormalizedTokens): GeneratorResult[] {
  const results: GeneratorResult[] = [];
  const timestamp = new Date().toISOString();

  // tokens.css.ts
  const tokensContent = `/**
 * 🎨 Vanilla Extract Design Tokens
 * 
 * 자동 생성된 파일입니다. 직접 수정하지 마세요!
 * 생성일: ${timestamp}
 */

import { createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
  color: ${JSON.stringify(flattenColors(tokens.colors), null, 4)},
  
  font: {
    family: ${JSON.stringify(extractFontFamilies(tokens.typography), null, 6)},
  },
  
  fontSize: ${JSON.stringify(extractFontSizes(tokens.typography), null, 4)},
  
  lineHeight: ${JSON.stringify(extractLineHeights(tokens.typography), null, 4)},
  
  fontWeight: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
});
`;

  results.push({
    filename: 'tokens.css.ts',
    language: 'typescript',
    content: tokensContent,
  });

  // typography.css.ts
  const typographyContent = generateTypographyRecipes(tokens.typography, timestamp);

  results.push({
    filename: 'typography.css.ts',
    language: 'typescript',
    content: typographyContent,
  });

  // sprinkles.css.ts (유틸리티)
  const sprinklesContent = `/**
 * 🧂 Vanilla Extract Sprinkles
 * 
 * 자동 생성된 파일입니다. 직접 수정하지 마세요!
 * 생성일: ${timestamp}
 */

import { defineProperties, createSprinkles } from '@vanilla-extract/sprinkles';
import { vars } from './tokens.css';

const responsiveProperties = defineProperties({
  conditions: {
    mobile: {},
    tablet: { '@media': 'screen and (min-width: 768px)' },
    desktop: { '@media': 'screen and (min-width: 1024px)' },
  },
  defaultCondition: 'mobile',
  properties: {
    color: vars.color,
    backgroundColor: vars.color,
    fontSize: vars.fontSize,
    fontFamily: vars.font.family,
    fontWeight: vars.fontWeight,
    lineHeight: vars.lineHeight,
  },
});

export const sprinkles = createSprinkles(responsiveProperties);

export type Sprinkles = Parameters<typeof sprinkles>[0];
`;

  results.push({
    filename: 'sprinkles.css.ts',
    language: 'typescript',
    content: sprinklesContent,
  });

  // 사용 예시
  const exampleContent = `/**
 * Vanilla Extract 사용 예시
 * 
 * 생성일: ${timestamp}
 */

// 1. 기본 스타일 정의 (*.css.ts 파일에서)
import { style } from '@vanilla-extract/css';
import { vars } from './tokens.css';
import { typography } from './typography.css';

export const container = style({
  backgroundColor: vars.color.theme.white,
  padding: '16px',
});

export const title = style([
  typography.mobile.kr.title1700,
  {
    color: vars.color.primary.skyblueBase,
  },
]);

// 2. Sprinkles 사용
import { sprinkles } from './sprinkles.css';

export const box = style([
  sprinkles({
    color: { mobile: 'primary.black', desktop: 'primary.skyblueBase' },
    fontSize: 'lg',
  }),
]);

// 3. 컴포넌트에서 사용
// import { container, title } from './styles.css';
// 
// export function Component() {
//   return (
//     <div className={container}>
//       <h1 className={title}>Hello</h1>
//     </div>
//   );
// }
`;

  results.push({
    filename: 'example.ts',
    language: 'typescript',
    content: exampleContent,
  });

  return results;
}

function flattenColors(colors: unknown, prefix: string = ''): Record<string, string> {
  const result: Record<string, string> = {};

  if (typeof colors !== 'object' || colors === null) return result;

  for (const [key, value] of Object.entries(colors)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      result[newKey] = value;
    } else if (typeof value === 'object') {
      Object.assign(result, flattenColors(value, newKey));
    }
  }

  return result;
}

function extractFontFamilies(typography: Record<string, unknown>): Record<string, string> {
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

  const result: Record<string, string> = {};
  families.forEach(family => {
    const key = family
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    result[key] = `'${family}', sans-serif`;
  });

  return result;
}

function extractFontSizes(typography: Record<string, unknown>): Record<string, string> {
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
  const labels = ['xs', 'sm', 'md', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
  
  const result: Record<string, string> = {};
  sorted.forEach((size, i) => {
    const label = labels[i] || `${size}`;
    result[label] = `${size}px`;
  });

  return result;
}

function extractLineHeights(typography: Record<string, unknown>): Record<string, string> {
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

  const sorted = Array.from(heights).sort((a, b) => a - b);
  const result: Record<string, string> = {};
  
  sorted.forEach((height) => {
    result[`${height}`] = `${height}px`;
  });

  return result;
}

function generateTypographyRecipes(typography: Record<string, unknown>, timestamp: string): string {
  let content = `/**
 * 📝 Typography Recipes for Vanilla Extract
 * 
 * 자동 생성된 파일입니다. 직접 수정하지 마세요!
 * 생성일: ${timestamp}
 */

import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from './tokens.css';

`;

  // 각 타이포그래피 스타일을 개별 style로 생성
  const styles: Record<string, Record<string, Record<string, string>>> = {};

  for (const [device, deviceValue] of Object.entries(typography)) {
    if (typeof deviceValue !== 'object' || deviceValue === null) continue;
    
    styles[device] = {};

    for (const [locale, localeValue] of Object.entries(deviceValue as Record<string, unknown>)) {
      if (typeof localeValue !== 'object' || localeValue === null) continue;

      styles[device][locale] = {};

      for (const [styleName, styleValue] of Object.entries(localeValue as Record<string, TypographyToken>)) {
        if (!isTypographyToken(styleValue)) continue;

        const varName = `${device}${capitalize(locale)}${capitalize(styleName.replace(/-/g, ''))}`;
        
        content += `export const ${varName} = style({
  fontFamily: '${styleValue.fontFamily}, sans-serif',
  fontSize: '${styleValue.fontSize}px',
  fontWeight: ${styleValue.fontWeight},
  lineHeight: '${styleValue.lineHeight}px',${styleValue.letterSpacing ? `\n  letterSpacing: '${styleValue.letterSpacing}px',` : ''}
});

`;
        styles[device][locale][styleName.replace(/-/g, '')] = varName;
      }
    }
  }

  // typography 객체로 묶기
  content += `// Typography object for convenient access\n`;
  content += `export const typography = {\n`;
  
  for (const [device, locales] of Object.entries(styles)) {
    content += `  ${device}: {\n`;
    for (const [locale, styleNames] of Object.entries(locales)) {
      content += `    ${locale}: {\n`;
      for (const [styleName, varName] of Object.entries(styleNames)) {
        content += `      ${styleName}: ${varName},\n`;
      }
      content += `    },\n`;
    }
    content += `  },\n`;
  }
  
  content += `};\n`;

  return content;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function isTypographyToken(value: unknown): value is TypographyToken {
  return (
    typeof value === 'object' &&
    value !== null &&
    'fontFamily' in value &&
    'fontSize' in value
  );
}
