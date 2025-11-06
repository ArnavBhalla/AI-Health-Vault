'use client';

import { useState, useEffect } from 'react';
import { Record } from '@/lib/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function RecordsList() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    try {
      const response = await fetch('/api/records/list');
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExplain(recordId: string) {
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId }),
      });

      if (response.ok) {
        toast.success('AI explanation generated!');
        // Refresh records to show the new AI explanation
        await fetchRecords();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to generate explanation');
      }
    } catch (error) {
      console.error('Failed to generate explanation:', error);
      toast.error('Failed to generate explanation. Please try again.');
    }
  }

  async function handleDelete(recordId: string) {
    if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }

    const deletePromise = fetch('/api/records/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId }),
    }).then(async (response) => {
      if (response.ok) {
        await fetchRecords();
        return 'Record deleted successfully';
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete record');
      }
    });

    toast.promise(deletePromise, {
      loading: 'Deleting record...',
      success: (msg) => msg,
      error: (err) => err.message || 'Failed to delete record',
    });
  }

  async function handleExport(recordId: string) {
    const exportPromise = fetch('/api/records/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId }),
    }).then(async (response) => {
      if (response.ok) {
        const data = await response.json();

        // Create a downloadable JSON file
        const blob = new Blob([JSON.stringify(data.record, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `health-record-${recordId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return 'Record exported successfully';
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to export record');
      }
    });

    toast.promise(exportPromise, {
      loading: 'Exporting record...',
      success: (msg) => msg,
      error: (err) => err.message || 'Failed to export record',
    });
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div>
                    <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="mt-3 h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="flex gap-2 ml-4">
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No records yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Upload your first health record to get started
        </p>
        <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Upload Record
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Health Records
        </h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Filter
          </button>
          <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Sort
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {records.map((record: any) => (
          <RecordCard
            key={record.id}
            record={record}
            onExplain={handleExplain}
            onDelete={handleDelete}
            onExport={handleExport}
          />
        ))}
      </div>
    </div>
  );
}

function RecordCard({
  record,
  onExplain,
  onDelete,
  onExport
}: {
  record: any;
  onExplain: (recordId: string) => void;
  onDelete: (recordId: string) => void;
  onExport: (recordId: string) => void;
}) {
  const [explaining, setExplaining] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const metadata = record.metadata || {};
  const hasAI = record.aiExplanations && record.aiExplanations.length > 0;
  const aiExplanation = hasAI ? record.aiExplanations[0] : null;

  const getSeverityColor = (severity: number | undefined) => {
    if (severity === undefined) return 'gray';
    if (severity < 0) return 'blue';
    if (severity > 0) return 'orange';
    return 'green';
  };

  const severityColor = getSeverityColor(aiExplanation?.severity);

  async function handleExplain() {
    setExplaining(true);
    try {
      await onExplain(record.id);
    } finally {
      setExplaining(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">
              {record.type === 'lab' ? '🧪' : '📄'}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {metadata.labName || record.filename}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(record.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          {metadata.value && (
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metadata.value}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {metadata.unit}
                </span>
              </div>
              {metadata.range && (
                <div className="text-sm text-gray-500">
                  Normal: {metadata.range}
                </div>
              )}
              {aiExplanation && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium bg-${severityColor}-100 text-${severityColor}-800 dark:bg-${severityColor}-900/30 dark:text-${severityColor}-300`}
                >
                  {aiExplanation.trend}
                </span>
              )}
            </div>
          )}

          {aiExplanation && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <span className="text-lg">🧠</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    AI Insight
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {aiExplanation.summary}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 ml-4 relative">
          {!hasAI && (
            <button
              onClick={handleExplain}
              disabled={explaining}
              className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {explaining ? 'Analyzing...' : 'Explain'}
            </button>
          )}
          <button
            onClick={() => onExport(record.id)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Export record"
          >
            Export
          </button>
          <button
            onClick={() => onDelete(record.id)}
            className="px-3 py-1.5 text-sm border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Delete record"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
