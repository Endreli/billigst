interface StatCardProps {
  label: string;
  value: string;
  color?: "red" | "green" | "white";
}

export function StatCard({ label, value, color = "white" }: StatCardProps) {
  const colorClass = {
    red: "text-red-500",
    green: "text-primary",
    white: "text-white",
  }[color];

  return (
    <div className="bg-surface rounded-card p-5">
      <div className="text-[13px] text-text-muted uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-bold mt-1.5 ${colorClass}`}>{value}</div>
    </div>
  );
}
