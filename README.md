# 자산 장부

개인 순자산 트래커 웹앱. 은행/마이데이터 자동 연동 없이 **매달 잔고를 직접 입력**하면
순자산 추이 · 자산 구성 · 목표 진행을 Apple(iOS) 스타일 대시보드로 보여줍니다.

## 원칙

- **100% 클라이언트 사이드.** 백엔드/서버/DB/로그인/계정이 없습니다.
- **데이터는 이 브라우저의 `localStorage`에만 저장됩니다.** 외부 네트워크 요청을 전혀
  보내지 않으며(시세·애널리틱스·트래킹·폰트 CDN 포함), 오프라인에서 완전히 동작합니다.
- **AI/LLM 기능 없음.** 챗봇·요약·추천 등 어떤 AI 호출도 포함하지 않은 깨끗한 베이스라인입니다.
- **은행/증권 연동 없음.** 오직 수기 입력.
- 금액 단위는 **만원**, UI는 한국어.

## 실행 방법

이 프로젝트는 [pnpm](https://pnpm.io)을 사용합니다.

```bash
pnpm install
pnpm dev      # 개발 서버
pnpm build    # 프로덕션 빌드 (dist/)
pnpm preview  # 빌드 결과 미리보기
```

`pnpm dev` 실행 후 안내되는 주소(기본 http://localhost:5173)를 브라우저에서 엽니다.
최초 실행 시 시드 데이터로 대시보드가 채워집니다.

## 데이터 저장 & 백업

- 모든 데이터는 **이 브라우저에만** 저장됩니다. 브라우저 데이터를 지우거나 다른
  기기/브라우저에서 열면 데이터가 보이지 않습니다.
- 백업하려면 우측 상단 **내보내기**로 `자산장부_YYYY-MM-DD.json` 파일을 받아 두세요.
- 복원은 **불러오기**로 그 JSON 파일을 선택하면 됩니다.

저장 키: `ledger:entries:v1`, `ledger:cats:v1`, `ledger:goal:v1`, `ledger:goaldate:v1`

## 기능

- 순자산 히어로 카드(추이 영역 차트) + 전월 대비 증감
- 하이라이트 배지(역대 최고 순자산 · 올해 YTD · 최고 증가월)
- 목표 순자산/목표 날짜 진행률과 속도 판정("순조"/"속도 부족"), 도달 예상 시점
- 총자산/총부채/부채 비율 요약
- **2단계 구조: 묶음(그룹) → 상세 상품(항목).** 예: `저축 > 자유입출금/예금/적금…`,
  `투자 > 미국주식/ETF/가상화폐…`. 그룹 합계는 항목 값의 합으로 자동 계산됩니다.
- 자산 구성 도넛 + 그룹별 비중(금액·%)
- 월별 증감 막대(양수 초록/음수 빨강)
- 월별 기록 리스트(탭하면 수정 폼 로드, 삭제 지원)
- 입력 폼: 그룹별 소계 표시, 다음 달 자동 지정 + 지난달 값 프리필, 같은 달 덮어쓰기
- 항목 편집: 자산/부채 그룹과 상세 항목을 추가·이름변경·삭제
- 기존 평면 데이터는 열 때 자동으로 그룹 구조로 마이그레이션(값 보존)
- 데이터 내보내기/가져오기, 전체 기록 삭제(2단계 확인)

## 기술 스택

Vite + React, [recharts](https://recharts.org), [lucide-react](https://lucide.dev).
스타일은 인라인 스타일 + iOS 디자인 토큰(`src/styles/tokens.js`), 시스템 SF 폰트만 사용.

## 파일 구조

```
src/
  App.jsx                # 상태 오케스트레이션 + 레이아웃
  main.jsx
  components/            # Hero, Highlights, GoalCard, SummaryCard,
                         # CompositionCard, ChangeCard, RecordsList,
                         # EntryForm, CategoryEditor, Card, ChartTooltip
  lib/  storage.js       # localStorage 래퍼 + 내보내기/가져오기
        format.js        # 금액/날짜 포맷 유틸
        derive.js        # entries → 파생 rows/하이라이트
  data/ seed.js          # 최초 실행 시드
        categories.js    # 기본 카테고리
  styles/ tokens.js      # 색/폰트 토큰
```
