// localStorage 동기 래퍼. 모든 데이터는 이 브라우저에만 저장된다.
// 외부 네트워크 요청은 어디에서도 발생하지 않는다.

import { SEED_ENTRIES } from '../data/seed.js';
import { defaultCats, toGroups, DEFAULT_INCOME_GROUPS } from '../data/categories.js';

export const KEYS = {
  entries: 'ledger:entries:v2', // v2: 원 단위 (× 10,000 마이그레이션됨)
  entriesLegacy: 'ledger:entries:v1', // v1: 만원 단위 (마이그레이션 원본)
  cats: 'ledger:cats:v2', // v2: 그룹→항목 2단계 구조
  catsLegacy: 'ledger:cats:v1', // v1: 평면 카테고리 (마이그레이션 원본)
  goal: 'ledger:goal:v2', // v2: 원 단위
  goalLegacy: 'ledger:goal:v1', // v1: 만원 단위
  goalDate: 'ledger:goaldate:v1',
};

// 만원 → 원 환산 배수
const WON_PER_MANWON = 10000;

// entry의 금액(만원)을 원으로 스케일한다. date는 그대로 둔다.
function scaleEntryValues(e, factor) {
  const out = { date: e.date };
  for (const [k, v] of Object.entries(e)) {
    if (k === 'date') continue;
    const n = Number(v);
    out[k] = Number.isFinite(n) ? n * factor : v;
  }
  return out;
}

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
  return [...list].sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

// 구버전(월 단위, {month:"YYYY-MM"}) 엔트리를 일 단위({date:"YYYY-MM-DD"})로 정규화한다.
// - date가 이미 있으면 그대로.
// - month만 있으면 "YYYY-MM"은 해당 월 1일로, 그 밖의 값은 그대로 date로 옮기고 month는 제거.
function normalizeEntry(e) {
  const { month, ...rest } = e; // month는 구버전 필드 → 결과에서 항상 제거
  if (typeof rest.date === 'string' && rest.date) return rest;
  if (typeof month === 'string' && month) {
    const date = month.length === 7 ? `${month}-01` : month;
    return { ...rest, date };
  }
  return null;
}

// 원시 배열 → 정규화(month→date) + 정렬
function readList(raw) {
  if (!Array.isArray(raw)) return [];
  return sortEntries(
    raw
      .filter((e) => e && (typeof e.date === 'string' || typeof e.month === 'string'))
      .map(normalizeEntry)
      .filter((e) => e && typeof e.date === 'string'),
  );
}

// v2(원)를 우선 읽고, 없으면 v1(만원)을 ×10000 해서 v2로 마이그레이션한다.
export function getEntries() {
  const v2 = getJSON(KEYS.entries, null);
  if (Array.isArray(v2)) return readList(v2);

  const v1 = getJSON(KEYS.entriesLegacy, null);
  if (Array.isArray(v1)) {
    const migrated = readList(v1).map((e) => scaleEntryValues(e, WON_PER_MANWON));
    setJSON(KEYS.entries, migrated); // 마이그레이션 1회 저장
    return migrated;
  }
  return [];
}

export function setEntries(list) {
  const clean = Array.isArray(list)
    ? sortEntries(list.map(normalizeEntry).filter((e) => e && typeof e.date === 'string'))
    : [];
  setJSON(KEYS.entries, clean);
  return clean;
}

// --- categories ----------------------------------------------------------

// income 그룹이 없는(수입 도입 이전) 저장본은 기본 수입 그룹으로 보정한다.
const cloneIncome = () =>
  DEFAULT_INCOME_GROUPS.map((g) => ({ ...g, items: g.items.map((it) => ({ ...it })) }));

// v2(그룹 구조)를 우선 읽고, 없으면 v1(평면)을 마이그레이션해 v2로 저장한다.
export function getCats() {
  const v2 = getJSON(KEYS.cats, null);
  if (v2 && Array.isArray(v2.assets) && Array.isArray(v2.debts)) {
    return {
      assets: toGroups(v2.assets),
      debts: toGroups(v2.debts),
      income: Array.isArray(v2.income) ? toGroups(v2.income) : cloneIncome(),
    };
  }

  const v1 = getJSON(KEYS.catsLegacy, null);
  if (v1 && Array.isArray(v1.assets) && Array.isArray(v1.debts)) {
    const migrated = {
      assets: toGroups(v1.assets),
      debts: toGroups(v1.debts),
      income: cloneIncome(),
    };
    setJSON(KEYS.cats, migrated); // 마이그레이션 1회 저장
    return migrated;
  }

  return defaultCats();
}

export function setCats(cats) {
  const safe = {
    assets: toGroups(cats?.assets),
    debts: toGroups(cats?.debts),
    income: Array.isArray(cats?.income) ? toGroups(cats.income) : cloneIncome(),
  };
  setJSON(KEYS.cats, safe);
  return safe;
}

// --- goal ----------------------------------------------------------------

// v2(원)를 우선 읽고, 없으면 v1(만원)을 ×10000 해서 v2로 마이그레이션한다.
export function getGoal() {
  const v2 = getRaw(KEYS.goal, null);
  if (v2 !== null) {
    const n = Number(v2);
    return Number.isFinite(n) ? n : 0;
  }
  const v1 = getRaw(KEYS.goalLegacy, null);
  if (v1 !== null && v1 !== '') {
    const n = Number(v1);
    const wonVal = Number.isFinite(n) ? n * WON_PER_MANWON : 0;
    setRaw(KEYS.goal, wonVal); // 마이그레이션 1회 저장
    return wonVal;
  }
  return 0;
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
    const hasEntriesV2 = localStorage.getItem(KEYS.entries) !== null;
    const hasEntriesV1 = localStorage.getItem(KEYS.entriesLegacy) !== null;
    const hasEntries = hasEntriesV2 || hasEntriesV1;
    const hasCatsV2 = localStorage.getItem(KEYS.cats) !== null;
    const hasCatsV1 = localStorage.getItem(KEYS.catsLegacy) !== null;

    if (!hasEntries && !hasCatsV2 && !hasCatsV1) {
      // 완전 최초 실행 → 시드(만원 → 원 환산) + 기본 그룹
      setEntries(SEED_ENTRIES.map((e) => scaleEntryValues(e, WON_PER_MANWON)));
      setCats(defaultCats());
      return;
    }
    // 구버전(만원) 엔트리가 있으면 v2(원)로 확정 마이그레이션
    if (!hasEntriesV2 && hasEntriesV1) getEntries();
    if (!hasEntries) setEntries([]);
    // v2가 없으면 v1 마이그레이션 결과(또는 기본값)를 v2로 확정 저장
    if (!hasCatsV2) setCats(getCats());
  } catch {
    /* localStorage 접근 불가 환경에서도 앱은 메모리로 동작 */
  }
}

// --- 내보내기 / 가져오기 / 전체삭제 --------------------------------------

export function exportAll() {
  const cats = getCats();
  return {
    unit: 'won', // 금액 단위 마커 (구버전 백업은 이 필드가 없어 만원으로 간주)
    entries: getEntries(),
    assetCats: cats.assets,
    debtCats: cats.debts,
    incomeCats: cats.income,
    goal: getGoal(),
    goalDate: getGoalDate(),
  };
}

// 스케일 후 저장할 엔트리 목록 만들기 (정규화 + 만원→원 필요 시 환산)
function importEntries(list, factor) {
  const scaled = (Array.isArray(list) ? list : [])
    .map(normalizeEntry)
    .filter((e) => e && typeof e.date === 'string')
    .map((e) => scaleEntryValues(e, factor));
  setEntries(scaled);
}

// data: { unit, entries, assetCats, debtCats, incomeCats, goal, goalDate } 또는 entries 배열 단독.
// unit !== 'won' (구버전 백업/단독 배열)은 만원으로 보고 ×10000 환산해 가져온다.
export function importAll(data) {
  if (Array.isArray(data)) {
    importEntries(data, WON_PER_MANWON); // 구버전 단독 배열 = 만원
    return true;
  }
  if (!data || typeof data !== 'object') return false;

  const factor = data.unit === 'won' ? 1 : WON_PER_MANWON;

  if (Array.isArray(data.entries)) importEntries(data.entries, factor);

  if (
    Array.isArray(data.assetCats) ||
    Array.isArray(data.debtCats) ||
    Array.isArray(data.incomeCats)
  ) {
    const cur = getCats();
    setCats({
      assets: Array.isArray(data.assetCats) ? data.assetCats : cur.assets,
      debts: Array.isArray(data.debtCats) ? data.debtCats : cur.debts,
      income: Array.isArray(data.incomeCats) ? data.incomeCats : cur.income,
    });
  }
  if (data.goal !== undefined) {
    const g = Number(data.goal);
    setGoal(Number.isFinite(g) ? g * factor : 0);
  }
  if (data.goalDate !== undefined) setGoalDate(data.goalDate);
  return true;
}

export function clearAll() {
  remove(KEYS.entries);
  remove(KEYS.entriesLegacy); // 만원 원본도 제거 (마이그레이션 재부활 방지)
  remove(KEYS.cats);
  remove(KEYS.catsLegacy); // 구버전 원본도 제거 (마이그레이션 재부활 방지)
  remove(KEYS.goal);
  remove(KEYS.goalLegacy);
  remove(KEYS.goalDate);
}
