interface StatCardProps {
  label: string;
  value: string;
  color?: "red" | "green" | "white";
}

export function StatCard({ label, value, color = "white" }: StatCardProps) {
  const colorClass = {
    red: "text-red-500",
    green: "text-green-500",
    white: "text-white",
  }[color];

  return (
    <div className="bg-surface rounded-xl p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-bold mt-1 ${colorClass}`}>{value}</div>
    </div>
  );
}
