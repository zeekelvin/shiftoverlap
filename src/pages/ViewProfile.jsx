import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, MapPin, Heart, MessageCircle, ThumbsUp, Star, X, ShieldAlert } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import ProfessionBadge from "../components/shared/ProfessionBadge";
import ShiftBadge from "../components/shared/ShiftBadge";
import ScheduleOverlapIndicator, { computeOverlap } from "../components/shared/ScheduleOverlapIndicator";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
const TIME_BLOCKS = [
  { key: "morning", label: "Morning", color: "bg-amber-100 text-amber-700" },
  { key: "afternoon", label: "Afternoon", color: "bg-orange-100 text-orange-700" },
  { key: "evening", label: "Evening", color: "bg-violet-100 text-violet-700" },
  { key: "night", label: "Night", color: "bg-indigo-100 text-indigo-700" },
];

export default function ViewProfile() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const profileId = urlParams.get("id");

  const [currentUser, setCurrentUser] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    base44.auth.me().then(async (user) => {
      setCurrentUser(user);
      const profiles = await base44.entities.Profile.filter({ user_email: user.email });
      setMyProfile(profiles?.[0] || null);
    });
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", profileId],
    queryFn: () => base44.entities.Profile.filter({ id: profileId }),
    enabled: !!profileId,
    select: (data) => data?.[0],
  });

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
      </div>
    );
  }

  const isOwnProfile = currentUser?.email === profile.user_email;
  const overlapPct = myProfile && profile ? computeOverlap(myProfile.weekly_schedule, profile.weekly_schedule) : null;
  const photos = profile.photo_urls?.length ? profile.photo_urls : [];

  const handleAction = async (action) => {
    if (!currentUser?.email || !profile) return;
    // Check if already swiped
    const existing = await base44.entities.Match.filter({ user_email: currentUser.email, target_profile_id: profile.id });
    if (existing.length > 0) {
      await base44.entities.Match.update(existing[0].id, { action });
    } else {
      await base44.entities.Match.create({
        user_email: currentUser.email,
        target_profile_id: profile.id,
        target_email: profile.user_email,
        action,
      });
    }
    // Check mutual
    if (["like", "super_like", "interested"].includes(action)) {
      const theirSwipes = await base44.entities.Match.filter({ user_email: profile.user_email, target_email: currentUser.email });
      const theyLike = theirSwipes.some((s) => ["like", "super_like", "interested"].includes(s.action));
      if (theyLike) {
        // Create conversation if not exists
        await handleMessage();
        return;
      }
    }
    navigate(-1);
  };

  const handleMessage = async () => {
    if (!currentUser?.email || !profile.user_email) return;
    // Find existing conversation or create one
    const all = await base44.entities.Conversation.list();
    const existing = all.find((c) =>
      c.participant_emails?.includes(currentUser.email) &&
      c.participant_emails?.includes(profile.user_email)
    );
    let conv = existing;
    if (!conv) {
      conv = await base44.entities.Conversation.create({
        participant_emails: [currentUser.email, profile.user_email],
      });
    }
    navigate(createPageUrl(`Messages?conversationId=${conv.id}`));
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Photo Hero */}
      <div className="relative h-[60vh] bg-slate-900">
        {photos.length > 0 ? (
          <img
            src={photos[activePhoto]}
            alt={profile.display_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
            <span className="text-8xl font-bold text-white/30">{profile.display_name?.[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Edit button if own profile */}
        {isOwnProfile && (
          <button
            onClick={() => navigate(createPageUrl("MyProfile"))}
            className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-[#FF6B35] hover:bg-white transition-colors"
          >
            Edit Profile
          </button>
        )}

        {/* Photo thumbnails */}
        {photos.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setActivePhoto(i)}
                className={`rounded-full transition-all ${i === activePhoto ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50"}`}
              />
            ))}
          </div>
        )}

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-black text-white">
            {profile.display_name}{profile.age ? `, ${profile.age}` : ""}
          </h1>
          {(profile.city || profile.state) && (
            <div className="flex items-center gap-1 text-white/80 mt-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{[profile.city, profile.state].filter(Boolean).join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {profile.profession && <ProfessionBadge profession={profile.profession} />}
          {profile.shift_pattern && <ShiftBadge shiftPattern={profile.shift_pattern} />}
        </div>

        {/* Overlap indicator */}
        {!isOwnProfile && overlapPct !== null && (
          <div className="bg-gradient-to-r from-orange-50 to-rose-50 rounded-2xl p-4 border border-orange-100">
            <ScheduleOverlapIndicator
              mySchedule={myProfile?.weekly_schedule}
              theirSchedule={profile.weekly_schedule}
            />
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">About</h2>
            <p className="text-slate-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span key={interest} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Schedule */}
        {profile.weekly_schedule && Object.keys(profile.weekly_schedule).length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Availability</h2>
            <div className="space-y-2">
              {DAYS.map((day) => {
                const slots = profile.weekly_schedule[day];
                if (!slots?.length) return null;
                return (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-8 uppercase">{DAY_LABELS[day]}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {TIME_BLOCKS.filter((b) => slots.includes(b.key)).map((b) => (
                        <span key={b.key} className={`px-2.5 py-1 rounded-full text-xs font-medium ${b.color}`}>
                          {b.label}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All photos grid */}
        {photos.length > 1 && (
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Photos</h2>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((url, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => setActivePhoto(i)}
                >
                  <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons (fixed bottom, only for other profiles) */}
      {!isOwnProfile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 p-4 safe-area-bottom">
          <div className="max-w-lg mx-auto flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl border-slate-200 text-slate-500"
              onClick={() => navigate(-1)}
            >
              Pass
            </Button>
            <Button
              variant="outline"
              className="h-12 px-4 rounded-xl border-[#FF6B35] text-[#FF6B35] hover:bg-orange-50"
              onClick={handleMessage}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] text-white font-bold shadow-lg shadow-orange-200"
            >
              <Heart className="w-4 h-4 mr-2" /> Like
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}