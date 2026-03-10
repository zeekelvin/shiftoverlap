import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import RequireAuth from "../components/shared/RequireAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

import ProfileSetupSteps from "../components/profile/ProfileSetupSteps";
import ProfileCard from "../components/discover/ProfileCard";
import MatchPopup from "../components/discover/MatchPopup";

function DiscoverInner() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [matchPopup, setMatchPopup] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  // Fetch my profile
  const { data: myProfiles, isLoading: loadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ["myProfile", currentUser?.email],
    queryFn: () => base44.entities.Profile.filter({ user_email: currentUser.email }),
    enabled: !!currentUser?.email,
    initialData: [],
  });
  const myProfile = myProfiles?.[0];

  // Fetch all profiles
  const { data: allProfiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ["allProfiles"],
    queryFn: () => base44.entities.Profile.filter({ is_complete: true }),
    enabled: !!myProfile,
    initialData: [],
  });

  // Fetch my matches (to exclude already-swiped)
  const { data: myMatches } = useQuery({
    queryKey: ["myMatches", currentUser?.email],
    queryFn: () => base44.entities.Match.filter({ user_email: currentUser.email }),
    enabled: !!currentUser?.email,
    initialData: [],
  });

  // --- Compatibility scoring ---
  const computeCompatibility = (a, b) => {
    // 1. Schedule overlap (0-100, weighted 60%)
    let scheduleScore = 0;
    const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const schA = a.weekly_schedule || {};
    const schB = b.weekly_schedule || {};
    let totalA = 0, overlapCount = 0;
    DAYS.forEach((d) => {
      const sA = schA[d] || [], sB = schB[d] || [];
      totalA += sA.length;
      overlapCount += sA.filter((s) => sB.includes(s)).length;
    });
    scheduleScore = totalA > 0 ? (overlapCount / totalA) * 100 : 0;

    // 2. Gender preference match (binary, weighted 30%)
    const prefScore = (() => {
      if (!a.looking_for || !b.looking_for) return 50;
      const aWantsB = a.looking_for === "everyone" || a.looking_for === b.gender;
      const bWantsA = b.looking_for === "everyone" || b.looking_for === a.gender;
      if (aWantsB && bWantsA) return 100;
      if (aWantsB || bWantsA) return 50;
      return 0;
    })();

    // 3. Shared interests (0-100, weighted 10%)
    const interestScore = (() => {
      const iA = a.interests || [], iB = b.interests || [];
      if (!iA.length || !iB.length) return 50;
      const shared = iA.filter((i) => iB.includes(i)).length;
      return Math.min(100, (shared / Math.max(iA.length, iB.length)) * 100 * 2);
    })();

    return scheduleScore * 0.6 + prefScore * 0.3 + interestScore * 0.1;
  };

  // Filter and sort candidates by compatibility
  const candidates = allProfiles
    .filter((p) => {
      if (p.user_email === currentUser?.email) return false;
      const alreadySwiped = myMatches.some((m) => m.target_profile_id === p.id);
      if (alreadySwiped) return false;
      return true;
    })
    .map((p) => ({ ...p, _compat: myProfile ? computeCompatibility(myProfile, p) : 0 }))
    .sort((a, b) => b._compat - a._compat);

  const currentCandidate = candidates[currentIndex];

  const swipeMutation = useMutation({
    mutationFn: async ({ profile, action }) => {
      // Create my swipe
      const match = await base44.entities.Match.create({
        user_email: currentUser.email,
        target_profile_id: profile.id,
        target_email: profile.user_email,
        action,
      });

      // Check if they already liked me
      if (action === "like" || action === "super_like") {
        const theirSwipes = await base44.entities.Match.filter({
          user_email: profile.user_email,
          target_email: currentUser.email,
        });
        const theyLikedMe = theirSwipes.some((s) => s.action === "like" || s.action === "super_like");

        if (theyLikedMe) {
          // Mutual match!
          await base44.entities.Match.update(match.id, { is_mutual: true });
          const theirMatch = theirSwipes.find((s) => s.action === "like" || s.action === "super_like");
          if (theirMatch) {
            await base44.entities.Match.update(theirMatch.id, { is_mutual: true });
          }
          // Create conversation
          await base44.entities.Conversation.create({
            participant_emails: [currentUser.email, profile.user_email],
            match_id: match.id,
          });
          return { mutual: true, profile };
        }
      }
      return { mutual: false };
    },
    onSuccess: (result) => {
      if (result.mutual) {
        setMatchPopup(result.profile);
      }
      setCurrentIndex((i) => i + 1);
      queryClient.invalidateQueries({ queryKey: ["myMatches"] });
    },
  });

  const handleSwipe = (action) => {
    if (!currentCandidate) return;
    swipeMutation.mutate({ profile: currentCandidate, action });
  };

  // Profile setup
  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
      </div>
    );
  }

  if (!myProfile) {
    return <ProfileSetupSteps onComplete={() => refetchProfile()} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Discover</h1>
          <p className="text-sm text-slate-400 mt-1">People who share your schedule</p>
        </div>

        {/* Cards */}
        {loadingProfiles ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
          </div>
        ) : !currentCandidate ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <RefreshCcw className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No more profiles</h3>
            <p className="text-sm text-slate-400 mt-2">Check back later for new people!</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setCurrentIndex(0); queryClient.invalidateQueries({ queryKey: ["allProfiles"] }); }}
            >
              Refresh
            </Button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCandidate.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <ProfileCard
                profile={currentCandidate}
                mySchedule={myProfile.weekly_schedule}
                onLike={() => handleSwipe("like")}
                onPass={() => handleSwipe("pass")}
                onSuperLike={() => handleSwipe("super_like")}
                compatScore={currentCandidate._compat}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Match popup */}
      <AnimatePresence>
        {matchPopup && (
          <MatchPopup
            myProfile={myProfile}
            theirProfile={matchPopup}
            onChat={() => {
              setMatchPopup(null);
              navigate(createPageUrl("Messages"));
            }}
            onKeepSwiping={() => setMatchPopup(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}