import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Medical Disclaimer Banner */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3">
        <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center max-w-4xl mx-auto">
          ⚠️ <strong>AI Health Vault does not provide medical advice.</strong> All AI summaries are for educational purposes only.
          Always consult a qualified healthcare provider for diagnosis or treatment.
        </p>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI Health Vault
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Your health data, encrypted and explained.
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            A privacy-first platform where you can upload or sync your health records,
            store them securely with end-to-end encryption, and use explainable AI to understand your results.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-24 grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🔒"
            title="End-to-End Encryption"
            description="Your data is encrypted before upload. Only you hold the decryption key."
          />
          <FeatureCard
            icon="🧠"
            title="AI Explanations"
            description="Understand your lab results with plain-language AI summaries and trend analysis."
          />
          <FeatureCard
            icon="📊"
            title="Visual Insights"
            description="Track your health metrics over time with interactive charts and timelines."
          />
          <FeatureCard
            icon="🔗"
            title="FHIR Integration"
            description="Connect to MyChart, LabCorp, and other providers via SMART on FHIR."
          />
          <FeatureCard
            icon="⌚"
            title="Wearable Sync"
            description="Import daily summaries from Apple Health, Google Fit, and more."
          />
          <FeatureCard
            icon="🔐"
            title="Privacy Controls"
            description="Granular sharing, time-limited links, and complete audit trails."
          />
        </div>

        {/* Privacy Promise */}
        <div className="mt-24 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Our Privacy Promise
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-gray-600 dark:text-gray-300">
            <div className="flex gap-3">
              <span className="text-2xl">✓</span>
              <div>
                <strong className="block text-gray-900 dark:text-white">Zero-Knowledge Architecture</strong>
                Your data is encrypted before it reaches our servers
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">✓</span>
              <div>
                <strong className="block text-gray-900 dark:text-white">HIPAA Compliant</strong>
                Enterprise-grade security and compliance controls
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">✓</span>
              <div>
                <strong className="block text-gray-900 dark:text-white">Full Transparency</strong>
                See exactly where your data is and who accessed it
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">✓</span>
              <div>
                <strong className="block text-gray-900 dark:text-white">You Own Your Data</strong>
                Export or delete everything at any time
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
