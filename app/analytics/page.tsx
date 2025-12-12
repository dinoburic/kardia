"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

type Measurement = {
  id: number;
  createdAt: string;
  heartRate: number;
  spo2: number;
  temperature: number; // This value is now correctly assumed to be Room Temperature
  motionLevel: number;
  status?: string;
  score?: number;
};

interface MetricSummary {
  avg: number | null;
  min: number | null;
  max: number | null;
}

// Generic Chart Component (kept the same)
function MetricLineChart({
  title,
  color,
  labels,
  values,
  unit,
}: {
  title: string;
  color: string;
  labels: string[];
  values: number[];
  unit?: string;
}) {
  const data = {
    labels,
    datasets: [
      {
        label: `${title}${unit ? ` (${unit})` : ""}`,
        data: values,
        borderColor: color,
        backgroundColor: `${color}33`,
        tension: 0.4,
        fill: true,
        pointRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#f9fafb",
        bodyColor: "#e5e7eb",
        displayColors: false,
      },
    },
    scales: {
      x: {
        ticks: { color: "#6b7280" },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#6b7280" },
        grid: { color: "#e5e7eb" },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="h-40">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // --- DATA LOADING useEffect ---
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/measurements");
        const json = await res.json();
        const list = Array.isArray(json) ? json : json.measurements;

        if (Array.isArray(list)) {
          setMeasurements(
            list.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
          );
        }
      } catch (err) {
        console.error("Failed to load measurements", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // --- AI INSIGHT GENERATION useEffect ---
  useEffect(() => {
    if (!loading && measurements.length > 0) {
      setLoadingInsight(true);
      setAiInsight(null);

      async function generateInsight() {
        try {
          const res = await fetch("/api/insight", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            // We still send the raw data, but the backend AI prompt should be adjusted
            // to treat 'temperature' as 'room temperature'.
            body: JSON.stringify({ measurements }),
          });

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          
          const { insight } = await res.json();

          if (typeof insight === 'string') {
            setAiInsight(insight);
          } else {
             setAiInsight("Data analysis failed. Please try again later.");
          }

        } catch (err) {
          console.error("Failed to fetch AI insight", err);
          setAiInsight(
            "Error retrieving AI Insight. Displaying general recommendations."
          );
        } finally {
          setLoadingInsight(false);
        }
      }

      generateInsight();
    } else if (!loading && measurements.length === 0) {
        setAiInsight("Not enough data yet. Perform a few measurements to generate insights.");
    }
  }, [loading, measurements]);


  // --- Data preparation (kept the same) ---
  const labels = useMemo(
    () =>
      measurements.map((m) =>
        new Date(m.createdAt).toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      ),
    [measurements]
  );

  const heartValues = measurements.map((m) => m.heartRate);
  const spo2Values = measurements.map((m) => m.spo2);
  const tempValues = measurements.map((m) => m.temperature);
  const motionValues = measurements.map((m) => m.motionLevel);

  const makeSummary = (values: number[]): MetricSummary => {
    if (!values.length) return { avg: null, min: null, max: null };
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { avg, min: Math.min(...values), max: Math.max(...values) };
  };

  const heartSummary = useMemo(() => makeSummary(heartValues), [heartValues]);
  const spo2Summary = useMemo(() => makeSummary(spo2Values), [spo2Values]);
  const tempSummary = useMemo(() => makeSummary(tempValues), [tempValues]);
  const motionSummary = useMemo(() => makeSummary(motionValues), [motionValues]);

  // Use AI insight or a loading/placeholder message
  const displayInsight = loadingInsight 
    ? "Generating AI Insight..." 
    : aiInsight || "No insight available.";


  return (
    <div className="min-h-screen bg-[#f5f7fa] p-8 md:ml-60">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Analytics</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Detailed analysis of heart rate, oxygen saturation, room temperature, and activity patterns.
        </p>
      </header>

      {loading ? (
        <div className="text-gray-500">Loading data...</div>
      ) : !measurements.length ? (
        <div className="bg-white rounded-2xl shadow p-6 text-gray-500">
          No measurements available. Start a measurement session to see analytics.
        </div>
      ) : (
        <>
          {/* TOP SUMMARY CARDS */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SummaryCard title="Avg BPM" value={heartSummary.avg} unit="bpm" healthyRange="60–90" />
            <SummaryCard title="Avg SpO₂" value={spo2Summary.avg} unit="%" healthyRange="96–100" />
            {/* CORRECTED TITLE and HealthyRange for Room Temperature */}
            <SummaryCard title="Avg Room Temp" value={tempSummary.avg} unit="°C" healthyRange="20–24" /> 
            <SummaryCard title="Avg Motion" value={motionSummary.avg} unit="%" healthyRange="20–60" />
          </section>

          {/* CHARTS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <MetricLineChart title="Heart Rate" color="#ef4444" labels={labels} values={heartValues} unit="bpm" />
            <MetricLineChart title="SpO₂" color="#3b82f6" labels={labels} values={spo2Values} unit="%" />
            {/* CORRECTED CHART TITLE */}
            <MetricLineChart title="Room Temperature" color="#f97316" labels={labels} values={tempValues} unit="°C" />
            <MetricLineChart title="Motion Level" color="#8b5cf6" labels={labels} values={motionValues} unit="%" />
          </section>

          {/* AI INSIGHT */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Kardia Insight (AI-Generated)
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {displayInsight}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Heart Health Recommendations
              </h3>
              <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                <li>Maintain regular moderate physical activity.</li>
                <li>Avoid excessive caffeine and late meals.</li>
                <li>Get 7–8 hours of sleep each night.</li>
                <li>Stay hydrated throughout the day.</li>
                <li>Track symptoms such as chest pressure, dizziness, or irregular heartbeat.</li>
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// SummaryCard component (kept the same)
function SummaryCard({
  title,
  value,
  unit,
  healthyRange,
}: {
  title: string;
  value: number | null;
  unit: string;
  healthyRange: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex flex-col">
      <span className="text-xs text-gray-500 mb-1">{title}</span>
      <span className="text-2xl font-semibold text-gray-800">
        {value !== null ? `${value.toFixed(1)} ${unit}` : "--"}
      </span>
      <span className="text-[11px] text-gray-400 mt-1">
        Ideal: {healthyRange}
      </span>
    </div>
  );
}