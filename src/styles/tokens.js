// Apple / iOS design tokens — used across all components as inline styles.

export const font =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Apple SD Gothic Neo", system-ui, sans-serif';

export const colors = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  separator: 'rgba(60,60,67,0.2)',

  label: '#000000',
  secondary: 'rgba(60,60,67,0.6)',
  tertiary: 'rgba(60,60,67,0.3)',

  blue: '#007AFF', // systemBlue — 강조/인터랙션
  green: '#34C759', // systemGreen — 증가·목표
  red: '#FF3B30', // systemRed — 감소
  orange: '#FF9500', // systemOrange — 경고
};

// 카테고리 색 팔레트 (인덱스 순환)
export const palette = [
  '#007AFF',
  '#5AC8FA',
  '#34C759',
  '#FF9500',
  '#5856D6',
  '#8E8E93',
  '#FF2D55',
  '#AF52DE',
  '#FFCC00',
  '#30B0C7',
];

export const colorAt = (i) => palette[((i % palette.length) + palette.length) % palette.length];

export const radius = {
  card: 18,
  inner: 12,
  pill: 999,
};

// 큰 숫자 공통 스타일
export const bigNumber = {
  fontWeight: 700,
  letterSpacing: '-0.02em',
  fontVariantNumeric: 'tabular-nums',
};

export const tabular = { fontVariantNumeric: 'tabular-nums' };
