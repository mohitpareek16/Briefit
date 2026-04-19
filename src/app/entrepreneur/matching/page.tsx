"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Star, MapPin, Phone, MessageCircle, ArrowLeft, Check } from "lucide-react";
import { NavBar } from "@/components/NavBar";

const LOADING_STEPS = [
  "Scanning profiles...",
  "Analyzing skills...",
  "Ranking by availability...",
  "Done!",
];

const MATCHED_FREELANCERS = [
  {
    id: 1,
    name: "Arjun Mehta",
    skill: "Development",
    location: "Bangalore",
    available: true,
    rating: 4.9,
    completed: 34,
    initial: "A",
    phone: "+919876543210",
    gradient: "from-purple-600 to-purple-400",
  },
  {
    id: 2,
    name: "Karan Gupta",
    skill: "Development",
    location: "Remote",
    available: true,
    rating: 4.9,
    completed: 56,
    initial: "K",
    phone: "+919876543211",
    gradient: "from-cyan-600 to-cyan-400",
  },
  {
    id: 3,
    name: "Nikhil Reddy",
    skill: "Development",
    location: "Hyderabad",
    available: false,
    availableIn: "2h",
    rating: 4.9,
    completed: 61,
    initial: "N",
    phone: "+919876543212",
    gradient: "from-green-600 to-green-400",
  },
  {
    id: 4,
    name: "Priya Singh",
    skill: "Design",
    location: "Mumbai",
    available: true,
    rating: 4.8,
    completed: 28,
    initial: "P",
    phone: "+919876543213",
    gradient: "from-pink-600 to-pink-400",
  },
];

const STARTUP_NAME = "TechFlow";

function NeuralNetworkAnimation() {
  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border-2 border-purple-500/40"
        style={{ borderTopColor: "#7c3aed", borderRightColor: "transparent" }}
      />

      {/* Middle ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute inset-4 rounded-full border-2 border-cyan-500/40"
        style={{ borderTopColor: "transparent", borderRightColor: "#06b6d4" }}
      />

      {/* Inner ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-8 rounded-full border-2 border-purple-400/60"
        style={{ borderTopColor: "#a855f7", borderRightColor: "transparent" }}
      />

      {/* Center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500
            flex items-center justify-center"
        >
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-2xl"
          >
            🧠
          </motion.div>
        </motion.div>
      </div>

      {/* Orbiting dots */}
      {[0, 90, 180, 270].map((angle, i) => (
        <motion.div
          key={i}
          animate={{ rotate: 360 }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
          style={{ transformOrigin: "50% 50%" }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full bg-purple-400 absolute"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${angle}deg) translateX(60px) translateY(-50%)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default function MatchingPage() {
  const [loadingStep, setLoadingStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 3500;
    const stepDuration = totalDuration / LOADING_STEPS.length;

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return p + 1;
      });
    }, totalDuration / 100);

    LOADING_STEPS.forEach((_, i) => {
      setTimeout(() => setLoadingStep(i), i * stepDuration);
    });

    const showTimer = setTimeout(() => {
      setShowResults(true);
    }, totalDuration + 500);

    return () => {
      clearTimeout(showTimer);
      clearInterval(progressInterval);
    };
  }, []);

  const buildWhatsAppLink = (name: string, phone: string) => {
    const message = encodeURIComponent(
      `Hi ${name}, I'm a founder working on ${STARTUP_NAME}. I found your profile on Briefit and I'm interested in discussing a brief with you. Are you available for a quick chat?`
    );
    return `https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-purple-900/20 to-transparent" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl" />

      <NavBar showBack backHref="/entrepreneur/post-brief" backLabel="Edit Brief" />

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-24">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-sm w-full"
            >
              <NeuralNetworkAnimation />

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white mt-8 mb-2"
              >
                Making the perfect match...
              </motion.h2>

              {/* Progress bar */}
              <div className="w-full bg-white/10 rounded-full h-1.5 mb-6 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-cyan-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Steps */}
              <div className="space-y-2">
                {LOADING_STEPS.map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: i <= loadingStep ? 1 : 0.3,
                      x: 0,
                    }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="flex items-center justify-center gap-2 text-sm"
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      i < loadingStep
                        ? "bg-green-500"
                        : i === loadingStep
                        ? "bg-purple-500 animate-pulse"
                        : "bg-white/10"
                    }`}>
                      {i < loadingStep && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className={i <= loadingStep ? "text-white" : "text-slate-600"}>
                      {step}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-4xl"
            >
              {/* Header */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400
                    flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2">Perfect Matches Found!</h1>
                <p className="text-slate-400">
                  We found <span className="text-purple-400 font-semibold">{MATCHED_FREELANCERS.length} hustlers</span> that match your brief perfectly.
                </p>
              </div>

              {/* Freelancer cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {MATCHED_FREELANCERS.map((freelancer, index) => (
                  <motion.div
                    key={freelancer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="glass border border-white/10 rounded-xl p-5 bg-white/5
                      hover:border-purple-500/30 transition-all duration-200"
                  >
                    {/* Top row */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${freelancer.gradient}
                        flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                        {freelancer.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-white">{freelancer.name}</h3>
                          {freelancer.available ? (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full
                              bg-green-500/20 text-green-400 border border-green-500/20 flex-shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                              Available Now
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0
                              bg-orange-500/20 text-orange-400 border border-orange-500/20">
                              in {(freelancer as { availableIn?: string }).availableIn}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span className="text-purple-300">{freelancer.skill}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {freelancer.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-between mb-4 text-sm">
                      <div className="flex items-center gap-1 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < Math.floor(freelancer.rating) ? "fill-yellow-400" : "fill-transparent stroke-yellow-400"}`}
                          />
                        ))}
                        <span className="text-slate-400 ml-1 text-xs">{freelancer.rating}</span>
                      </div>
                      <span className="text-slate-500 text-xs">{freelancer.completed} briefs completed</span>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex gap-2">
                      <a
                        href={buildWhatsAppLink(freelancer.name, freelancer.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                          bg-green-600 hover:bg-green-500 text-white text-sm font-semibold
                          transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${freelancer.phone}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                          bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold
                          transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Back button */}
              <div className="text-center">
                <Link
                  href="/entrepreneur/dashboard"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors
                    px-4 py-2 rounded-xl hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
