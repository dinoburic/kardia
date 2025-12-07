// src/lib/heart.ts

export type MeasurementInput = {
  heartRate: number;
  spo2: number;
  temperature: number; // °C
  motionLevel: number; // 0–1
};

export type HeartEvaluation = {
  status: "OK" | "ELEVATED" | "WARNING";
  score: number; // 0–100
  reasons: string[]; // za AI insight
};

// Ovo NIJE medicinska dijagnoza – samo heuristika za projekt
export function evaluateMeasurement(input: MeasurementInput): HeartEvaluation {
  const { heartRate, spo2, temperature, motionLevel } = input;

  let score = 100;
  const reasons: string[] = [];

  // 1) Bazni opseg otkucaja (pretpostavimo odraslu osobu u mirovanju)
  // ako ima dosta kretanja (motionLevel > 0.6), dopuštamo viši puls
  const isResting = motionLevel < 0.3;

  if (isResting) {
    if (heartRate < 50) {
      score -= 20;
      reasons.push("Heart rate is quite low while resting.");
    } else if (heartRate < 60) {
      score -= 5;
      reasons.push("Heart rate is slightly below typical resting range.");
    } else if (heartRate > 100 && heartRate <= 110) {
      score -= 10;
      reasons.push("Heart rate is slightly elevated while resting.");
    } else if (heartRate > 110) {
      score -= 25;
      reasons.push("Heart rate is high while resting.");
    }
  } else {
    // kod aktivnosti
    if (heartRate > 160) {
      score -= 20;
      reasons.push("Heart rate is very high with activity.");
    }
  }

  // 2) SpO2 (tipično normalno >= 95%)
  if (spo2 < 90) {
    score -= 35;
    reasons.push("SpO₂ is very low.");
  } else if (spo2 < 93) {
    score -= 20;
    reasons.push("SpO₂ is below optimal range.");
  } else if (spo2 < 95) {
    score -= 10;
    reasons.push("SpO₂ is slightly below normal.");
  }

  // 3) Temperatura – sobna, indirektno utiče, ali možemo je blago uzeti
  if (temperature > 28) {
    score -= 5;
    reasons.push("Ambient temperature is higher, which may increase heart rate.");
  } else if (temperature < 15) {
    score -= 5;
    reasons.push("Ambient temperature is low, which may affect circulation.");
  }

  // 4) Motion – jako visok motion + visok BPM = vjerovatno ok vježbanje
  if (!isResting && heartRate < 70) {
    score -= 5;
    reasons.push("Low heart rate despite movement – might be sensor noise.");
  }

  // Normalizuj score u [0,100]
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  let status: "OK" | "ELEVATED" | "WARNING" = "OK";

  if (score < 60) status = "WARNING";
  else if (score < 80) status = "ELEVATED";

  return { status, score, reasons };
}
