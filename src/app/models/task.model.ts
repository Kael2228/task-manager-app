export enum Priority {
  low = 'low',
  medium = 'medium',
  high = 'high'
}

export enum Status {
  todo = 'todo',
  in_progress = 'in_progress',
  done = 'done'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  assignedUser: string;
  attachments: string[];
  completedAt?: Date | null;
}

