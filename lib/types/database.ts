// Hand-written types for the initial schema.
// Regenerate from your live Supabase project with:
//   npm run types:db
// (requires `supabase` CLI logged in and SUPABASE_PROJECT_ID set)

export type AreaTag =
  | 'geoscience'
  | 'engineering'
  | 'it'
  | 'data_science'
  | 'management'
  | 'other';

export type SessionType =
  | 'keynote'
  | 'panel'
  | 'talk'
  | 'networking'
  | 'break';

export type SpeakerRole = 'speaker' | 'moderator';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          company: string | null;
          job_title: string | null;
          area: AreaTag | null;
          linkedin_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          company?: string | null;
          job_title?: string | null;
          area?: AreaTag | null;
          linkedin_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      speakers: {
        Row: {
          id: string;
          full_name: string;
          bio: string | null;
          photo_url: string | null;
          institution: string | null;
          specialty: string | null;
          linkedin_url: string | null;
          researchgate_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['speakers']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['speakers']['Insert']>;
      };
      sessions: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: SessionType;
          starts_at: string;
          ends_at: string;
          location: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>;
      };
      session_speakers: {
        Row: {
          session_id: string;
          speaker_id: string;
          role: SpeakerRole;
        };
        Insert: Database['public']['Tables']['session_speakers']['Row'];
        Update: Partial<Database['public']['Tables']['session_speakers']['Row']>;
      };
      user_favorites: {
        Row: {
          user_id: string;
          session_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_favorites']['Row'], 'created_at'> & {
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_favorites']['Row']>;
      };
      check_ins: {
        Row: {
          id: string;
          user_id: string;
          checked_in_at: string;
          checked_in_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['check_ins']['Row'], 'id' | 'checked_in_at'> & {
          id?: string;
          checked_in_at?: string;
        };
        Update: Partial<Database['public']['Tables']['check_ins']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          title: string;
          body: string;
          target_user_id: string | null;
          session_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      admins: {
        Row: { user_id: string };
        Insert: { user_id: string };
        Update: Partial<{ user_id: string }>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
  };
}
