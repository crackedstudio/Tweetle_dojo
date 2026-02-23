export function ProvingBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-brand py-2">
      <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-semibold text-secondary">
        Generating ZK proof...
      </span>
    </div>
  );
}
