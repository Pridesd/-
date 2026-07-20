// 금액 단위는 "원". won()은 콤마 + "원"으로 표기한다.

const safe = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
};

// 정수 콤마. (원 단위 값)
export function comma(n) {
  const v = safe(n);
  return Math.round(v).toLocaleString('ko-KR');
}

// 원 단위 금액 표기 — 콤마 + "원". 음수/NaN 안전.
export function won(n) {
  return comma(n) + '원';
}

// 부호 표기 (+/-). 0은 부호 없음.
export function signed(n) {
  const v = safe(n);
  if (v > 0) return '+' + comma(v);
  if (v < 0) return '-' + comma(Math.abs(v));
  return comma(0);
}

// y축 라벨용 — "억" 단위 소수 1자리 (예: 1.8억). 원 값 입력.
export function eokAxis(wonValue) {
  const v = safe(wonValue);
  const e = v / 1e8; // 1억 = 100,000,000원
  if (Math.abs(e) >= 100) return `${Math.round(e)}억`;
  // 소수 첫째자리, 불필요한 .0 제거
  const s = e.toFixed(1).replace(/\.0$/, '');
  return `${s}억`;
}

// "YYYY-MM" → 다음 달
export function nextMonth(ym) {
  return addMonths(ym, 1);
}

// "YYYY-MM"에 n개월 더하기 (음수 가능)
export function addMonths(ym, n) {
  const [y, m] = String(ym).split('-').map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return ym;
  const base = y * 12 + (m - 1) + n;
  const ny = Math.floor(base / 12);
  const nm = (base % 12 + 12) % 12;
  return `${String(ny).padStart(4, '0')}-${String(nm + 1).padStart(2, '0')}`;
}

// b - a (개월 수). a, b 모두 "YYYY-MM".
export function monthsBetween(a, b) {
  const [ay, am] = String(a).split('-').map(Number);
  const [by, bm] = String(b).split('-').map(Number);
  if (![ay, am, by, bm].every(Number.isFinite)) return 0;
  return by * 12 + (bm - 1) - (ay * 12 + (am - 1));
}

// 현재 달 "YYYY-MM" (로컬 기준). 저장/네트워크와 무관, 폼 기본값용.
export function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// 오늘 "YYYY-MM-DD" (로컬 기준). 폼 기본값용.
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// "YYYY-MM-DD" → "YYYY-MM" (월 단위 계산용)
export function ymOf(date) {
  return String(date).slice(0, 7);
}

// 차트 축 라벨용 — "YYYY-MM-DD" → "MM/DD"
export function fmtAxisDate(date) {
  return String(date).slice(5).replace('-', '/');
}
