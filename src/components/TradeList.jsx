import { Trash2, ChevronRight } from 'lucide-react';
import Card, { CardTitle } from './Card.jsx';
import { colors, radius } from '../styles/tokens.js';
import { comma } from '../lib/format.js';
import { sortTradesDesc, tradeAmount } from '../lib/trades.js';

const badge = (side) => ({
  display: 'inline-block',
  fontSize: 11.5,
  fontWeight: 600,
  padding: '2px 7px',
  borderRadius: radius.pill,
  color: '#fff',
  background: side === 'sell' ? colors.orange : colors.blue,
  flexShrink: 0,
});

export default function TradeList({ trades, onEdit, onDelete }) {
  const list = sortTradesDesc(trades);

  return (
    <Card>
      <CardTitle>거래 내역</CardTitle>
      {list.length === 0 ? (
        <div style={{ color: colors.secondary, fontSize: 14, padding: '8px 0' }}>거래 내역이 없습니다.</div>
      ) : (
        <div>
          {list.map((t, idx) => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 0',
                borderBottom: idx === list.length - 1 ? 'none' : `0.5px solid ${colors.separator}`,
              }}
            >
              <button
                onClick={() => onEdit(t.id)}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <span style={badge(t.side)}>{t.side === 'sell' ? '매도' : '매수'}</span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: colors.label, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.ticker}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: colors.secondary, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>
                    {t.date} · {comma(t.qty)}주 × {comma(t.price)}원
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: colors.label, fontVariantNumeric: 'tabular-nums' }}>
                    {comma(tradeAmount(t))}원
                  </div>
                  {t.fee ? (
                    <div style={{ fontSize: 12.5, color: colors.secondary, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                      수수료 {comma(t.fee)}원
                    </div>
                  ) : null}
                </div>
                <ChevronRight size={18} color={colors.tertiary} style={{ flexShrink: 0 }} />
              </button>
              <button
                onClick={() => onDelete(t.id)}
                aria-label={`${t.ticker} ${t.date} 거래 삭제`}
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
          ))}
        </div>
      )}
    </Card>
  );
}
