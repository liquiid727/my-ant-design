import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { ChatMessage, ChatSession } from '../types';
import { StorageService } from '../services/storage';

type ChatState = {
  messages: ChatMessage[];
  sessions: ChatSession[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => ChatMessage;
  updateMessage: (id: string, content: string) => void;
  clearSession: () => void;
};

const sessionTitle = (messages: ChatMessage[]) => messages.find((message) => message.role === 'user')?.content.slice(0, 40) || 'New chat';

const persist = (messages: ChatMessage[], sessions: ChatSession[]) => {
  StorageService.set('chat_messages', messages);
  StorageService.set('chat_sessions', sessions);
};

export const useChatStore = create<ChatState>((set) => ({
  messages: StorageService.get<ChatMessage[]>('chat_messages', []),
  sessions: StorageService.get<ChatSession[]>('chat_sessions', []),

  addMessage: (message) => {
    const next: ChatMessage = { ...message, id: nanoid(), createdAt: new Date().toISOString() };
    set((state) => {
      const messages = [...state.messages, next];
      const now = new Date().toISOString();
      const sessions = [
        {
          id: 'default',
          title: sessionTitle(messages),
          messages,
          createdAt: state.sessions[0]?.createdAt ?? now,
          updatedAt: now,
        },
        ...state.sessions.filter((session) => session.id !== 'default'),
      ];
      persist(messages, sessions);
      return { messages, sessions };
    });
    return next;
  },

  updateMessage: (id, content) =>
    set((state) => {
      const messages = state.messages.map((message) => (message.id === id ? { ...message, content } : message));
      const sessions = state.sessions.map((session) =>
        session.id === 'default' ? { ...session, title: sessionTitle(messages), messages, updatedAt: new Date().toISOString() } : session,
      );
      persist(messages, sessions);
      return { messages, sessions };
    }),

  clearSession: () => {
    persist([], []);
    set({ messages: [], sessions: [] });
  },
}));
