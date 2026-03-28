'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FollowUpCard from '@/components/FollowUpCard';
import type { FollowUp, FollowUpStatus } from '@/types';

type FilterTab = 'all' | FollowUpStatus;

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'in-progress', label: 'En Progreso' },
  { key: 'completed', label: 'Completados' },
];

export default function Home() {
  const router = useRouter();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);

  async function fetchFollowUps() {
    setLoading(true);
    try {
      const res = await fetch('/api/follow-ups');
      const data = await res.json();
      setFollowUps(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const filtered =
    activeTab === 'all' ? followUps : followUps.filter((f) => f.status === activeTab);

  const stats = {
    total: followUps.length,
    pending: followUps.filter((f) => f.status === 'pending').length,
    inProgress: followUps.filter((f) => f.status === 'in-progress').length,
    completed: followUps.filter((f) => f.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Callbell Tracker Pro</h1>
          </div>
          <button
            onClick={() => router.push('/follow-ups/new')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Nuevo Seguimiento
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-700', bg: 'bg-white' },
            { label: 'Pendientes', value: stats.pending, color: 'text-yellow-700', bg: 'bg-yellow-50' },
            { label: 'En Progreso', value: stats.inProgress, color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Completados', value: stats.completed, color: 'text-green-700', bg: 'bg-green-50' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl border border-gray-100 p-4 shadow-sm`}>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className={`text-sm font-medium ${s.color}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No hay seguimientos</p>
            <p className="text-gray-300 text-sm mt-1">Crea uno nuevo para comenzar</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((f) => (
              <FollowUpCard key={f.id} followUp={f} onDeleted={fetchFollowUps} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
