import React, { useState, useEffect } from "react";
import RequireAuth from "../components/shared/RequireAuth";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Heart, Clock, MessageCircle, Star, ThumbsUp, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfessionBadge from "../components/shared/ProfessionBadge";
import { computeOverlap } from "../components/shared/ScheduleOverlapIndicator";

function ProfileThumb({ profile, myProfile, onChat, onViewProfile, blur = false }) {
  const overlap = myProfile?.weekly_schedule && profile?.weekly_schedule
    ? computeOverlap(myProfile.weekly_schedule, profile.weekly_schedule)
    : null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div
        className="aspect-square overflow-hidden cursor-pointer relative"
        onClick={() => !blur && onViewProfile?.(profile)}
      >
        {profile.photo_urls?.[0] ? (
          <img
            src={profile.photo_urls[0]}
            alt=""
            className={`w-full h-full object-cover ${blur ? "blur-md scale-110" : ""}`}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#1B2A4A] flex items-center justify-center text-white text-3xl font-bold ${blur ? "blur-sm" : ""}`}>
            {profile.display_name?.[0]}
          </div>
        )}
        {blur && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
            <Lock className="w-6 h-6 text-white mb-1" />
            <span className="text-white text-xs font-semibold">Like to reveal</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-slate-800 truncate">
          {blur ? "Someone likes you ❤️" : `${profile.display_name}${profile.age ? `, ${profile.age}` : ""}`}
        </p>
        {!blur && profile.profession && (
          <div className="mt-1.5">
            <ProfessionBadge profession={profile.profession} size="sm" />
          </div>
        )}
        {!blur && overlap && (
          <div className="flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
            <Clock className="w-3 h-3" />
            {overlap.percentage}% overlap
          </div>
        )}
        {!blur && onChat && (
          <button
            onClick={() => onChat(profile)}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-orange-50 text-[#FF6B35] text-xs font-semibold hover:bg-orange-100 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Message
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-rose-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      <p className="text-sm text-slate-400 mt-2">{sub}</p>
    </div>
  );
}

function MatchesInner() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    base44.auth.me().then(async (user) => {
      setCurrentUser(user);
      const all = await base44.entities.Conversation.list();
      setConversations(all.filter((c) => c.participant_emails?.includes(user.email)));
    });
  }, []);

  const openChat = async (profile) => {
    if (!currentUser?.email) return;
    const existing = conversations.find(
      (c) => c.participant_emails?.includes(currentUser.email) && c.participant_emails?.includes(profile.user_email)
    );
    let conv = existing;
    if (!conv) {
      conv = await base44.entities.Conversation.create({
        participant_emails: [currentUser.email, profile.user_email],
      });
      setConversations((prev) => [...prev, conv]);
    }
    navigate(createPageUrl(`Messages?conversationId=${conv.id}`));
  };

  const { data: myProfiles } = useQuery({
    queryKey: ["myProfile", currentUser?.email],
    queryFn: () => base44.entities.Profile.filter({ user_email: currentUser.email }),
    enabled: !!currentUser?.email,
    initialData: [],
  });
  const myProfile = myProfiles?.[0];

  // All matches I made
  const { data: mySwipes, isLoading: loadingSwipes } = useQuery({
    queryKey: ["mySwipes", currentUser?.email],
    queryFn: () => base44.entities.Match.filter({ user_email: currentUser.email }),
    enabled: !!currentUser?.email,
    initialData: [],
  });

  // People who swiped on me
  const { data: likedMe, isLoading: loadingLikedMe } = useQuery({
    queryKey: ["likedMe", currentUser?.email],
    queryFn: () => base44.entities.Match.filter({ target_email: currentUser.email }),
    enabled: !!currentUser?.email,
    initialData: [],
  });

  const { data: allProfiles } = useQuery({
    queryKey: ["allProfilesForMatches"],
    queryFn: () => base44.entities.Profile.filter({ is_complete: true }),
    enabled: !!currentUser?.email,
    initialData: [],
  });

  const getProfile = (id) => allProfiles.find((p) => p.id === id);
  const getProfileByEmail = (email) => allProfiles.find((p) => p.user_email === email);

  const mutualMatches = mySwipes
    .filter((m) => m.is_mutual)
    .map((m) => getProfile(m.target_profile_id))
    .filter(Boolean);

  const myLikes = mySwipes
    .filter((m) => ["like", "super_like"].includes(m.action))
    .map((m) => getProfile(m.target_profile_id))
    .filter(Boolean);

  const myInterested = mySwipes
    .filter((m) => m.action === "interested")
    .map((m) => getProfile(m.target_profile_id))
    .filter(Boolean);

  const mySuperLikes = mySwipes
    .filter((m) => m.action === "super_like")
    .map((m) => getProfile(m.target_profile_id))
    .filter(Boolean);

  // People who liked/super_liked/interested me (non-mutual means they haven't been matched yet)
  const whoLikedMe = likedMe
    .filter((m) => ["like", "super_like", "interested"].includes(m.action))
    .map((m) => ({
      swipe: m,
      profile: getProfileByEmail(m.user_email),
    }))
    .filter((x) => x.profile);

  const isLoading = loadingSwipes || loadingLikedMe;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Matches & Likes</h1>
          <p className="text-sm text-slate-400 mt-1">All your connections</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="matches">
            <TabsList className="w-full mb-6 bg-slate-100 rounded-xl p-1 grid grid-cols-4 text-xs">
              <TabsTrigger value="matches" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex flex-col gap-0.5 h-auto py-2">
                <Heart className="w-3.5 h-3.5" />
                <span>Matches</span>
                {mutualMatches.length > 0 && <span className="text-[10px] font-bold text-[#FF6B35]">{mutualMatches.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="liked_me" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex flex-col gap-0.5 h-auto py-2">
                <Star className="w-3.5 h-3.5" />
                <span>Liked Me</span>
                {whoLikedMe.length > 0 && <span className="text-[10px] font-bold text-[#FF6B35]">{whoLikedMe.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="my_likes" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex flex-col gap-0.5 h-auto py-2">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>My Likes</span>
                {myLikes.length > 0 && <span className="text-[10px] font-bold text-[#FF6B35]">{myLikes.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="interested" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex flex-col gap-0.5 h-auto py-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Interested</span>
                {myInterested.length > 0 && <span className="text-[10px] font-bold text-[#FF6B35]">{myInterested.length}</span>}
              </TabsTrigger>
            </TabsList>

            {/* Mutual Matches */}
            <TabsContent value="matches">
              {mutualMatches.length === 0 ? (
                <EmptyState icon={Heart} title="No matches yet" sub="Keep swiping — your shift buddy is out there!" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {mutualMatches.map((profile) => (
                    <ProfileThumb
                      key={profile.id}
                      profile={profile}
                      myProfile={myProfile}
                      onChat={openChat}
                      onViewProfile={(p) => navigate(createPageUrl(`ViewProfile?id=${p.id}`))}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Who Liked Me */}
            <TabsContent value="liked_me">
              <p className="text-xs text-slate-400 mb-4 text-center">Like them back to reveal their profile and match!</p>
              {whoLikedMe.length === 0 ? (
                <EmptyState icon={Star} title="No likes yet" sub="Keep your profile active to get noticed!" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {whoLikedMe.map(({ swipe, profile }) => {
                    // Check if it's already mutual
                    const isMutual = mySwipes.some((m) => m.target_email === profile.user_email && ["like","super_like","interested"].includes(m.action));
                    return (
                      <ProfileThumb
                        key={swipe.id}
                        profile={profile}
                        myProfile={myProfile}
                        onChat={isMutual ? openChat : undefined}
                        onViewProfile={isMutual ? (p) => navigate(createPageUrl(`ViewProfile?id=${p.id}`)) : undefined}
                        blur={!isMutual}
                      />
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* My Likes */}
            <TabsContent value="my_likes">
              {myLikes.length === 0 ? (
                <EmptyState icon={Heart} title="You haven't liked anyone yet" sub="Head to Discover and start swiping!" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {myLikes.map((profile) => {
                    const isMutual = mutualMatches.some((p) => p.id === profile.id);
                    return (
                      <ProfileThumb
                        key={profile.id}
                        profile={profile}
                        myProfile={myProfile}
                        onChat={isMutual ? openChat : undefined}
                        onViewProfile={(p) => navigate(createPageUrl(`ViewProfile?id=${p.id}`))}
                      />
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Interested */}
            <TabsContent value="interested">
              {myInterested.length === 0 ? (
                <EmptyState icon={ThumbsUp} title="No 'Interested' yet" sub="Tap the thumbs up on profiles you're curious about!" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {myInterested.map((profile) => {
                    const isMutual = mutualMatches.some((p) => p.id === profile.id);
                    return (
                      <ProfileThumb
                        key={profile.id}
                        profile={profile}
                        myProfile={myProfile}
                        onChat={isMutual ? openChat : undefined}
                        onViewProfile={(p) => navigate(createPageUrl(`ViewProfile?id=${p.id}`))}
                      />
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

const Matches = () => <RequireAuth><MatchesInner /></RequireAuth>;
export default Matches;