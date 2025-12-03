import { NormalizedTokens, GeneratorResult, TypographyToken } from '../types/tokens';

export function generateEmotion(tokens: NormalizedTokens): GeneratorResult[] {
  const results: GeneratorResult[] = [];
  const timestamp = new Date().toISOString();

  // theme.ts
  const themeContent = `/**
 * 🎨 Emotion Theme
 * 
 * 자동 생성된 파일입니다. 직접 수정하지 마세요!
 * 생성일: ${timestamp}
 */

export const theme = {
  colors: ${JSON.stringify(tokens.colors, null, 4)},
  
  typography: ${JSON.stringify(tokens.typography, null, 4)},
  
  fontFamily: ${JSON.stringify(extractFontFamilies(tokens.typography), null, 4)},
} as const;

export type Theme = typeof theme;
`;

  results.push({
    filename: 'theme.ts',
    language: 'typescript',
    content: themeContent,
  });

  // emotion.d.ts (타입 선언)
  const typesContent = `/**
 * Emotion Theme Type Declaration
 * 
 * 자동 생성된 파일입니다. 직접 수정하지 마세요!
 * 생성일: ${timestamp}
 */

import '@emotion/react';
import { theme } from './theme';

type ThemeType = typeof theme;

declare module '@emotion/react' {
  export interface Theme extends ThemeType {}
}
`;

  results.push({
    filename: 'emotion.d.ts',
    language: 'typescript',
    content: typesContent,
  });

  // typography.ts (타이포그래피 스타일 객체)
  const typographyStyles = generateTypographyStyles(tokens.typography);
  const typographyContent = `/**
 * 📝 Typography Styles for Emotion
 * 
 * 자동 생성된 파일입니다. 직접 수정하지 마세요!
 * 생성일: ${timestamp}
 * 
 * 사용법:
 * import { css } from '@emotion/react';
 * import { typography } from './typography';
 * 
 * const Title = styled.h1\`
 *   \${typography.mobile.kr.title1700}
 * \`;
 */

import { css } from '@emotion/react';

${typographyStyles}
`;

  results.push({
    filename: 'typography.ts',
    language: 'typescript',
    content: typographyContent,
  });

  // ThemeProvider 예시
  const providerContent = `/**
 * Theme Provider Example
 * 
 * 자동 생성된 파일입니다.
 * 생성일: ${timestamp}
 */

import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { theme } from './theme';

interface Props {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: Props) {
  return (
    <EmotionThemeProvider theme={theme}>
      {children}
    </EmotionThemeProvider>
  );
}

// 사용 예시:
// 
// // _app.tsx 또는 layout.tsx
// import { ThemeProvider } from './ThemeProvider';
// 
// export default function App({ children }) {
//   return <ThemeProvider>{children}</ThemeProvider>;
// }
//
// // 컴포넌트에서 사용
// import styled from '@emotion/styled';
// 
// const Button = styled.button\`
//   background-color: \${({ theme }) => theme.colors.primary.skyblueBase};
//   color: \${({ theme }) => theme.colors.primary.white};
// \`;
`;

  results.push({
    filename: 'ThemeProvider.tsx',
    language: 'typescript',
    content: providerContent,
  });

  return results;
}

function generateTypographyStyles(typography: Record<string, unknown>): string {
  const styles: Record<string, Record<string, Record<string, string>>> = {};

  for (const [device, deviceValue] of Object.entries(typography)) {
    if (typeof deviceValue !== 'object' || deviceValue === null) continue;

    styles[device] = {};

    for (const [locale, localeValue] of Object.entries(deviceValue as Record<string, unknown>)) {
      if (typeof localeValue !== 'object' || localeValue === null) continue;

      styles[device][locale] = {};

      for (const [styleName, styleValue] of Object.entries(localeValue as Record<string, TypographyToken>)) {
        if (!isTypographyToken(styleValue)) continue;

        const cleanName = styleName.replace(/-/g, '');
        styles[device][locale][cleanName] = `css\`
    font-family: '${styleValue.fontFamily}', sans-serif;
    font-size: ${styleValue.fontSize}px;
    font-weight: ${styleValue.fontWeight};
    line-height: ${styleValue.lineHeight}px;${styleValue.letterSpacing ? `\n    letter-spacing: ${styleValue.letterSpacing}px;` : ''}
  \``;
      }
    }
  }

  let result = 'export const typography = {\n';

  for (const [device, locales] of Object.entries(styles)) {
    result += `  ${device}: {\n`;
    
    for (const [locale, styleNames] of Object.entries(locales)) {
      result += `    ${locale}: {\n`;
      
      for (const [styleName, styleCode] of Object.entries(styleNames)) {
        result += `      ${styleName}: ${styleCode},\n`;
      }
      
      result += '    },\n';
    }
    
    result += '  },\n';
  }

  result += '} as const;\n';
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
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
    result[key] = `'${family}', sans-serif`;
  });

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
