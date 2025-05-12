import { createConfig } from '@gluestack-style/react';

export const config = createConfig({
  tokens: {
    colors: {
      primary: '#0967D2',
      secondary: '#47A3F3',
      background: '#FFFFFF',
      foreground: '#000000',
    },
  },
  aliases: {
    bg: 'backgroundColor',
    color: 'color',
  },
}); 