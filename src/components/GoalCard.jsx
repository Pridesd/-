import Card, { CardTitle } from './Card.jsx';
import { colors, radius, font } from '../styles/tokens.js';
import { won, comma, addMonths, monthsBetween, ymOf } from '../lib/format.js';
import { monthlyAvgDelta } from '../lib/derive.js';
import useIsNarrow from '../lib/useIsNarrow.js';

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  border: 'none',
  outline: 'none',
  background: colors.bg,
  borderRadius: radius.inner,
  padding: '10px 12px',
  fontSize: 16,
  fontFamily: font,
  color: colors.label,
  fontVariantNumeric: 'tabular-nums',
};

const labelStyle = { fontSize: 13, color: colors.secondary, marginBottom: 6, display: 'block' };

export default function GoalCard({ rows, goal, goalDate, onGoal, onGoalDate }) {
  const isNarrow = useIsNarrow();
  const last = rows.length ? rows[rows.length - 1] : null;
  const net = last ? last.net : 0;
  const avg = monthlyAvgDelta(rows); // 월 환산 평균 증감

  const hasGoal = goal > 0;
  const remaining = Math.max(0, goal - net);
  const pct = hasGoal ? Math.min(100, Math.max(0, (net / goal) * 100)) : 0;
  const reached = hasGoal && net >= goal;

  let barColor = colors.blue;
  if (reached) barColor = colors.green;

  // 상태 메시지 계산
  let statusNode = null;
  if (hasGoal && !reached && last) {
    if (goalDate) {
      const monthsLeft = monthsBetween(ymOf(last.date), goalDate);
      if (monthsLeft <= 0) {
        statusNode = (
          <Note tone={colors.orange}>
            목표일이 이미 지났습니다. 목표 날짜를 다시 설정해 보세요.
          </Note>
        );
      } else {
        const needPerMonth = remaining / monthsLeft;
        const onTrack = avg !== null && avg >= needPerMonth;
        statusNode = (
          <div style={{ marginTop: 12 }}>
            <Line>
              목표일({goalDate})까지 매달 약{' '}
              <b style={{ color: colors.label }}>{comma(Math.ceil(needPerMonth))}원</b> 필요
            </Line>
            {avg !== null && (
              <Line>
                최근 저축 평균 <b style={{ color: colors.label }}>{comma(Math.round(avg))}원</b> /월
              </Line>
            )}
            <div style={{ marginTop: 8 }}>
              {avg === null ? (
                <Badge tone={colors.secondary}>기록이 더 쌓이면 속도를 판정합니다</Badge>
              ) : onTrack ? (
                <Badge tone={colors.green}>순조</Badge>
              ) : (
                <Badge tone={colors.orange}>속도 부족</Badge>
              )}
            </div>
          </div>
        );
      }
    } else {
      // 목표 날짜 없음 → 도달 예상
      if (avg !== null && avg > 0) {
        const months = Math.ceil(remaining / avg);
        const eta = addMonths(ymOf(last.date), months);
        statusNode = (
          <Note tone={colors.secondary}>
            이 속도면 약 <b style={{ color: colors.label }}>{months}개월</b> 후 ·{' '}
            <b style={{ color: colors.label }}>{eta}</b> 도달 예상
          </Note>
        );
      } else {
        statusNode = (
          <Note tone={colors.secondary}>
            최근 증가 추세가 없어 도달 시점을 예상할 수 없습니다.
          </Note>
        );
      }
    }
  }

  return (
    <Card>
      <CardTitle>목표</CardTitle>

      <div style={{ display: 'grid', gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>목표 순자산 (원)</label>
          <input
            type="number"
            inputMode="numeric"
            value={goal || ''}
            placeholder="예: 500000000"
            onChange={(e) => onGoal(e.target.value === '' ? 0 : Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>목표 날짜 (선택)</label>
          <input
            type="month"
            value={goalDate || ''}
            onChange={(e) => onGoalDate(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {hasGoal && (
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: barColor, fontVariantNumeric: 'tabular-nums' }}>
              {reached ? '목표 달성 🎉' : `${pct.toFixed(1)}%`}
            </span>
            <span style={{ fontSize: 14, color: colors.secondary, fontVariantNumeric: 'tabular-nums' }}>
              {reached ? `목표 ${won(goal)}` : `남은 ${won(remaining)}`}
            </span>
          </div>
          <div
            style={{
              height: 10,
              borderRadius: 999,
              background: colors.bg,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.max(reached ? 100 : pct, 2)}%`,
                height: '100%',
                borderRadius: 999,
                background: barColor,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          {statusNode}
        </div>
      )}
    </Card>
  );
}

function Note({ children, tone }) {
  return (
    <p style={{ margin: '12px 0 0', fontSize: 14, color: tone, lineHeight: 1.5 }}>{children}</p>
  );
}

function Line({ children }) {
  return (
    <p style={{ margin: '0 0 4px', fontSize: 14, color: colors.secondary, lineHeight: 1.5 }}>
      {children}
    </p>
  );
}

function Badge({ children, tone }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '5px 12px',
        borderRadius: 999,
        background: tone + '1A',
        color: tone,
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}
