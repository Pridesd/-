import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ArrowUp, ArrowDown } from 'lucide-react';
import Card from './Card.jsx';
import ChartTooltip from './ChartTooltip.jsx';
import { colors, bigNumber } from '../styles/tokens.js';
import { comma, eokAxis, signed, fmtAxisDate } from '../lib/format.js';

export default function Hero({ rows }) {
  const last = rows.length ? rows[rows.length - 1] : null;
  const data = useMemo(
    () => rows.map((r) => ({ date: r.date, net: r.net })),
    [rows],
  );

  if (!last) {
    return (
      <Card style={{ padding: 24 }}>
        <div style={{ color: colors.secondary, fontSize: 16, textAlign: 'center' }}>
          아직 기록이 없습니다. 아래에서 첫 달을 입력해 보세요.
        </div>
      </Card>
    );
  }

  const up = (last.delta ?? 0) >= 0;
  const deltaColor = last.delta === null ? colors.secondary : up ? colors.green : colors.red;

  return (
    <Card style={{ padding: 'clamp(18px, 5vw, 24px)' }}>
      <div style={{ fontSize: 15, color: colors.secondary, marginBottom: 6 }}>순자산</div>
      <div
        style={{
          ...bigNumber,
          fontSize: 'clamp(30px, 9vw, 44px)',
          color: colors.label,
          lineHeight: 1.08,
          wordBreak: 'keep-all',
        }}
      >
        {comma(last.net)}
        <span style={{ fontSize: 'clamp(16px, 4.5vw, 22px)', fontWeight: 600, color: colors.secondary, marginLeft: 6, whiteSpace: 'nowrap' }}>
          원
        </span>
      </div>

      {last.delta !== null && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {up ? <ArrowUp size={18} color={deltaColor} /> : <ArrowDown size={18} color={deltaColor} />}
          <span style={{ fontSize: 16, fontWeight: 600, color: deltaColor, fontVariantNumeric: 'tabular-nums' }}>
            {signed(last.delta)}원
          </span>
          {last.deltaRate !== null && (
            <span style={{ fontSize: 16, fontWeight: 600, color: deltaColor, fontVariantNumeric: 'tabular-nums' }}>
              ({last.deltaRate >= 0 ? '+' : ''}
              {(last.deltaRate * 100).toFixed(1)}%)
            </span>
          )}
          <span style={{ fontSize: 14, color: colors.tertiary, marginLeft: 2 }}>직전 대비</span>
        </div>
      )}

      <div style={{ height: 180, marginTop: 18, marginLeft: -8, marginRight: -8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.blue} stopOpacity={0.22} />
                <stop offset="100%" stopColor={colors.blue} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={colors.separator} strokeDasharray="0" opacity={0.4} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: colors.secondary }}
              tickFormatter={fmtAxisDate}
              axisLine={false}
              tickLine={false}
              minTickGap={20}
            />
            <YAxis
              tick={{ fontSize: 11, fill: colors.secondary }}
              tickFormatter={eokAxis}
              axisLine={false}
              tickLine={false}
              width={44}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<ChartTooltip valueLabel="순자산" />} />
            <Area
              type="monotone"
              dataKey="net"
              stroke={colors.blue}
              strokeWidth={2.5}
              fill="url(#netFill)"
              dot={false}
              activeDot={{ r: 4, fill: colors.blue, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
