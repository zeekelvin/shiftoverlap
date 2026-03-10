import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function RequireAuth({ children }) {
  const [status, setStatus] = useState("loading"); // loading | auth | unauth

  useEffect(() => {
    base44.auth.isAuthenticated().then((ok) => {
      if (ok) {
        setStatus("auth");
      } else {
        setStatus("unauth");
        base44.auth.redirectToLogin(window.location.href);
      }
    });
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
      </div>
    );
  }

  if (status === "unauth") return null;

  return children;
}