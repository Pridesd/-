// localStorage 동기 래퍼. 모든 데이터는 이 브라우저에만 저장된다.
// 외부 네트워크 요청은 어디에서도 발생하지 않는다.

import { SEED_ENTRIES } from '../data/seed.js';
import { defaultCats } from '../data/categories.js';

export const KEYS = {
  entries: 'ledger:entries:v1',
  cats: 'ledger:cats:v1',
  goal: 'ledger:goal:v1',
  goalDate: 'ledger:goaldate:v1',
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
  };
}

// data: { entries, assetCats, debtCats, goal, goalDate } 또는 entries 배열 단독
export function importAll(data) {
  if (Array.isArray(data)) {
    setEntries(data);
    return true;
  }
  if (!data || typeof data !== 'object') return false;

  if (Array.isArray(data.entries)) setEntries(data.entries);

  if (Array.isArray(data.assetCats) || Array.isArray(data.debtCats)) {
    const cur = getCats();
    setCats({
      assets: Array.isArray(data.assetCats) ? data.assetCats : cur.assets,
      debts: Array.isArray(data.debtCats) ? data.debtCats : cur.debts,
    });
  }
  if (data.goal !== undefined) setGoal(data.goal);
  if (data.goalDate !== undefined) setGoalDate(data.goalDate);
  return true;
}

export function clearAll() {
  remove(KEYS.entries);
  remove(KEYS.cats);
  remove(KEYS.goal);
  remove(KEYS.goalDate);
}
