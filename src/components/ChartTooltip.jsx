import { colors, font } from '../styles/tokens.js';
import { eok } from '../lib/format.js';

// 흰 라운드 카드 툴팁 (옅은 블러/그림자).
export default function ChartTooltip({ active, payload, label, valueLabel = '순자산' }) {
  if (!active || !payload || !payload.length) return null;
  const v = payload[0]?.value;
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `0.5px solid ${colors.separator}`,
        borderRadius: 12,
        boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
        padding: '10px 12px',
        fontFamily: font,
      }}
    >
      <div style={{ fontSize: 12, color: colors.secondary, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: colors.label, fontVariantNumeric: 'tabular-nums' }}>
        {valueLabel} {eok(v)}
      </div>
    </div>
  );
}
