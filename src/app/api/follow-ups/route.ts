import { getAll, create } from '@/lib/storage';
import type { CreateFollowUpInput, FollowUpStatus, FollowUpPriority } from '@/types';

const VALID_STATUSES: FollowUpStatus[] = ['pending', 'in-progress', 'completed'];
const VALID_PRIORITIES: FollowUpPriority[] = ['low', 'medium', 'high'];

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

  const status = body.status ?? 'pending';
  const priority = body.priority ?? 'medium';

  if (!VALID_STATUSES.includes(status)) {
    return Response.json({ error: `Invalid status: ${status}` }, { status: 400 });
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    return Response.json({ error: `Invalid priority: ${priority}` }, { status: 400 });
  }

  const followUp = create({
    contactName,
    contactPhone,
    title,
    notes: body.notes ?? '',
    status,
    priority,
    dueDate: body.dueDate ?? null,
  });

  return Response.json(followUp, { status: 201 });
}
