export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      breaking_barriers_results: {
        Row: {
          additional_info: string | null
          age_range: string | null
          background_category: string
          barriers: Json
          childhood_hobbies: string[] | null
          created_at: string
          disability_details: string | null
          disability_status: string | null
          encouragement: string
          ethnicity: string[] | null
          experience: string
          family_university: boolean | null
          gender: string | null
          household_income_age14: string | null
          id: string
          location_grew_up: string | null
          neurodiversity_details: string | null
          neurodiversity_status: string | null
          parent_occupation_age14: string | null
          resources: Json
          sexuality: string | null
          strategies: Json
          user_id: string
        }
        Insert: {
          additional_info?: string | null
          age_range?: string | null
          background_category: string
          barriers: Json
          childhood_hobbies?: string[] | null
          created_at?: string
          disability_details?: string | null
          disability_status?: string | null
          encouragement: string
          ethnicity?: string[] | null
          experience: string
          family_university?: boolean | null
          gender?: string | null
          household_income_age14?: string | null
          id?: string
          location_grew_up?: string | null
          neurodiversity_details?: string | null
          neurodiversity_status?: string | null
          parent_occupation_age14?: string | null
          resources: Json
          sexuality?: string | null
          strategies: Json
          user_id: string
        }
        Update: {
          additional_info?: string | null
          age_range?: string | null
          background_category?: string
          barriers?: Json
          childhood_hobbies?: string[] | null
          created_at?: string
          disability_details?: string | null
          disability_status?: string | null
          encouragement?: string
          ethnicity?: string[] | null
          experience?: string
          family_university?: boolean | null
          gender?: string | null
          household_income_age14?: string | null
          id?: string
          location_grew_up?: string | null
          neurodiversity_details?: string | null
          neurodiversity_status?: string | null
          parent_occupation_age14?: string | null
          resources?: Json
          sexuality?: string | null
          strategies?: Json
          user_id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          description: string
          difficulty: string
          id: string
          order_index: number
          role: string
          title: string
          total_questions: number
        }
        Insert: {
          created_at?: string
          description: string
          difficulty: string
          id?: string
          order_index: number
          role: string
          title: string
          total_questions?: number
        }
        Update: {
          created_at?: string
          description?: string
          difficulty?: string
          id?: string
          order_index?: number
          role?: string
          title?: string
          total_questions?: number
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string | null
          friend_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          id: string
          last_accessed: string
          role: string
          started_at: string
          user_id: string
        }
        Insert: {
          id?: string
          last_accessed?: string
          role: string
          started_at?: string
          user_id: string
        }
        Update: {
          id?: string
          last_accessed?: string
          role?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      path_match_results: {
        Row: {
          created_at: string
          encouragement: string
          experience: string
          id: string
          match_score: number
          recommended_path: Json
          skill_gaps: Json
          skills: string
          target_role: string
          transferable_skills: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          encouragement: string
          experience: string
          id?: string
          match_score: number
          recommended_path: Json
          skill_gaps: Json
          skills: string
          target_role: string
          transferable_skills: Json
          user_id: string
        }
        Update: {
          created_at?: string
          encouragement?: string
          experience?: string
          id?: string
          match_score?: number
          recommended_path?: Json
          skill_gaps?: Json
          skills?: string
          target_role?: string
          transferable_skills?: Json
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          friend_code: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          friend_code?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          friend_code?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      trophies: {
        Row: {
          created_at: string
          criteria_type: string
          criteria_value: Json
          description: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          criteria_type: string
          criteria_value: Json
          description: string
          icon: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          criteria_type?: string
          criteria_value?: Json
          description?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          first_attempt_correct: number
          id: string
          last_accessed: string
          questions_answered: number
          started_at: string
          total_attempts: number
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          first_attempt_correct?: number
          id?: string
          last_accessed?: string
          questions_answered?: number
          started_at?: string
          total_attempts?: number
          total_questions?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          first_attempt_correct?: number
          id?: string
          last_accessed?: string
          questions_answered?: number
          started_at?: string
          total_attempts?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          max_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          max_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          max_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_trophies: {
        Row: {
          earned_at: string
          id: string
          trophy_id: string
          user_id: string
        }
        Insert: {
          earned_at?: string
          id?: string
          trophy_id: string
          user_id: string
        }
        Update: {
          earned_at?: string
          id?: string
          trophy_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_trophies_trophy_id_fkey"
            columns: ["trophy_id"]
            isOneToOne: false
            referencedRelation: "trophies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_friend_code: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
