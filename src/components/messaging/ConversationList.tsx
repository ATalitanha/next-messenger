'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function ConversationList({ onSelectConversation }: { onSelectConversation: (conversationId: string) => void }) {
  const conversations = useStore((state) => state.conversations);
  const setConversations = useStore((state) => state.setConversations);

  useEffect(() => {
    async function fetchConversations() {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      setConversations(data);
    }

    fetchConversations();
  }, [setConversations]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Conversations</h2>
      <ul>
        {conversations.map((conversation: any) => (
          <li
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className="p-2 cursor-pointer hover:bg-muted rounded"
          >
            {conversation.title || conversation.participants.map((p: any) => p.user.name || p.user.handle).join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}
