"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star, MapPin, Plus, Users, TrendingUp, Clock } from "lucide-react";
import { NavBar } from "@/components/NavBar";

const SKILL_FILTERS = ["All", "Design", "Development", "Marketing", "Content", "Video", "Social Media"];

const MOCK_FREELANCERS = [
  { id: 1, name: "Arjun Mehta", skill: "Development", location: "Bangalore", available: true, availableIn: null, rating: 4.9, completed: 34, initial: "A" },
  { id: 2, name: "Priya Singh", skill: "Design", location: "Mumbai", available: true, availableIn: null, rating: 4.8, completed: 28, initial: "P" },
  { id: 3, name: "Rohit Kumar", skill: "Marketing", location: "Delhi", available: false, availableIn: "2h", rating: 4.7, completed: 22, initial: "R" },
  { id: 4, name: "Sneha Patel", skill: "Content", location: "Pune", available: true, availableIn: null, rating: 5.0, completed: 41, initial: "S" },
  { id: 5, name: "Vikram Nair", skill: "Video", location: "Chennai", available: false, availableIn: "1h", rating: 4.6, completed: 19, initial: "V" },
  { id: 6, name: "Ananya Rao", skill: "Social Media", location: "Hyderabad", available: true, availableIn: null, rating: 4.8, completed: 31, initial: "A" },
  { id: 7, name: "Karan Gupta", skill: "Development", location: "Remote", available: true, availableIn: null, rating: 4.9, completed: 56, initial: "K" },
  { id: 8, name: "Meera Joshi", skill: "Design", location: "Jaipur", available: false, availableIn: "3h", rating: 4.7, completed: 25, initial: "M" },
  { id: 9, name: "Aditya Shah", skill: "Marketing", location: "Ahmedabad", available: true, availableIn: null, rating: 4.8, completed: 38, initial: "A" },
  { id: 10, name: "Tanvi Desai", skill: "Content", location: "Remote", available: true, availableIn: null, rating: 4.9, completed: 47, initial: "T" },
  { id: 11, name: "Rahul Verma", skill: "Video", location: "Kolkata", available: false, availableIn: "4h", rating: 4.5, completed: 16, initial: "R" },
  { id: 12, name: "Ishaan Malhotra", skill: "Social Media", location: "Gurgaon", available: true, availableIn: null, rating: 4.8, completed: 29, initial: "I" },
  { id: 13, name: "Divya Sharma", skill: "Design", location: "Noida", available: true, availableIn: null, rating: 4.6, completed: 23, initial: "D" },
  { id: 14, name: "Nikhil Reddy", skill: "Development", location: "Hyderabad", available: false, availableIn: "2h", rating: 4.9, completed: 61, initial: "N" },
];

const AVATAR_COLORS = [
  "from-purple-600 to-purple-400",
  "from-cyan-600 to-cyan-400",
  "from-pink-600 to-pink-400",
  "from-green-600 to-green-400",
  "from-orange-600 to-orange-400",
  "from-blue-600 to-blue-400",
];

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [target, duration]);

  return <span>{count.toLocaleString("en-IN")}</span>;
}

export default function EntrepreneurDashboard() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? MOCK_FREELANCERS
    : MOCK_FREELANCERS.filter((f) => {
        const map: Record<string, string> = {
          Content: "Content",
          Video: "Video",
        };
        const skill = map[activeFilter] || activeFilter;
        return f.skill === skill || f.skill.toLowerCase().includes(activeFilter.toLowerCase());
      });

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <NavBar showBack backHref="/" backLabel="Home" />

      <main className="pt-20 pb-24 px-4 max-w-7xl mx-auto">
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="glass border border-white/10 rounded-xl px-5 py-4 flex items-center gap-3 bg-white/5">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="pulse-dot scale-75" />
                <span className="text-lg font-bold text-white">
                  <AnimatedCounter target={247} />
                </span>
              </div>
              <p className="text-xs text-slate-400">Hustlers Live Now</p>
            </div>
          </div>

          <div className="glass border border-white/10 rounded-xl px-5 py-4 flex items-center gap-3 bg-white/5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">
                <AnimatedCounter target={1842} />
              </div>
              <p className="text-xs text-slate-400">Total Hustlers</p>
            </div>
          </div>

          <div className="glass border border-white/10 rounded-xl px-5 py-4 flex items-center gap-3 bg-white/5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">~2 min</div>
              <p className="text-xs text-slate-400">Avg. Match Time</p>
            </div>
          </div>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide"
        >
          {SKILL_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeFilter === filter
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </motion.div>

        {/* Freelancer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((freelancer, index) => (
            <motion.div
              key={freelancer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="glass border border-white/10 rounded-xl p-5 cursor-pointer
                hover:border-purple-500/30 hover:bg-white/5 transition-all duration-200 bg-white/5"
            >
              {/* Avatar */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]}
                  flex items-center justify-center text-white font-bold text-lg`}>
                  {freelancer.initial}
                </div>

                {/* Availability badge */}
                {freelancer.available ? (
                  <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full
                    bg-green-500/20 text-green-400 border border-green-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Available Now
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-full
                    bg-orange-500/20 text-orange-400 border border-orange-500/20">
                    Available in {freelancer.availableIn}
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-white text-sm mb-1">{freelancer.name}</h3>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs">
                  {freelancer.skill}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {freelancer.location}
                </span>
              </div>

              {/* Rating & stats */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < Math.floor(freelancer.rating) ? "fill-yellow-400" : "fill-transparent stroke-yellow-400"}`}
                    />
                  ))}
                  <span className="text-slate-400 ml-1">{freelancer.rating}</span>
                </div>
                <span className="text-slate-500">{freelancer.completed} briefs</span>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Floating Post Brief button */}
      <Link href="/entrepreneur/post-brief">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-6 py-4 rounded-2xl
            bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold
            shadow-2xl shadow-purple-500/30 cursor-pointer neon-glow"
        >
          <Plus className="w-5 h-5" />
          Post a Brief
        </motion.div>
      </Link>
    </div>
  );
}
