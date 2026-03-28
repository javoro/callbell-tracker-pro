'use client';

import { useRouter } from 'next/navigation';
import type { FollowUp } from '@/types';

const statusLabel: Record<FollowUp['status'], string> = {
  pending: 'Pendiente',
  'in-progress': 'En Progreso',
  completed: 'Completado',
};

const statusColor: Record<FollowUp['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

const priorityLabel: Record<FollowUp['priority'], string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

const priorityColor: Record<FollowUp['priority'], string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-orange-100 text-orange-700',
  high: 'bg-red-100 text-red-700',
};

interface Props {
  followUp: FollowUp;
  onDeleted: () => void;
}

export default function FollowUpCard({ followUp, onDeleted }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${followUp.title}"?`)) return;
    await fetch(`/api/follow-ups/${followUp.id}`, { method: 'DELETE' });
    onDeleted();
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">{followUp.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {followUp.contactName} · {followUp.contactPhone}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => router.push(`/follow-ups/${followUp.id}/edit`)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[followUp.status]}`}>
          {statusLabel[followUp.status]}
        </span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${priorityColor[followUp.priority]}`}>
          Prioridad {priorityLabel[followUp.priority]}
        </span>
        {followUp.dueDate && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
            Vence: {new Date(followUp.dueDate + 'T00:00:00').toLocaleDateString('es-ES')}
          </span>
        )}
      </div>

      {followUp.notes && (
        <p className="text-sm text-gray-600 line-clamp-2">{followUp.notes}</p>
      )}
    </div>
  );
}
