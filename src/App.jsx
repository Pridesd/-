import { useEffect, useMemo, useRef, useState } from 'react';
import { colors, font } from './styles/tokens.js';
import * as store from './lib/storage.js';
import { deriveRows, computeHighlights } from './lib/derive.js';

import Hero from './components/Hero.jsx';
import Highlights from './components/Highlights.jsx';
import GoalCard from './components/GoalCard.jsx';
import SummaryCard from './components/SummaryCard.jsx';
import CompositionCard from './components/CompositionCard.jsx';
import ChangeCard from './components/ChangeCard.jsx';
import RecordsList from './components/RecordsList.jsx';
import EntryForm from './components/EntryForm.jsx';
import CategoryEditor from './components/CategoryEditor.jsx';
import HoldingsCard from './components/HoldingsCard.jsx';
import TradeList from './components/TradeList.jsx';
import TradeForm from './components/TradeForm.jsx';

store.initIfEmpty();

function todayStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function App() {
  const [entries, setEntriesState] = useState(() => store.getEntries());
  const [cats, setCatsState] = useState(() => store.getCats());
  const [goal, setGoalState] = useState(() => store.getGoal());
  const [goalDate, setGoalDateState] = useState(() => store.getGoalDate());

  const [trades, setTradesState] = useState(() => store.getTrades());

  const [editMonth, setEditMonth] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  const [editTradeId, setEditTradeId] = useState(null);
  const [tradeResetKey, setTradeResetKey] = useState(0);

  const fileRef = useRef(null);
  const formRef = useRef(null);
  const tradeFormRef = useRef(null);

  // 파생값
  const rows = useMemo(() => deriveRows(entries, cats), [entries, cats]);
  const latest = rows.length ? rows[rows.length - 1] : null;
  const highlights = useMemo(() => computeHighlights(rows), [rows]);

  // --- mutations (state + localStorage 동시) ---
  const persistEntries = (list) => setEntriesState(store.setEntries(list));
  const persistCats = (c) => setCatsState(store.setCats(c));

  const saveEntry = (entry) => {
    const others = entries.filter((e) => e.month !== entry.month);
    persistEntries([...others, entry]);
    setEditMonth(null);
    setResetKey((k) => k + 1);
  };

  const deleteEntry = (month) => {
    if (!window.confirm(`${month} 기록을 삭제할까요?`)) return;
    persistEntries(entries.filter((e) => e.month !== month));
    if (editMonth === month) {
      setEditMonth(null);
      setResetKey((k) => k + 1);
    }
  };

  const editEntry = (month) => {
    setEditMonth(month);
    setResetKey((k) => k + 1);
    if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const startNew = () => {
    setEditMonth(null);
    setResetKey((k) => k + 1);
  };

  const updateGoal = (n) => {
    setGoalState(n);
    store.setGoal(n);
  };
  const updateGoalDate = (d) => {
    setGoalDateState(d);
    store.setGoalDate(d);
  };

  // --- 주식 거래 ---
  const persistTrades = (list) => setTradesState(store.setTrades(list));

  const saveTrade = (trade) => {
    const others = trades.filter((t) => t.id !== trade.id);
    persistTrades([...others, trade]);
    setEditTradeId(null);
    setTradeResetKey((k) => k + 1);
  };

  const deleteTrade = (id) => {
    const t = trades.find((x) => x.id === id);
    const label = t ? `${t.date} ${t.ticker} ${t.side === 'sell' ? '매도' : '매수'}` : '이';
    if (!window.confirm(`${label} 거래를 삭제할까요?`)) return;
    persistTrades(trades.filter((x) => x.id !== id));
    if (editTradeId === id) {
      setEditTradeId(null);
      setTradeResetKey((k) => k + 1);
    }
  };

  const editTrade = (id) => {
    setEditTradeId(id);
    setTradeResetKey((k) => k + 1);
    if (tradeFormRef.current) tradeFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const startNewTrade = () => {
    setEditTradeId(null);
    setTradeResetKey((k) => k + 1);
  };

  // --- 내보내기 / 가져오기 / 전체삭제 ---
  const doExport = () => {
    const data = store.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `자산장부_${todayStamp()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const doImportClick = () => fileRef.current?.click();

  const onImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const ok = store.importAll(data);
        if (!ok) throw new Error('형식 오류');
        setEntriesState(store.getEntries());
        setCatsState(store.getCats());
        setGoalState(store.getGoal());
        setGoalDateState(store.getGoalDate());
        setTradesState(store.getTrades());
        setEditMonth(null);
        setResetKey((k) => k + 1);
        setEditTradeId(null);
        setTradeResetKey((k) => k + 1);
        window.alert('가져오기 완료');
      } catch {
        window.alert('가져오기 실패: 올바른 JSON 파일이 아닙니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const doClearAll = () => {
    if (!window.confirm('전체 기록을 삭제할까요?\n이 작업은 되돌릴 수 없습니다.')) return;
    if (!window.confirm('정말 삭제하시겠습니까? 마지막 확인입니다.')) return;
    store.clearAll();
    // 전체 비우고 기본 카테고리만 남긴다 (시드는 재적용하지 않음)
    store.setEntries([]);
    store.setCats(store.getCats()); // getCats는 값이 없으면 defaultCats() 반환
    setEntriesState([]);
    setCatsState(store.getCats());
    setTradesState(store.setTrades([]));
    updateGoal(0);
    updateGoalDate('');
    setEditMonth(null);
    setResetKey((k) => k + 1);
    setEditTradeId(null);
    setTradeResetKey((k) => k + 1);
  };

  useEffect(() => {
    document.title = '자산 장부';
  }, []);

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', fontFamily: font, color: colors.label, overflowX: 'hidden' }}>
      <input ref={fileRef} type="file" accept="application/json,.json" onChange={onImportFile} style={{ display: 'none' }} />

      <div
        style={{
          maxWidth: 700,
          margin: '0 auto',
          padding: '24px max(16px, env(safe-area-inset-left)) calc(64px + env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-right))',
        }}
      >
        {/* 헤더 */}
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 20,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 'clamp(28px, 8vw, 34px)', fontWeight: 700, letterSpacing: '-0.02em' }}>자산</h1>
          <div style={{ display: 'flex', gap: 16 }}>
            <button onClick={doImportClick} style={textBtn}>불러오기</button>
            <button onClick={doExport} style={textBtn}>내보내기</button>
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Hero rows={rows} />
          <Highlights highlights={highlights} />
          <GoalCard
            rows={rows}
            goal={goal}
            goalDate={goalDate}
            onGoal={updateGoal}
            onGoalDate={updateGoalDate}
          />
          <SummaryCard row={latest} />
          <CompositionCard row={latest} assetCats={cats.assets} />
          <ChangeCard rows={rows} />
          <RecordsList rows={rows} onEdit={editEntry} onDelete={deleteEntry} />

          <div ref={formRef}>
            <EntryForm
              entries={entries}
              assetCats={cats.assets}
              debtCats={cats.debts}
              editMonth={editMonth}
              resetKey={resetKey}
              onSave={saveEntry}
              onNew={startNew}
            />
          </div>

          <CategoryEditor
            assetCats={cats.assets}
            debtCats={cats.debts}
            onChange={persistCats}
          />

          {/* ── 주식 거래 ── */}
          <h2 style={{ margin: '18px 0 2px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
            주식 거래
          </h2>
          <HoldingsCard trades={trades} />
          <TradeList trades={trades} onEdit={editTrade} onDelete={deleteTrade} />
          <div ref={tradeFormRef}>
            <TradeForm
              trades={trades}
              editId={editTradeId}
              resetKey={tradeResetKey}
              onSave={saveTrade}
              onNew={startNewTrade}
            />
          </div>

          {/* 하단 */}
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <button onClick={doClearAll} style={{ ...textBtn, color: colors.red, fontSize: 15 }}>
              전체 기록 삭제
            </button>
            <p style={{ margin: '14px auto 0', maxWidth: 420, fontSize: 12.5, color: colors.secondary, lineHeight: 1.6 }}>
              데이터는 이 브라우저에만 저장됩니다. 백업하려면 내보내기로 파일을 받아 두세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const textBtn = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  color: colors.blue,
  fontSize: 16,
  fontWeight: 500,
  fontFamily: font,
};
