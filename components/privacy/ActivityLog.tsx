'use client';

import { useState, useEffect } from 'react';
import { AuditLog } from '@/lib/types';
import { format } from 'date-fns';

export function ActivityLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const response = await fetch('/api/logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading activity log...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Activity Log
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Immutable audit trail of all actions on your data
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No activity yet
            </div>
          ) : (
            logs.map((log) => (
              <LogItem key={log.id} log={log} />
            ))
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-xl">🔐</span>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Cryptographically Secured
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Each log entry is hashed and chained to the previous entry, making it tamper-evident.
              No PHI (Personal Health Information) is stored in logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogItem({ log }: { log: AuditLog }) {
  const getEventIcon = (event: string) => {
    const icons: Record<string, string> = {
      upload: '📤',
      analyze: '🧠',
      share: '🔗',
      access: '👁️',
      delete: '🗑️',
    };
    return icons[event] || '📋';
  };

  const getEventLabel = (event: string) => {
    const labels: Record<string, string> = {
      upload: 'Uploaded record',
      analyze: 'AI analysis',
      share: 'Created share link',
      access: 'Accessed data',
      delete: 'Deleted record',
    };
    return labels[event] || event;
  };

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-start gap-4">
        <span className="text-2xl">{getEventIcon(log.event)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-medium text-gray-900 dark:text-white">
              {getEventLabel(log.event)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
          {log.metadata && typeof log.metadata === 'object' && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {JSON.stringify(log.metadata, null, 2)
                .replace(/[{}"]/g, '')
                .split('\n')
                .filter(Boolean)
                .join(' • ')}
            </div>
          )}
          {log.currentHash && (
            <div className="mt-2 text-xs font-mono text-gray-400 dark:text-gray-500 truncate">
              Hash: {log.currentHash.slice(0, 16)}...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
