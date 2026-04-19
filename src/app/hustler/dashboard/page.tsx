"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, IndianRupee, Zap, Bell, Check, X, Wifi } from "lucide-react";
import { NavBar } from "@/components/NavBar";

const MOCK_BRIEFS = [
  {
    id: 1,
    title: "Build a React Landing Page",
    skill: "Development",
    budget: 8000,
    urgency: "Urgent",
    location: "Remote",
    postedAt: "2 mins ago",
    color: "purple",
  },
  {
    id: 2,
    title: "Design a Brand Identity Kit",
    skill: "Design",
    budget: 12000,
    urgency: "Normal",
    location: "Mumbai",
    postedAt: "5 mins ago",
    color: "cyan",
  },
  {
    id: 3,
    title: "Write 10 SEO Blog Posts",
    skill: "Content Writing",
    budget: 5000,
    urgency: "Normal",
    location: "Remote",
    postedAt: "8 mins ago",
    color: "green",
  },
  {
    id: 4,
    title: "Run Instagram Ads Campaign",
    skill: "Social Media",
    budget: 6500,
    urgency: "Urgent",
    location: "Remote",
    postedAt: "12 mins ago",
    color: "pink",
  },
  {
    id: 5,
    title: "Edit 3 Product Launch Videos",
    skill: "Video Editing",
    budget: 9000,
    urgency: "Urgent",
    location: "Delhi",
    postedAt: "18 mins ago",
    color: "orange",
  },
  {
    id: 6,
    title: "Create Go-to-Market Strategy",
    skill: "Marketing",
    budget: 15000,
    urgency: "Normal",
    location: "Remote",
    postedAt: "24 mins ago",
    color: "blue",
  },
];

const SKILL_COLORS: Record<string, string> = {
  Development: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Design: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "Content Writing": "bg-green-500/20 text-green-300 border-green-500/30",
  "Social Media": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Video Editing": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Marketing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

export default function HustlerDashboard() {
  const [matchState, setMatchState] = useState<"idle" | "incoming" | "accepted">("idle");
  const [showMatch, setShowMatch] = useState(false);

  useEffect(() => {
    // Simulate incoming match after 3 seconds
    const timer = setTimeout(() => {
      setMatchState("incoming");
      setShowMatch(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    setMatchState("accepted");
  };

  const handleReject = () => {
    setShowMatch(false);
    setMatchState("idle");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <NavBar showBack backHref="/" backLabel="Home" />

      <main className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">Hustler Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Live briefs from founders near you</p>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
            <span className="pulse-dot" />
            <span className="text-green-400 font-semibold text-sm">You&apos;re Live</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-300">Live Briefs Feed</span>
              <span className="text-xs text-slate-500 ml-auto">Updated every 30s</span>
            </div>

            <div className="space-y-4">
              {MOCK_BRIEFS.map((brief, index) => (
                <motion.div
                  key={brief.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="feed-card glass border border-white/10 rounded-xl p-5 cursor-pointer
                    hover:border-purple-500/30 hover:bg-white/5 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-semibold text-white text-sm group-hover:text-purple-300 transition-colors">
                          {brief.title}
                        </h3>
                        {brief.urgency === "Urgent" && (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full
                            bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                            <Zap className="w-3 h-3" />
                            Urgent
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                        <span className={`px-2 py-1 rounded-lg border text-xs ${SKILL_COLORS[brief.skill] || "bg-slate-500/20 text-slate-300 border-slate-500/30"}`}>
                          {brief.skill}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {brief.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {brief.postedAt}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-green-400 font-bold text-lg">
                        <IndianRupee className="w-4 h-4" />
                        {brief.budget.toLocaleString("en-IN")}
                      </div>
                      <button className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-purple-600 text-white
                        hover:bg-purple-500 transition-colors font-medium">
                        Apply
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Stats card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass border border-white/10 rounded-xl p-5 mb-4 bg-white/5"
            >
              <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                Your Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Briefs Applied", value: "12" },
                  { label: "Matches", value: "4" },
                  { label: "Completed", value: "3" },
                  { label: "Earnings", value: "₹24k" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Incoming Match */}
            <AnimatePresence>
              {showMatch && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="relative overflow-hidden rounded-xl border"
                  style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))",
                    borderColor: matchState === "accepted" ? "rgba(74,222,128,0.4)" : "rgba(124,58,237,0.4)",
                  }}
                >
                  <div className="p-5">
                    {matchState === "incoming" && (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                          <span className="text-sm font-semibold text-purple-300">Incoming Match!</span>
                        </div>
                        <p className="text-white text-sm font-medium mb-1">
                          🎉 A founder is looking for a
                        </p>
                        <p className="text-purple-300 font-bold mb-4">Design expert</p>
                        <p className="text-slate-400 text-xs mb-4">
                          Match found based on your profile. Accept to share your contact details.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAccept}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                              bg-green-600 text-white text-sm font-semibold hover:bg-green-500 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Accept
                          </button>
                          <button
                            onClick={handleReject}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                              bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Pass
                          </button>
                        </div>
                      </>
                    )}

                    {matchState === "accepted" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="text-center py-2">
                          <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/40
                            flex items-center justify-center mx-auto mb-3">
                            <Check className="w-6 h-6 text-green-400" />
                          </div>
                          <p className="text-green-400 font-bold mb-2">Matched!</p>
                          <p className="text-slate-300 text-xs leading-relaxed">
                            The founder may reach out via call or WhatsApp. Your contact has been shared.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Animated top border */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 animated-gradient" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 glass border border-white/10 rounded-xl p-4 bg-white/5"
            >
              <p className="text-xs font-semibold text-slate-400 mb-3">Quick Tips</p>
              {[
                "Complete your profile for 3x more matches",
                "Apply within 10 mins for best results",
                "Keep your availability status updated",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-slate-500">{tip}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
