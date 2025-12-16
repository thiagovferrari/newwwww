export enum Priority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta'
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  priority: Priority;
  createdAt: number;
}

export interface AIResponse {
  improvedTitle: string;
  improvedDescription: string;
  suggestedPriority: Priority;
}
