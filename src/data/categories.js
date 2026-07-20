// 2단계 카테고리 모델: 그룹(묶음) → 항목(상세 상품).
//   group = { key, label, items: [{ key, label }] }
//   cats  = { assets: [group...], debts: [group...] }
// 값은 entry에 "항목 key" 단위로 저장된다. 그룹 합계 = 항목 값들의 합.
// 사용자가 그룹/항목을 자유롭게 추가·이름변경·삭제할 수 있다.

export const DEFAULT_ASSET_GROUPS = [
  {
    key: 'g_saving',
    label: '저축',
    items: [
      { key: 'i_free', label: '자유입출금' },
      { key: 'i_emergency', label: '비상예비자금' },
      { key: 'i_deposit', label: '예금' },
      { key: 'i_saving', label: '적금' },
      { key: 'i_house', label: '주택청약' },
    ],
  },
  {
    key: 'g_invest',
    label: '투자',
    items: [
      { key: 'i_kr_stock', label: '국내주식' },
      { key: 'i_us_stock', label: '미국주식' },
      { key: 'i_etf', label: 'ETF' },
      { key: 'i_fund', label: '펀드' },
      { key: 'i_cash', label: '예수금' },
      { key: 'i_coin', label: '가상화폐' },
    ],
  },
  {
    key: 'g_pension',
    label: '연금',
    items: [
      { key: 'i_pension', label: '연금저축' },
      { key: 'i_irp', label: 'IRP' },
    ],
  },
  {
    key: 'g_realestate',
    label: '부동산',
    items: [{ key: 'i_realestate', label: '부동산' }],
  },
  {
    key: 'g_etc_asset',
    label: '기타',
    items: [
      { key: 'i_bond', label: '채권' },
      { key: 'i_gold', label: '금' },
    ],
  },
];

export const DEFAULT_DEBT_GROUPS = [
  {
    key: 'g_loan',
    label: '대출',
    items: [
      { key: 'i_mortgage', label: '주택담보대출' },
      { key: 'i_credit', label: '신용카드' },
      { key: 'i_etc_debt', label: '기타대출' },
    ],
  },
];

// 수입은 "흐름(flow)"이라 순자산/자산 차트에 합산하지 않고 별도로 기록·표시한다.
export const DEFAULT_INCOME_GROUPS = [
  {
    key: 'g_income',
    label: '수입',
    items: [
      { key: 'i_salary', label: '급여' },
      { key: 'i_interest', label: '이자' },
      { key: 'i_dividend', label: '배당' },
    ],
  },
];

const clone = (groups) =>
  groups.map((g) => ({ ...g, items: g.items.map((it) => ({ ...it })) }));

export const defaultCats = () => ({
  assets: clone(DEFAULT_ASSET_GROUPS),
  debts: clone(DEFAULT_DEBT_GROUPS),
  income: clone(DEFAULT_INCOME_GROUPS),
});

// 고유 key 생성
function uid(prefix) {
  const rand = Math.random().toString(36).slice(2, 6);
  return prefix + Date.now().toString(36) + rand;
}
export const newGroupKey = () => uid('g');
export const newItemKey = () => uid('i');

// 평면(구버전) 또는 혼합 리스트를 그룹 구조로 정규화한다.
// - 이미 items가 있으면 그대로(누락 key만 보정)
// - items가 없으면(구버전 평면 카테고리) 옛 key를 항목 key로 보존한 단일 항목 그룹으로 변환
//   → 기존 entry 값이 그대로 유지된다.
export function toGroups(list) {
  return (Array.isArray(list) ? list : []).map((c) => {
    if (Array.isArray(c.items)) {
      return {
        key: c.key || newGroupKey(),
        label: c.label ?? '',
        items: c.items.map((it) => ({ key: it.key || newItemKey(), label: it.label ?? '' })),
      };
    }
    return {
      key: newGroupKey(),
      label: c.label ?? '',
      items: [{ key: c.key || newItemKey(), label: c.label ?? '' }],
    };
  });
}
