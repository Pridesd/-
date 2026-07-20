import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import Card, { CardTitle } from './Card.jsx';
import ChartTooltip from './ChartTooltip.jsx';
import { colors } from '../styles/tokens.js';
import { eokAxis, fmtAxisDate } from '../lib/format.js';

export default function ChangeCard({ rows }) {
  const data = useMemo(
    () =>
      rows
        .filter((r) => r.delta !== null)
        .map((r) => ({ date: r.date, delta: r.delta })),
    [rows],
  );

  if (data.length === 0) {
    return (
      <Card>
        <CardTitle>직전 대비 증감</CardTitle>
        <div style={{ color: colors.secondary, fontSize: 14, padding: '8px 0' }}>
          증감을 계산할 데이터가 부족합니다.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>직전 대비 증감</CardTitle>
      <div style={{ height: 180, marginLeft: -8, marginRight: -8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: colors.secondary }}
              tickFormatter={fmtAxisDate}
              axisLine={false}
              tickLine={false}
              minTickGap={16}
            />
            <YAxis
              tick={{ fontSize: 11, fill: colors.secondary }}
              tickFormatter={eokAxis}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <ReferenceLine y={0} stroke={colors.separator} />
            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} content={<ChartTooltip valueLabel="증감" />} />
            <Bar dataKey="delta" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {data.map((d) => (
                <Cell key={d.date} fill={d.delta >= 0 ? colors.green : colors.red} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
