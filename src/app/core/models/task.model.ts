export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  contactId: string;
  dealId: string | null;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  description: string;
  assignedTo: string;
  createdAt: string;
}

export interface TaskFormValue {
  title: string;
  contactId: string;
  dealId: string | null;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  description: string;
  assignedTo: string;
}
