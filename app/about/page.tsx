export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fa] p-10 text-gray-700">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-10 border border-gray-200">
        
        <h1 className="text-4xl font-bold mb-6 text-gray-900">About Kardia</h1>

        <p className="text-lg text-gray-600 leading-relaxed mb-6">
          Kardia is an intelligent heart-health monitoring platform designed 
          to help you understand your cardiovascular patterns through real-time 
          sensor data, analytics, and AI-powered insights.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">
          Our Mission
        </h2>
        <p className="text-gray-600 leading-relaxed">
          We aim to make heart monitoring accessible, modern, and proactive. 
          By combining IoT devices with smart algorithms, Kardia gives users 
          meaningful feedback about their heart activity, stress levels, and 
          overall well-being — all in one simple dashboard.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">
          How It Works
        </h2>
        <ul className="list-disc ml-6 text-gray-600 leading-relaxed space-y-2">
          <li>IoT sensors capture heart rate, SpO₂, temperature, and motion activity.</li>
          <li>The platform analyzes patterns and detects potential abnormalities.</li>
          <li>AI models generate insights based on trends and overall heart condition.</li>
          <li>Users receive easy-to-understand feedback and health recommendations.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">
          Why Choose Kardia?
        </h2>
        <ul className="list-disc ml-6 text-gray-600 leading-relaxed space-y-2">
          <li>Accurate sensor-based measurement.</li>
          <li>Simple and intuitive dashboard.</li>
          <li>AI-enhanced decision support.</li>
          <li>Designed with reliability and ease-of-use in mind.</li>
        </ul>

        <div className="mt-10 p-5 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-center text-blue-700 font-medium text-lg">
            Kardia is here to support healthier living — one heartbeat at a time.
          </p>
        </div>

      </div>
    </div>
  );
}
