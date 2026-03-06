import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, Heart, Users, ArrowRight, Shield, Zap, Calendar } from "lucide-react";
import LogoBrand from "../components/shared/LogoBrand";

export default function Home() {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  const handleGetStarted = () => {
    if (isAuth) {
      navigate(createPageUrl("Discover"));
    } else {
      base44.auth.redirectToLogin(createPageUrl("Discover"));
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero */}
      <div className="relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B35]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#1B2A4A]/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-6xl mx-auto px-6 pt-8">
          {/* Nav */}
          <nav className="flex items-center justify-between mb-20">
            <LogoBrand size="md" />
            <div className="flex items-center gap-3">
              {isAuth === false && (
                <Button variant="ghost" onClick={() => base44.auth.redirectToLogin()} className="text-slate-600 hidden sm:flex">
                  Log In
                </Button>
              )}
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] text-white rounded-full px-6"
              >
                {isAuth ? "Open App" : "Get Started"}
              </Button>
            </div>
          </nav>

          {/* Hero content */}
          <div className="grid md:grid-cols-2 gap-12 items-center pb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-[#FF6B35] text-sm font-medium mb-6">
                <Clock className="w-4 h-4" />
                Built for shift workers
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold text-[#1B2A4A] leading-tight tracking-tight">
                Love Doesn't{" "}
                <span className="text-[#FF6B35]">Clock Out</span>
              </h1>

              <p className="text-lg text-slate-500 mt-6 max-w-md leading-relaxed">
                The dating app designed for nurses, firefighters, EMTs, doctors, and anyone
                who works hours the rest of the world sleeps through. We match you based on
                when you're actually <em>free</em>.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] text-white rounded-full px-8 h-12 text-base shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all"
                >
                  Find Your Match <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <div className="flex items-center gap-6 mt-8 text-sm text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Verified profiles</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4" />
                  <span>100% free to start</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/20 to-[#1B2A4A]/20 rounded-3xl rotate-3 scale-105" />
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
                  {/* Mini schedule preview */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF8F5E] flex items-center justify-center text-white text-xl font-bold">S</div>
                    <div>
                      <p className="font-bold text-[#1B2A4A]">Sarah, 28</p>
                      <p className="text-sm text-slate-400">ER Nurse • 12-Hour Rotating</p>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-2">
                      <Calendar className="w-4 h-4" />
                      73% Schedule Overlap!
                    </div>
                    <p className="text-xs text-green-600">
                      You're both free Tuesday & Thursday evenings, and Saturday mornings.
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <span className="text-xs px-3 py-1 rounded-full bg-rose-100 text-rose-700">Yoga</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">Coffee</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700">Hiking</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-violet-100 text-violet-700">Dogs</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-[#1B2A4A]">Why ShiftOverlap?</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">
              Regular dating apps don't understand your schedule. We do.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Schedule-Based Matching",
                desc: "We calculate when your free time overlaps with potential matches. No more guessing if they're awake at 3am too.",
                color: "from-[#FF6B35] to-[#FF8F5E]",
              },
              {
                icon: Users,
                title: "For Shift Workers Only",
                desc: "Everyone here gets it — the exhaustion, the weird sleep patterns, the missed holidays. You're among your people.",
                color: "from-[#1B2A4A] to-[#2d4270]",
              },
              {
                icon: Zap,
                title: "Quick Date Planning",
                desc: "See exactly which windows you share. Plan a coffee during your mutual Tuesday morning off in seconds.",
                color: "from-violet-500 to-purple-600",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#1B2A4A]">{feature.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Professions */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-[#1B2A4A] mb-4">Made For Heroes</h2>
          <p className="text-slate-500 mb-10">Join thousands of essential workers finding love on their terms</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["🩺 Nurses", "🚒 Firefighters", "🚑 EMTs", "👨‍⚕️ Doctors", "👮 Police", "🏭 Factory Workers", "✈️ Flight Crew", "🚚 Truck Drivers", "🏨 Hospitality", "🍳 Restaurant Staff", "🛡️ Security", "🎖️ Military"].map((p) => (
              <span key={p} className="px-5 py-2.5 rounded-full bg-slate-100 text-slate-700 font-medium text-sm hover:bg-orange-50 hover:text-[#FF6B35] transition-colors cursor-default">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#1B2A4A] to-[#2d4270] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Your Next Date Is Between Shifts
          </h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto">
            Stop missing out on love because of your schedule. ShiftOverlap finds people who are free when you are.
          </p>
          <Button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] text-white rounded-full px-10 h-14 text-lg shadow-lg shadow-orange-900/20 hover:shadow-xl transition-all"
          >
            Start Free Today <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <LogoBrand size="sm" />
          <p className="text-xs text-slate-400">© 2026 ShiftOverlap. Love on your schedule.</p>
        </div>
      </footer>
    </div>
  );
}