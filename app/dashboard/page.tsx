'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadPanel } from '@/components/upload/UploadPanel';
import { RecordsList } from '@/components/dashboard/RecordsList';
import { PrivacyPanel } from '@/components/privacy/PrivacyPanel';
import { ActivityLog } from '@/components/privacy/ActivityLog';

type Tab = 'records' | 'upload' | 'privacy' | 'activity';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('records');
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleSignOut() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  function handleUploadSuccess() {
    // Switch to records tab and trigger refresh
    setActiveTab('records');
    setRefreshKey(prev => prev + 1);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Medical Disclaimer Banner */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3">
        <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center max-w-4xl mx-auto">
          ⚠️ <strong>Educational purposes only.</strong> AI Health Vault does not provide medical advice.
          Always consult a qualified healthcare provider.
        </p>
      </div>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Health Vault
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                🔒 End-to-end encrypted
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <TabButton
              active={activeTab === 'records'}
              onClick={() => setActiveTab('records')}
              icon="📊"
            >
              My Records
            </TabButton>
            <TabButton
              active={activeTab === 'upload'}
              onClick={() => setActiveTab('upload')}
              icon="📤"
            >
              Upload
            </TabButton>
            <TabButton
              active={activeTab === 'privacy'}
              onClick={() => setActiveTab('privacy')}
              icon="🔐"
            >
              Privacy
            </TabButton>
            <TabButton
              active={activeTab === 'activity'}
              onClick={() => setActiveTab('activity')}
              icon="📋"
            >
              Activity Log
            </TabButton>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'records' && <RecordsList key={refreshKey} />}
        {activeTab === 'upload' && <UploadPanel onUploadSuccess={handleUploadSuccess} />}
        {activeTab === 'privacy' && <PrivacyPanel />}
        {activeTab === 'activity' && <ActivityLog />}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
        ${
          active
            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
        }
      `}
    >
      <span>{icon}</span>
      {children}
    </button>
  );
}
