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
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  const showNav = isAuth && !PAGES_WITHOUT_NAV.includes(currentPageName);

  return (
    <div className="min-h-screen bg-white">
      {children}

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-40 safe-area-bottom">
          <div className="max-w-lg mx-auto flex items-center justify-around py-2">
            {NAV_ITEMS.map((item) => {
              const isActive = currentPageName === item.name;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.name)}
                  className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
                    isActive
                      ? "text-[#FF6B35]"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
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