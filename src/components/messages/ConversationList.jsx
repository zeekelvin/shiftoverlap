import React from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";

export default function ConversationList({ conversations, profiles, currentEmail, onSelect, selectedId }) {
  if (!conversations?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <MessageCircle className="w-7 h-7 text-slate-300" />
        </div>
        <h3 className="font-semibold text-slate-700">No conversations yet</h3>
        <p className="text-sm text-slate-400 mt-1">Match with someone to start chatting!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {conversations.map((conv) => {
        const otherEmail = conv.participant_emails?.find((e) => e !== currentEmail);
        const otherProfile = profiles?.find((p) => p.user_email === otherEmail);
        const isSelected = conv.id === selectedId;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50 ${
              isSelected ? "bg-orange-50 border-l-2 border-[#FF6B35]" : ""
            }`}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              {otherProfile?.photo_urls?.[0] ? (
                <img src={otherProfile.photo_urls[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#1B2A4A] flex items-center justify-center text-white font-bold">
                  {otherProfile?.display_name?.[0] || "?"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-800 truncate">
                  {otherProfile?.display_name || otherEmail}
                </span>
                {conv.last_message_at && (
                  <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {conv.last_message || "Start the conversation!"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}