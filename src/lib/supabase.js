import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURACIÓN DE SUPABASE
// ============================================
// 1. Ve a https://supabase.com y crea cuenta gratis
// 2. Crea un nuevo proyecto
// 3. Ve a Settings > API y copia estas dos claves:
//    - Project URL
//    - anon/public key
// 4. Pégalas aquí abajo:
// ============================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'TU_SUPABASE_URL_AQUI';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY_AQUI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Verificar si Supabase está configurado
export const isSupabaseConfigured = () => {
  return SUPABASE_URL !== 'TU_SUPABASE_URL_AQUI' && SUPABASE_ANON_KEY !== 'TU_SUPABASE_ANON_KEY_AQUI';
};
