'use client';

export function PrivacyPanel() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Privacy Dashboard
      </h2>

      {/* Privacy Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Data Status
        </h3>

        <StatusItem
          icon="🔒"
          title="Encryption Status"
          status="Active"
          description="All your records are encrypted with AES-256-GCM"
          statusColor="green"
        />

        <StatusItem
          icon="🔑"
          title="Keys Location"
          status="Local Browser Only"
          description="Your private key never leaves your device"
          statusColor="green"
        />

        <StatusItem
          icon="🌐"
          title="Server Access"
          status="Zero Knowledge"
          description="Server can only see encrypted data"
          statusColor="green"
        />

        <StatusItem
          icon="🤖"
          title="AI Processing"
          status="De-identified"
          description="AI sees only anonymized data (no dates, names, or PHI)"
          statusColor="green"
        />
      </div>

      {/* Data Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Controls
        </h3>

        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💾</span>
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white">
                  Export All Data
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Download all your records and keys
                </div>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔄</span>
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white">
                  Backup Keys
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Save your recovery keys securely
                </div>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🗑️</span>
              <div className="text-left">
                <div className="font-medium text-red-600 dark:text-red-400">
                  Delete All Data
                </div>
                <div className="text-sm text-red-500 dark:text-red-400">
                  Permanently remove all records and keys
                </div>
              </div>
            </div>
            <span className="text-red-400">→</span>
          </button>
        </div>
      </div>

      {/* Sharing */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Active Share Links
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          No active share links. You can create time-limited encrypted links to share your records.
        </p>
      </div>

      {/* Compliance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Compliance & Security
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <ComplianceItem title="HIPAA" status="Compliant" />
          <ComplianceItem title="End-to-End Encryption" status="AES-256-GCM" />
          <ComplianceItem title="Key Management" status="RSA-2048" />
          <ComplianceItem title="Audit Logging" status="Enabled" />
        </div>
      </div>
    </div>
  );
}

function StatusItem({
  icon,
  title,
  status,
  description,
  statusColor,
}: {
  icon: string;
  title: string;
  status: string;
  description: string;
  statusColor: 'green' | 'yellow' | 'red';
}) {
  const colors = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <div className="font-medium text-gray-900 dark:text-white">{title}</div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[statusColor]}`}>
            {status}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function ComplianceItem({ title, status }: { title: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <span className="text-gray-700 dark:text-gray-300">{title}</span>
      <span className="font-medium text-gray-900 dark:text-white">{status}</span>
    </div>
  );
}
