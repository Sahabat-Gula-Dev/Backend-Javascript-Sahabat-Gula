import { createClient } from "@supabase/supabase-js";
import NotFoundError from "../exceptions/NotFoundError.js";

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function getUserProfile(userId) {
  const { data: profile, error } = await this._supabaseAdmin
    .from("profiles")
    .select("id, username, email, role, is_active")
    .eq("id", userId)
    .single();

  if (error || !profile) throw new NotFoundError("User not found");
  return profile;
}
