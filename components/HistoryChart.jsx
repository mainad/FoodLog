import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

export default function HistoryChart({ data }) {
  // data: [{ date: '2025-08-01', calories: 1500 }]
  return (
    <div style={{ width: '100%', height: 160 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="calories" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
