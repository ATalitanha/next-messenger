'use client';

import { useState } from 'react';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import Header from '@/components/auth/Header';
import ConversationList from '@/components/messaging/ConversationList';
import ConversationView from '@/components/messaging/ConversationView';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';

export default function Home() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-grow">
        <SignedIn>
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={25}>
              <ConversationList onSelectConversation={setSelectedConversation} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={75}>
              {selectedConversation ? (
                <ConversationView conversationId={selectedConversation} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p>Select a conversation to start messaging</p>
                </div>
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        </SignedIn>
        <SignedOut>
          <div className="flex h-full items-center justify-center">
            <h2 className="text-2xl">Sign in to start messaging</h2>
          </div>
        </SignedOut>
      </div>
    </main>
  );
}
