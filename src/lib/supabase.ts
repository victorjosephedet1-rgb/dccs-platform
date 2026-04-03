import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseAnonKey.startsWith('eyJ')
)

if (!isSupabaseConfigured) {
  console.error('[CONFIGURATION ERROR] Supabase is not configured properly!');
  console.error('Missing or invalid environment variables:');
  console.error('  VITE_SUPABASE_URL:', supabaseUrl ? 'Set but invalid format' : 'NOT SET');
  console.error('  VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set but invalid format' : 'NOT SET');
  console.error('');
  console.error('Required format:');
  console.error('  VITE_SUPABASE_URL must start with https:// and contain .supabase.co');
  console.error('  VITE_SUPABASE_ANON_KEY must start with eyJ (JWT format)');
  console.error('');
  console.error('Platform will run in demo mode with limited functionality.');
} else {
  console.log('[CONFIGURATION] Supabase configured successfully');
  console.log('  URL:', supabaseUrl);
  console.log('  Key:', supabaseAnonKey.substring(0, 20) + '...');
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signUp: () => Promise.resolve({ data: { user: null }, error: { message: 'Demo mode - authentication disabled' } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Demo mode - authentication disabled' } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null })
      },
      from: () => {
        const createMockQueryBuilder = () => ({
          select: () => createMockQueryBuilder(),
          insert: () => createMockQueryBuilder(),
          update: () => createMockQueryBuilder(),
          delete: () => createMockQueryBuilder(),
          limit: () => createMockQueryBuilder(),
          order: () => createMockQueryBuilder(),
          eq: () => createMockQueryBuilder(),
          neq: () => createMockQueryBuilder(),
          gt: () => createMockQueryBuilder(),
          gte: () => createMockQueryBuilder(),
          lt: () => createMockQueryBuilder(),
          lte: () => createMockQueryBuilder(),
          like: () => createMockQueryBuilder(),
          ilike: () => createMockQueryBuilder(),
          is: () => createMockQueryBuilder(),
          in: () => createMockQueryBuilder(),
          contains: () => createMockQueryBuilder(),
          containedBy: () => createMockQueryBuilder(),
          rangeGt: () => createMockQueryBuilder(),
          rangeGte: () => createMockQueryBuilder(),
          rangeLt: () => createMockQueryBuilder(),
          rangeLte: () => createMockQueryBuilder(),
          rangeAdjacent: () => createMockQueryBuilder(),
          overlaps: () => createMockQueryBuilder(),
          textSearch: () => createMockQueryBuilder(),
          match: () => createMockQueryBuilder(),
          not: () => createMockQueryBuilder(),
          or: () => createMockQueryBuilder(),
          filter: () => createMockQueryBuilder(),
          single: () => Promise.resolve({ data: null, error: { message: 'Demo mode - database disabled' } }),
          maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Demo mode - database disabled' } }),
          then: (resolve: (value: { data: unknown[]; error: null }) => unknown) => resolve({ data: [], error: null })
        });
        return createMockQueryBuilder();
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: { message: 'Demo mode - storage disabled' } }),
          remove: () => Promise.resolve({ error: null }),
          getPublicUrl: () => ({ data: { publicUrl: '' } })
        })
      }
    } as unknown as ReturnType<typeof createClient>

export { isSupabaseConfigured }

// Database types
export interface Profile {
  id: string
  email: string
  name: string
  role: 'artist' | 'creator'
  created_at: string
}

export interface AudioSnippet {
  id: string
  title: string
  artist: string
  artist_id: string
  duration: number
  price: number
  mood: string[]
  bpm: number
  genre: string
  audio_url: string
  waveform_data: number[]
  is_licensed: boolean
  created_at: string
  updated_at: string
}

export interface SnippetLicense {
  id: string
  snippet_id: string
  user_id: string
  price_paid: number
  license_type: string
  created_at: string
  valid_until: string
}