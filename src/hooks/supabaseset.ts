import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lnyovzkokmdavkqomkhq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxueW92emtva21kYXZrcW9ta2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNDg4NDcsImV4cCI6MjA3ODgyNDg0N30.5IkIR4wPit5wzABj2sEzjir022QM3ECsF87pFSn9bFs";

// Create a singleton Supabase client so every hook/component shares the same instance
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export function useSupabaseSet() {
  return supabaseClient;
}
