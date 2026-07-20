// entries + cats → 파생 rows 계산.
// 삭제된 카테고리의 과거 값은 entry에 남아있어도 합계에선 제외한다
// (현재 cats 목록에 있는 key만 합산).

import { ymOf, monthsBetween, addMonths } from './format.js';

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const itemsOf = (group) => (Array.isArray(group?.items) ? group.items : []);

// 그룹 합계 = 소속 항목 값들의 합
export function groupTotal(entry, group) {
  return itemsOf(group).reduce((acc, it) => acc + num(entry?.[it.key]), 0);
}

// 한쪽(자산 또는 부채) 전체 합계 = 그룹 합계들의 합
// 삭제된 그룹/항목의 값은 entry에 남아있어도 현재 목록에 없으면 제외된다.
export function sumSide(entry, groups) {
  return (Array.isArray(groups) ? groups : []).reduce(
    (acc, g) => acc + groupTotal(entry, g),
    0,
  );
}

// entries(날짜 오름차순) → rows[]
// row: { date, entry, totalAssets, totalDebts, totalIncome, net, delta, deltaRate }
// 수입(totalIncome)은 흐름이라 net/totalAssets/totalDebts에 포함하지 않는다.
export function deriveRows(entries, cats) {
  const assets = cats?.assets ?? [];
  const debts = cats?.debts ?? [];
  const income = cats?.income ?? [];
  const sorted = [...entries].sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );

  let prevNet = null;
  return sorted.map((entry) => {
    const totalAssets = sumSide(entry, assets);
    const totalDebts = sumSide(entry, debts);
    const totalIncome = sumSide(entry, income);
    const net = totalAssets - totalDebts;

    let delta = null;
    let deltaRate = null;
    if (prevNet !== null) {
      delta = net - prevNet;
      deltaRate = prevNet !== 0 ? delta / Math.abs(prevNet) : null;
    }
    prevNet = net;

    return { date: entry.date, entry, totalAssets, totalDebts, totalIncome, net, delta, deltaRate };
  });
}

export function latestRow(rows) {
  return rows.length ? rows[rows.length - 1] : null;
}

// 월 환산 평균 증감 — 최근 windowMonths개월 구간의 순자산 변화를 경과 개월수로 나눈다.
// 일 단위 기록에서도 "한 달에 얼마" 속도를 일관되게 계산하기 위한 값. 계산 불가 시 null.
export function monthlyAvgDelta(rows, windowMonths = 6) {
  if (rows.length < 2) return null;
  const last = rows[rows.length - 1];
  const lastYm = ymOf(last.date);
  const cutoff = addMonths(lastYm, -windowMonths);
  const inWindow = rows.filter((r) => ymOf(r.date) >= cutoff);
  const from = inWindow.length >= 2 ? inWindow[0] : rows[0];
  const span = monthsBetween(ymOf(from.date), lastYm);
  if (span <= 0) return null;
  return (last.net - from.net) / span;
}

// 하이라이트 계산
export function computeHighlights(rows) {
  const out = [];
  if (rows.length === 0) return out;

  const last = rows[rows.length - 1];

  // 역대 최고 순자산
  const maxNet = Math.max(...rows.map((r) => r.net));
  if (last.net >= maxNet && rows.length > 1) {
    out.push({ kind: 'record', tone: 'green', text: '역대 최고 순자산' });
  }

  // 올해 YTD (%): 올해 첫 기록 대비 최신
  const year = String(last.date).slice(0, 4);
  const thisYear = rows.filter((r) => String(r.date).slice(0, 4) === year);
  if (thisYear.length >= 1) {
    const firstOfYear = thisYear[0];
    const base = firstOfYear.net;
    if (base !== 0 && last.date !== firstOfYear.date) {
      const pct = ((last.net - base) / Math.abs(base)) * 100;
      const sign = pct >= 0 ? '+' : '';
      out.push({
        kind: 'ytd',
        tone: pct >= 0 ? 'green' : 'red',
        text: `올해 ${sign}${pct.toFixed(1)}%`,
      });
    }
  }

  // 최고 증가 기록
  const withDelta = rows.filter((r) => r.delta !== null);
  if (withDelta.length) {
    const best = withDelta.reduce((a, b) => (b.delta > a.delta ? b : a));
    if (best.delta > 0) {
      out.push({ kind: 'bestMonth', tone: 'blue', date: best.date, delta: best.delta });
    }
  }

  return out;
}
