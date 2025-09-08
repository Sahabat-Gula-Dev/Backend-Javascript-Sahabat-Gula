import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import otpGenerator from "otp-generator";
import InvariantError from "../../exceptions/InvariantError.js";
import AuthenticationError from "../../exceptions/AuthenticationError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";

const OTP_EXPIRE_MINUTES = 5;

export default class AuthService {
  constructor() {
    this._supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    this._supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    this._resend = new Resend(process.env.RESEND_API_KEY);
  }

  _nowPlusMinutes(m) {
    return new Date(Date.now() + m * 60 * 1000);
  }

  _genOtp() {
    return otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
  }

  async _sendEmail({ to, subject, html, text }) {
    await this._resend.emails.send({
      from: "Sahabat Gula <noreply@sahabatgula.com>",
      to,
      subject,
      html,
      text,
    });
  }

  async _getUserProfile(userId) {
    const { data: profile, error } = await this._supabaseAdmin
      .from("profiles")
      .select("id, username, email, role, is_active")
      .eq("id", userId)
      .single();

    if (error || !profile) throw new NotFoundError("User not found");
    return profile;
  }

  async registerUser({ username, email, password }) {
    const { data, error } = await this._supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    });

    if (error) {
      // Jika sudah ada user → handle re-activate via OTP jika belum aktif
      const code = error?.code || error?.status || "";
      if (
        code === "user_already_exists" ||
        code === "email_exists" ||
        error.message?.toLowerCase().includes("already registered")
      ) {
        const { data: existing } = await this._supabaseAdmin
          .from("profiles")
          .select("id, is_active")
          .eq("email", email)
          .maybeSingle();

        if (!existing) {
          throw new InvariantError(
            "Email sudah terdaftar tetapi profile tidak ditemukan."
          );
        }
        if (existing.is_active) {
          throw new InvariantError("Email ini sudah aktif. Silakan login.");
        }

        const otp = this._genOtp();
        const expiresAt = this._nowPlusMinutes(OTP_EXPIRE_MINUTES);

        const { error: upErr } = await this._supabaseAdmin
          .from("profiles")
          .update({ activation_otp: otp, activation_otp_expires_at: expiresAt })
          .eq("id", existing.id);

        if (upErr) throw new InvariantError("Gagal menyimpan OTP aktivasi.");

        await this._sendEmail({
          to: email,
          subject: "Kode Aktivasi Akun Sahabat Gula",
          html: `<p>Halo,</p><p>Kode aktivasi akun Anda adalah: <strong>${otp}</strong></p><p>Kode berlaku ${OTP_EXPIRE_MINUTES} menit.</p>`,
          text: `Kode aktivasi akun Anda: ${otp} (berlaku ${OTP_EXPIRE_MINUTES} menit)`,
        });

        return { reused: true };
      }

      throw new InvariantError("Registrasi gagal: " + error.message);
    }

    const user = data.user;
    await this._supabaseAdmin
      .from("profiles")
      .update({ email })
      .eq("id", user.id);

    const otp = this._genOtp();
    const expiresAt = this._nowPlusMinutes(OTP_EXPIRE_MINUTES);

    const { error: updateError } = await this._supabaseAdmin
      .from("profiles")
      .update({ activation_otp: otp, activation_otp_expires_at: expiresAt })
      .eq("id", user.id);

    if (updateError) throw new InvariantError("Gagal menyimpan OTP aktivasi.");

    await this._sendEmail({
      to: email,
      subject: "Kode Aktivasi Akun Sahabat Gula",
      html: `<p>Halo,</p><p>Kode aktivasi akun Anda adalah: <strong>${otp}</strong></p><p>Kode berlaku ${OTP_EXPIRE_MINUTES} menit.</p>`,
      text: `Kode aktivasi akun Anda: ${otp} (berlaku ${OTP_EXPIRE_MINUTES} menit)`,
    });

    return { reused: false };
  }

  async verifyOtpAndActivate({ email, otp }) {
    const { data: profile, error } = await this._supabaseAdmin
      .from("profiles")
      .select("id, activation_otp, activation_otp_expires_at, is_active")
      .eq("email", email)
      .maybeSingle();

    if (error) throw new InvariantError("Gagal mencari profile.");
    if (!profile) throw new NotFoundError("Profile tidak ditemukan.");

    if (profile.is_active) throw new InvariantError("Akun sudah aktif.");
    if (!profile.activation_otp || profile.activation_otp !== otp) {
      throw new AuthenticationError("OTP tidak valid.");
    }

    if (
      !profile.activation_otp_expires_at ||
      new Date() > new Date(profile.activation_otp_expires_at)
    ) {
      throw new AuthenticationError("OTP telah kedaluwarsa.");
    }

    const { error: upErr } = await this._supabaseAdmin
      .from("profiles")
      .update({
        is_active: true,
        activation_otp: null,
        activation_otp_expires_at: null,
      })
      .eq("id", profile.id);

    if (upErr) throw new InvariantError("Gagal mengaktifkan akun.");

    return this._getUserProfile(profile.id);
  }

  async resendActivationOtp(email) {
    const { data: profile, error } = await this._supabaseAdmin
      .from("profiles")
      .select("id, is_active")
      .eq("email", email)
      .maybeSingle();

    if (error) throw new InvariantError("Gagal mencari profile.");
    if (!profile) throw new NotFoundError("User tidak ditemukan.");
    if (profile.is_active) throw new InvariantError("Akun sudah aktif.");

    const otp = this._genOtp();
    const expiresAt = this._nowPlusMinutes(OTP_EXPIRE_MINUTES);

    const { error: upErr } = await this._supabaseAdmin
      .from("profiles")
      .update({ activation_otp: otp, activation_otp_expires_at: expiresAt })
      .eq("id", profile.id);

    if (upErr) throw new InvariantError("Gagal menyimpan OTP aktivasi.");

    await this._sendEmail({
      to: email,
      subject: "Kode Aktivasi Akun (Baru)",
      html: `<p>Halo,</p><p>Kode aktivasi baru Anda: <strong>${otp}</strong></p><p>Berlaku ${OTP_EXPIRE_MINUTES} menit.</p>`,
      text: `Kode aktivasi baru Anda: ${otp} (berlaku ${OTP_EXPIRE_MINUTES} menit)`,
    });
  }

  async login({ email, password }) {
    const result = await this._supabase.auth.signInWithPassword({
      email,
      password,
    });

    const {
      data: { user },
      error,
    } = result;

    if (error) throw new AuthenticationError("Login gagal: " + error.message);
    if (!user)
      throw new AuthenticationError("Login gagal: user tidak ditemukan.");

    const { data: profile, error: pErr } = await this._supabaseAdmin
      .from("profiles")
      .select("id, is_active")
      .eq("id", user.id)
      .single();

    if (pErr || !profile) throw new NotFoundError("Profile tidak ditemukan.");
    if (!profile.is_active)
      throw new AuthenticationError(
        "Akun belum aktif. Verifikasi OTP terlebih dahulu."
      );

    return this._getUserProfile(user.id);
  }

  async requestPasswordReset(email) {
    const { data: profile, error } = await this._supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (error) throw new InvariantError("Gagal mencari profile.");
    if (!profile) throw new NotFoundError("Email tidak terdaftar.");

    const otp = this._genOtp();
    const expiresAt = this._nowPlusMinutes(OTP_EXPIRE_MINUTES);

    const { error: upErr } = await this._supabaseAdmin
      .from("profiles")
      .update({ reset_otp: otp, reset_otp_expires_at: expiresAt })
      .eq("id", profile.id);

    if (upErr) throw new InvariantError("Gagal menyimpan OTP reset password.");

    await this._sendEmail({
      to: profile.email,
      subject: "Kode OTP Reset Password",
      html: `<p>Halo,</p><p>Kode OTP reset password Anda: <strong>${otp}</strong></p><p>Berlaku ${OTP_EXPIRE_MINUTES} menit.</p>`,
      text: `OTP reset password: ${otp} (berlaku ${OTP_EXPIRE_MINUTES} menit)`,
    });

    return { ok: true };
  }

  async verifyPasswordResetOtp({ email, otp }) {
    const { data: profile, error } = await this._supabaseAdmin
      .from("profiles")
      .select("id, reset_otp, reset_otp_expires_at")
      .eq("email", email)
      .maybeSingle();

    if (error) throw new InvariantError("Gagal mencari profile.");
    if (!profile) throw new NotFoundError("Profile tidak ditemukan.");

    if (!profile.reset_otp || profile.reset_otp !== otp) {
      throw new AuthenticationError("OTP tidak valid.");
    }

    if (
      !profile.reset_otp_expires_at ||
      new Date() > new Date(profile.reset_otp_expires_at)
    ) {
      throw new AuthenticationError("OTP telah kedaluwarsa.");
    }

    await this._supabaseAdmin
      .from("profiles")
      .update({ reset_otp: null, reset_otp_expires_at: null })
      .eq("id", profile.id);

    return { id: profile.id };
  }

  async resetPassword(userId, newPassword) {
    const { error } = await this._supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        password: newPassword,
      }
    );
    if (error)
      throw new InvariantError("Gagal reset password: " + error.message);
  }
}
