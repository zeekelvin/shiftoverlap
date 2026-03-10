import React from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";

export default function ConversationList({ conversations, profiles, currentEmail, onSelect, selectedId, unreadCounts }) {
  if (!conversations?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <MessageCircle className="w-7 h-7 text-slate-300" />
        </div>
        <h3 className="font-semibold text-slate-700">No conversations yet</h3>
        <p className="text-sm text-slate-400 mt-1">Match with someone to start chatting!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 overflow-y-auto">
      {conversations.map((conv) => {
        const otherEmail = conv.participant_emails?.find((e) => e !== currentEmail);
        const otherProfile = profiles?.find((p) => p.user_email === otherEmail);
        const isSelected = conv.id === selectedId;
        const unread = unreadCounts?.[conv.id] || 0;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50 ${
              isSelected ? "bg-orange-50 border-l-2 border-[#FF6B35]" : ""
            }`}
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              {otherProfile?.photo_urls?.[0] ? (
                <img src={otherProfile.photo_urls[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#1B2A4A] flex items-center justify-center text-white font-bold">
                  {otherProfile?.display_name?.[0] || "?"}
                </div>
              )}
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#FF6B35] rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-sm truncate ${unread > 0 ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                  {otherProfile?.display_name || otherEmail}
                </span>
                {conv.last_message_at && (
                  <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              <p className={`text-xs truncate mt-0.5 ${unread > 0 ? "text-slate-700 font-medium" : "text-slate-500"}`}>
                {conv.last_message || "Start the conversation!"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}