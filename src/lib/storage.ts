import fs from 'fs';
import path from 'path';
import type { FollowUp, CreateFollowUpInput } from '@/types';

const DATA_FILE = process.env.DATA_FILE_PATH ?? path.join(process.cwd(), 'data', 'callbell-data.json');

export function readData(): FollowUp[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as FollowUp[];
  } catch {
    return [];
  }
}

export function writeData(data: FollowUp[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmpFile = DATA_FILE + '.tmp';
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
  try {
    fs.renameSync(tmpFile, DATA_FILE);
  } catch (err) {
    try { fs.unlinkSync(tmpFile); } catch { /* ignore cleanup errors */ }
    throw err;
  }
}

export function getAll(): FollowUp[] {
  return readData();
}

export function getById(id: string): FollowUp | undefined {
  return readData().find((f) => f.id === id);
}

export function create(input: CreateFollowUpInput): FollowUp {
  const data = readData();
  const now = new Date().toISOString();
  const followUp: FollowUp = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  data.push(followUp);
  writeData(data);
  return followUp;
}

export function update(id: string, input: Partial<CreateFollowUpInput>): FollowUp | undefined {
  const data = readData();
  const index = data.findIndex((f) => f.id === id);
  if (index === -1) return undefined;
  const updated: FollowUp = {
    ...data[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  data[index] = updated;
  writeData(data);
  return updated;
}

export function remove(id: string): boolean {
  const data = readData();
  const index = data.findIndex((f) => f.id === id);
  if (index === -1) return false;
  data.splice(index, 1);
  writeData(data);
  return true;
}
