import { NormalizedTokens, GeneratorResult, TypographyToken } from '../types/tokens';

export function generateStyledComponents(tokens: NormalizedTokens): GeneratorResult[] {
  const results: GeneratorResult[] = [];
  const timestamp = new Date().toISOString();

  // theme.ts
  const themeContent = `/**
 * 🎨 Styled-Components Theme
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

// 색상 접근 헬퍼
export const getColor = (path: string) => {
  const keys = path.split('.');
  let result: unknown = theme.colors;
  
  for (const key of keys) {
    if (typeof result === 'object' && result !== null && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  return result as string | undefined;
};
`;

  results.push({
    filename: 'theme.ts',
    language: 'typescript',
    content: themeContent,
  });

  // styled.d.ts (타입 선언)
  const typesContent = `/**
 * Styled-Components Theme Type Declaration
 * 
 * 자동 생성된 파일입니다. 직접 수정하지 마세요!
 * 생성일: ${timestamp}
 */

import 'styled-components';
import { theme } from './theme';

type ThemeType = typeof theme;

declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType {}
}
`;

  results.push({
    filename: 'styled.d.ts',
    language: 'typescript',
    content: typesContent,
  });

  // mixins.ts (타이포그래피 믹스인)
  const mixinsContent = generateMixins(tokens.typography, timestamp);

  results.push({
    filename: 'mixins.ts',
    language: 'typescript',
    content: mixinsContent,
  });

  // GlobalStyle.tsx
  const globalStyleContent = `/**
 * Global Styles
 * 
 * 자동 생성된 파일입니다.
 * 생성일: ${timestamp}
 */

import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle\`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: \${({ theme }) => theme.fontFamily.samsungone || 'sans-serif'};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
\`;
`;

  results.push({
    filename: 'GlobalStyle.tsx',
    language: 'typescript',
    content: globalStyleContent,
  });

  // ThemeProvider 예시
  const providerContent = `/**
 * Theme Provider Example
 * 
 * 자동 생성된 파일입니다.
 * 생성일: ${timestamp}
 */

import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme } from './theme';
import { GlobalStyle } from './GlobalStyle';

interface Props {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: Props) {
  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </StyledThemeProvider>
  );
}

// 사용 예시:
// 
// // _app.tsx
// import { ThemeProvider } from './ThemeProvider';
// 
// export default function App({ Component, pageProps }) {
//   return (
//     <ThemeProvider>
//       <Component {...pageProps} />
//     </ThemeProvider>
//   );
// }
//
// // 컴포넌트에서 사용
// import styled from 'styled-components';
// import { typoMoKrTitle1700 } from './mixins';
// 
// const Title = styled.h1\`
//   \${typoMoKrTitle1700}
//   color: \${({ theme }) => theme.colors.primary.skyblueBase};
// \`;
`;

  results.push({
    filename: 'ThemeProvider.tsx',
    language: 'typescript',
    content: providerContent,
  });

  return results;
}

function generateMixins(typography: Record<string, unknown>, timestamp: string): string {
  let content = `/**
 * 📝 Typography Mixins for Styled-Components
 * 
 * 자동 생성된 파일입니다. 직접 수정하지 마세요!
 * 생성일: ${timestamp}
 * 
 * 사용법:
 * import styled from 'styled-components';
 * import { typoMoKrTitle1700 } from './mixins';
 * 
 * const Title = styled.h1\`
 *   \${typoMoKrTitle1700}
 * \`;
 */

import { css } from 'styled-components';

`;

  for (const [device, deviceValue] of Object.entries(typography)) {
    if (typeof deviceValue !== 'object' || deviceValue === null) continue;

    for (const [locale, localeValue] of Object.entries(deviceValue as Record<string, unknown>)) {
      if (typeof localeValue !== 'object' || localeValue === null) continue;

      for (const [styleName, styleValue] of Object.entries(localeValue as Record<string, TypographyToken>)) {
        if (!isTypographyToken(styleValue)) continue;

        const funcName = toCamelCase(`typo-${device}-${locale}-${styleName}`);
        
        content += `export const ${funcName} = css\`
  font-family: '${styleValue.fontFamily}', sans-serif;
  font-size: ${styleValue.fontSize}px;
  font-weight: ${styleValue.fontWeight};
  line-height: ${styleValue.lineHeight}px;${styleValue.letterSpacing ? `\n  letter-spacing: ${styleValue.letterSpacing}px;` : ''}
\`;

`;
      }
    }
  }

  return content;
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

function toCamelCase(str: string): string {
  return str
    .replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, char => char.toLowerCase());
}

function isTypographyToken(value: unknown): value is TypographyToken {
  return (
    typeof value === 'object' &&
    value !== null &&
    'fontFamily' in value &&
    'fontSize' in value
  );
}
