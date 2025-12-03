"use client";

interface MetrciCardProps {
  title: string;
  value: string | number;
  unit?: string;
  color?: string;
}

export default function MetricCard({ title, value, unit, color = "bg-blue-500" }: MetrciCardProps) {
  return (
    <div className="p-5 bg-white rounded-xl shadow-sm border hover:shadow-md transition">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className={`text-3xl font-semibold mt-1 ${color}`}>
        {value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </h2>
    </div>
        );
}