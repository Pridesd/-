import Card, { Row } from './Card.jsx';
import { colors } from '../styles/tokens.js';
import { won } from '../lib/format.js';

export default function SummaryCard({ row }) {
  if (!row) return null;
  const ratio = row.totalAssets > 0 ? (row.totalDebts / row.totalAssets) * 100 : 0;
  const income = row.totalIncome || 0;
  return (
    <Card>
      <Row label="총자산" value={won(row.totalAssets)} />
      <Row label="총부채" value={won(row.totalDebts)} valueColor={colors.red} />
      <Row
        label="부채 비율"
        value={`${ratio.toFixed(1)}%`}
        valueColor={ratio >= 50 ? colors.orange : colors.label}
        last={income <= 0}
      />
      {income > 0 && (
        <Row label="총수입" value={won(income)} valueColor={colors.green} last />
      )}
    </Card>
  );
}
