export { generateTailwind } from './tailwind';
export { generateCSSVariables } from './css-variables';
export { generateSCSS } from './scss';
export { generateEmotion } from './emotion';
export { generateStyledComponents } from './styled-components';
export { generateVanillaExtract } from './vanilla-extract';
export { generatePandaCSS } from './panda-css';

import { NormalizedTokens, GeneratorResult, OutputFormat } from '../types/tokens';
import { generateTailwind } from './tailwind';
import { generateCSSVariables } from './css-variables';
import { generateSCSS } from './scss';
import { generateEmotion } from './emotion';
import { generateStyledComponents } from './styled-components';
import { generateVanillaExtract } from './vanilla-extract';
import { generatePandaCSS } from './panda-css';

export function generate(tokens: NormalizedTokens, format: OutputFormat): GeneratorResult[] {
  switch (format) {
    case 'tailwind':
      return generateTailwind(tokens);
    case 'css-variables':
      return generateCSSVariables(tokens);
    case 'scss':
      return generateSCSS(tokens);
    case 'emotion':
      return generateEmotion(tokens);
    case 'styled-components':
      return generateStyledComponents(tokens);
    case 'vanilla-extract':
      return generateVanillaExtract(tokens);
    case 'panda-css':
      return generatePandaCSS(tokens);
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

export const formatInfo: Record<OutputFormat, { name: string; description: string; icon: string }> = {
  'tailwind': {
    name: 'Tailwind CSS',
    description: 'Utility-first CSS framework',
    icon: '🌬️',
  },
  'css-variables': {
    name: 'CSS Variables',
    description: 'Native CSS custom properties',
    icon: '🎨',
  },
  'scss': {
    name: 'SCSS',
    description: 'Sass with variables & mixins',
    icon: '💅',
  },
  'emotion': {
    name: 'Emotion',
    description: 'CSS-in-JS library',
    icon: '👩‍🎤',
  },
  'styled-components': {
    name: 'styled-components',
    description: 'CSS-in-JS with tagged templates',
    icon: '💄',
  },
  'vanilla-extract': {
    name: 'Vanilla Extract',
    description: 'Zero-runtime CSS-in-TypeScript',
    icon: '🧁',
  },
  'panda-css': {
    name: 'Panda CSS',
    description: 'Zero-runtime CSS-in-JS',
    icon: '🐼',
  },
};
