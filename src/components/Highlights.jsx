import { Trophy, TrendingUp, CalendarCheck } from 'lucide-react';
import { colors, font } from '../styles/tokens.js';
import { signed } from '../lib/format.js';

const toneColor = { green: colors.green, blue: colors.blue, red: colors.red };

function Badge({ icon, text, tone }) {
  const c = toneColor[tone] || colors.blue;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        borderRadius: 999,
        background: c + '1A', // ~10% alpha
        color: c,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: font,
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {text}
    </div>
  );
}

export default function Highlights({ highlights }) {
  if (!highlights || highlights.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {highlights.map((h, i) => {
        if (h.kind === 'record')
          return <Badge key={i} tone="green" icon={<Trophy size={15} />} text={h.text} />;
        if (h.kind === 'ytd')
          return <Badge key={i} tone={h.tone} icon={<TrendingUp size={15} />} text={h.text} />;
        if (h.kind === 'bestMonth')
          return (
            <Badge
              key={i}
              tone="blue"
              icon={<CalendarCheck size={15} />}
              text={`최고 증가월 ${h.month} (${signed(h.delta)})`}
            />
          );
        return null;
      })}
    </div>
  );
}
