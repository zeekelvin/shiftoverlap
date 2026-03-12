import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import RequireAuth from "../components/shared/RequireAuth";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Heart, MessageCircle, Star, ThumbsUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function MatchesInner() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: myMatches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ["myMatches", currentUser?.email],
    queryFn: () => base44.entities.Match.filter({ user_email: currentUser.email }),
    enabled: !!currentUser?.email,
  });

  const { data: likedMe = [], isLoading: loadingLikedMe } = useQuery({
    queryKey: ["likedMe", currentUser?.email],
    queryFn: () => base44.entities.Match.filter({ target_email: currentUser.email }),
    enabled: !!currentUser?.email,
  });

  const { data: allProfiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ["allProfilesMatches"],
    queryFn: () => base44.entities.Profile.list(),
    enabled: !!currentUser?.email,
  });

  const getProfile = (email) => allProfiles.find((p) => p.user_email === email);

  const mutualMatches = myMatches.filter((m) => m.is_mutual && ["like", "super_like", "interested"].includes(m.action));
  const theyLikedMe = likedMe.filter((m) => ["like", "super_like", "interested"].includes(m.action));
  const iLiked = myMatches.filter((m) => ["like", "super_like"].includes(m.action) && !m.is_mutual);
  const interested = myMatches.filter((m) => m.action === "interested" && !m.is_mutual);

  const handleChat = async (otherEmail) => {
    const all = await base44.entities.Conversation.list();
    const existing = all.find(
      (c) => c.participant_emails?.includes(currentUser.email) && c.participant_emails?.includes(otherEmail)
    );
    let conv = existing;
    if (!conv) {
      conv = await base44.entities.Conversation.create({ participant_emails: [currentUser.email, otherEmail] });
    }
    navigate(createPageUrl(`Messages?conversationId=${conv.id}`));
  };

  const isLoading = loadingMatches || loadingLikedMe || loadingProfiles;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
      </div>
    );
  }

  const ProfileTile = ({ email, action, blurred = false }) => {
    const profile = getProfile(email);
    const photo = profile?.photo_urls?.[0];
    const name = profile?.display_name || email.split("@")[0];

    return (
      <div
        className="relative cursor-pointer group"
        onClick={() => !blurred && profile && navigate(createPageUrl(`ViewProfile?id=${profile.id}`))}
      >
        <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${blurred ? "blur-md" : ""}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FF6B35] to-[#1B2A4A]">
              <span className="text-2xl font-bold text-white/60">{name[0]?.toUpperCase()}</span>
            </div>
          )}
          {blurred && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700">Like to reveal</div>
            </div>
          )}
          {action === "super_like" && !blurred && (
            <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
          )}
        </div>
        <p className="text-xs font-semibold text-slate-700 mt-1.5 truncate">{blurred ? "???" : name}</p>
        {!blurred && (
          <button
            onClick={(e) => { e.stopPropagation(); handleChat(email); }}
            className="absolute bottom-7 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#FF6B35] rounded-full p-1.5 shadow-lg"
          >
            <MessageCircle className="w-3.5 h-3.5 text-white" />
          </button>
        )}
      </div>
    );
  };

  const EmptyState = ({ icon: Icon, text }) => (
    <div className="col-span-3 py-16 flex flex-col items-center gap-3 text-slate-400">
      <Icon className="w-10 h-10 opacity-30" />
      <p className="text-sm">{text}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Matches</h1>
          <p className="text-sm text-slate-400 mt-1">Your connections</p>
        </div>

        <Tabs defaultValue="mutual">
          <TabsList className="w-full grid grid-cols-4 mb-6">
            <TabsTrigger value="mutual" className="text-xs">
              Matches {mutualMatches.length > 0 && <span className="ml-1 bg-[#FF6B35] text-white rounded-full text-[10px] px-1.5">{mutualMatches.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="likedme" className="text-xs">
              Liked Me {theyLikedMe.length > 0 && <span className="ml-1 bg-rose-500 text-white rounded-full text-[10px] px-1.5">{theyLikedMe.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="iliked" className="text-xs">My Likes</TabsTrigger>
            <TabsTrigger value="interested" className="text-xs">Interested</TabsTrigger>
          </TabsList>

          <TabsContent value="mutual">
            <div className="grid grid-cols-3 gap-3">
              {mutualMatches.length === 0 ? (
                <EmptyState icon={Heart} text="No mutual matches yet — keep swiping!" />
              ) : (
                mutualMatches.map((m) => (
                  <ProfileTile key={m.id} email={m.target_email} action={m.action} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="likedme">
            <div className="grid grid-cols-3 gap-3">
              {theyLikedMe.length === 0 ? (
                <EmptyState icon={Heart} text="No one has liked you yet" />
              ) : (
                theyLikedMe.map((m) => (
                  <ProfileTile key={m.id} email={m.user_email} action={m.action} blurred={!myMatches.some((mm) => mm.target_email === m.user_email && ["like","super_like","interested"].includes(mm.action))} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="iliked">
            <div className="grid grid-cols-3 gap-3">
              {iLiked.length === 0 ? (
                <EmptyState icon={Star} text="You haven't liked anyone yet" />
              ) : (
                iLiked.map((m) => (
                  <ProfileTile key={m.id} email={m.target_email} action={m.action} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="interested">
            <div className="grid grid-cols-3 gap-3">
              {interested.length === 0 ? (
                <EmptyState icon={ThumbsUp} text="No 'Interested' connections yet" />
              ) : (
                interested.map((m) => (
                  <ProfileTile key={m.id} email={m.target_email} action={m.action} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

const Matches = () => <RequireAuth><MatchesInner /></RequireAuth>;
export default Matches;