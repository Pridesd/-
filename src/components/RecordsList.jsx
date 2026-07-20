import { Trash2, ChevronRight } from 'lucide-react';
import Card, { CardTitle } from './Card.jsx';
import { colors } from '../styles/tokens.js';
import { eok, signed } from '../lib/format.js';

export default function RecordsList({ rows, onEdit, onDelete }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardTitle>기록</CardTitle>
        <div style={{ color: colors.secondary, fontSize: 14, padding: '8px 0' }}>기록이 없습니다.</div>
      </Card>
    );
  }

  // 최신이 위로
  const list = [...rows].reverse();

  return (
    <Card>
      <CardTitle>기록</CardTitle>
      <div>
        {list.map((r, idx) => {
          const up = (r.delta ?? 0) >= 0;
          const deltaColor = r.delta === null ? colors.tertiary : up ? colors.green : colors.red;
          return (
            <div
              key={r.month}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 0',
                borderBottom: idx === list.length - 1 ? 'none' : `0.5px solid ${colors.separator}`,
              }}
            >
              <button
                onClick={() => onEdit(r.month)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                  minWidth: 0,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: colors.label }}>{r.month}</div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: colors.secondary,
                      marginTop: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    자산 {eok(r.totalAssets)} · 부채 {eok(r.totalDebts)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: colors.label, fontVariantNumeric: 'tabular-nums' }}>
                    {eok(r.net)}
                  </div>
                  <div style={{ fontSize: 12.5, color: deltaColor, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                    {r.delta === null ? '—' : `${signed(r.delta)}`}
                  </div>
                </div>
                <ChevronRight size={18} color={colors.tertiary} style={{ flexShrink: 0 }} />
              </button>
              <button
                onClick={() => onDelete(r.month)}
                aria-label={`${r.month} 삭제`}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={17} color={colors.red} />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
