import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";

export default function MatchPopup({ myProfile, theirProfile, onChat, onKeepSwiping }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
      >
        {/* Confetti-ish header */}
        <div className="relative mb-6">
          <div className="text-5xl font-black bg-gradient-to-r from-[#FF6B35] to-[#1B2A4A] bg-clip-text text-transparent">
            It's a Match!
          </div>
          <p className="text-slate-500 mt-2 text-sm">Your shifts overlap — time to connect!</p>
        </div>

        {/* Avatars */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#FF6B35] shadow-lg">
            {myProfile?.photo_urls?.[0] ? (
              <img src={myProfile.photo_urls[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#FF8F5E] flex items-center justify-center text-white text-2xl font-bold">
                {myProfile?.display_name?.[0]}
              </div>
            )}
          </div>
          <div className="text-3xl">❤️</div>
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#1B2A4A] shadow-lg">
            {theirProfile?.photo_urls?.[0] ? (
              <img src={theirProfile.photo_urls[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1B2A4A] to-[#2d4270] flex items-center justify-center text-white text-2xl font-bold">
                {theirProfile?.display_name?.[0]}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onChat}
            className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] text-white h-12 rounded-xl text-base"
          >
            <MessageCircle className="w-5 h-5 mr-2" /> Send a Message
          </Button>
          <Button
            variant="ghost"
            onClick={onKeepSwiping}
            className="w-full text-slate-500 h-12"
          >
            Keep Swiping <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}