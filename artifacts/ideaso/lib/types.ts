export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  isInbox: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type AIAction =
  | "summarize"
  | "cleanup"
  | "to-tasks"
  | "outline"
  | "expand"
  | "key-points"
  | "title"
  | "brainstorm"
  | "fix-grammar"
  | "meeting-notes";

export interface AIActionResult {
  action: AIAction;
  input: string;
  output: string;
  createdAt: string;
}
