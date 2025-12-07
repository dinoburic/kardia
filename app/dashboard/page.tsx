"use client";

import { useEffect, useState, useMemo } from "react";
import HeartRateChart from "./components/HeartRateChart";

type Measurement = {
  id: number;
  userId: number;
  createdAt: string;
  heartRate: number;
  spo2: number;
  temperature: number;
  motionLevel: number;
  status: string;
  score: number;
  source: string;
};


export default function Dashboard() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const today = new Date();

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/measurements");
      const data = await res.json();
      setMeasurements(data);
    }
    load();
  }, []);

  const groupByDay = useMemo(() => {
    const map = new Map();

    measurements.forEach((m) => {
      const d = new Date(m.createdAt);
      const key = d.toISOString().split("T")[0]; 

      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    });

    return map;
  }, [measurements]);

  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const [weekStart, setWeekStart] = useState(getMonday(new Date()));

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const latest = measurements[0];

  const currentBpm = latest?.heartRate ?? "-";
  const currentSpo2 = latest?.spo2 ?? "-";

  const selectedKey = selectedDay.toISOString().split("T")[0];
  const selectedMeasurements = groupByDay.get(selectedKey) ?? [];

  const bpmValues = selectedMeasurements.map((m: Measurement) => m.heartRate);

  const highestBpm = bpmValues.length ? Math.max(...bpmValues) : "-";
  const lowestBpm = bpmValues.length ? Math.min(...bpmValues) : "-";


  const weeklyMeasurements = measurements.filter((m) => {
    const d = new Date(m.createdAt);
    return d >= weekStart && d <= new Date(weekStart.getTime() + 6 * 86400000);
  });

  const weekAvg =
    weeklyMeasurements.reduce((sum, m) => sum + m.heartRate, 0) /
      weeklyMeasurements.length || 0;

  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(weekStart.getDate() - 7);

  const lastWeekEnd = new Date(weekStart);
  lastWeekEnd.setDate(weekStart.getDate() - 1);

  const lastWeekMeasurements = measurements.filter((m: Measurement) => {
    const d = new Date(m.createdAt);
    return d >= lastWeekStart && d <= lastWeekEnd;
  });

  const lastWeekAvg =
    lastWeekMeasurements.reduce((sum, m) => sum + m.heartRate, 0) /
      lastWeekMeasurements.length || 0;

  const percentageChange =
    lastWeekAvg !== 0
      ? (((weekAvg - lastWeekAvg) / lastWeekAvg) * 100).toFixed(1)
      : "0";

 
  const aiInsight = useMemo(() => {
    if (!latest) return "Waiting for data...";

    if (latest.spo2 < 92)
      return "⚠️ Low SpO₂ detected. Consider resting and deep breathing.";

    if (latest.heartRate > 110)
      return "Your heart rate is elevated. Reduce physical activity.";

    if (latest.motionLevel > 80)
      return "High movement detected — heart rhythm responding normally.";

    return "Your vitals look stable. Keep a balanced routine today.";
  }, [latest]);


  return (
    <div className="min-h-screen bg-[#f5f7fa] p-8 text-gray-700">

      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-semibold">Dashboard</h1>

        <div className="flex gap-10 text-lg">
          <div className="flex flex-col items-center">
            <p className="text-gray-500 text-sm">Current BPM</p>
            <p className="text-2xl font-semibold text-red-500">{currentBpm}</p>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-gray-500 text-sm">SpO₂</p>
            <p className="text-2xl font-semibold text-blue-500">
              {currentSpo2}%
            </p>
          </div>
        </div>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Stress Patterns Overview</h2>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={prevWeek}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            ←
          </button>

          <span className="text-gray-400 text-sm">
            {weekStart.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>

          <button
            onClick={nextWeek}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            →
          </button>
        </div>

        <div className="flex gap-5 justify-between">
          {weekDays.map((date) => {
            const isSelected = isSameDay(date, selectedDay);

            return (
              <button
                key={date.toString()}
                onClick={() => setSelectedDay(date)}
                className={`flex flex-col items-center p-3 rounded-xl transition ${
                  isSelected
                    ? "bg-[#e4ecff] text-indigo-600 font-semibold"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">
                  {date.getDate().toString().padStart(2, "0")}
                </span>
                <span className="text-xs">
                  {date.toLocaleDateString("en-US", {
                    weekday: "short",
                  }).toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex mt-10 gap-10">
          <div className="relative w-40 h-40">
            <svg className="absolute inset-0" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e7eaf0"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#6c8bff"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * weekAvg) / 150}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-semibold">
                {Math.round((weekAvg / 150) * 100)}%
              </span>
              <p className="text-sm text-gray-500">Avg Stress Level</p>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold mb-1">Daily Stress Trends</h3>

            <div className="flex gap-10 text-sm mt-5">
              <div>
                <p className="text-gray-400">Highest Peak</p>
                <p className="font-semibold">{highestBpm} bpm</p>
              </div>

              <div>
                <p className="text-gray-400">Lowest Point</p>
                <p className="font-semibold">{lowestBpm} bpm</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Heart Rate</h2>
        <p className="text-gray-500 text-sm mb-6">
          Weekly heart rate trends based on your measurements.
        </p>

        <div className="grid grid-cols-2 gap-6">
          <HeartRateChart dataPoints={bpmValues} />

          <div className="flex flex-col gap-3 text-sm">
            <div>
              <p className="text-gray-400">Current Week Avg</p>
              <p className="text-xl font-semibold">{weekAvg.toFixed(1)} bpm</p>
            </div>

            <div>
              <p className="text-gray-400">Previous Week Avg</p>
              <p className="text-xl font-semibold">
                {lastWeekAvg.toFixed(1)} bpm
              </p>
            </div>

            <div>
              <p className="text-gray-400">Percentage Change</p>
              <p
                className={`font-semibold ${
                  Number(percentageChange) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {percentageChange}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-3">Kardia AI Insight</h2>
        <p className="text-gray-600">{aiInsight}</p>
      </div>
    </div>
  );
}
