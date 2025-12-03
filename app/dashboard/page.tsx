import ChartPlaceholder from "./components/ChartPlaceholder";
import MetricCard from "./components/MetricCard";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#f5f7fa] p-8">
      {/* Dashboard Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-semibold text-gray-800">Kardia Dashboard</h1>

        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red-600 transition">Logout</button>
        </form>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricCard title="Heart Rate" value={72} unit="bpm" color="text-red-500" />
        <MetricCard title="SpO2" value="97" unit="%" color="text-blue-600" />
        <MetricCard title="Temperature" value="36.8" unit="°C" color="text-teal-600" />
        <MetricCard title="Movement Level" value={12} unit="%" color="text-purple-600" />
      </div>

      {/* Chart Placeholder */}
      < ChartPlaceholder />

      {/* Future sections */}
      <div className="mt-10 text-gray-500 text-sm text-center">
        More insights coming soon...
      </div>
    </div>
  );
}
