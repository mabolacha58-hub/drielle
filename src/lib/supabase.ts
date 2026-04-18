import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'profissional' | 'empresa' | 'admin'

export type Profile = {
  id: string
  nome: string
  email: string
  role: UserRole
  avatar_url?: string
  titulo?: string
  localizacao?: string
  bio?: string
  website?: string
  telefone?: string
  created_at: string
}
