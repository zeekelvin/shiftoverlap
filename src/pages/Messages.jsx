import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import ConversationList from "../components/messages/ConversationList";
import ChatView from "../components/messages/ChatView";

export default function Messages() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  // Conversations (real-time)
  const { data: conversations, isLoading: loadingConvs } = useQuery({
    queryKey: ["conversations", currentUser?.email],
    queryFn: async () => {
      const all = await base44.entities.Conversation.list("-last_message_at");
      return all.filter((c) => c.participant_emails?.includes(currentUser.email));
    },
    enabled: !!currentUser?.email,
    initialData: [],
  });

  // Subscribe to conversation changes in real-time
  useEffect(() => {
    if (!currentUser?.email) return;
    const unsubscribe = base44.entities.Conversation.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["conversations", currentUser.email] });
    });
    return unsubscribe;
  }, [currentUser?.email]);

  // Deep-link: open specific conversation from URL param ?conversationId=xxx
  useEffect(() => {
    if (!conversations?.length) return;
    const urlParams = new URLSearchParams(window.location.search);
    const convId = urlParams.get("conversationId");
    if (convId && !selectedConversation) {
      const found = conversations.find((c) => c.id === convId);
      if (found) setSelectedConversation(found);
    }
  }, [conversations]);

  const { data: allProfiles } = useQuery({
    queryKey: ["profilesForMessages"],
    queryFn: () => base44.entities.Profile.filter({ is_complete: true }),
    enabled: conversations.length > 0,
    initialData: [],
  });

  // Compute unread counts across all conversations
  useEffect(() => {
    if (!conversations.length || !currentUser?.email) return;
    const fetchUnread = async () => {
      const counts = {};
      await Promise.all(
        conversations.map(async (conv) => {
          const msgs = await base44.entities.Message.filter({
            conversation_id: conv.id,
            is_read: false,
          });
          const unread = msgs.filter((m) => m.sender_email !== currentUser.email).length;
          if (unread > 0) counts[conv.id] = unread;
        })
      );
      setUnreadCounts(counts);
    };
    fetchUnread();
  }, [conversations, currentUser?.email]);

  // Subscribe to new messages globally for unread badge updates
  useEffect(() => {
    if (!currentUser?.email) return;
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.type === "create" && event.data?.sender_email !== currentUser.email) {
        const convId = event.data?.conversation_id;
        if (!convId) return;
        // Don't count unread if this conversation is currently open
        if (selectedConversation?.id === convId) return;
        setUnreadCounts((prev) => ({
          ...prev,
          [convId]: (prev[convId] || 0) + 1,
        }));
      }
      if (event.type === "update" && event.data?.is_read) {
        const convId = event.data?.conversation_id;
        if (!convId) return;
        setUnreadCounts((prev) => {
          const next = { ...prev };
          // Recalculate will happen on next conversation select; just clear for now
          delete next[convId];
          return next;
        });
      }
    });
    return unsubscribe;
  }, [currentUser?.email, selectedConversation?.id]);

  const otherEmail = selectedConversation?.participant_emails?.find((e) => e !== currentUser?.email);
  const otherProfile = allProfiles?.find((p) => p.user_email === otherEmail);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    // Clear unread for this conversation
    setUnreadCounts((prev) => {
      const next = { ...prev };
      delete next[conv.id];
      return next;
    });
  };

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  if (loadingConvs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white pb-20 md:pb-0" style={{ height: "calc(100vh - 64px)" }}>
      <div className="max-w-4xl mx-auto md:grid md:grid-cols-[320px_1fr] h-full">
        {/* Conversation list */}
        <div className={`md:border-r border-slate-100 md:flex md:flex-col h-full ${selectedConversation ? "hidden md:flex" : "flex flex-col"}`}>
          <div className="p-4 border-b border-slate-100 flex-shrink-0 flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#1B2A4A]">Messages</h1>
            {totalUnread > 0 && (
              <span className="px-2 py-0.5 bg-[#FF6B35] text-white text-xs font-bold rounded-full">
                {totalUnread} new
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              profiles={allProfiles}
              currentEmail={currentUser?.email}
              onSelect={handleSelectConversation}
              selectedId={selectedConversation?.id}
              unreadCounts={unreadCounts}
            />
          </div>
        </div>

        {/* Chat pane */}
        <div className={`md:flex md:flex-col h-full ${selectedConversation ? "flex flex-col" : "hidden md:flex"}`}>
          {selectedConversation ? (
            <ChatView
              conversation={selectedConversation}
              currentEmail={currentUser?.email}
              otherProfile={otherProfile}
              onBack={() => setSelectedConversation(null)}
              onMessageSent={() => {
                queryClient.invalidateQueries({ queryKey: ["conversations", currentUser?.email] });
              }}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-3">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
                <span className="text-3xl">💬</span>
              </div>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}