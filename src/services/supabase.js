import { createClient } from '@supabase/supabase-js'

// Intentamos leer del .env (Buenas Prácticas)
// PERO si no existen, usamos las credenciales "hardcodeadas" (A prueba de fallos)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zzzljhyrijldgesbosfz.supabase.co"
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6emxqaHlyaWpsZGdlc2Jvc2Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MTQwMDYsImV4cCI6MjA3NDQ5MDAwNn0.9E3cZkuGLQSBAQaFRL1idLv_T-MKYLTGEQBGPDGau8Y"

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] Error crítico: No se encontraron las credenciales de conexión.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)