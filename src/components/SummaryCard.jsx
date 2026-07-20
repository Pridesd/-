import Card, { Row } from './Card.jsx';
import { colors } from '../styles/tokens.js';
import { eok } from '../lib/format.js';

export default function SummaryCard({ row }) {
  if (!row) return null;
  const ratio = row.totalAssets > 0 ? (row.totalDebts / row.totalAssets) * 100 : 0;
  return (
    <Card>
      <Row label="총자산" value={`${eok(row.totalAssets)}만원`} />
      <Row label="총부채" value={`${eok(row.totalDebts)}만원`} valueColor={colors.red} />
      <Row
        label="부채 비율"
        value={`${ratio.toFixed(1)}%`}
        valueColor={ratio >= 50 ? colors.orange : colors.label}
        last
      />
    </Card>
  );
}
