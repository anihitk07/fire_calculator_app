import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface ChartDataPoint {
  year: number;
  balance: number;
  fireNumber: number;
}

interface ProjectionChartProps {
  data: ChartDataPoint[];
}

export default function ProjectionChart({ data }: ProjectionChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const fireGoal = data[0]?.fireNumber || 0;
  const milestone25 = fireGoal * 0.25;
  const milestone50 = fireGoal * 0.5;
  const milestone75 = fireGoal * 0.75;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="year"
          stroke="#9CA3AF"
          tick={{ fill: '#9CA3AF' }}
        />
        <YAxis
          tickFormatter={formatCurrency}
          stroke="#9CA3AF"
          tick={{ fill: '#9CA3AF' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '0.5rem',
            color: 'white',
          }}
          formatter={(value: number | undefined) => value ? [`$${value.toLocaleString()}`, ''] : ['', '']}
          labelFormatter={(label) => `Age ${label}`}
        />
        <Legend wrapperStyle={{ color: '#9CA3AF' }} />
        <ReferenceLine
          y={milestone25}
          stroke="#6b7280"
          strokeDasharray="3 3"
          strokeOpacity={0.5}
          label={{ value: '25%', fill: '#6b7280', position: 'insideTopLeft', fontSize: 11 }}
        />
        <ReferenceLine
          y={milestone50}
          stroke="#6b7280"
          strokeDasharray="3 3"
          strokeOpacity={0.6}
          label={{ value: '50%', fill: '#6b7280', position: 'insideTopLeft', fontSize: 11 }}
        />
        <ReferenceLine
          y={milestone75}
          stroke="#6b7280"
          strokeDasharray="3 3"
          strokeOpacity={0.7}
          label={{ value: '75%', fill: '#6b7280', position: 'insideTopLeft', fontSize: 11 }}
        />
        <ReferenceLine
          y={fireGoal}
          stroke="#10b981"
          strokeDasharray="5 5"
          label={{ value: 'FIRE Goal', fill: '#10b981', position: 'insideTopRight' }}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#f97316"
          strokeWidth={3}
          name="Projected Balance"
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
