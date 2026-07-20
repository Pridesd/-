// 주식 거래 내역 집계. 금액 단위는 "원".
// trade = { id, date:'YYYY-MM-DD', ticker, side:'buy'|'sell', qty, price, fee }
//   qty   : 주 수 (양수)
//   price : 1주당 단가 (원)
//   fee   : 거래 수수료+세금 (원, 선택. 없으면 0)
//
// 실현손익은 "이동평균 단가법"으로 계산한다.
//   - 매수: 보유 수량·원가에 더하고 평균단가를 갱신한다.
//   - 매도: (매도단가 - 평균단가) × 수량 - 수수료 를 실현손익에 더하고,
//           평균단가 × 수량 만큼 보유 원가에서 뺀다. 평균단가는 그대로 유지.

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// 고유 id 생성 (categories.js와 동일한 방식)
export function newTradeId() {
  return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// 한 거래의 체결금액(수수료 제외) = 수량 × 단가
export function tradeAmount(t) {
  return num(t?.qty) * num(t?.price);
}

// 최신 거래가 위로 오도록 정렬 (날짜 내림차순, 같은 날짜는 id 내림차순)
export function sortTradesDesc(trades) {
  return [...(Array.isArray(trades) ? trades : [])].sort((a, b) => {
    const d = String(b.date).localeCompare(String(a.date));
    return d !== 0 ? d : String(b.id).localeCompare(String(a.id));
  });
}

// 종목별 집계. 반환:
// {
//   ticker, holdingQty, avgCost, investedCost,
//   realizedPnL, buyQty, sellQty, buyAmount, sellAmount, feeTotal, tradeCount
// }
export function computeHoldings(trades) {
  const list = Array.isArray(trades) ? trades : [];

  // 이동평균 계산은 반드시 시간순으로 처리해야 한다.
  // 날짜 오름차순 → 같은 날은 매수를 매도보다 먼저(당일 매수분으로 당일 매도 손익 계산)
  // → 그다음 id 오름차순(생성순).
  const sideRank = (t) => (t.side === 'sell' ? 1 : 0);
  const chrono = [...list].sort((a, b) => {
    const d = String(a.date).localeCompare(String(b.date));
    if (d !== 0) return d;
    const sr = sideRank(a) - sideRank(b);
    if (sr !== 0) return sr;
    return String(a.id).localeCompare(String(b.id));
  });

  const map = new Map(); // ticker → 누적 상태

  const blank = (ticker) => ({
    ticker,
    holdingQty: 0, // 현재 보유 수량
    investedCost: 0, // 보유분 원가 총액 (매수 수수료 포함)
    realizedPnL: 0, // 실현 손익 (매도 시 확정, 수수료 반영)
    buyQty: 0,
    sellQty: 0,
    buyAmount: 0, // 총 매수 체결금액 (수수료 제외)
    sellAmount: 0, // 총 매도 체결금액 (수수료 제외)
    feeTotal: 0,
    tradeCount: 0,
  });

  for (const t of chrono) {
    const ticker = String(t.ticker ?? '').trim() || '(미지정)';
    if (!map.has(ticker)) map.set(ticker, blank(ticker));
    const s = map.get(ticker);

    const qty = Math.abs(num(t.qty));
    const price = num(t.price);
    const fee = Math.abs(num(t.fee));
    const amount = qty * price;

    s.tradeCount += 1;
    s.feeTotal += fee;

    if (t.side === 'buy') {
      s.holdingQty += qty;
      s.investedCost += amount + fee; // 매수 수수료는 원가에 포함
      s.buyQty += qty;
      s.buyAmount += amount;
    } else if (t.side === 'sell') {
      const avg = s.holdingQty > 0 ? s.investedCost / s.holdingQty : 0;
      // 실제 보유분에 한해서만 손익을 실현한다. 보유량을 넘는 매도(데이터 누락 등)의
      // 초과분은 원가를 알 수 없으므로 손익에 반영하지 않는다(허구 이익 방지).
      const covered = Math.min(qty, Math.max(0, s.holdingQty));
      s.realizedPnL += (price - avg) * covered - fee; // 실현손익 = 보유분 시세차익 - 매도수수료
      s.investedCost = Math.max(0, s.investedCost - avg * covered);
      s.holdingQty = Math.max(0, s.holdingQty - qty); // 음수 보유는 0으로 정리
      s.sellQty += qty;
      s.sellAmount += amount;
    }
  }

  const tickers = [...map.values()].map((s) => ({
    ...s,
    avgCost: s.holdingQty > 0 ? s.investedCost / s.holdingQty : 0,
  }));

  // 정렬: 보유 중인 종목 먼저(원가 큰 순), 그다음 청산 종목(종목명 순)
  tickers.sort((a, b) => {
    const aHeld = a.holdingQty > 0 ? 1 : 0;
    const bHeld = b.holdingQty > 0 ? 1 : 0;
    if (aHeld !== bHeld) return bHeld - aHeld;
    if (aHeld) return b.investedCost - a.investedCost;
    return String(a.ticker).localeCompare(String(b.ticker));
  });

  const summary = tickers.reduce(
    (acc, s) => {
      acc.totalRealized += s.realizedPnL;
      acc.totalBuyAmount += s.buyAmount;
      acc.totalSellAmount += s.sellAmount;
      acc.totalInvestedCost += s.investedCost;
      acc.totalFees += s.feeTotal;
      return acc;
    },
    {
      totalRealized: 0,
      totalBuyAmount: 0,
      totalSellAmount: 0,
      totalInvestedCost: 0,
      totalFees: 0,
    },
  );

  return { tickers, ...summary };
}
