import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, Heart, Users, ArrowRight, Shield, Zap, Calendar, Star, ChevronLeft, ChevronRight } from "lucide-react";
import LogoBrand from "../components/shared/LogoBrand";

const PROFILES = [
  {
    name: "Sofia, 27",
    role: "ER Nurse",
    shift: "12-Hour Rotating",
    overlap: "87%",
    img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80",
    color: "from-rose-400 to-pink-600",
  },
  {
    name: "James, 31",
    role: "Firefighter",
    shift: "24 On / 48 Off",
    overlap: "74%",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80",
    color: "from-orange-400 to-red-500",
  },
  {
    name: "Aria, 25",
    role: "Paramedic",
    shift: "Rotating Shifts",
    overlap: "91%",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80",
    color: "from-violet-400 to-purple-600",
  },
  {
    name: "Ethan, 33",
    role: "ER Doctor",
    shift: "Night Shifts",
    overlap: "68%",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
    color: "from-blue-400 to-indigo-600",
  },
  {
    name: "Zoe, 29",
    role: "Flight Crew",
    shift: "Irregular",
    overlap: "82%",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
    color: "from-teal-400 to-cyan-600",
  },
  {
    name: "Marcus, 32",
    role: "Police Officer",
    shift: "Fixed Nights",
    overlap: "77%",
    img: "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=600&q=80",
    color: "from-amber-400 to-orange-500",
  },
];

const COUPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
  "https://images.unsplash.com/photo-1519742866993-66d3cfef4bbd?w=800&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
];

const TESTIMONIALS = [
  {
    text: "We matched because we both had Wednesday mornings free. That coffee date turned into forever.",
    name: "Ava & Daniel",
    role: "ICU Nurse & Firefighter",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    stars: 5,
  },
  {
    text: "I never thought a dating app would actually understand my 3am shifts. ShiftOverlap changed everything.",
    name: "Jordan",
    role: "Trauma Surgeon",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80",
    stars: 5,
  },
  {
    text: "The schedule overlap feature is genius. No more 'I'm free when you work' conversations.",
    name: "Priya",
    role: "ER Nurse",
    img: "https://images.unsplash.com/photo-1519742866993-66d3cfef4bbd?w=200&q=80",
    stars: 5,
  },
];

function ProfileCarousel() {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % PROFILES.length), 3500);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + PROFILES.length) % PROFILES.length);
  const next = () => setCurrent((c) => (c + 1) % PROFILES.length);

  const visible = [
    PROFILES[(current - 1 + PROFILES.length) % PROFILES.length],
    PROFILES[current],
    PROFILES[(current + 1) % PROFILES.length],
  ];

  return (
    <div className="relative flex items-center justify-center gap-4 h-[460px]">
      {visible.map((profile, idx) => {
        const isCenter = idx === 1;
        return (
          <motion.div
            key={profile.name + idx}
            animate={{
              scale: isCenter ? 1 : 0.82,
              opacity: isCenter ? 1 : 0.55,
              zIndex: isCenter ? 10 : 5,
              y: isCenter ? 0 : 24,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer flex-shrink-0 ${
              isCenter ? "w-64 h-96" : "w-52 h-80 hidden sm:block"
            }`}
            onClick={isCenter ? undefined : (idx === 0 ? prev : next)}
          >
            <img src={profile.img} alt={profile.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            {isCenter && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute bottom-0 left-0 right-0 p-5"
              >
                <p className="text-white font-bold text-xl">{profile.name}</p>
                <p className="text-white/80 text-sm">{profile.role} · {profile.shift}</p>
                <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${profile.color} text-white text-xs font-bold shadow-lg`}>
                  <Heart className="w-3 h-3 fill-white" />
                  {profile.overlap} overlap with you
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Nav arrows */}
      <button onClick={prev} className="absolute left-0 z-20 w-10 h-10 flex items-center justify-center bg-white/90 rounded-full shadow-lg hover:scale-110 transition-transform">
        <ChevronLeft className="w-5 h-5 text-slate-700" />
      </button>
      <button onClick={next} className="absolute right-0 z-20 w-10 h-10 flex items-center justify-center bg-white/90 rounded-full shadow-lg hover:scale-110 transition-transform">
        <ChevronRight className="w-5 h-5 text-slate-700" />
      </button>

      {/* Dots */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
        {PROFILES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all ${i === current ? "w-5 h-2 bg-[#FF6B35]" : "w-2 h-2 bg-slate-300"}`}
          />
        ))}
      </div>
    </div>
  );
}

function CouplesBanner() {
  const [pos, setPos] = useState(0);

  useEffect(() => {
    let frame;
    let start = null;
    const speed = 0.4;
    const totalWidth = COUPLE_PHOTOS.length * 340;

    const animate = (ts) => {
      if (!start) start = ts;
      setPos(((ts - start) * speed) % totalWidth);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const doubled = [...COUPLE_PHOTOS, ...COUPLE_PHOTOS];

  return (
    <div className="overflow-hidden w-full">
      <div className="flex gap-4" style={{ transform: `translateX(-${pos}px)`, willChange: "transform" }}>
        {doubled.map((src, i) => (
          <div key={i} className="flex-shrink-0 w-80 h-52 rounded-2xl overflow-hidden shadow-lg">
            <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ── HERO ── */}
      <div className="relative min-h-screen flex flex-col">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-[#FF6B35]/20 to-pink-300/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-[#1B2A4A]/15 to-blue-300/15 rounded-full blur-3xl" />
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6 pb-4">
          <LogoBrand size="md" />
          <div className="flex items-center gap-3">
            {isAuth === false && (
              <Button variant="ghost" onClick={() => base44.auth.redirectToLogin()} className="text-slate-600 hidden sm:flex font-medium">
                Log In
              </Button>
            )}
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] text-white rounded-full px-6 shadow-lg shadow-orange-200"
            >
              {isAuth ? "Open App" : "Get Started"} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-8 pb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-[#FF6B35] text-sm font-semibold mb-6 shadow-sm">
              <Clock className="w-4 h-4" />
              Built for shift workers · 50,000+ members
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-[#1B2A4A] leading-[1.05] tracking-tight max-w-3xl mx-auto">
              Love Doesn't{" "}
              <span className="relative inline-block">
                <span className="text-[#FF6B35]">Clock Out</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 8C80 2 200 2 298 8" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
                </svg>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 mt-6 max-w-xl mx-auto leading-relaxed">
              The only dating app that matches you based on when you're actually <strong className="text-[#1B2A4A]">free</strong>.
              Built for nurses, firefighters, EMTs, doctors, and every hero working when others sleep.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] text-white rounded-full px-10 h-14 text-base font-bold shadow-xl shadow-orange-200 hover:shadow-2xl hover:shadow-orange-300 hover:scale-105 transition-all"
              >
                Find Your Match Free <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-400">
              <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-green-500" /><span>Verified profiles</span></div>
              <div className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-400" /><span>Free to start</span></div>
              <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /><span>4.9 rating</span></div>
            </div>
          </motion.div>

          {/* Profile Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 w-full max-w-lg mx-auto px-4"
          >
            <ProfileCarousel />
          </motion.div>
        </div>
      </div>

      {/* ── SCROLLING COUPLES BANNER ── */}
      <div className="py-12 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-[#FF6B35] uppercase tracking-widest mb-2">Real Connections</p>
          <h2 className="text-3xl font-extrabold text-[#1B2A4A]">Love Found Between Shifts</h2>
        </div>
        <CouplesBanner />
      </div>

      {/* ── FEATURES ── */}
      <div className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#FF6B35] uppercase tracking-widest mb-2">Why Us</p>
            <h2 className="text-4xl font-extrabold text-[#1B2A4A]">Finally, a Dating App That Gets It</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Schedule-Based Matching",
                desc: "We calculate your exact free-time overlap with every match. See who's free when you are — before you even swipe.",
                color: "from-[#FF6B35] to-[#FF8F5E]",
                img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80",
              },
              {
                icon: Users,
                title: "For Shift Workers Only",
                desc: "Everyone here understands the exhaustion, weird sleep patterns, and missed holidays. You're finally among your people.",
                color: "from-[#1B2A4A] to-[#2d4270]",
                img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
              },
              {
                icon: Zap,
                title: "Instant Date Planning",
                desc: "See your shared free windows. Book that coffee on your mutual Tuesday morning off in two taps.",
                color: "from-violet-500 to-purple-600",
                img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group"
              >
                <div className="h-44 overflow-hidden">
                  <img src={feature.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-md`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1B2A4A]">{feature.title}</h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#FF6B35] uppercase tracking-widest mb-2">Love Stories</p>
            <h2 className="text-4xl font-extrabold text-[#1B2A4A]">They Found Their Match</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-3xl p-7 border border-orange-100 relative"
              >
                <div className="flex mb-4">
                  {Array(t.stars).fill(0).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 italic leading-relaxed text-sm mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />
                  <div>
                    <p className="font-bold text-[#1B2A4A] text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROFESSIONS ── */}
      <div className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm font-semibold text-[#FF6B35] uppercase tracking-widest mb-2">Community</p>
          <h2 className="text-4xl font-extrabold text-[#1B2A4A] mb-3">Made For Heroes</h2>
          <p className="text-slate-500 mb-10">Join thousands of essential workers finding love on their terms</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["🩺 Nurses","🚒 Firefighters","🚑 EMTs","👨‍⚕️ Doctors","👮 Police","🏭 Factory Workers","✈️ Flight Crew","🚚 Truck Drivers","🏨 Hospitality","🍳 Restaurant Staff","🛡️ Security","🎖️ Military"].map((p) => (
              <span key={p} className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium text-sm shadow-sm hover:bg-orange-50 hover:text-[#FF6B35] hover:border-orange-200 transition-all cursor-default">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1600&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A]/90 to-[#FF6B35]/70" />
        <div className="relative z-10 py-28 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Your Next Date Is<br />Between Shifts
            </h2>
            <p className="text-white/80 mb-10 max-w-lg mx-auto text-lg">
              Stop missing out on love because of your schedule. ShiftOverlap finds people who are free when you are.
            </p>
            <Button
              onClick={handleGetStarted}
              className="bg-white text-[#FF6B35] font-bold rounded-full px-12 h-16 text-lg shadow-2xl hover:scale-105 transition-all hover:bg-orange-50"
            >
              Start Free Today <ArrowRight className="w-6 h-6" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6 bg-[#1B2A4A]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <LogoBrand size="sm" />
          <p className="text-xs text-slate-400">© 2026 ShiftOverlap. Love on your schedule.</p>
          <div className="flex gap-4 text-xs text-slate-500">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}