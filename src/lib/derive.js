// entries + cats → 파생 rows 계산.
// 삭제된 카테고리의 과거 값은 entry에 남아있어도 합계에선 제외한다
// (현재 cats 목록에 있는 key만 합산).

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function sumCats(entry, cats) {
  return cats.reduce((acc, c) => acc + num(entry?.[c.key]), 0);
}

// entries(월 오름차순) → rows[]
// row: { month, entry, totalAssets, totalDebts, net, delta, deltaRate }
export function deriveRows(entries, cats) {
  const assets = cats?.assets ?? [];
  const debts = cats?.debts ?? [];
  const sorted = [...entries].sort((a, b) =>
    String(a.month).localeCompare(String(b.month)),
  );

  let prevNet = null;
  return sorted.map((entry) => {
    const totalAssets = sumCats(entry, assets);
    const totalDebts = sumCats(entry, debts);
    const net = totalAssets - totalDebts;

    let delta = null;
    let deltaRate = null;
    if (prevNet !== null) {
      delta = net - prevNet;
      deltaRate = prevNet !== 0 ? delta / Math.abs(prevNet) : null;
    }
    prevNet = net;

    return { month: entry.month, entry, totalAssets, totalDebts, net, delta, deltaRate };
  });
}

export function latestRow(rows) {
  return rows.length ? rows[rows.length - 1] : null;
}

// 최근 최대 n개월의 증감(delta) 평균. 값 없으면 null.
export function recentAvgDelta(rows, n = 4) {
  const deltas = rows.map((r) => r.delta).filter((d) => d !== null && d !== undefined);
  if (!deltas.length) return null;
  const slice = deltas.slice(-n);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
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
  const year = String(last.month).slice(0, 4);
  const thisYear = rows.filter((r) => String(r.month).slice(0, 4) === year);
  if (thisYear.length >= 1) {
    const firstOfYear = thisYear[0];
    const base = firstOfYear.net;
    if (base !== 0 && last.month !== firstOfYear.month) {
      const pct = ((last.net - base) / Math.abs(base)) * 100;
      const sign = pct >= 0 ? '+' : '';
      out.push({
        kind: 'ytd',
        tone: pct >= 0 ? 'green' : 'red',
        text: `올해 ${sign}${pct.toFixed(1)}%`,
      });
    }
  }

  // 최고 증가월
  const withDelta = rows.filter((r) => r.delta !== null);
  if (withDelta.length) {
    const best = withDelta.reduce((a, b) => (b.delta > a.delta ? b : a));
    if (best.delta > 0) {
      out.push({ kind: 'bestMonth', tone: 'blue', month: best.month, delta: best.delta });
    }
  }

  return out;
}
