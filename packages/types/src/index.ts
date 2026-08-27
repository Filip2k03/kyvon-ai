export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: 'engineer' | 'architect' | 'cto';
  isActive: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  messages: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinking?: string;
  createdAt: string;
  metaInfo?: Record<string, any>;
}

export interface MemoryItem {
  id: string;
  category: 'preferences' | 'tech_stack' | 'projects' | 'goals' | 'decisions' | 'past_problems';
  layer: 'working' | 'long_term' | 'knowledge';
  key: string;
  value: string;
  confidence: number;
}
