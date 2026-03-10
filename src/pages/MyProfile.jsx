import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Camera, X, Save, LogOut, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ProfessionBadge, { PROFESSION_MAP } from "../components/shared/ProfessionBadge";
import ShiftBadge, { SHIFT_MAP } from "../components/shared/ShiftBadge";
import WeeklyCalendar from "../components/shared/WeeklyCalendar";
import { toast } from "sonner";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_BLOCKS = [
  { key: "morning", label: "Morning", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { key: "afternoon", label: "Afternoon", color: "bg-orange-100 text-orange-700 border-orange-300" },
  { key: "evening", label: "Evening", color: "bg-violet-100 text-violet-700 border-violet-300" },
  { key: "night", label: "Night", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
];

const INTERESTS = [
  "Fitness", "Cooking", "Reading", "Hiking", "Movies", "Music", "Travel", "Gaming",
  "Photography", "Yoga", "Cycling", "Coffee", "Wine", "Dogs", "Cats", "Art",
  "Dancing", "Fishing", "Sports", "Board Games", "Volunteering", "Meditation",
];

export default function MyProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["myProfile", currentUser?.email],
    queryFn: () => base44.entities.Profile.filter({ user_email: currentUser.email }),
    enabled: !!currentUser?.email,
    initialData: [],
  });

  const profile = profiles?.[0];

  useEffect(() => {
    if (profile && !form) {
      setForm({ ...profile });
    }
  }, [profile]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleScheduleSlot = (day, block) => {
    setForm((f) => {
      const schedule = { ...(f.weekly_schedule || {}) };
      const daySlots = schedule[day] || [];
      if (daySlots.includes(block)) {
        schedule[day] = daySlots.filter((s) => s !== block);
      } else {
        schedule[day] = [...daySlots, block];
      }
      return { ...f, weekly_schedule: schedule };
    });
  };

  const toggleInterest = (interest) => {
    setForm((f) => ({
      ...f,
      interests: f.interests?.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...(f.interests || []), interest],
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, photo_urls: [...(f.photo_urls || []), file_url] }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { id, created_date, updated_date, created_by, ...data } = form;
      await base44.entities.Profile.update(profile.id, data);
    },
    onSuccess: () => {
      toast.success("Profile saved!");
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });

  if (isLoading || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-32">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1B2A4A]">My Profile</h1>
          {profile?.id && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(createPageUrl(`ViewProfile?id=${profile.id}`))}
              className="text-[#FF6B35] border-orange-200 rounded-full"
            >
              <Eye className="w-4 h-4 mr-1" /> Preview
            </Button>
          )}
        </div>

        {/* Photos */}
        <Card>
          <CardHeader><CardTitle className="text-base">Photos</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {form.photo_urls?.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => update("photo_urls", form.photo_urls.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {(form.photo_urls?.length || 0) < 6 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6B35] transition-colors">
                  <Camera className="w-5 h-5 text-slate-400" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basics */}
        <Card>
          <CardHeader><CardTitle className="text-base">About Me</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Display Name</Label>
                <Input value={form.display_name || ""} onChange={(e) => update("display_name", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Age</Label>
                <Input type="number" value={form.age || ""} onChange={(e) => update("age", Number(e.target.value))} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea value={form.bio || ""} onChange={(e) => update("bio", e.target.value)} className="mt-1 h-20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input value={form.city || ""} onChange={(e) => update("city", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>State</Label>
                <Input value={form.state || ""} onChange={(e) => update("state", e.target.value)} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Career */}
        <Card>
          <CardHeader><CardTitle className="text-base">Work & Shifts</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Profession</Label>
              <Select value={form.profession || ""} onValueChange={(v) => update("profession", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PROFESSION_MAP).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Shift Pattern</Label>
              <Select value={form.shift_pattern || ""} onValueChange={(v) => update("shift_pattern", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SHIFT_MAP).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Availability</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Tap or drag cells to mark when you're free</p>
          </CardHeader>
          <CardContent>
            <WeeklyCalendar
              schedule={form.weekly_schedule || {}}
              onChange={(newSchedule) => update("weekly_schedule", newSchedule)}
            />
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader><CardTitle className="text-base">Interests</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const active = form.interests?.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      active ? "bg-[#FF6B35] text-white border-[#FF6B35]" : "bg-white text-slate-500 border-slate-200"
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] text-white h-12 rounded-xl"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
          <Button
            variant="ghost"
            onClick={() => base44.auth.logout()}
            className="w-full text-slate-400 h-12"
          >
            <LogOut className="w-4 h-4 mr-2" /> Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}