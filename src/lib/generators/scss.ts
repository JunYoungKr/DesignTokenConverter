import { NormalizedTokens, GeneratorResult, TypographyToken } from '../types/tokens';

export function generateSCSS(tokens: NormalizedTokens): GeneratorResult[] {
  const results: GeneratorResult[] = [];
  const timestamp = new Date().toISOString();

  // _colors.scss
  let colorsScss = `// 🎨 Design Token Colors
// 자동 생성된 파일입니다. 직접 수정하지 마세요!
// 생성일: ${timestamp}

`;
  colorsScss += generateColorVariables(tokens.colors, '');
  colorsScss += '\n// Color Map for programmatic access\n';
  colorsScss += generateColorMap(tokens.colors);

  results.push({
    filename: '_colors.scss',
    language: 'scss',
    content: colorsScss,
  });

  // _typography.scss
  let typographyScss = `// 📝 Design Token Typography
// 자동 생성된 파일입니다. 직접 수정하지 마세요!
// 생성일: ${timestamp}

`;
  typographyScss += generateTypographyVariables(tokens.typography);
  typographyScss += '\n// Typography Mixins\n';
  typographyScss += generateTypographyMixins(tokens.typography);

  results.push({
    filename: '_typography.scss',
    language: 'scss',
    content: typographyScss,
  });

  // _index.scss (메인 진입점)
  const indexScss = `// Design Tokens
// 자동 생성된 파일입니다. 직접 수정하지 마세요!
// 생성일: ${timestamp}

@forward 'colors';
@forward 'typography';
`;

  results.push({
    filename: '_index.scss',
    language: 'scss',
    content: indexScss,
  });

  return results;
}

function generateColorVariables(obj: unknown, prefix: string): string {
  let result = '';

  if (typeof obj !== 'object' || obj === null) return result;

  for (const [key, value] of Object.entries(obj)) {
    const varName = prefix ? `${prefix}-${key}` : key;

    if (typeof value === 'string') {
      result += `$color-${toKebabCase(varName)}: ${value};\n`;
    } else if (typeof value === 'object') {
      result += generateColorVariables(value, varName);
    }
  }

  return result;
}

function generateColorMap(colors: unknown, indent: number = 0): string {
  const spaces = '  '.repeat(indent);
  
  if (typeof colors !== 'object' || colors === null) {
    return '';
  }

  let result = indent === 0 ? '$colors: (\n' : '';

  const entries = Object.entries(colors);
  entries.forEach(([key, value], index) => {
    const isLast = index === entries.length - 1;
    const comma = isLast ? '' : ',';

    if (typeof value === 'string') {
      result += `${spaces}  '${key}': ${value}${comma}\n`;
    } else if (typeof value === 'object') {
      result += `${spaces}  '${key}': (\n`;
      result += generateColorMapInner(value, indent + 2);
      result += `${spaces}  )${comma}\n`;
    }
  });

  if (indent === 0) {
    result += ');\n';
  }

  return result;
}

function generateColorMapInner(obj: unknown, indent: number): string {
  const spaces = '  '.repeat(indent);
  let result = '';

  if (typeof obj !== 'object' || obj === null) return result;

  const entries = Object.entries(obj);
  entries.forEach(([key, value], index) => {
    const isLast = index === entries.length - 1;
    const comma = isLast ? '' : ',';

    if (typeof value === 'string') {
      result += `${spaces}'${key}': ${value}${comma}\n`;
    } else if (typeof value === 'object') {
      result += `${spaces}'${key}': (\n`;
      result += generateColorMapInner(value, indent + 1);
      result += `${spaces})${comma}\n`;
    }
  });

  return result;
}

function generateTypographyVariables(typography: Record<string, unknown>): string {
  let result = '// Font Families\n';
  const families = extractUniqueFontFamilies(typography);
  
  families.forEach(family => {
    const varName = toKebabCase(family);
    result += `$font-family-${varName}: '${family}', sans-serif;\n`;
  });

  result += '\n// Font Sizes\n';
  const sizes = extractUniqueFontSizes(typography);
  sizes.forEach(size => {
    result += `$font-size-${size}: ${size}px;\n`;
  });

  result += '\n// Font Weights\n';
  result += '$font-weight-regular: 400;\n';
  result += '$font-weight-medium: 500;\n';
  result += '$font-weight-bold: 700;\n';

  return result;
}

function generateTypographyMixins(typography: Record<string, unknown>): string {
  let result = '';

  for (const [device, deviceValue] of Object.entries(typography)) {
    if (typeof deviceValue !== 'object' || deviceValue === null) continue;

    for (const [locale, localeValue] of Object.entries(deviceValue as Record<string, unknown>)) {
      if (typeof localeValue !== 'object' || localeValue === null) continue;

      for (const [styleName, styleValue] of Object.entries(localeValue as Record<string, TypographyToken>)) {
        if (!isTypographyToken(styleValue)) continue;

        const mixinName = `typo-${device}-${locale}-${styleName}`;
        result += `@mixin ${mixinName} {\n`;
        result += `  font-family: '${styleValue.fontFamily}', sans-serif;\n`;
        result += `  font-size: ${styleValue.fontSize}px;\n`;
        result += `  font-weight: ${styleValue.fontWeight};\n`;
        result += `  line-height: ${styleValue.lineHeight}px;\n`;
        if (styleValue.letterSpacing) {
          result += `  letter-spacing: ${styleValue.letterSpacing}px;\n`;
        }
        result += '}\n\n';
      }
    }
  }

  return result;
}

function extractUniqueFontFamilies(typography: Record<string, unknown>): string[] {
  const families = new Set<string>();
  traverse(typography, families, 'fontFamily');
  return Array.from(families);
}

function extractUniqueFontSizes(typography: Record<string, unknown>): number[] {
  const sizes = new Set<number>();
  
  function findSizes(obj: unknown) {
    if (typeof obj !== 'object' || obj === null) return;
    
    if ('fontSize' in obj && typeof (obj as { fontSize: number }).fontSize === 'number') {
      sizes.add((obj as { fontSize: number }).fontSize);
    }
    
    for (const value of Object.values(obj)) {
      findSizes(value);
    }
  }

  findSizes(typography);
  return Array.from(sizes).sort((a, b) => a - b);
}

function traverse(obj: unknown, set: Set<string>, key: string) {
  if (typeof obj !== 'object' || obj === null) return;

  if (key in obj && typeof (obj as Record<string, string>)[key] === 'string') {
    set.add((obj as Record<string, string>)[key]);
  }

  for (const value of Object.values(obj)) {
    traverse(value, set, key);
  }
}

function isTypographyToken(value: unknown): value is TypographyToken {
  return (
    typeof value === 'object' &&
    value !== null &&
    'fontFamily' in value &&
    'fontSize' in value
  );
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}
