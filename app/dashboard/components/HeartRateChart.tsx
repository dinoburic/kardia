"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import React from "react";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

interface Props {
  dataPoints: number[];
}

export default function HeartRateChart({ dataPoints }: Props) {
  if (!dataPoints || dataPoints.length === 0) {
    return (
      <div className="w-full h-56 flex items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  const labels = dataPoints.map((_, i) => `M${i + 1}`);

  const data = {
    labels,
    datasets: [
      {
        label: "Heart Rate",
        data: dataPoints,
        borderColor: "#6c8bff",
        backgroundColor: "rgba(108,139,255,0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#6c8bff",
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          boxWidth: 12,
          color: "#6b7280",
        },
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#fff",
        bodyColor: "#e5e7eb",
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: { color: "#6b7280" },
        grid: { color: "#e5e7eb" },
      },
      x: {
        ticks: { color: "#6b7280" },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="w-full h-56">
      <Line data={data} options={options} />
    </div>
  );
}
