'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FollowUp, FollowUpStatus, FollowUpPriority } from '@/types';

export default function EditFollowUpPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [followUp, setFollowUp] = useState<FollowUp | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    params.then(({ id }) =>
      fetch(`/api/follow-ups/${id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          setFollowUp(data);
          setLoading(false);
        })
    );
  }, [params]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!followUp) return;
    setError('');
    setSubmitting(true);

    const form = e.currentTarget;
    const data = {
      contactName: (form.elements.namedItem('contactName') as HTMLInputElement).value,
      contactPhone: (form.elements.namedItem('contactPhone') as HTMLInputElement).value,
      title: (form.elements.namedItem('title') as HTMLInputElement).value,
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value,
      status: (form.elements.namedItem('status') as HTMLSelectElement).value as FollowUpStatus,
      priority: (form.elements.namedItem('priority') as HTMLSelectElement).value as FollowUpPriority,
      dueDate: (form.elements.namedItem('dueDate') as HTMLInputElement).value || null,
    };

    try {
      const res = await fetch(`/api/follow-ups/${followUp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? 'Error al actualizar');
        return;
      }

      router.push('/');
    } catch {
      setError('Error de red. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Cargando...</div>;
  }

  if (!followUp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Seguimiento no encontrado</p>
          <button onClick={() => router.push('/')} className="mt-4 text-emerald-600 hover:underline text-sm">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">Editar Seguimiento</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del contacto *</label>
              <input name="contactName" required defaultValue={followUp.contactName} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
              <input name="contactPhone" required defaultValue={followUp.contactPhone} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input name="title" required defaultValue={followUp.title} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea name="notes" rows={3} defaultValue={followUp.notes} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select name="status" defaultValue={followUp.status} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
                <option value="pending">Pendiente</option>
                <option value="in-progress">En Progreso</option>
                <option value="completed">Completado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select name="priority" defaultValue={followUp.priority} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
              <input name="dueDate" type="date" defaultValue={followUp.dueDate ?? ''} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
