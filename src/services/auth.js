import { supabase } from './supabase'
import { createUserProfile } from './user-profiles'

// Estado reactivo del usuario (incluyendo el rol para admin)
let user = { 
    id: null, 
    email: null, 
    role: null 
}

// Usamos un Array para los observadores (tal cual el profesor)
let observers = []

/**
 * Permite suscribirse a los cambios de estado del usuario.
 * Retorna una función para cancelar la suscripción.
 */
export function subscribeToAuthState(callback) {
    // Agregamos el callback al array
    observers.push(callback)
    
    // Notificamos inmediatamente el estado actual
    notify(callback)
    
    // Retornamos la función para "desuscribirse"
    return () => {
        // Usamos filter para sacar al observer de la lista
        observers = observers.filter(obs => obs !== callback)
    }
}

// Función auxiliar para notificar a un solo observer
function notify(callback) {
    callback({ ...user })
}

// Notificar a TODOS los observers
function notifyAll() {
    observers.forEach(callback => notify(callback))
}

export async function loadUserFromSupabase() {
    try {
        const { data, error } = await supabase.auth.getUser()
        
        if (error && error.message !== 'Auth session missing!') {
            console.warn('[auth] getUser warning:', error.message)
        }
        
        const sessionUser = data?.user || null
        
        // Actualizamos estado básico
        user.id = sessionUser?.id ?? null
        user.email = sessionUser?.email ?? null

        // --- LÓGICA ADMIN (Mantenemos la tuya, es vital) ---
        if (user.id) {
            try {
                // Buscamos el rol en user_profiles
                const { data: profile, error: profileError } = await supabase
                    .from('user_profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profileError) {
                    // Si falla, asumimos usuario normal por seguridad
                    user.role = 'user' 
                } else {
                    user.role = profile?.role || 'user'
                }
            } catch (err) {
                console.error('Error leyendo rol:', err)
                user.role = 'user'
            }
        } else {
            user.role = null
        }

    } catch (e) {
        console.error('Error crítico en loadUserFromSupabase:', e)
    } finally {
        // Avisamos a toda la app que el usuario cambió
        notifyAll()
    }
}

// --- Métodos de Autenticación (Iguales, funcionan perfecto) ---

export async function register(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  
  // 2. AGREGAR ESTO: Crear el perfil en la base de datos
  if (data.user) {
    await createUserProfile(data.user.id, data.user.email)
  }

  await loadUserFromSupabase()
  return data
}

export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await loadUserFromSupabase()
    return data
}

export async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    await loadUserFromSupabase()
}

export async function changePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    return data
}

export function getCurrentUser() { 
    return { ...user } 
}

// Escuchar cambios automáticos de Supabase (ej: expiró sesión)
supabase.auth.onAuthStateChange(() => { 
    loadUserFromSupabase() 
})