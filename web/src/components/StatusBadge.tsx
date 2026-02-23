const STATUS_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: 'Pending', color: 'text-tile-present', bg: 'bg-tile-present/20' },
  1: { label: 'Active', color: 'text-brand', bg: 'bg-brand/20' },
  2: { label: 'Completed', color: 'text-tile-correct', bg: 'bg-tile-correct/20' },
  3: { label: 'Cancelled', color: 'text-error', bg: 'bg-error/20' },
};

export function StatusBadge({ status }: { status: number }) {
  const config = STATUS_CONFIG[status] ?? { label: 'Unknown', color: 'text-text-muted', bg: 'bg-bg-surface' };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${config.color} ${config.bg}`}>
      {config.label}
    </span>
  );
}
