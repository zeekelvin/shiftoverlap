import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Heart, Clock, MessageCircle } from "lucide-react";
import ProfessionBadge from "../components/shared/ProfessionBadge";
import { computeOverlap } from "../components/shared/ScheduleOverlapIndicator";

export default function Matches() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: myProfiles } = useQuery({
    queryKey: ["myProfile", currentUser?.email],
    queryFn: () => base44.entities.Profile.filter({ user_email: currentUser.email }),
    enabled: !!currentUser?.email,
    initialData: [],
  });
  const myProfile = myProfiles?.[0];

  const { data: mutualMatches, isLoading } = useQuery({
    queryKey: ["mutualMatches", currentUser?.email],
    queryFn: () => base44.entities.Match.filter({ user_email: currentUser.email, is_mutual: true }),
    enabled: !!currentUser?.email,
    initialData: [],
  });

  const { data: allProfiles } = useQuery({
    queryKey: ["allProfilesForMatches"],
    queryFn: () => base44.entities.Profile.filter({ is_complete: true }),
    enabled: mutualMatches.length > 0,
    initialData: [],
  });

  const matchedProfiles = mutualMatches
    .map((m) => allProfiles.find((p) => p.id === m.target_profile_id))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Matches</h1>
          <p className="text-sm text-slate-400 mt-1">{matchedProfiles.length} mutual matches</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
          </div>
        ) : matchedProfiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-rose-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No matches yet</h3>
            <p className="text-sm text-slate-400 mt-2">Keep swiping — your shift buddy is out there!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {matchedProfiles.map((profile) => {
              const overlap = myProfile?.weekly_schedule && profile.weekly_schedule
                ? computeOverlap(myProfile.weekly_schedule, profile.weekly_schedule)
                : null;

              return (
                <button
                  key={profile.id}
                  onClick={() => navigate(createPageUrl("Messages"))}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left"
                >
                  <div className="aspect-square overflow-hidden">
                    {profile.photo_urls?.[0] ? (
                      <img src={profile.photo_urls[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#1B2A4A] flex items-center justify-center text-white text-3xl font-bold">
                        {profile.display_name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-slate-800 truncate">
                      {profile.display_name}{profile.age ? `, ${profile.age}` : ""}
                    </p>
                    {profile.profession && (
                      <div className="mt-1.5">
                        <ProfessionBadge profession={profile.profession} size="sm" />
                      </div>
                    )}
                    {overlap && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
                        <Clock className="w-3 h-3" />
                        {overlap.percentage}% overlap
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}