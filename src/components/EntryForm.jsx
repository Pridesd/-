import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Card, { CardTitle } from './Card.jsx';
import { colors, radius, font } from '../styles/tokens.js';
import { today, comma } from '../lib/format.js';
import { newGroupKey, newItemKey } from '../data/categories.js';
import useIsNarrow from '../lib/useIsNarrow.js';

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

const iconBtn = {
  background: 'none',
  border: 'none',
  padding: 6,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
};

const addBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: 'none',
  border: 'none',
  padding: '4px 2px',
  cursor: 'pointer',
  color: colors.blue,
  fontSize: 15,
  fontWeight: 600,
  fontFamily: font,
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

const findEntry = (entries, date) => entries.find((e) => e.date === date) || null;

// 모든 그룹의 항목 key를 평평하게 펼친다.
const flattenItems = (groups) =>
  (groups || []).flatMap((g) => (g.items || []).map((it) => it.key));

// 입력/편집 대상 3분면. 수입은 흐름이라 순자산엔 합산되지 않지만 기록·표시는 한다.
const SIDES = [
  { key: 'assets', title: '자산 (원)' },
  { key: 'debts', title: '부채 (원)' },
  { key: 'income', title: '수입 (원)' },
];

export default function EntryForm({ entries, cats, editDate, resetKey, onSave, onNew, onCatsChange }) {
  const isNarrow = useIsNarrow();

  const assetKeys = useMemo(() => flattenItems(cats.assets), [cats.assets]);
  const debtKeys = useMemo(() => flattenItems(cats.debts), [cats.debts]);
  const incomeKeys = useMemo(() => flattenItems(cats.income), [cats.income]);
  const allItemKeys = useMemo(
    () => [...assetKeys, ...debtKeys, ...incomeKeys],
    [assetKeys, debtKeys, incomeKeys],
  );
  const keySignature = allItemKeys.join(',');

  const isEditing = !!editDate;

  const buildInitial = () => {
    // 신규: 직전 기록의 잔액을 이월. 편집: 해당 기록을 로드.
    const source = isEditing
      ? findEntry(entries, editDate)
      : entries.length
        ? entries[entries.length - 1]
        : null;

    const date = editDate || today();

    const values = {};
    // 잔액(자산/부채)은 직전 값을 이월한다.
    [...assetKeys, ...debtKeys].forEach((k) => {
      values[k] = source && source[k] != null ? String(source[k]) : '';
    });
    // 수입은 흐름 → 신규 입력 시 빈칸, 편집 시에만 해당 기록 값 로드.
    incomeKeys.forEach((k) => {
      values[k] = isEditing && source && source[k] != null ? String(source[k]) : '';
    });
    return { date, values };
  };

  const [form, setForm] = useState(buildInitial);
  const [editingCats, setEditingCats] = useState(false);

  // 대상 기록/리셋/entries 변화 → 소스에서 다시 로드
  useEffect(() => {
    setForm(buildInitial());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDate, resetKey, entries]);

  // 카테고리 변화 → 입력값 보존하며 key 목록만 재조정 (추가된 항목은 빈칸)
  useEffect(() => {
    setForm((f) => {
      const values = {};
      allItemKeys.forEach((k) => {
        values[k] = f.values[k] ?? '';
      });
      return { ...f, values };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keySignature]);

  const overwrite = !isEditing && !!findEntry(entries, form.date);

  const setVal = (key, v) => setForm((f) => ({ ...f, values: { ...f.values, [key]: v } }));
  const setDate = (d) => setForm((f) => ({ ...f, date: d }));

  const clearValues = () => {
    const values = {};
    allItemKeys.forEach((k) => (values[k] = ''));
    setForm((f) => ({ ...f, values }));
  };

  const submit = () => {
    if (!form.date) return;
    const entry = { date: form.date };
    allItemKeys.forEach((k) => {
      const raw = form.values[k];
      entry[k] = raw === '' || raw == null ? 0 : Number(raw) || 0;
    });
    onSave(entry);
  };

  // --- 인라인 카테고리 편집 ---------------------------------------------
  const mutateSide = (side, fn) => onCatsChange({ ...cats, [side]: fn(cats[side] || []) });

  const renameGroup = (side, gkey, label) =>
    mutateSide(side, (list) => list.map((g) => (g.key === gkey ? { ...g, label } : g)));

  const deleteGroup = (side, gkey) => {
    const g = (cats[side] || []).find((x) => x.key === gkey);
    if (
      !window.confirm(
        `"${g?.label}" 그룹을 삭제할까요?\n(소속 항목도 함께 사라집니다. 과거 기록의 값은 남지만 합계에서 제외됩니다)`,
      )
    )
      return;
    mutateSide(side, (list) => list.filter((x) => x.key !== gkey));
  };

  const addGroup = (side) => {
    const label = side === 'assets' ? '새 자산 그룹' : side === 'debts' ? '새 부채 그룹' : '새 수입 그룹';
    mutateSide(side, (list) => [...list, { key: newGroupKey(), label, items: [] }]);
  };

  const renameItem = (side, gkey, ikey, label) =>
    mutateSide(side, (list) =>
      list.map((g) =>
        g.key === gkey
          ? { ...g, items: g.items.map((it) => (it.key === ikey ? { ...it, label } : it)) }
          : g,
      ),
    );

  const deleteItem = (side, gkey, ikey) => {
    const g = (cats[side] || []).find((x) => x.key === gkey);
    const it = g?.items.find((x) => x.key === ikey);
    if (
      !window.confirm(
        `"${it?.label}" 항목을 삭제할까요?\n(과거 기록의 값은 남지만 합계에서 제외됩니다)`,
      )
    )
      return;
    mutateSide(side, (list) =>
      list.map((x) => (x.key === gkey ? { ...x, items: x.items.filter((i) => i.key !== ikey) } : x)),
    );
  };

  const addItem = (side, gkey) =>
    mutateSide(side, (list) =>
      list.map((g) => (g.key === gkey ? { ...g, items: [...g.items, { key: newItemKey(), label: '새 항목' }] } : g)),
    );

  // --- 렌더 ---------------------------------------------------------------
  const groupSubtotal = (group) =>
    (group.items || []).reduce((acc, it) => acc + (Number(form.values[it.key]) || 0), 0);

  const groupBox = { background: colors.bg, borderRadius: radius.inner, padding: 12, marginBottom: 10 };

  // 값 입력 그룹
  const renderValueGroup = (group) => (
    <div key={group.key} style={groupBox}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: (group.items || []).length ? 10 : 0,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: colors.label }}>{group.label}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: colors.secondary, fontVariantNumeric: 'tabular-nums' }}>
          {comma(groupSubtotal(group))}
        </span>
      </div>

      {(group.items || []).length === 0 ? (
        <div style={{ fontSize: 13, color: colors.tertiary }}>
          항목이 없습니다 · 위 “항목 편집”에서 추가하세요.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isNarrow ? '1fr' : 'repeat(2, 1fr)', gap: 10 }}>
          {group.items.map((it) => (
            <label key={it.key} style={{ display: 'block' }}>
              <span style={{ display: 'block', fontSize: 12.5, color: colors.secondary, marginBottom: 5 }}>
                {it.label}
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={form.values[it.key] ?? ''}
                placeholder="0"
                onChange={(e) => setVal(it.key, e.target.value)}
                style={{ ...field, background: '#fff' }}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );

  // 편집 그룹 (이름변경/추가/삭제)
  const renderEditGroup = (side, group) => (
    <div key={group.key} style={groupBox}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <input
          value={group.label}
          onChange={(e) => renameGroup(side, group.key, e.target.value)}
          style={{ ...field, background: '#fff', fontWeight: 700 }}
        />
        <button onClick={() => deleteGroup(side, group.key)} aria-label={`${group.label} 그룹 삭제`} style={iconBtn}>
          <Trash2 size={18} color={colors.red} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 4 }}>
        {group.items.map((it) => (
          <div key={it.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: colors.tertiary, fontSize: 14, flexShrink: 0 }}>·</span>
            <input
              value={it.label}
              onChange={(e) => renameItem(side, group.key, it.key, e.target.value)}
              style={{ ...field, background: '#fff' }}
            />
            <button onClick={() => deleteItem(side, group.key, it.key)} aria-label={`${it.label} 삭제`} style={iconBtn}>
              <Trash2 size={16} color={colors.red} />
            </button>
          </div>
        ))}
        {group.items.length === 0 && (
          <div style={{ fontSize: 13, color: colors.tertiary, paddingLeft: 4 }}>항목 없음</div>
        )}
        <button onClick={() => addItem(side, group.key)} style={{ ...addBtn, marginTop: 2, paddingLeft: 4 }}>
          <Plus size={16} /> 항목 추가
        </button>
      </div>
    </div>
  );

  const renderSide = ({ key: side, title }) => {
    const groups = cats[side] || [];
    return (
      <div key={side} style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: colors.secondary, margin: '0 0 8px 2px' }}>{title}</div>
        {groups.length === 0 ? (
          <div style={{ fontSize: 13, color: colors.tertiary, marginLeft: 2 }}>
            {editingCats ? '그룹이 없습니다. 아래에서 추가하세요.' : '그룹이 없습니다.'}
          </div>
        ) : (
          groups.map((g) => (editingCats ? renderEditGroup(side, g) : renderValueGroup(g)))
        )}
        {editingCats && (
          <button onClick={() => addGroup(side)} style={{ ...addBtn, marginTop: 4 }}>
            <Plus size={16} /> 그룹 추가
          </button>
        )}
      </div>
    );
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 16 }}>
        <CardTitle style={{ margin: 0 }}>
          {editingCats ? '항목 편집' : isEditing ? `${editDate} 수정` : '새 입력'}
        </CardTitle>
        <button
          onClick={() => setEditingCats((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: colors.blue,
            fontSize: 15,
            fontWeight: 600,
            fontFamily: font,
          }}
        >
          {editingCats ? '완료' : '항목 편집'}
        </button>
      </div>

      {editingCats ? (
        <>
          {SIDES.map(renderSide)}
          <p style={{ margin: '4px 2px 0', fontSize: 12.5, color: colors.secondary, lineHeight: 1.6 }}>
            그룹·항목을 자유롭게 추가·이름변경·삭제할 수 있습니다. “완료”를 누르면 입력 화면으로 돌아갑니다.
          </p>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <span style={{ display: 'block', fontSize: 12.5, color: colors.secondary, marginBottom: 5, marginLeft: 2 }}>
              날짜
            </span>
            <input
              type="date"
              value={form.date}
              disabled={isEditing}
              onChange={(e) => setDate(e.target.value)}
              style={{ ...field, opacity: isEditing ? 0.6 : 1, maxWidth: 220 }}
            />
            {overwrite && (
              <span style={{ marginLeft: 10, fontSize: 12.5, color: colors.orange }}>
                이미 있는 날짜 — 저장 시 덮어씁니다
              </span>
            )}
          </div>

          {SIDES.map(renderSide)}

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
        </>
      )}
    </Card>
  );
}
