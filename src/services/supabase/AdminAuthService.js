import { createClient } from "@supabase/supabase-js";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";
import { Resend } from "resend";

const OTP_EXPIRE_MINUTES = 5;

export default class AdminAuthService {
  constructor() {
    this._supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    this._resend = new Resend(process.env.RESEND_API_KEY);
  }

  async _getProfileById(id) {
    const { data, error } = await this._supabaseAdmin
      .from("profiles")
      .select("id, username, email, role, is_active")
      .eq("id", id)
      .single();
    if (error || !data) throw new NotFoundError("Profile tidak ditemukan");
    return data;
  }

  // ===== Register Super Admin (only once) =====
  async registerSuperAdmin({ username, email, password }) {
    const { data: exists } = await this._supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("role", "super-admin")
      .maybeSingle();

    if (exists) {
      throw new InvariantError(
        "Super admin sudah ada, tidak bisa daftar lagi."
      );
    }

    const { data, error } = await this._supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    });

    if (error) throw new InvariantError("Registrasi gagal: " + error.message);

    await this._supabaseAdmin
      .from("profiles")
      .update({ role: "super-admin", is_active: true })
      .eq("id", data.user.id);

    return this._getProfileById(data.user.id);
  }

  // ===== Super Admin creates account (admin / user) =====
  async createAccount({ username, email, password, role }) {
    if (!["admin", "user"].includes(role)) {
      throw new InvariantError("Role tidak valid");
    }

    const { data, error } = await this._supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    });

    if (error) throw new InvariantError("Gagal membuat akun: " + error.message);

    await this._supabaseAdmin
      .from("profiles")
      .update({ role, is_active: true })
      .eq("id", data.user.id);

    return this._getProfileById(data.user.id);
  }
}
