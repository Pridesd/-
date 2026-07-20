import { useEffect, useState } from 'react';
import Card, { CardTitle } from './Card.jsx';
import { colors, radius, font } from '../styles/tokens.js';
import { comma, thisDay } from '../lib/format.js';
import { newTradeId } from '../lib/trades.js';

const field = {
  width: '100%',
  boxSizing: 'border-box',
  border: 'none',
  outline: 'none',
  background: colors.bg,
  borderRadius: radius.inner,
  padding: '10px 12px',
  fontSize: 16,
  fontFamily: font,
  color: colors.label,
  fontVariantNumeric: 'tabular-nums',
};

const labelStyle = { display: 'block', fontSize: 12.5, color: colors.secondary, marginBottom: 5, marginLeft: 2 };

function btn(kind) {
  const base = {
    border: 'none',
    borderRadius: radius.inner,
    padding: '12px 16px',
    fontSize: 16,
    fontWeight: 600,
    fontFamily: font,
    cursor: 'pointer',
  };
  if (kind === 'primary') return { ...base, background: colors.blue, color: '#fff' };
  return { ...base, background: colors.bg, color: colors.blue };
}

const findTrade = (trades, id) => trades.find((t) => t.id === id) || null;

const emptyForm = () => ({
  id: null,
  date: thisDay(),
  ticker: '',
  side: 'buy',
  qty: '',
  price: '',
  fee: '',
});

export default function TradeForm({ trades, editId, resetKey, onSave, onNew }) {
  const buildInitial = () => {
    if (editId) {
      const t = findTrade(trades, editId);
      if (t) {
        return {
          id: t.id,
          date: t.date,
          ticker: t.ticker,
          side: t.side === 'sell' ? 'sell' : 'buy',
          qty: t.qty != null ? String(t.qty) : '',
          price: t.price != null ? String(t.price) : '',
          fee: t.fee ? String(t.fee) : '',
        };
      }
    }
    return emptyForm();
  };

  const [form, setForm] = useState(buildInitial);

  useEffect(() => {
    setForm(buildInitial());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, resetKey]);

  const isEditing = !!editId;
  const set = (key, v) => setForm((f) => ({ ...f, [key]: v }));

  const qtyNum = Number(form.qty) || 0;
  const priceNum = Number(form.price) || 0;
  const amount = qtyNum * priceNum;
  const canSave = form.date && form.ticker.trim() && qtyNum > 0 && priceNum > 0;

  const submit = () => {
    if (!canSave) return;
    onSave({
      id: form.id || newTradeId(),
      date: form.date,
      ticker: form.ticker.trim(),
      side: form.side === 'sell' ? 'sell' : 'buy',
      qty: qtyNum,
      price: priceNum,
      fee: Number(form.fee) || 0,
    });
    if (!isEditing) setForm(emptyForm());
  };

  const segBtn = (side, label, activeColor) => {
    const active = form.side === side;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={active}
        onClick={() => set('side', side)}
        style={{
          flex: 1,
          border: 'none',
          borderRadius: radius.inner,
          padding: '10px 12px',
          fontSize: 15,
          fontWeight: 600,
          fontFamily: font,
          cursor: 'pointer',
          background: active ? activeColor : colors.bg,
          color: active ? '#fff' : colors.secondary,
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <Card>
      <CardTitle>{isEditing ? '거래 수정' : '거래 입력'}</CardTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 12 }}>
        <label style={{ display: 'block' }}>
          <span style={labelStyle}>날짜</span>
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} style={field} />
        </label>
        <label style={{ display: 'block' }}>
          <span style={labelStyle}>종목명</span>
          <input
            type="text"
            value={form.ticker}
            placeholder="예: 삼성전자"
            onChange={(e) => set('ticker', e.target.value)}
            style={field}
          />
        </label>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span id="side-label" style={labelStyle}>매매 구분</span>
        <div role="radiogroup" aria-labelledby="side-label" style={{ display: 'flex', gap: 8 }}>
          {segBtn('buy', '매수', colors.blue)}
          {segBtn('sell', '매도', colors.orange)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
        <label style={{ display: 'block' }}>
          <span style={labelStyle}>수량 (주)</span>
          <input
            type="number"
            inputMode="numeric"
            value={form.qty}
            placeholder="0"
            onChange={(e) => set('qty', e.target.value)}
            style={field}
          />
        </label>
        <label style={{ display: 'block' }}>
          <span style={labelStyle}>단가 (원)</span>
          <input
            type="number"
            inputMode="numeric"
            value={form.price}
            placeholder="0"
            onChange={(e) => set('price', e.target.value)}
            style={field}
          />
        </label>
        <label style={{ display: 'block' }}>
          <span style={labelStyle}>수수료 (원)</span>
          <input
            type="number"
            inputMode="numeric"
            value={form.fee}
            placeholder="0"
            onChange={(e) => set('fee', e.target.value)}
            style={field}
          />
        </label>
      </div>

      <div style={{ fontSize: 13.5, color: colors.secondary, marginBottom: 14, marginLeft: 2, fontVariantNumeric: 'tabular-nums' }}>
        체결금액 <span style={{ color: colors.label, fontWeight: 600 }}>{comma(amount)}원</span>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={submit} disabled={!canSave} style={{ ...btn('primary'), flex: '1 1 140px', opacity: canSave ? 1 : 0.4, cursor: canSave ? 'pointer' : 'not-allowed' }}>
          {isEditing ? '수정 저장' : '추가'}
        </button>
        {isEditing && (
          <button onClick={onNew} style={btn('secondary')}>
            새로 입력
          </button>
        )}
      </div>
    </Card>
  );
}
