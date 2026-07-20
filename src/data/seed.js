// 최초 실행 시 채우는 시드 데이터. 값은 "항목 key" 단위.
// 가독성을 위해 여기서는 "만원"으로 적고, 저장 시 storage.initIfEmpty()에서 원(×10,000)으로 환산된다.
// 기본 그룹/항목(data/categories.js)에 맞춰 구성되어 있다.
// date는 "YYYY-MM-DD" (일 단위). 잔액(자산/부채)은 저량, 수입(급여/이자/배당)은 흐름.

export const SEED_ENTRIES = [
  {
    date: '2024-09-01',
    i_free: 300, i_emergency: 100, i_deposit: 200, i_saving: 100, i_house: 40,
    i_kr_stock: 150, i_us_stock: 450, i_etf: 300, i_fund: 400, i_cash: 500, i_coin: 400,
    i_irp: 120, i_realestate: 30000, i_gold: 60,
    i_mortgage: 15200, i_credit: 30,
    i_salary: 320, i_interest: 3, i_dividend: 12,
  },
  {
    date: '2024-10-01',
    i_free: 340, i_emergency: 100, i_deposit: 200, i_saving: 130, i_house: 46,
    i_kr_stock: 160, i_us_stock: 500, i_etf: 320, i_fund: 450, i_cash: 550, i_coin: 450,
    i_irp: 132, i_realestate: 30000, i_gold: 70,
    i_mortgage: 15100, i_credit: 25,
    i_salary: 320, i_interest: 3, i_dividend: 0,
  },
  {
    date: '2024-11-01',
    i_free: 360, i_emergency: 100, i_deposit: 200, i_saving: 160, i_house: 52,
    i_kr_stock: 140, i_us_stock: 520, i_etf: 340, i_fund: 470, i_cash: 600, i_coin: 300,
    i_irp: 144, i_realestate: 30000, i_gold: 80,
    i_mortgage: 15100, i_credit: 10,
    i_salary: 320, i_interest: 4, i_dividend: 8,
  },
  {
    date: '2024-12-01',
    i_free: 390, i_emergency: 100, i_deposit: 200, i_saving: 190, i_house: 58,
    i_kr_stock: 180, i_us_stock: 560, i_etf: 360, i_fund: 490, i_cash: 680, i_coin: 520,
    i_irp: 156, i_realestate: 30500, i_gold: 85,
    i_mortgage: 15000, i_credit: 10,
    i_salary: 520, i_interest: 4, i_dividend: 30,
  },
  {
    date: '2025-01-01',
    i_free: 420, i_emergency: 100, i_deposit: 200, i_saving: 150, i_house: 62,
    i_kr_stock: 205, i_us_stock: 600, i_etf: 377, i_fund: 500, i_cash: 734, i_coin: 678,
    i_irp: 168, i_realestate: 30500, i_gold: 90,
    i_mortgage: 14900, i_credit: 20,
    i_salary: 330, i_interest: 5, i_dividend: 10,
  },
];
