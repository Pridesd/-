import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card, { CardTitle } from './Card.jsx';
import { colors, colorAt, font } from '../styles/tokens.js';
import { eok } from '../lib/format.js';

export default function CompositionCard({ row, assetCats }) {
  const data = useMemo(() => {
    if (!row) return [];
    return assetCats
      .map((c, i) => ({
        key: c.key,
        name: c.label,
        value: Number(row.entry?.[c.key]) || 0,
        color: colorAt(i),
      }))
      .filter((d) => d.value > 0);
  }, [row, assetCats]);

  const total = data.reduce((a, b) => a + b.value, 0);

  if (!row || total === 0) {
    return (
      <Card>
        <CardTitle>자산 구성</CardTitle>
        <div style={{ color: colors.secondary, fontSize: 14, padding: '8px 0' }}>
          표시할 자산이 없습니다.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>자산 구성 · {row.month}</CardTitle>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 150, height: 150, flexShrink: 0, margin: '0 auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={44}
                outerRadius={70}
                paddingAngle={1.5}
                stroke="none"
              >
                {data.map((d) => (
                  <Cell key={d.key} fill={d.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTip total={total} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0, flex: 1, minWidth: 180 }}>
          {data.map((d) => (
            <li
              key={d.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '6px 0',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 15, color: colors.label, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.name}
                </span>
              </span>
              <span style={{ fontSize: 14, color: colors.secondary, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                {((d.value / total) * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function PieTip({ active, payload, total }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  const pct = total > 0 ? ((p.value / total) * 100).toFixed(1) : '0';
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `0.5px solid ${colors.separator}`,
        borderRadius: 12,
        boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
        padding: '8px 12px',
        fontFamily: font,
      }}
    >
      <div style={{ fontSize: 12, color: colors.secondary }}>{p.name}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: colors.label, fontVariantNumeric: 'tabular-nums' }}>
        {eok(p.value)}만원 · {pct}%
      </div>
    </div>
  );
}
