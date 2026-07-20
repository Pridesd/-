// 금액 단위는 "만원". eok()은 억 + 만 조합으로 표기한다.

const safe = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
};

// 정수 콤마. (만원 단위 값)
export function comma(n) {
  const v = safe(n);
  return v.toLocaleString('ko-KR');
}

// 부호 표기 (+/-). 0은 부호 없음.
export function signed(n) {
  const v = safe(n);
  if (v > 0) return '+' + comma(v);
  if (v < 0) return '-' + comma(Math.abs(v));
  return comma(0);
}

// 만원 값을 "1억 8,430" 형태로. 음수/0/NaN 안전.
export function eok(manwon) {
  const v = Math.round(safe(manwon));
  const neg = v < 0;
  const abs = Math.abs(v);

  const eokPart = Math.floor(abs / 10000);
  const manPart = abs % 10000;

  let out;
  if (eokPart > 0 && manPart > 0) {
    out = `${comma(eokPart)}억 ${comma(manPart)}`;
  } else if (eokPart > 0) {
    out = `${comma(eokPart)}억`;
  } else {
    out = comma(manPart);
  }
  return (neg ? '-' : '') + out;
}

// y축 라벨용 — "억" 단위 소수 1자리 (예: 1.8억). 만원 값 입력.
export function eokAxis(manwon) {
  const v = safe(manwon);
  const e = v / 10000;
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

// 오늘 날짜 "YYYY-MM-DD" (로컬 기준). 거래 입력 폼 기본값용.
export function thisDay() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
