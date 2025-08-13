export default function ProgressBar({ label, value=0, target=0 }) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeTarget = Number.isFinite(target) && target > 0 ? target : 0;
  const pct = safeTarget ? Math.min(200, (safeValue / safeTarget) * 100) : 0;
  const color = pct <= 100 ? 'bg-emerald-400' : pct <= 120 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="py-1">
      <div className="flex justify-between text-xs text-gray-600">
        <div>{label}</div>
        <div>{Math.round(safeValue)} / {safeTarget ? Math.round(safeTarget) : '-'}{label.includes('(mg)') ? ' mg' : ''}</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mt-1 overflow-hidden">
        <div className={`h-3 ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}
