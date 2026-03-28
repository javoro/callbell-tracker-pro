export type FollowUpStatus = 'pending' | 'in-progress' | 'completed';
export type FollowUpPriority = 'low' | 'medium' | 'high';

export interface FollowUp {
  id: string;
  contactName: string;
  contactPhone: string;
  title: string;
  notes: string;
  status: FollowUpStatus;
  priority: FollowUpPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFollowUpInput {
  contactName: string;
  contactPhone: string;
  title: string;
  notes: string;
  status: FollowUpStatus;
  priority: FollowUpPriority;
  dueDate: string | null;
}
