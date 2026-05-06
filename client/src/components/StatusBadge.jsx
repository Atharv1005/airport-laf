const STATUS_CONFIG = {
  ACTIVE:   { color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  CLAIMED:  { color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',         dot: 'bg-blue-400' },
  EXPIRED:  { color: 'text-red-400 bg-red-400/10 border-red-400/20',            dot: 'bg-red-400' },
  DISPOSED: { color: 'text-gray-400 bg-gray-400/10 border-gray-400/20',         dot: 'bg-gray-400' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border font-display ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}
