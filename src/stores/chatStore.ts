import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { ChatMessage } from '../types';
import { StorageService } from '../services/storage';

type ChatState = {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => ChatMessage;
  updateMessage: (id: string, content: string) => void;
  clearSession: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: StorageService.get<ChatMessage[]>('chat_messages', []),

  addMessage: (message) => {
    const next: ChatMessage = { ...message, id: nanoid(), createdAt: new Date().toISOString() };
    set((state) => {
      const messages = [...state.messages, next];
      StorageService.set('chat_messages', messages);
      return { messages };
    });
    return next;
  },

  updateMessage: (id, content) =>
    set((state) => {
      const messages = state.messages.map((message) => (message.id === id ? { ...message, content } : message));
      StorageService.set('chat_messages', messages);
      return { messages };
    }),

  clearSession: () => {
    StorageService.set('chat_messages', []);
    set({ messages: [] });
  },
}));

