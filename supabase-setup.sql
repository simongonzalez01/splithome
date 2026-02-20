-- ============================================
-- SPLITHOME — SUPABASE SETUP
-- Ejecuta esto en: Dashboard > SQL Editor > New query
-- ============================================

-- 1. Hogares
CREATE TABLE IF NOT EXISTS households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Mi Hogar',
  join_code TEXT NOT NULL UNIQUE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_households_code ON households(join_code);

-- 2. Miembros del hogar
CREATE TABLE IF NOT EXISTS household_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6A8EAE',
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(household_id, user_id)
);

-- 3. Datos compartidos del hogar
CREATE TABLE IF NOT EXISTS household_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL UNIQUE,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Datos individuales (fallback sin hogar)
CREATE TABLE IF NOT EXISTS user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Households
CREATE POLICY "members_view_household" ON households FOR SELECT
  USING (id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));
CREATE POLICY "users_create_household" ON households FOR INSERT
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner_update_household" ON households FOR UPDATE
  USING (owner_id = auth.uid());

-- Members
CREATE POLICY "members_view_members" ON household_members FOR SELECT
  USING (household_id IN (SELECT household_id FROM household_members hm WHERE hm.user_id = auth.uid()));
CREATE POLICY "users_join" ON household_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_self" ON household_members FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY "users_leave" ON household_members FOR DELETE
  USING (user_id = auth.uid());

-- Household data
CREATE POLICY "members_view_data" ON household_data FOR SELECT
  USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));
CREATE POLICY "members_insert_data" ON household_data FOR INSERT
  WITH CHECK (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));
CREATE POLICY "members_update_data" ON household_data FOR UPDATE
  USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

-- User data
CREATE POLICY "user_select" ON user_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_insert" ON user_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_update" ON user_data FOR UPDATE USING (auth.uid() = user_id);
