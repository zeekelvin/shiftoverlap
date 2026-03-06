import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

export default function ChatView({ conversation, messages, currentEmail, otherProfile, onBack, onMessageSent }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

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
    });
    await base44.entities.Conversation.update(conversation.id, {
      last_message: content,
      last_message_at: new Date().toISOString(),
      last_message_by: currentEmail,
    });
    
    setSending(false);
    onMessageSent?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white">
        <button onClick={onBack} className="md:hidden text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          {otherProfile?.photo_urls?.[0] ? (
            <img src={otherProfile.photo_urls[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#1B2A4A] flex items-center justify-center text-white font-bold text-sm">
              {otherProfile?.display_name?.[0] || "?"}
            </div>
          )}
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-800">{otherProfile?.display_name || "Unknown"}</p>
          <p className="text-xs text-slate-400">{otherProfile?.profession_detail || ""}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        {messages?.length === 0 && (
          <div className="text-center py-12 text-sm text-slate-400">
            Say hello! You both work wild hours — you get each other. 💪
          </div>
        )}
        {messages?.map((msg) => {
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
      <div className="p-4 border-t border-slate-100 bg-white">
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
            className="rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] hover:from-[#e5602f] hover:to-[#e57f52] h-10 w-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}