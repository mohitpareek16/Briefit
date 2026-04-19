"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { MapPin, ChevronDown, Phone, Rocket, ArrowRight, ArrowLeft, Check, Building2 } from "lucide-react";
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

const REFERRAL_SOURCES = [
  "Instagram",
  "LinkedIn",
  "Friend/Referral",
  "Google",
  "Other",
];

const COUNTRY_CODES = ["+91", "+1", "+44", "+61", "+971"];

const STEPS = ["About You", "Your Startup", "Contact Details"];

export default function EntrepreneurRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    startupName: "",
    skillNeeded: "",
    location: "",
    referral: "",
    countryCode: "+91",
    mobile: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!form.name.trim()) newErrors.name = "Name is required";
    }
    if (step === 1) {
      if (!form.startupName.trim()) newErrors.startupName = "Startup name is required";
      if (!form.skillNeeded) newErrors.skillNeeded = "Please select a skill you need";
      if (!form.location.trim()) newErrors.location = "Location is required";
    }
    if (step === 2) {
      if (!form.referral) newErrors.referral = "Please select an option";
      if (!form.mobile.trim()) newErrors.mobile = "Mobile number is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < STEPS.length - 1) {
        setStep((s) => s + 1);
      } else {
        router.push("/entrepreneur/dashboard");
      }
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute -top-40 left-0 w-80 h-80 bg-cyan-700/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />

      <NavBar showBack backHref="/" backLabel="Home" />

      <main className="relative z-10 flex items-center justify-center min-h-screen px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-cyan-400
              flex items-center justify-center mx-auto mb-4 neon-glow-cyan">
              <Rocket className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join as an Entrepreneur</h1>
            <p className="text-slate-400 text-sm">Find the perfect hustler for your startup</p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 ${
                  i < step
                    ? "bg-cyan-600 text-white"
                    : i === step
                    ? "bg-cyan-600 text-white ring-4 ring-cyan-500/30"
                    : "bg-white/10 text-slate-500"
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                    i < step ? "bg-cyan-600" : "bg-white/10"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="glass border border-white/10 rounded-2xl p-8 bg-white/5">
            <AnimatePresence mode="wait" custom={step}>
              <motion.div
                key={step}
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <h2 className="text-lg font-semibold text-white mb-6">{STEPS[step]}</h2>

                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Your Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Priya Kapoor"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        className="input-field"
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Google Sign-In */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Quick Sign In</label>
                      <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
                        bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200
                        hover:shadow-lg active:scale-95">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                      </button>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Startup Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. TechFlow"
                          value={form.startupName}
                          onChange={(e) => update("startupName", e.target.value)}
                          className="input-field pl-10"
                        />
                      </div>
                      {errors.startupName && <p className="text-red-400 text-xs mt-1">{errors.startupName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Skill You Need</label>
                      <div className="relative">
                        <select
                          value={form.skillNeeded}
                          onChange={(e) => update("skillNeeded", e.target.value)}
                          className="input-field appearance-none pr-10 cursor-pointer"
                        >
                          <option value="" disabled>Select skill needed</option>
                          {SKILLS.map((s) => (
                            <option key={s} value={s} className="bg-[#111118]">{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                      {errors.skillNeeded && <p className="text-red-400 text-xs mt-1">{errors.skillNeeded}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Bangalore, India"
                          value={form.location}
                          onChange={(e) => update("location", e.target.value)}
                          className="input-field pl-10"
                        />
                      </div>
                      {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Where did you hear about us?</label>
                      <div className="relative">
                        <select
                          value={form.referral}
                          onChange={(e) => update("referral", e.target.value)}
                          className="input-field appearance-none pr-10 cursor-pointer"
                        >
                          <option value="" disabled>Select source</option>
                          {REFERRAL_SOURCES.map((s) => (
                            <option key={s} value={s} className="bg-[#111118]">{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                      {errors.referral && <p className="text-red-400 text-xs mt-1">{errors.referral}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Mobile Number</label>
                      <div className="flex gap-2">
                        <div className="relative">
                          <select
                            value={form.countryCode}
                            onChange={(e) => update("countryCode", e.target.value)}
                            className="input-field w-24 appearance-none pr-6 cursor-pointer text-sm"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={c} value={c} className="bg-[#111118]">{c}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="tel"
                            placeholder="9876543210"
                            value={form.mobile}
                            onChange={(e) => update("mobile", e.target.value)}
                            className="input-field pl-10"
                          />
                        </div>
                      </div>
                      {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile}</p>}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="btn-secondary flex items-center gap-2 flex-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 flex-1 px-6 py-3 rounded-xl font-semibold
                  transition-all duration-200 text-white active:scale-95
                  bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400
                  hover:shadow-lg hover:shadow-cyan-500/25"
              >
                {step === STEPS.length - 1 ? (
                  <>
                    <Rocket className="w-4 h-4" />
                    Launch Your Search
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-slate-500 text-xs mt-4">
            By joining, you agree to our Terms & Privacy Policy
          </p>
        </motion.div>
      </main>
    </div>
  );
}
