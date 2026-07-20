import { useEffect, useMemo, useState } from 'react';
import Card, { CardTitle } from './Card.jsx';
import { colors, radius, font } from '../styles/tokens.js';
import { nextMonth, thisMonth } from '../lib/format.js';

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

// entries에서 특정 month 항목 찾기
const findEntry = (entries, month) => entries.find((e) => e.month === month) || null;

export default function EntryForm({ entries, assetCats, debtCats, editMonth, resetKey, onSave, onNew }) {
  const allCats = useMemo(() => [...assetCats, ...debtCats], [assetCats, debtCats]);

  const buildInitial = () => {
    // 수정 모드
    if (editMonth) {
      const e = findEntry(entries, editMonth);
      const values = {};
      allCats.forEach((c) => {
        values[c.key] = e && e[c.key] != null ? String(e[c.key]) : '';
      });
      return { month: editMonth, values };
    }
    // 새 입력: 다음 달 자동 지정 + 지난달 값 프리필
    const last = entries.length ? entries[entries.length - 1] : null;
    const month = last ? nextMonth(last.month) : thisMonth();
    const values = {};
    allCats.forEach((c) => {
      values[c.key] = last && last[c.key] != null ? String(last[c.key]) : '';
    });
    return { month, values };
  };

  const [form, setForm] = useState(buildInitial);

  // editMonth 변경 또는 외부 reset 요청 시 폼 재구성
  useEffect(() => {
    setForm(buildInitial());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMonth, resetKey, entries, allCats.length]);

  const isEditing = !!editMonth;
  const overwrite = !isEditing && !!findEntry(entries, form.month);

  const setVal = (key, v) => setForm((f) => ({ ...f, values: { ...f.values, [key]: v } }));
  const setMonth = (m) => setForm((f) => ({ ...f, month: m }));

  const clearValues = () => {
    const values = {};
    allCats.forEach((c) => (values[c.key] = ''));
    setForm((f) => ({ ...f, values }));
  };

  const submit = () => {
    if (!form.month) return;
    const entry = { month: form.month };
    allCats.forEach((c) => {
      const raw = form.values[c.key];
      entry[c.key] = raw === '' || raw == null ? 0 : Number(raw) || 0;
    });
    onSave(entry);
  };

  const renderGroup = (title, cats) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, color: colors.secondary, margin: '0 0 8px 2px' }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {cats.map((c) => (
          <label key={c.key} style={{ display: 'block' }}>
            <span style={{ display: 'block', fontSize: 12.5, color: colors.secondary, marginBottom: 5 }}>
              {c.label}
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={form.values[c.key] ?? ''}
              placeholder="0"
              onChange={(e) => setVal(c.key, e.target.value)}
              style={field}
            />
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardTitle>{isEditing ? `${editMonth} 수정` : '새 입력'}</CardTitle>

      <div style={{ marginBottom: 16 }}>
        <span style={{ display: 'block', fontSize: 12.5, color: colors.secondary, marginBottom: 5, marginLeft: 2 }}>
          달
        </span>
        <input
          type="month"
          value={form.month}
          disabled={isEditing}
          onChange={(e) => setMonth(e.target.value)}
          style={{ ...field, opacity: isEditing ? 0.6 : 1, maxWidth: 220 }}
        />
        {overwrite && (
          <span style={{ marginLeft: 10, fontSize: 12.5, color: colors.orange }}>
            이미 있는 달 — 저장 시 덮어씁니다
          </span>
        )}
      </div>

      {renderGroup('자산 (만원)', assetCats)}
      {renderGroup('부채 (만원)', debtCats)}

      <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
        <button onClick={submit} style={{ ...btn('primary'), flex: '1 1 140px' }}>
          {isEditing ? '수정 저장' : '저장'}
        </button>
        <button onClick={clearValues} style={btn('secondary')}>
          비우기
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
