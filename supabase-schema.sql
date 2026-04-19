-- =============================================
-- BRIEFIT DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('hustler', 'entrepreneur')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  location TEXT,
  heard_from TEXT,
  avatar_url TEXT,
  onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HUSTLERS TABLE
CREATE TABLE IF NOT EXISTS public.hustlers (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  skill TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3,1) DEFAULT 5.0,
  completed_briefs INTEGER DEFAULT 0,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENTREPRENEURS TABLE
CREATE TABLE IF NOT EXISTS public.entrepreneurs (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  startup_name TEXT NOT NULL,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BRIEFS TABLE
CREATE TABLE IF NOT EXISTS public.briefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entrepreneur_id UUID REFERENCES public.entrepreneurs(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skill TEXT NOT NULL,
  budget INTEGER NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('Urgent', 'Normal')),
  location_pref TEXT NOT NULL DEFAULT 'Remote',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brief_id UUID REFERENCES public.briefs(id) ON DELETE CASCADE NOT NULL,
  hustler_id UUID REFERENCES public.hustlers(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brief_id, hustler_id)
);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hustlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrepreneurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES — PROFILES
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 8. RLS POLICIES — HUSTLERS
CREATE POLICY "hustlers_select" ON public.hustlers
  FOR SELECT USING (true);

CREATE POLICY "hustlers_insert" ON public.hustlers
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "hustlers_update" ON public.hustlers
  FOR UPDATE USING (auth.uid() = id);

-- 9. RLS POLICIES — ENTREPRENEURS
CREATE POLICY "entrepreneurs_select" ON public.entrepreneurs
  FOR SELECT USING (true);

CREATE POLICY "entrepreneurs_insert" ON public.entrepreneurs
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "entrepreneurs_update" ON public.entrepreneurs
  FOR UPDATE USING (auth.uid() = id);

-- 10. RLS POLICIES — BRIEFS
CREATE POLICY "briefs_select" ON public.briefs
  FOR SELECT USING (true);

CREATE POLICY "briefs_insert" ON public.briefs
  FOR INSERT WITH CHECK (entrepreneur_id = auth.uid());

CREATE POLICY "briefs_update" ON public.briefs
  FOR UPDATE USING (entrepreneur_id = auth.uid());

-- 11. RLS POLICIES — MATCHES
CREATE POLICY "matches_select" ON public.matches
  FOR SELECT USING (
    hustler_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.briefs
      WHERE briefs.id = brief_id
      AND briefs.entrepreneur_id = auth.uid()
    )
  );

CREATE POLICY "matches_insert" ON public.matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "matches_update" ON public.matches
  FOR UPDATE USING (hustler_id = auth.uid());

-- 12. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.briefs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hustlers;
