export default function StatCard({
  label,
  value,
  icon,
  accent = "brand",
}: {
  label: string;
  value: string;
  icon: string;
  accent?: "brand" | "gold";
}) {
  return (
    <div className="card flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
          accent === "gold" ? "bg-gold-500/15" : "bg-brand-500/10"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-brand-500">{label}</p>
        <p className="text-xl font-semibold text-brand-950">{value}</p>
      </div>
    </div>
  );
}
