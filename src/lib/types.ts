export interface MeasurementResult {
  id: number;
  heartRate: number;
  spo2: number;
  temperature: number;
  motionLevel: number;
  createdAt: string;
  status: "ok" | "elevated" | "warning";
  score: number;
}
