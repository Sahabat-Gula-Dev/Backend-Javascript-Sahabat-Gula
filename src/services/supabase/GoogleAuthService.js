import { OAuth2Client } from "google-auth-library";
import admin from "firebase-admin";
import { createClient } from "@supabase/supabase-js";
import InvariantError from "../../exceptions/InvariantError.js";

export default class GoogleAuthService {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    }

    this._client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    this._supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  async verifyGoogleIdToken(idToken) {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      return decoded;
    } catch (error) {
      throw new InvariantError("Gagal memverifikasi Firebase ID Token");
    }
  }

  async findOrCreateUser({ email, username }) {
    const { data: existing, error } = await this._supabaseAdmin
      .from("profiles")
      .select("id, username, email, role, is_active")
      .eq("email", email)
      .maybeSingle();
    if (error) throw new InvariantError("Gagal mencari user: " + error.message);

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

    await new Promise((r) => setTimeout(r, 500));

    const { error: upErr } = await this._supabaseAdmin
      .from("profiles")
      .update({ is_active: true })
      .eq("id", newUser.user.id);

    if (upErr)
      throw new InvariantError(
        "Gagal mengaktifkan profile Google: " + upErr.message
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


