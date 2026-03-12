import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Camera, X, Loader2, Check, Home, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LogoBrand from "../shared/LogoBrand";
import { PROFESSION_MAP } from "../shared/ProfessionBadge";
import { SHIFT_MAP } from "../shared/ShiftBadge";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_BLOCKS = [
  { key: "morning", label: "Morning", sub: "6am–12pm", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { key: "afternoon", label: "Afternoon", sub: "12pm–5pm", color: "bg-orange-100 text-orange-700 border-orange-300" },
  { key: "evening", label: "Evening", sub: "5pm–10pm", color: "bg-violet-100 text-violet-700 border-violet-300" },
  { key: "night", label: "Night", sub: "10pm–6am", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
];

const INTERESTS = [
  "Fitness", "Cooking", "Reading", "Hiking", "Movies", "Music", "Travel", "Gaming",
  "Photography", "Yoga", "Cycling", "Coffee", "Wine", "Dogs", "Cats", "Art",
  "Dancing", "Fishing", "Sports", "Board Games", "Volunteering", "Meditation",
];

const STEPS = ["Basics", "Career", "Schedule", "Interests", "Photos"];

export default function ProfileSetupSteps({ onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    age: "",
    gender: "",
    looking_for: "",
    profession: "",
    profession_detail: "",
    shift_pattern: "",
    bio: "",
    city: "",
    state: "",
    interests: [],
    weekly_schedule: {},
    photo_urls: [],
  });

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleInterest = (interest) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  };

  const toggleScheduleSlot = (day, block) => {
    setForm((f) => {
      const schedule = { ...f.weekly_schedule };
      const daySlots = schedule[day] || [];
      if (daySlots.includes(block)) {
        schedule[day] = daySlots.filter((s) => s !== block);
      } else {
        schedule[day] = [...daySlots, block];
      }
      return { ...f, weekly_schedule: schedule };
    });
  };

  const handlePhotoUpload = async (e, replaceIdx = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((f) => {
      if (replaceIdx !== null) {
        const updated = [...f.photo_urls];
        updated[replaceIdx] = file_url;
        return { ...f, photo_urls: updated };
      }
      return { ...f, photo_urls: [...f.photo_urls, file_url] };
    });
  };

  const removePhoto = (idx) => {
    setForm((f) => ({ ...f, photo_urls: f.photo_urls.filter((_, i) => i !== idx) }));
  };

  const handleFinish = async () => {
    setSaving(true);
    const user = await base44.auth.me();
    await base44.entities.Profile.create({
      ...form,
      user_email: user.email,
      age: Number(form.age),
      is_complete: true,
    });
    setSaving(false);
    onComplete?.();
  };

  const canProceed = () => {
    if (step === 0) return form.display_name && form.age && form.gender && form.looking_for;
    if (step === 1) return form.profession && form.shift_pattern;
    if (step === 2) return Object.keys(form.weekly_schedule).some((d) => form.weekly_schedule[d]?.length > 0);
    if (step === 3) return form.interests.length >= 3;
    if (step === 4) return form.photo_urls.length >= 1;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex flex-col">
      {/* Header */}
      <div className="p-6 flex justify-center">
        <LogoBrand size="md" />
      </div>

      {/* Progress */}
      <div className="px-6 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-1 mb-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                i <= step ? "bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E]" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400 mb-8">
          {STEPS.map((s, i) => (
            <span key={s} className={i === step ? "text-[#FF6B35] font-semibold" : ""}>{s}</span>
          ))}
        </div>
      </div>

      {/* Steps content */}
      <div className="flex-1 px-6 max-w-lg mx-auto w-full pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {/* Step 0: Basics */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-[#1B2A4A]">Let's get started</h2>
                  <p className="text-slate-500 mt-1">Tell us a bit about yourself</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Display Name</Label>
                    <Input value={form.display_name} onChange={(e) => update("display_name", e.target.value)} placeholder="Your first name" className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Age</Label>
                      <Input type="number" value={form.age} onChange={(e) => update("age", e.target.value)} placeholder="25" className="mt-1" />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non_binary">Non-Binary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>I'm looking for</Label>
                    <Select value={form.looking_for} onValueChange={(v) => update("looking_for", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Men</SelectItem>
                        <SelectItem value="female">Women</SelectItem>
                        <SelectItem value="everyone">Everyone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>City</Label>
                      <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Dallas" className="mt-1" />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="TX" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Night owl ER nurse who loves sunrise coffee dates..." className="mt-1 h-20" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Career */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-[#1B2A4A]">Your Work Life</h2>
                  <p className="text-slate-500 mt-1">This is what makes ShiftOverlap special — we match based on your schedule</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Profession</Label>
                    <Select value={form.profession} onValueChange={(v) => update("profession", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select your field" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(PROFESSION_MAP).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Specific Role (optional)</Label>
                    <Input value={form.profession_detail} onChange={(e) => update("profession_detail", e.target.value)} placeholder="e.g. ICU Nurse, Ladder Truck Captain" className="mt-1" />
                  </div>
                  <div>
                    <Label>Shift Pattern</Label>
                    <Select value={form.shift_pattern} onValueChange={(v) => update("shift_pattern", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select your shift type" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(SHIFT_MAP).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Schedule */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-[#1B2A4A]">When Are You Free?</h2>
                  <p className="text-slate-500 mt-1">Tap the time slots when you're typically available for dates</p>
                </div>
                <div className="space-y-3">
                  {DAYS.map((day, di) => (
                    <div key={day} className="space-y-1.5">
                      <Label className="text-xs text-slate-500 uppercase tracking-wider">{DAY_LABELS[di]}</Label>
                      <div className="flex gap-2 flex-wrap">
                        {TIME_BLOCKS.map((block) => {
                          const active = form.weekly_schedule[day]?.includes(block.key);
                          return (
                            <button
                              key={block.key}
                              type="button"
                              onClick={() => toggleScheduleSlot(day, block.key)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                active
                                  ? block.color + " border-current shadow-sm"
                                  : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              {block.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Interests */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-[#1B2A4A]">What Do You Love?</h2>
                  <p className="text-slate-500 mt-1">Pick at least 3 interests</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => {
                    const active = form.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                          active
                            ? "bg-[#FF6B35] text-white border-[#FF6B35] shadow-md shadow-orange-200"
                            : "bg-white text-slate-600 border-slate-200 hover:border-[#FF6B35] hover:text-[#FF6B35]"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400">{form.interests.length}/3 minimum selected</p>
              </div>
            )}

            {/* Step 4: Photos */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-[#1B2A4A]">Show Yourself</h2>
                  <p className="text-slate-500 mt-1">Upload at least 1 photo</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {form.photo_urls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {form.photo_urls.length < 6 && (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6B35] hover:bg-orange-50 transition-colors">
                      <Camera className="w-6 h-6 text-slate-400" />
                      <span className="text-xs text-slate-400 mt-1">Add</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-100 p-4 z-50">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex-1 bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] hover:from-[#e5602f] hover:to-[#e57f52] text-white"
            >
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={!canProceed() || saving}
              className="flex-1 bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] hover:from-[#e5602f] hover:to-[#e57f52] text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
              {saving ? "Creating Profile..." : "Launch My Profile"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}