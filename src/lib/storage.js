// localStorage 동기 래퍼. 모든 데이터는 이 브라우저에만 저장된다.
// 외부 네트워크 요청은 어디에서도 발생하지 않는다.

import { SEED_ENTRIES } from '../data/seed.js';
import { defaultCats } from '../data/categories.js';
import { newTradeId } from './trades.js';

export const KEYS = {
  entries: 'ledger:entries:v1',
  cats: 'ledger:cats:v1',
  goal: 'ledger:goal:v1',
  goalDate: 'ledger:goaldate:v1',
  trades: 'ledger:trades:v1', // 주식 거래 내역 (자산 스냅샷과 독립)
};

// --- 저수준 헬퍼 ---------------------------------------------------------

function getRaw(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

function getJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    const parsed = JSON.parse(v);
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function setJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 저장 실패는 조용히 무시 (용량 초과 등) */
  }
}

function setRaw(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* noop */
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

// --- entries -------------------------------------------------------------

function sortEntries(list) {
  return [...list].sort((a, b) => String(a.month).localeCompare(String(b.month)));
}

export function getEntries() {
  const v = getJSON(KEYS.entries, null);
  if (!Array.isArray(v)) return [];
  return sortEntries(v.filter((e) => e && typeof e.month === 'string'));
}

export function setEntries(list) {
  const clean = Array.isArray(list) ? sortEntries(list) : [];
  setJSON(KEYS.entries, clean);
  return clean;
}

// --- categories ----------------------------------------------------------

export function getCats() {
  const v = getJSON(KEYS.cats, null);
  if (!v || !Array.isArray(v.assets) || !Array.isArray(v.debts)) return defaultCats();
  return { assets: v.assets, debts: v.debts };
}

export function setCats(cats) {
  const safe = {
    assets: Array.isArray(cats?.assets) ? cats.assets : [],
    debts: Array.isArray(cats?.debts) ? cats.debts : [],
  };
  setJSON(KEYS.cats, safe);
  return safe;
}

// --- goal ----------------------------------------------------------------

export function getGoal() {
  const v = getRaw(KEYS.goal, '');
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function setGoal(n) {
  const v = Number(n);
  setRaw(KEYS.goal, Number.isFinite(v) ? v : 0);
}

export function getGoalDate() {
  return getRaw(KEYS.goalDate, '') || '';
}

export function setGoalDate(ym) {
  setRaw(KEYS.goalDate, ym || '');
}

// --- trades (주식 거래 내역) ---------------------------------------------
// trade = { id, date: 'YYYY-MM-DD', ticker, side: 'buy'|'sell', qty, price, fee }
// 금액 단위는 "원". 자산 스냅샷(entries, 만원)과는 별개다.

function sortTrades(list) {
  return [...list].sort((a, b) => {
    const d = String(a.date).localeCompare(String(b.date));
    return d !== 0 ? d : String(a.id).localeCompare(String(b.id));
  });
}

// 저장/불러오기 시 최소한의 유효성만 확인한다 (날짜·종목·매매구분 필수).
function isValidTrade(t) {
  return (
    t &&
    typeof t === 'object' &&
    typeof t.date === 'string' &&
    typeof t.ticker === 'string' &&
    (t.side === 'buy' || t.side === 'sell')
  );
}

// id가 없거나 비어 있으면(외부에서 가져온 데이터 등) 안정적인 id를 부여한다.
// id는 수정/삭제/React key의 기준이므로 반드시 유일하고 비어 있지 않아야 한다.
function withId(t) {
  return typeof t.id === 'string' && t.id ? t : { ...t, id: newTradeId() };
}

export function getTrades() {
  const v = getJSON(KEYS.trades, null);
  if (!Array.isArray(v)) return [];
  return sortTrades(v.filter(isValidTrade).map(withId));
}

export function setTrades(list) {
  const clean = Array.isArray(list) ? sortTrades(list.filter(isValidTrade).map(withId)) : [];
  setJSON(KEYS.trades, clean);
  return clean;
}

// --- 초기화 (최초 실행) --------------------------------------------------

export function initIfEmpty() {
  try {
    const hasEntries = localStorage.getItem(KEYS.entries) !== null;
    const hasCats = localStorage.getItem(KEYS.cats) !== null;
    if (!hasEntries && !hasCats) {
      setEntries(SEED_ENTRIES);
      setCats(defaultCats());
    } else {
      if (!hasEntries) setEntries([]);
      if (!hasCats) setCats(defaultCats());
    }
  } catch {
    /* localStorage 접근 불가 환경에서도 앱은 메모리로 동작 */
  }
}

// --- 내보내기 / 가져오기 / 전체삭제 --------------------------------------

export function exportAll() {
  return {
    entries: getEntries(),
    assetCats: getCats().assets,
    debtCats: getCats().debts,
    goal: getGoal(),
    goalDate: getGoalDate(),
    trades: getTrades(),
  };
}

// data: { entries, assetCats, debtCats, goal, goalDate, trades } 또는 entries 배열 단독
// 인식 가능한 키가 하나도 없으면 false를 반환한다(엉뚱한 파일을 "완료"로 오표시 방지).
export function importAll(data) {
  if (Array.isArray(data)) {
    setEntries(data);
    return true;
  }
  if (!data || typeof data !== 'object') return false;

  let touched = false;

  if (Array.isArray(data.entries)) {
    setEntries(data.entries);
    touched = true;
  }

  if (Array.isArray(data.assetCats) || Array.isArray(data.debtCats)) {
    const cur = getCats();
    setCats({
      assets: Array.isArray(data.assetCats) ? data.assetCats : cur.assets,
      debts: Array.isArray(data.debtCats) ? data.debtCats : cur.debts,
    });
    touched = true;
  }
  if (data.goal !== undefined) {
    setGoal(data.goal);
    touched = true;
  }
  if (data.goalDate !== undefined) {
    setGoalDate(data.goalDate);
    touched = true;
  }
  if (Array.isArray(data.trades)) {
    setTrades(data.trades);
    touched = true;
  }
  return touched;
}

export function clearAll() {
  remove(KEYS.entries);
  remove(KEYS.cats);
  remove(KEYS.goal);
  remove(KEYS.goalDate);
  remove(KEYS.trades);
}
