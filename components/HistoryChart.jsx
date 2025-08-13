import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
export default function HistoryChart({ data }) {
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
