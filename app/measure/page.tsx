"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { MeasurementResult } from "@/lib/types";

export default function MeasurePage() {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [result, setResult] = useState<MeasurementResult | null>(null);
  const [error, setError] = useState(false);

  const measureNow = async () => {
    setIsMeasuring(true);
    setResult(null);
    setError(false);

    await new Promise((res) => setTimeout(res, 4500));

    try {
      const res = await fetch("/api/measurements/live", { method: "GET" });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data: MeasurementResult = await res.json();
      setResult(data);
    } catch (e) {
      setError(true);
    } finally {
      setIsMeasuring(false);
    }
  };

  const showNoDataMessage = !isMeasuring && !result && error;

  return (
    <div className="min-h-screen px-8 py-10 bg-[#f5f7fa] text-gray-700">

      <h1 className="text-4xl font-semibold mb-8">Measure</h1>

      <div className="flex flex-col items-center mb-10">

        <button
          onClick={measureNow}
          disabled={isMeasuring}
          className={`px-10 py-4 rounded-full text-white text-xl font-semibold transition 
            ${isMeasuring ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"}`}
        >
          {isMeasuring ? "Measuring..." : "Measure"}
        </button>

        {isMeasuring && (
          <div className="mt-8 flex items-center justify-center">
            <Heart
              className="w-24 h-24 text-red-500 animate-pulse"
              strokeWidth={1.2}
            />
          </div>
        )}
      </div>

      {showNoDataMessage && (
        <div className="bg-red-100 p-4 rounded-lg shadow-md max-w-xl mx-auto text-center border border-red-300">
            <p className="text-red-700 font-medium">Measurement failed: No data received after 5 seconds.</p>
        </div>
      )}

      {result && (
        <div className="bg-white p-6 rounded-2xl shadow-md max-w-xl mx-auto space-y-4">

          <h2 className="text-2xl font-semibold text-center mb-4">
            Measurement Results
          </h2>

          <div className="grid grid-cols-2 gap-6 text-lg">
            <div>
              <p className="text-gray-400 text-sm">Heart Rate</p>
              <p className="font-semibold text-red-500">{result.heartRate} bpm</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">SpO₂</p>
              <p className="font-semibold text-blue-500">{result.spo2}%</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Temperature</p>
              <p className="font-semibold text-teal-600">{result.temperature}°C</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Motion Level</p>
              <p className="font-semibold text-purple-600">{result.motionLevel}</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">Heart Status</p>

            <p
              className={`text-2xl font-bold ${
                result.status === "ok"
                  ? "text-green-600"
                  : result.status === "elevated"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {result.status.toUpperCase()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}