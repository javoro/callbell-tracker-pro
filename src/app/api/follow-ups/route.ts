import { getAll, create } from '@/lib/storage';
import type { CreateFollowUpInput } from '@/types';

export async function GET() {
  const all = getAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return Response.json(all);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CreateFollowUpInput>;
  const { contactName, contactPhone, title } = body;

  if (!contactName || !contactPhone || !title) {
    return Response.json(
      { error: 'contactName, contactPhone, and title are required' },
      { status: 400 }
    );
  }

  const followUp = create({
    contactName,
    contactPhone,
    title,
    notes: body.notes ?? '',
    status: body.status ?? 'pending',
    priority: body.priority ?? 'medium',
    dueDate: body.dueDate ?? null,
  });

  return Response.json(followUp, { status: 201 });
}
