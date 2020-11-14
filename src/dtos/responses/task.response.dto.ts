import { TaskStatus } from '@taskmanager/enums';
import { User } from '@taskmanager/entities';

export interface TaskResponse {
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  user: User;
}
