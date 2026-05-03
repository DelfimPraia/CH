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

export type TrackTag = 'upstream' | 'midstream' | 'downstream';

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
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
        Relationships: [];
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
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: SessionType;
          track: TrackTag | null;
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
        Relationships: [];
      };
      session_speakers: {
        Row: {
          session_id: string;
          speaker_id: string;
          role: SpeakerRole;
        };
        Insert: Database['public']['Tables']['session_speakers']['Row'];
        Update: Partial<Database['public']['Tables']['session_speakers']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'session_speakers_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'session_speakers_speaker_id_fkey';
            columns: ['speaker_id'];
            isOneToOne: false;
            referencedRelation: 'speakers';
            referencedColumns: ['id'];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: 'user_favorites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_favorites_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          }
        ];
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
        Relationships: [];
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
        Relationships: [];
      };
      admins: {
        Row: { user_id: string };
        Insert: { user_id: string };
        Update: Partial<{ user_id: string }>;
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          body: string;
          is_answered: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['questions']['Row'], 'id' | 'is_answered' | 'created_at'> & {
          id?: string;
          is_answered?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['questions']['Insert']>;
        Relationships: [];
      };
      question_upvotes: {
        Row: {
          question_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['question_upvotes']['Row'], 'created_at'> & {
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['question_upvotes']['Row']>;
        Relationships: [];
      };
    };
    Views: {
      questions_ranked: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          body: string;
          is_answered: boolean;
          created_at: string;
          author_name: string;
          upvote_count: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
