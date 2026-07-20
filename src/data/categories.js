// 기본 카테고리. 사용자가 추가/이름변경/삭제 가능.

export const DEFAULT_ASSET_CATS = [
  { key: 'deposit', label: '예금' },
  { key: 'savings', label: '적금' },
  { key: 'stock', label: '주식' },
  { key: 'coin', label: '코인' },
  { key: 'realestate', label: '부동산' },
  { key: 'etcAsset', label: '기타자산' },
];

export const DEFAULT_DEBT_CATS = [
  { key: 'mortgage', label: '주택담보대출' },
  { key: 'etcDebt', label: '기타부채' },
];

export const defaultCats = () => ({
  assets: DEFAULT_ASSET_CATS.map((c) => ({ ...c })),
  debts: DEFAULT_DEBT_CATS.map((c) => ({ ...c })),
});

// 새 카테고리용 고유 key 생성.
export function newCatKey() {
  const rand = Math.random().toString(36).slice(2, 6);
  return 'c' + Date.now().toString(36) + rand;
}
