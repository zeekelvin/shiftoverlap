import React from "react";
import { MapPin, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ProfessionBadge from "../shared/ProfessionBadge";
import ShiftBadge from "../shared/ShiftBadge";
import ScheduleOverlapIndicator from "../shared/ScheduleOverlapIndicator";

export default function ProfileCard({ profile, mySchedule, onLike, onPass, onSuperLike }) {
  const navigate = useNavigate();
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        {/* Photo */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {profile.photo_urls?.[0] ? (
            <img
              src={profile.photo_urls[0]}
              alt={profile.display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#1B2A4A] flex items-center justify-center">
              <span className="text-7xl font-bold text-white/30">{profile.display_name?.[0]?.toUpperCase()}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Name & basic info */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
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

        {/* Info section */}
        <div className="p-5 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {profile.profession && <ProfessionBadge profession={profile.profession} />}
            {profile.shift_pattern && <ShiftBadge shiftPattern={profile.shift_pattern} />}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-slate-600 leading-relaxed">{profile.bio}</p>
          )}

          {/* Schedule overlap */}
          {mySchedule && profile.weekly_schedule && (
            <div className="bg-slate-50 rounded-2xl p-4">
              <ScheduleOverlapIndicator mySchedule={mySchedule} theirSchedule={profile.weekly_schedule} />
            </div>
          )}

          {/* Interests */}
          {profile.interests?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          {/* View full profile */}
          <button
            onClick={() => navigate(createPageUrl(`ViewProfile?id=${profile.id}`))}
            className="w-full flex items-center justify-center gap-1 text-xs text-[#FF6B35] font-semibold py-1 hover:underline"
          >
            View full profile <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4 mt-5">
        <button
          onClick={onPass}
          className="w-14 h-14 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:shadow-red-100 transition-all active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button
          onClick={onSuperLike}
          className="w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:shadow-blue-100 transition-all active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>

        <button
          onClick={onLike}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] shadow-lg shadow-orange-200 flex items-center justify-center text-white hover:shadow-xl hover:shadow-orange-300 transition-all active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>
    </div>
  );
}