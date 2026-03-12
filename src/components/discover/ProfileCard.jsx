import React, { useState } from "react";
import { MapPin, ChevronRight, X, Heart, Star, Zap, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import ProfessionBadge from "../shared/ProfessionBadge";
import ShiftBadge from "../shared/ShiftBadge";
import ScheduleOverlapIndicator from "../shared/ScheduleOverlapIndicator";

export default function ProfileCard({ profile, mySchedule, onLike, onPass, onSuperLike, onInterested, compatScore }) {
  const navigate = useNavigate();
  const [activePhoto, setActivePhoto] = useState(0);
  const photos = profile.photo_urls?.length ? profile.photo_urls : [];

  const x = useMotionValue(0);
  const controls = useAnimation();
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);

  const handleDragEnd = async (_, info) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      await controls.start({ x: 600, opacity: 0, transition: { duration: 0.3 } });
      onLike?.();
    } else if (info.offset.x < -threshold) {
      await controls.start({ x: -600, opacity: 0, transition: { duration: 0.3 } });
      onPass?.();
    } else {
      controls.start({ x: 0, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      {/* Drag indicators */}
      <motion.div
        className="absolute top-8 left-4 z-20 px-4 py-2 rounded-xl border-4 border-green-500 text-green-500 font-black text-xl rotate-[-15deg] pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        LIKE ❤️
      </motion.div>
      <motion.div
        className="absolute top-8 right-4 z-20 px-4 py-2 rounded-xl border-4 border-red-500 text-red-500 font-black text-xl rotate-[15deg] pointer-events-none"
        style={{ opacity: passOpacity }}
      >
        NOPE ✗
      </motion.div>

      {/* Draggable Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, rotate }}
        animate={controls}
        onDragEnd={handleDragEnd}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 cursor-grab active:cursor-grabbing"
      >
        {/* Photo */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {photos.length > 0 ? (
            <>
              <img
                src={photos[activePhoto]}
                alt={profile.display_name}
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* Photo nav dots */}
              {photos.length > 1 && (
                <div className="absolute top-0 left-0 right-0 flex gap-1 p-2">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onPointerDown={(e) => { e.stopPropagation(); setActivePhoto(i); }}
                      className={`flex-1 h-1 rounded-full transition-all ${i === activePhoto ? "bg-white" : "bg-white/40"}`}
                    />
                  ))}
                </div>
              )}
              {/* tap zones */}
              <div className="absolute inset-0 flex pointer-events-none">
                <div className="w-1/3 h-full pointer-events-auto" onPointerDown={(e) => { e.stopPropagation(); setActivePhoto(i => Math.max(0, i - 1)); }} />
                <div className="w-2/3 h-full" />
                <div className="w-1/3 h-full pointer-events-auto" onPointerDown={(e) => { e.stopPropagation(); setActivePhoto(i => Math.min(photos.length - 1, i + 1)); }} />
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#1B2A4A] flex items-center justify-center">
              <span className="text-7xl font-bold text-white/30">{profile.display_name?.[0]?.toUpperCase()}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

          <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
            <h2 className="text-2xl font-bold text-white">
              {profile.display_name}{profile.age ? `, ${profile.age}` : ""}
            </h2>
            {(profile.city || profile.state) && (
              <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{[profile.city, profile.state].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {profile.profession && <ProfessionBadge profession={profile.profession} />}
            {profile.shift_pattern && <ShiftBadge shiftPattern={profile.shift_pattern} />}
          </div>

          {profile.bio && (
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{profile.bio}</p>
          )}

          {compatScore != null && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    compatScore >= 70 ? "bg-gradient-to-r from-green-400 to-emerald-500"
                    : compatScore >= 40 ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                    : "bg-gradient-to-r from-red-300 to-rose-400"
                  }`}
                  style={{ width: `${Math.round(compatScore)}%` }}
                />
              </div>
              <span className={`text-xs font-bold tabular-nums ${
                compatScore >= 70 ? "text-green-600" : compatScore >= 40 ? "text-orange-500" : "text-rose-500"
              }`}>
                {Math.round(compatScore)}% match
              </span>
            </div>
          )}

          {mySchedule && profile.weekly_schedule && (
            <div className="bg-slate-50 rounded-2xl p-4">
              <ScheduleOverlapIndicator mySchedule={mySchedule} theirSchedule={profile.weekly_schedule} compact />
            </div>
          )}

          {profile.interests?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.slice(0, 6).map((interest) => (
                <span key={interest} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {interest}
                </span>
              ))}
            </div>
          )}

          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => navigate(createPageUrl(`ViewProfile?id=${profile.id}`))}
            className="w-full flex items-center justify-center gap-1 text-xs text-[#FF6B35] font-semibold py-1 hover:underline"
          >
            View full profile <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3 mt-5">
        {/* Pass */}
        <button
          onClick={onPass}
          className="w-14 h-14 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all active:scale-90"
          title="Pass"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Interested */}
        <button
          onClick={onInterested}
          className="w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-200 transition-all active:scale-90"
          title="Interested"
        >
          <ThumbsUp className="w-5 h-5" />
        </button>

        {/* Super Like */}
        <button
          onClick={onSuperLike}
          className="w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all active:scale-90"
          title="Super Like"
        >
          <Star className="w-5 h-5" />
        </button>

        {/* Like */}
        <button
          onClick={onLike}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] shadow-lg shadow-orange-200 flex items-center justify-center text-white hover:shadow-xl transition-all active:scale-90"
          title="Like"
        >
          <Heart className="w-6 h-6 fill-white" />
        </button>
      </div>

      {/* Swipe hint */}
      <p className="text-center text-xs text-slate-300 mt-3">← Swipe left to pass · Swipe right to like →</p>
    </div>
  );
}