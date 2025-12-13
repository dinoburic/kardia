# 🩺 Kardia: Heart Health Monitoring (Next.js + IoT)



Kardia is a Next.js and IoT project designed for **real-time heart health monitoring**. It utilizes an **ESP32 microcontroller** and **biomedical sensors** to collect physiological data, which is then processed, stored, and visualized using a modern web application stack.

This system provides users with **real-time physiological data**, trends visualization, and **AI-assisted insights** to help them better understand and manage their cardiovascular health.

## 🚀 Live Application

Experience the live application deployed on Vercel:

👉 **[https://kardia-theta.vercel.app/](https://kardia-theta.vercel.app/)**

---

## ⚙️ System Overview

Kardia is composed of three interconnected parts: the IoT Device, the Backend, and the Frontend. 

### 1. IoT Device


* **Microcontroller:** ESP32
* **Sensors:**
    * MAX30102 sensor for **Heart Rate (BPM)** and **SpO₂ (Oxygen Saturation)**.
    * Temperature sensor
    * PIR sensor for motion detection
* **Feedback:** OLED display for local feedback and RGB LED for real-time status indication.
* **Function:** Measures physiological data and sends it to the backend via Wi-Fi.

### 2. Backend

* **Framework:** Next.js API routes
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Function:** Receives measurements, stores them, evaluates heart health status, and exposes data for the frontend and AI insights.

### 3. Frontend

* **Framework:** Next.js
* **Styling:** Tailwind CSS
* **Visualization:** Chart.js
* **Function:** Provides interactive dashboards, analytics charts, real-time measurement feedback, and AI-based recommendations.

---

## ❤️ Health Data & Evaluation

The system monitors and evaluates the following key physiological parameters:

| Parameter | Unit | Indicator |
| :--- | :--- | :--- |
| **Heart Rate** | BPM | Primary cardiovascular indicator. |
| **SpO₂** | % | Oxygen saturation in blood. |
| **Temperature** | °C | Environmental/body influence on heart workload. |
| **Motion Level** | N/A | Physical activity context. |

These parameters are combined using proprietary logic (`lib/health-evaluation.js`) to determine whether the heart condition is **normal**, requires **attention**, or indicates **elevated risk**.

## 🧠 AI Insights

Kardia includes an AI module that analyzes sensor data trends to provide actionable information:

* **Explain Health Patterns:** Translates complex data trends into plain, understandable language.
* **Identify Risk Factors:** Highlights potential lifestyle or environmental factors influencing heart health.
* **Suggest Improvements:** Offers practical, personalized lifestyle recommendations.

> **Disclaimer:** AI insights are for informational purposes only and are **not intended for medical diagnosis.**

---

## 🛠️ Technology Stack

| Category | Component | Description |
| :--- | :--- | :--- |
| **Hardware** | ESP32 | Microcontroller for data acquisition and Wi-Fi. |
| **Hardware** | MAX30102 | Integrated pulse oximetry and heart-rate sensor. |
| **Frontend** | Next.js | React framework for web application development. |
| **Styling** | Tailwind CSS | Utility-first CSS framework for fast styling. |
| **Data Viz** | Chart.js | Flexible JavaScript charting library. |
| **Database** | PostgreSQL | Robust relational database for time-series data. |
| **ORM** | Prisma | Modern database toolkit for the backend. |
| **Deployment** | Vercel | Platform for Next.js application deployment. |

---


## ⚠️ Disclaimer

**Kardia is a student and research project created for educational purposes.** It is not a medical device, and the information provided should not be used as a replacement for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for any health concerns.

