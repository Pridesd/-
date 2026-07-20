import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Card, { CardTitle } from './Card.jsx';
import { colors, radius, font } from '../styles/tokens.js';
import { newCatKey } from '../data/categories.js';

const field = {
  flex: 1,
  minWidth: 0,
  boxSizing: 'border-box',
  border: 'none',
  outline: 'none',
  background: colors.bg,
  borderRadius: radius.inner,
  padding: '10px 12px',
  fontSize: 16,
  fontFamily: font,
  color: colors.label,
};

export default function CategoryEditor({ assetCats, debtCats, onChange }) {
  const [open, setOpen] = useState(false);
  const [seg, setSeg] = useState('assets'); // 'assets' | 'debts'

  const list = seg === 'assets' ? assetCats : debtCats;

  const commit = (nextList) => {
    if (seg === 'assets') onChange({ assets: nextList, debts: debtCats });
    else onChange({ assets: assetCats, debts: nextList });
  };

  const rename = (key, label) => commit(list.map((c) => (c.key === key ? { ...c, label } : c)));

  const remove = (key) => {
    const c = list.find((x) => x.key === key);
    if (!window.confirm(`"${c?.label}" 항목을 삭제할까요?\n(과거 기록의 값은 남지만 합계에서 제외됩니다)`)) return;
    commit(list.filter((x) => x.key !== key));
  };

  const add = () => {
    const label = seg === 'assets' ? '새 자산' : '새 부채';
    commit([...list, { key: newCatKey(), label }]);
  };

  return (
    <Card>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        <CardTitle style={{ margin: 0 }}>항목 편집</CardTitle>
        {open ? <ChevronUp size={18} color={colors.secondary} /> : <ChevronDown size={18} color={colors.secondary} />}
      </button>

      {open && (
        <div style={{ marginTop: 16 }}>
          {/* 세그먼트 */}
          <div
            style={{
              display: 'flex',
              background: colors.bg,
              borderRadius: radius.inner,
              padding: 3,
              marginBottom: 16,
            }}
          >
            {[
              ['assets', '자산'],
              ['debts', '부채'],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSeg(val)}
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 0',
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: font,
                  cursor: 'pointer',
                  background: seg === val ? '#fff' : 'transparent',
                  color: seg === val ? colors.label : colors.secondary,
                  boxShadow: seg === val ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {list.map((c) => (
              <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  value={c.label}
                  onChange={(e) => rename(c.key, e.target.value)}
                  style={field}
                />
                <button
                  onClick={() => remove(c.key)}
                  aria-label={`${c.label} 삭제`}
                  style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', flexShrink: 0 }}
                >
                  <Trash2 size={18} color={colors.red} />
                </button>
              </div>
            ))}
            {list.length === 0 && (
              <div style={{ fontSize: 14, color: colors.secondary, padding: '4px 2px' }}>
                항목이 없습니다. 아래에서 추가하세요.
              </div>
            )}
          </div>

          <button
            onClick={add}
            style={{
              marginTop: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              padding: '4px 2px',
              cursor: 'pointer',
              color: colors.blue,
              fontSize: 16,
              fontWeight: 600,
              fontFamily: font,
            }}
          >
            <Plus size={18} /> {seg === 'assets' ? '자산 항목 추가' : '부채 항목 추가'}
          </button>
        </div>
      )}
    </Card>
  );
}
