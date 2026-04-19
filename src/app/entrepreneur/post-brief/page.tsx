"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronDown, IndianRupee, FileText, Rocket } from "lucide-react";
import { NavBar } from "@/components/NavBar";

const SKILLS = [
  "Design",
  "Development",
  "Marketing",
  "Content Writing",
  "Video Editing",
  "Social Media",
  "Finance",
  "Legal",
  "Other",
];

export default function PostBriefPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    skill: "",
    budget: "",
    urgency: "Normal",
    location: "Remote",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.skill) newErrors.skill = "Please select a skill";
    if (!form.budget || isNaN(Number(form.budget))) newErrors.budget = "Please enter a valid budget";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      router.push("/entrepreneur/matching");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl" />

      <NavBar showBack backHref="/entrepreneur/dashboard" backLabel="Dashboard" />

      <main className="relative z-10 flex items-start justify-center min-h-screen px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500
                flex items-center justify-center neon-glow">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Post a Brief</h1>
                <p className="text-slate-400 text-sm">Describe what you need and we&apos;ll find the perfect hustler</p>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="glass border border-white/10 rounded-2xl p-8 bg-white/5">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Brief Title</label>
                <input
                  type="text"
                  placeholder="e.g. Build a landing page for my SaaS product"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  className="input-field"
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  placeholder="Describe the work in detail — deliverables, timeline, any specific requirements..."
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={4}
                  className="input-field resize-none"
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Skill + Budget row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Skill Required</label>
                  <div className="relative">
                    <select
                      value={form.skill}
                      onChange={(e) => update("skill", e.target.value)}
                      className="input-field appearance-none pr-10 cursor-pointer"
                    >
                      <option value="" disabled>Select skill</option>
                      {SKILLS.map((s) => (
                        <option key={s} value={s} className="bg-[#111118]">{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  {errors.skill && <p className="text-red-400 text-xs mt-1">{errors.skill}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Budget</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      placeholder="5000"
                      value={form.budget}
                      onChange={(e) => update("budget", e.target.value)}
                      className="input-field pl-10"
                      min="0"
                    />
                  </div>
                  {errors.budget && <p className="text-red-400 text-xs mt-1">{errors.budget}</p>}
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Urgency</label>
                <div className="flex gap-4">
                  {["Urgent", "Normal"].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        form.urgency === opt
                          ? "border-purple-500 bg-purple-500"
                          : "border-white/30 group-hover:border-purple-400"
                      }`}>
                        {form.urgency === opt && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="urgency"
                        value={opt}
                        checked={form.urgency === opt}
                        onChange={(e) => update("urgency", e.target.value)}
                        className="sr-only"
                      />
                      <div>
                        <span className={`text-sm font-medium ${form.urgency === opt ? "text-white" : "text-slate-400"}`}>
                          {opt}
                        </span>
                        {opt === "Urgent" && (
                          <p className="text-xs text-slate-500">Need this ASAP</p>
                        )}
                        {opt === "Normal" && (
                          <p className="text-xs text-slate-500">Flexible timeline</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location preference */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Freelancer Location</label>
                <div className="flex gap-3 flex-wrap">
                  {["Remote", "My City", "Anywhere"].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        form.location === opt
                          ? "border-cyan-500 bg-cyan-500"
                          : "border-white/30 group-hover:border-cyan-400"
                      }`}>
                        {form.location === opt && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="location"
                        value={opt}
                        checked={form.location === opt}
                        onChange={(e) => update("location", e.target.value)}
                        className="sr-only"
                      />
                      <span className={`text-sm font-medium ${form.location === opt ? "text-white" : "text-slate-400"}`}>
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-white
                  bg-gradient-to-r from-purple-600 to-cyan-600
                  hover:from-purple-500 hover:to-cyan-500
                  hover:shadow-xl hover:shadow-purple-500/20
                  transition-all duration-200 text-lg"
              >
                <Rocket className="w-5 h-5" />
                Find My Hustler
              </motion.button>
            </form>
          </div>

          {/* Info */}
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Our AI matches you with the best available hustler in under 2 minutes
          </div>
        </motion.div>
      </main>
    </div>
  );
}
