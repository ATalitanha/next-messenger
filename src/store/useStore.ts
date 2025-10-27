import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { del, get, set } from 'idb-keyval';

interface Store {
  conversations: any[];
  messages: { [conversationId: string]: any[] };
  offlineMessages: any[];
  isConnected: boolean;
  setConversations: (conversations: any[]) => void;
  addMessage: (message: any) => void;
  addOfflineMessage: (message: any) => void;
  clearOfflineMessages: () => void;
  setConnected: (isConnected: boolean) => void;
}

const storage = {
  getItem: async (name: string) => {
    const value = await get(name);
    return value ? JSON.stringify(value) : null;
  },
  setItem: async (name: string, value: string) => {
    await set(name, JSON.parse(value));
  },
  removeItem: async (name: string) => {
    await del(name);
  },
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      conversations: [],
      messages: {},
      offlineMessages: [],
      isConnected: true,
      setConversations: (conversations) => set({ conversations }),
      addMessage: (message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [message.conversationId]: [
              ...(state.messages[message.conversationId] || []),
              message,
            ],
          },
        })),
      addOfflineMessage: (message) =>
        set((state) => ({
          offlineMessages: [...state.offlineMessages, message],
        })),
      clearOfflineMessages: () => set({ offlineMessages: [] }),
      setConnected: (isConnected) => set({ isConnected }),
    }),
    {
      name: 'secure-messenger-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);
