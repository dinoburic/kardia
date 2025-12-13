import Link from "next/link";

export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center px-6">
      
      <section className="text-center max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#111111] font-[family-name:var(--font-geist-sans)]">
          Kardia
        </h1>

        <p className="mt-4 text-xl text-gray-600">
          Smart heart health monitoring powered by AI
        </p>

        <p className="mt-6 text-gray-500 leading-relaxed">
          Kardia combines real-time biometric data, intelligent insights and
          intuitive analytics to help you understand and improve your heart
          health — every single day.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            Get Started
          </Link>

          <Link
            href="/about"
            className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
          >
            Learn More
          </Link>
        </div>
      </section>

      <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        <Feature
          title="Live Monitoring"
          description="Track heart rate, SpO₂, temperature and motion in real time using smart sensors."
        />
        <Feature
          title="AI Insights"
          description="Understand what your data means with personalized AI-driven health insights."
        />
        <Feature
          title="Actionable Analytics"
          description="Visual dashboards that transform raw measurements into clear health signals."
        />
      </section>

      <footer className="mt-24 text-sm text-gray-400">
        © {new Date().getFullYear()} Kardia · Built for smarter heart care
      </footer>
    </div>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
