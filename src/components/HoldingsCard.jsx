import { useMemo } from 'react';
import Card, { CardTitle, Row } from './Card.jsx';
import { colors } from '../styles/tokens.js';
import { comma, signed } from '../lib/format.js';
import { computeHoldings } from '../lib/trades.js';

// 금액(원) 반올림 콤마. avgCost·원가 등 소수 방지.
const won = (n) => comma(Math.round(Number(n) || 0));

const pnlColor = (v) => (v > 0 ? colors.green : v < 0 ? colors.red : colors.secondary);

export default function HoldingsCard({ trades }) {
  const { tickers, totalRealized, totalBuyAmount, totalSellAmount } = useMemo(
    () => computeHoldings(trades),
    [trades],
  );

  if (tickers.length === 0) {
    return (
      <Card>
        <CardTitle>주식 손익</CardTitle>
        <div style={{ color: colors.secondary, fontSize: 14, padding: '8px 0' }}>
          거래 내역이 없습니다. 아래에서 매수·매도를 기록해 보세요.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>주식 손익</CardTitle>

      <Row label="총 실현손익" value={`${signed(Math.round(totalRealized))}원`} valueColor={pnlColor(Math.round(totalRealized))} />
      <Row label="총 매수" value={`${won(totalBuyAmount)}원`} />
      <Row label="총 매도" value={`${won(totalSellAmount)}원`} last />

      <div style={{ marginTop: 14, fontSize: 13, color: colors.secondary, marginBottom: 2 }}>종목별</div>
      <div>
        {tickers.map((t, idx) => {
          const held = t.holdingQty > 0;
          const rp = Math.round(t.realizedPnL); // 미세 부동소수 오차가 색/부호에 새지 않도록 반올림 후 판정
          return (
            <div
              key={t.ticker}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '12px 0',
                borderBottom: idx === tickers.length - 1 ? 'none' : `0.5px solid ${colors.separator}`,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: colors.label, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.ticker}
                </div>
                <div style={{ fontSize: 12.5, color: colors.secondary, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                  {held ? `보유 ${comma(t.holdingQty)}주 · 평단 ${won(t.avgCost)}` : '청산 완료'}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: pnlColor(rp), fontVariantNumeric: 'tabular-nums' }}>
                  {rp === 0 ? '—' : `${signed(rp)}원`}
                </div>
                <div style={{ fontSize: 12.5, color: colors.secondary, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                  {held ? `원가 ${won(t.investedCost)}` : `매도 ${won(t.sellAmount)}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
