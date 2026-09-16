import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://juxqpsxbbofbfqxrfuwv.supabase.co'
const supabaseAnonKey = 'sb_publishable_TyQGt9zVH3IH6JjHCEpf-g_1P1rhQ7X'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
