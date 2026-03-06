import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import ConversationList from "../components/messages/ConversationList";
import ChatView from "../components/messages/ChatView";

export default function Messages() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: conversations, isLoading: loadingConvs } = useQuery({
    queryKey: ["conversations", currentUser?.email],
    queryFn: async () => {
      const all = await base44.entities.Conversation.list("-last_message_at");
      return all.filter((c) => c.participant_emails?.includes(currentUser.email));
    },
    enabled: !!currentUser?.email,
    initialData: [],
    refetchInterval: 5000,
  });

  const { data: allProfiles } = useQuery({
    queryKey: ["profilesForMessages"],
    queryFn: () => base44.entities.Profile.filter({ is_complete: true }),
    enabled: conversations.length > 0,
    initialData: [],
  });

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", selectedConversation?.id],
    queryFn: () => base44.entities.Message.filter({ conversation_id: selectedConversation.id }, "created_date"),
    enabled: !!selectedConversation,
    initialData: [],
    refetchInterval: 3000,
  });

  const otherEmail = selectedConversation?.participant_emails?.find((e) => e !== currentUser?.email);
  const otherProfile = allProfiles?.find((p) => p.user_email === otherEmail);

  if (loadingConvs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto md:grid md:grid-cols-[320px_1fr] md:h-[calc(100vh-80px)]">
        {/* Conversation list */}
        <div className={`md:border-r border-slate-100 md:block ${selectedConversation ? "hidden" : "block"}`}>
          <div className="p-4 border-b border-slate-100">
            <h1 className="text-xl font-bold text-[#1B2A4A]">Messages</h1>
          </div>
          <ConversationList
            conversations={conversations}
            profiles={allProfiles}
            currentEmail={currentUser?.email}
            onSelect={setSelectedConversation}
            selectedId={selectedConversation?.id}
          />
        </div>

        {/* Chat */}
        <div className={`md:block ${selectedConversation ? "block" : "hidden"} h-full`}>
          {selectedConversation ? (
            <ChatView
              conversation={selectedConversation}
              messages={messages}
              currentEmail={currentUser?.email}
              otherProfile={otherProfile}
              onBack={() => setSelectedConversation(null)}
              onMessageSent={() => {
                queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation.id] });
                queryClient.invalidateQueries({ queryKey: ["conversations"] });
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}