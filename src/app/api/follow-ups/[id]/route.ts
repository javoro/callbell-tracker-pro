import { getById, update, remove } from '@/lib/storage';
import type { CreateFollowUpInput } from '@/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const followUp = getById(id);
  if (!followUp) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(followUp);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as Partial<CreateFollowUpInput>;
  const updated = update(id, body);
  if (!updated) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const success = remove(id);
  if (!success) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ success: true });
}
