// Design System — derived from SAV prototype CSS variables

export const colors = {
  // Backgrounds
  bg: '#080808',
  surface: '#111111',
  surface2: '#181818',
  surface3: '#202020',

  // Borders
  border: '#252525',
  border2: '#333333',

  // Brand
  gold: '#c9a84c',
  gold2: '#e8c97a',
  blue: '#6aa8d4',
  green: '#6db89a',

  // Module accent colors
  listen: '#7ab8e8',
  speak: '#c46a6a',
  review: '#6db89a',
  conversation: '#9b84c4',

  // UI
  ui: '#C4B49A',
  uiHover: '#D4C8B2',
  uiDim: '#8a7d6e',

  // Text
  text: '#e2ddd4',
  muted: '#5a5650',
  muted2: '#3a3633',

  // Semantic
  error: '#c46a6a',
  success: '#6db89a',
  warning: '#c9a84c',
} as const

export const fonts = {
  // Body text
  sans: 'System', // will use platform default; swap to DM Sans via expo-font later
  // Monospace (labels, badges, buttons)
  mono: 'SpaceMono', // Expo blank-typescript includes SpaceMono
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const

export const typography = {
  h1: { fontSize: 24, fontWeight: '600' as const, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '500' as const, letterSpacing: -0.3 },
  h3: { fontSize: 16, fontWeight: '500' as const },
  body: { fontSize: 14, fontWeight: '300' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '300' as const },
  label: { fontSize: 10, fontWeight: '400' as const, letterSpacing: 2, textTransform: 'uppercase' as const },
} as const
