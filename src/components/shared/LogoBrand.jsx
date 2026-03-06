import React from "react";

export default function LogoBrand({ size = "md", showText = true }) {
  const sizes = {
    sm: { img: "h-8 w-8", text: "text-lg" },
    md: { img: "h-10 w-10", text: "text-xl" },
    lg: { img: "h-16 w-16", text: "text-3xl" },
    xl: { img: "h-24 w-24", text: "text-5xl" },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-2">
      <img
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_694729cacc7539ed84d9c7f5/e96193233_ChatGPTImageMar62026at12_14_00AM.png"
        alt="ShiftOverlap"
        className={`${s.img} object-contain`}
      />
      {showText && (
        <span className={`${s.text} font-bold tracking-tight`}>
          <span className="text-[#1B2A4A]">Shift</span>
          <span className="text-[#FF6B35]">Overlap</span>
        </span>
      )}
    </div>
  );
}