// 정규화된 토큰 구조
export interface NormalizedTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing?: Record<string, string>;
  borderRadius?: Record<string, string>;
  shadows?: Record<string, string>;
  gradients?: GradientTokens;
}

export interface ColorTokens {
  [category: string]: {
    [name: string]: string;
  } | string;
}

export interface TypographyToken {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: number;
}

export interface TypographyTokens {
  [device: string]: {
    [locale: string]: {
      [name: string]: TypographyToken;
    };
  };
}

export interface GradientStop {
  position: number;
  color: string;
}

export interface GradientToken {
  type: string;
  rotation: number;
  stops: GradientStop[];
}

export interface GradientTokens {
  [category: string]: {
    [name: string]: GradientToken;
  };
}

// 출력 형식 타입
export type OutputFormat = 
  | 'tailwind' 
  | 'css-variables' 
  | 'scss' 
  | 'emotion' 
  | 'styled-components'
  | 'vanilla-extract'
  | 'panda-css';

export interface GeneratorResult {
  filename: string;
  content: string;
  language: string;
}
