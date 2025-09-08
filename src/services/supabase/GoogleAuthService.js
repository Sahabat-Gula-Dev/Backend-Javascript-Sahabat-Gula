import { OAuth2Client } from "google-auth-library";
import { createClient } from "@supabase/supabase-js";
import InvariantError from "../../exceptions/InvariantError.js";

export default class GoogleAuthService {
  constructor() {
    this._client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    this._supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  async verifyGoogleIdToken(idToken) {
    try {
      const ticket = await this._client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      return ticket.getPayload();
    } catch (error) {
      throw new InvariantError("Gagal memverifikasi Google ID Token");
    }
  }

  async findOrCreateUser({ email, username }) {
    const {
      data: { users },
      error: listError,
    } = await this._supabaseAdmin.auth.admin.listUsers();
    if (listError)
      throw new InvariantError("Gagal mencari user: " + listError.message);

    const existing = users.find((u) => u.email === email);
    if (existing) {
      const { data: profile, error: profileError } = await this._supabaseAdmin
        .from("profiles")
        .select("id, username, email, role, is_active")
        .eq("id", existing.id)
        .maybeSingle();

      if (profileError)
        throw new InvariantError(
          "Gagal mengambil profile: " + profileError.message
        );
      return profile;
    }

    const { data: newUser, error: createError } =
      await this._supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { username },
      });

    if (createError)
      throw new InvariantError(
        "Gagal membuat user auth: " + createError.message
      );

    return {
      id: newUser.user.id,
      email: newUser.user.email,
      username: username,
      role: "user",
      is_active: true,
    };
  }
}
