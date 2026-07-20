import { colors, radius, font } from '../styles/tokens.js';

// 회색 배경 위 흰 카드 (그림자 없음, 라운드 18).
export default function Card({ children, style, padded = true, ...rest }) {
  return (
    <section
      style={{
        background: colors.card,
        borderRadius: radius.card,
        padding: padded ? 18 : 0,
        fontFamily: font,
        ...style,
      }}
      {...rest}
    >
      {children}
    </section>
  );
}

// 카드 상단 소제목
export function CardTitle({ children, style }) {
  return (
    <h2
      style={{
        margin: '0 0 12px',
        fontSize: 15,
        fontWeight: 600,
        color: colors.secondary,
        letterSpacing: '-0.01em',
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

// iOS 리스트 행: 라벨 좌 / 값 우 + 얇은 구분선
export function Row({ label, value, valueColor, last = false, onClick, leading }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 0',
        borderBottom: last ? 'none' : `0.5px solid ${colors.separator}`,
        cursor: onClick ? 'pointer' : 'default',
        minHeight: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {leading}
        <span style={{ fontSize: 16, color: colors.label, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </div>
      <span
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: valueColor || colors.label,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
    </div>
  );
}
