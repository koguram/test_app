
export type MessageRole = 'user' | 'model';

export interface ChatMessage {
  role: MessageRole;
  text: string;
}

export interface CoachSummary {
  currentIssues: string;
  idealState: string;
  gap: string;
  leveragePoints: string[];
  actionFlow: string;
}

export interface User {
  email: string;
  password: string; // Numeric only, 5+ digits
}

export type AuthView = 'entry' | 'login' | 'register';
