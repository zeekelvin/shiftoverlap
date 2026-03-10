import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, User } from "lucide-react";
import { format } from "date-fns";

export default function ChatView({ conversation, currentEmail, otherProfile, onBack, onMessageSent }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);

  // Load initial messages
  useEffect(() => {
    if (!conversation?.id) return;
    base44.entities.Message.filter({ conversation_id: conversation.id }, "created_date")
      .then((msgs) => {
        setMessages(msgs || []);
        // Mark messages as read
        (msgs || []).forEach((m) => {
          if (!m.is_read && m.sender_email !== currentEmail) {
            base44.entities.Message.update(m.id, { is_read: true });
          }
        });
      });
  }, [conversation?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id !== conversation.id) return;
      if (event.type === "create") {
        setMessages((prev) => {
          if (prev.find((m) => m.id === event.id)) return prev;
          // Mark as read if from other person
          if (event.data.sender_email !== currentEmail) {
            base44.entities.Message.update(event.id, { is_read: true });
          }
          return [...prev, event.data];
        });
        onMessageSent?.();
      }
    });
    return unsubscribe;
  }, [conversation?.id, currentEmail]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const content = text.trim();
    setText("");

    await base44.entities.Message.create({
      conversation_id: conversation.id,
      sender_email: currentEmail,
      content,
      is_read: false,
    });
    await base44.entities.Conversation.update(conversation.id, {
      last_message: content,
      last_message_at: new Date().toISOString(),
      last_message_by: currentEmail,
    });

    setSending(false);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white flex-shrink-0">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          {otherProfile?.photo_urls?.[0] ? (
            <img src={otherProfile.photo_urls[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#1B2A4A] flex items-center justify-center text-white font-bold text-sm">
              {otherProfile?.display_name?.[0] || <User className="w-4 h-4" />}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-slate-800 truncate">{otherProfile?.display_name || "Unknown"}</p>
          <p className="text-xs text-slate-400 truncate">{otherProfile?.profession_detail || otherProfile?.profession || ""}</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Online" />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-[#FF6B35]/20">
              {otherProfile?.photo_urls?.[0] ? (
                <img src={otherProfile.photo_urls[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#1B2A4A] flex items-center justify-center text-white font-bold">
                  {otherProfile?.display_name?.[0] || "?"}
                </div>
              )}
            </div>
            <p className="font-semibold text-slate-700">{otherProfile?.display_name}</p>
            <p className="text-sm text-slate-400 mt-1">Say hello! You both work wild hours — you get each other. 💪</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_email === currentEmail;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMine
                    ? "bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] text-white rounded-br-md"
                    : "bg-white text-slate-700 border border-slate-100 rounded-bl-md shadow-sm"
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-slate-400"}`}>
                  {msg.created_date ? format(new Date(msg.created_date), "h:mm a") : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100 bg-white flex-shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-slate-50 border-slate-200"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!text.trim() || sending}
            className="rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] hover:from-[#e5602f] hover:to-[#e57f52] h-10 w-10 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}