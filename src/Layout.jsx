import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Search, Heart, MessageCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { name: "Discover", icon: Search, label: "Discover" },
  { name: "Matches", icon: Heart, label: "Matches" },
  { name: "Messages", icon: MessageCircle, label: "Messages" },
  { name: "MyProfile", icon: User, label: "Profile" },
];

const PAGES_WITHOUT_NAV = ["Home"];

export default function Layout({ children, currentPageName }) {
  React.useEffect(() => { document.title = "ShiftOverlap"; }, []);
  const [isAuth, setIsAuth] = useState(false);
  const [currentEmail, setCurrentEmail] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then((auth) => {
      setIsAuth(auth);
      if (auth) {
        base44.auth.me().then((user) => setCurrentEmail(user?.email));
      }
    });
  }, []);

  // Real-time unread badge
  useEffect(() => {
    if (!currentEmail) return;

    // Initial check
    const checkUnread = async () => {
      const convs = await base44.entities.Conversation.list();
      const myConvs = convs.filter((c) => c.participant_emails?.includes(currentEmail));
      if (!myConvs.length) return;
      const results = await Promise.all(
        myConvs.map((conv) =>
          base44.entities.Message.filter({ conversation_id: conv.id, is_read: false })
        )
      );
      const anyUnread = results.flat().some((m) => m.sender_email !== currentEmail);
      setHasUnread(anyUnread);
    };
    checkUnread();

    // Subscribe for live updates
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.type === "create" && event.data?.sender_email !== currentEmail && !event.data?.is_read) {
        setHasUnread(true);
      }
    });
    return unsubscribe;
  }, [currentEmail]);

  // Clear unread dot when visiting Messages page
  useEffect(() => {
    if (currentPageName === "Messages") {
      setHasUnread(false);
    }
  }, [currentPageName]);

  const showNav = isAuth && !PAGES_WITHOUT_NAV.includes(currentPageName);

  return (
    <div className="min-h-screen bg-white">
      {children}

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-40 safe-area-bottom">
          <div className="max-w-lg mx-auto flex items-center justify-around py-2">
            {NAV_ITEMS.map((item) => {
              const isActive = currentPageName === item.name;
              const showBadge = item.name === "Messages" && hasUnread;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.name)}
                  className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
                    isActive ? "text-[#FF6B35]" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <div className="relative">
                    <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF6B35] rounded-full border-2 border-white" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <style>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 8px);
        }
      `}</style>
    </div>
  );
}