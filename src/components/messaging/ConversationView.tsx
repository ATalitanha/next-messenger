'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Smile, X } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';

const reactions = ['❤️', '😂', '😮', '👍', '👎'];

export default function ConversationView({ conversationId }: { conversationId: string }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const messages = useStore((state) => state.messages[conversationId] || []);
  const { addMessage, addOfflineMessage, isConnected, setConnected } = useStore();
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<any>(null);
  const { getToken } = useAuth();

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  useEffect(() => {
    const handleOnline = async () => {
      setConnected(true);
      const offlineMessages = useStore.getState().offlineMessages;
      if (offlineMessages.length > 0) {
        const token = await getToken();
        for (const message of offlineMessages) {
          await fetch(`/api/conversations/${message.conversationId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              content: message.content,
              replyToId: message.replyToId,
            }),
          });
        }
        useStore.getState().clearOfflineMessages();
      }
    };
    const handleOffline = () => setConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setConnected, getToken]);

  useEffect(() => {
    if (conversationId) {
      const eventSource = new EventSource('/api/events');

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'message' && data.conversationId === conversationId) {
          addMessage(data);
        }
      };

      return () => {
        eventSource.close();
      };
    }
  }, [conversationId, addMessage]);

  useEffect(() => {
    async function fetchMessages() {
      if (conversationId) {
        const res = await fetch(`/api/conversations/${conversationId}/messages`);
        const data = await res.json();
        data.forEach(addMessage);
      }
    }

    fetchMessages();
  }, [conversationId, addMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const temporaryId = Date.now().toString();
    const message = {
      id: temporaryId,
      conversationId,
      content: newMessage,
      replyToId: replyTo?.id,
      sender: { name: 'Me' },
      createdAt: new Date().toISOString(),
    };

    if (isConnected) {
      addMessage(message);
      const token = await getToken();
      await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newMessage,
          replyToId: replyTo?.id,
        }),
      });
    } else {
      addOfflineMessage(message);
    }
    setNewMessage('');
    setReplyTo(null);
  };

  const handleReaction = async (messageId: string, content: string) => {
    const token = await getToken();
    await fetch(
      `/api/conversations/${conversationId}/messages/${messageId}/reactions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      }
    );
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="p-4 flex flex-col h-full">
      {!isConnected && (
        <div className="bg-yellow-500 text-center p-2 rounded mb-4">
          You are offline. Messages will be sent when you reconnect.
        </div>
      )}
      <div ref={parentRef} className="flex-grow overflow-y-auto">
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const message = messages[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <ContextMenu key={message.id}>
                  <ContextMenuTrigger>
                    <div className="mb-2 group relative p-2 rounded hover:bg-muted">
                      {message.replyTo && (
                        <div className="text-sm text-muted-foreground p-2 bg-background rounded mb-1">
                          Replying to <strong>{message.replyTo.sender.name || message.replyTo.sender.handle}</strong>: {message.replyTo.content}
                        </div>
                      )}
                      <strong>{message.sender.name || message.sender.handle}:</strong> {message.content}
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Smile className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-1">
                            <div className="flex space-x-1">
                              {reactions.map((reaction) => (
                                <Button
                                  key={reaction}
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleReaction(message.id, reaction)}
                                >
                                  {reaction}
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex space-x-1 mt-1">
                        {message.reactions?.map((reaction: any) => (
                          <div key={reaction.id} className="bg-muted rounded-full px-2 py-1 text-xs">
                            {reaction.content} {reaction._count.userId}
                          </div>
                        ))}
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => setReplyTo(message)}>Reply</ContextMenuItem>
                    <ContextMenuItem onClick={() => handleCopy(message.content)}>Copy</ContextMenuItem>
                    <ContextMenuItem>Edit</ContextMenuItem>
                    <ContextMenuItem>Delete</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </div>
            );
          })}
        </div>
      </div>
      <div className="relative">
        {replyTo && (
          <div className="absolute bottom-full left-0 right-0 bg-muted p-2 rounded-t flex justify-between items-center">
            <div>
              Replying to <strong>{replyTo.sender.name || replyTo.sender.handle}</strong>: {replyTo.content}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setReplyTo(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow"
            disabled={!isConnected}
          />
          <Button type="submit" disabled={!isConnected}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
