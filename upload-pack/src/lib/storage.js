import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_KEY = 'splithome-data';
const HOUSEHOLD_KEY = 'splithome-household';

// ===== LOCAL STORAGE =====
export function saveLocal(data) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch (e) {}
}

export function loadLocal() {
  try { const r = localStorage.getItem(LOCAL_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; }
}

export function saveHouseholdLocal(info) {
  try { localStorage.setItem(HOUSEHOLD_KEY, JSON.stringify(info)); } catch (e) {}
}

export function loadHouseholdLocal() {
  try { const r = localStorage.getItem(HOUSEHOLD_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; }
}

// ===== AUTH =====
export async function signUp(email, password) {
  if (!isSupabaseConfigured()) return { error: { message: 'Supabase no configurado' } };
  return await supabase.auth.signUp({ email, password });
}

export async function signIn(email, password) {
  if (!isSupabaseConfigured()) return { error: { message: 'Supabase no configurado' } };
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

export async function getUser() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthChange(callback) {
  if (!isSupabaseConfigured()) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}

// ===== HOUSEHOLD MANAGEMENT =====

// Generate a random code like "CASA-A7K3"
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `CASA-${code}`;
}

// Create a new household
export async function createHousehold(userId, displayName, householdName = 'Mi Hogar') {
  if (!isSupabaseConfigured()) return { error: { message: 'Supabase no configurado' } };

  // Generate unique code (retry if collision)
  let code = generateCode();
  let attempts = 0;
  let household = null;

  while (attempts < 5) {
    const { data, error } = await supabase
      .from('households')
      .insert({ name: householdName, join_code: code, owner_id: userId })
      .select()
      .single();

    if (!error) { household = data; break; }
    if (error.code === '23505') { code = generateCode(); attempts++; continue; } // duplicate code
    return { error };
  }

  if (!household) return { error: { message: 'No se pudo generar código único' } };

  // Add creator as owner member
  const { error: memErr } = await supabase
    .from('household_members')
    .insert({
      household_id: household.id,
      user_id: userId,
      display_name: displayName,
      color: '#6A8EAE',
      role: 'owner',
    });

  if (memErr) return { error: memErr };

  // Create empty data record
  await supabase
    .from('household_data')
    .insert({ household_id: household.id, data: {} });

  return { data: household };
}

// Join a household by code
export async function joinHousehold(userId, joinCode, displayName) {
  if (!isSupabaseConfigured()) return { error: { message: 'Supabase no configurado' } };

  const code = joinCode.trim().toUpperCase();

  // Find household
  const { data: household, error: findErr } = await supabase
    .from('households')
    .select('*')
    .eq('join_code', code)
    .single();

  if (findErr || !household) return { error: { message: 'Código no encontrado. Verifica e intenta de nuevo.' } };

  // Check not already member
  const { data: existing } = await supabase
    .from('household_members')
    .select('id')
    .eq('household_id', household.id)
    .eq('user_id', userId)
    .single();

  if (existing) return { error: { message: 'Ya eres miembro de este hogar' } };

  // Count members (max 6)
  const { count } = await supabase
    .from('household_members')
    .select('*', { count: 'exact', head: true })
    .eq('household_id', household.id);

  if (count >= 6) return { error: { message: 'Este hogar ya tiene el máximo de miembros (6)' } };

  const colors = ['#E07A5F', '#81B29A', '#8338EC', '#F2CC8F', '#4ECDC4'];
  const color = colors[(count || 1) - 1] || '#607D8B';

  const { error: joinErr } = await supabase
    .from('household_members')
    .insert({
      household_id: household.id,
      user_id: userId,
      display_name: displayName,
      color,
      role: 'member',
    });

  if (joinErr) return { error: joinErr };

  return { data: household };
}

// Get user's household
export async function getUserHousehold(userId) {
  if (!isSupabaseConfigured()) return null;

  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id, display_name, color, role')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (!membership) return null;

  const { data: household } = await supabase
    .from('households')
    .select('*')
    .eq('id', membership.household_id)
    .single();

  if (!household) return null;

  const { data: members } = await supabase
    .from('household_members')
    .select('*')
    .eq('household_id', household.id)
    .order('joined_at');

  return {
    ...household,
    members: members || [],
    myMembership: membership,
  };
}

// Get household members (for syncing to app settings)
export async function getHouseholdMembers(householdId) {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from('household_members')
    .select('*')
    .eq('household_id', householdId)
    .order('joined_at');
  return data || [];
}

// ===== SHARED DATA =====

export async function saveCloud(householdId, appData) {
  if (!isSupabaseConfigured() || !householdId) return;
  try {
    await supabase
      .from('household_data')
      .upsert({
        household_id: householdId,
        data: appData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'household_id' });
  } catch (e) {
    console.warn('Cloud save failed:', e);
  }
}

export async function loadCloud(householdId) {
  if (!isSupabaseConfigured() || !householdId) return null;
  try {
    const { data } = await supabase
      .from('household_data')
      .select('data')
      .eq('household_id', householdId)
      .single();
    return data?.data || null;
  } catch (e) {
    return null;
  }
}

// Subscribe to real-time changes on household data
export function subscribeToHousehold(householdId, callback) {
  if (!isSupabaseConfigured() || !householdId) return { unsubscribe: () => {} };

  const channel = supabase
    .channel(`household-${householdId}`)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'household_data', filter: `household_id=eq.${householdId}` },
      (payload) => {
        if (payload.new?.data) callback(payload.new.data);
      }
    )
    .subscribe();

  return { unsubscribe: () => supabase.removeChannel(channel) };
}
