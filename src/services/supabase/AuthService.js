import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import otpGenerator from "otp-generator";
import InvariantError from "../../exceptions/InvariantError.js";
import AuthenticationError from "../../exceptions/AuthenticationError.js";
import AuthorizationError from "../../exceptions/AuthorizationError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";

class AuthService {
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

  async _getUserProfile(userId) {
    const { data: profile, error } = await this._supabaseAdmin
      .from("profiles")
      .select("username, email, role, is_active")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      throw new NotFoundError("User not found");
    }

    const user = {
      id: userId,
      username: profile.username,
      email: profile.email,
      role: profile.role,
      is_active: profile.is_active,
    };

    return user;
  }

  async registerUser({ username, email, password }) {
    const { data, error } = await this._supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { username },
    });

    if (error) {
      // Kalau error karena email sudah ada, jangan langsung throw
      if (error.code === "email_exists") {
        // Ambil user lama dari profiles
        const { data: existing } = await this._supabaseAdmin
          .from("profiles")
          .select("id, is_active")
          .eq("email", email)
          .single();

        if (!existing) {
          throw new InvariantError("Email already exists but no profile found");
        }

        if (existing.is_active) {
          throw new InvariantError(
            "This email is already registered and active"
          );
        }

        // Generate OTP baru
        const otp = otpGenerator.generate(6, {
          upperCase: false,
          specialChars: false,
          lowerCaseAlphabets: false,
        });
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await this._supabaseAdmin
          .from("profiles")
          .update({ activation_otp: otp, activation_otp_expires_at: expiresAt })
          .eq("id", existing.id);

        await this._resend.emails.send({
          from: "Sahabat Gula <noreply@sahabatgula.com>",
          to: email,
          subject: "Your activation code",
          html: `<p>Your activation code is: <strong>${otp}</strong></p>`,
        });

        return; // selesai
      }

      // error lain → throw biasa
      console.error("Create user error:", error);
      throw new InvariantError("User registration failed: " + error.message);
    }

    const user = data.user;

    // User baru → update OTP
    const otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const { error: updateError } = await this._supabaseAdmin
      .from("profiles")
      .update({ activation_otp: otp, activation_otp_expires_at: expiresAt })
      .eq("id", user.id);

    if (updateError) {
      console.error("Update OTP error:", updateError);
      throw new InvariantError("Failed to save OTP");
    }

    await this._resend.emails.send({
      from: "Sahabat Gula <noreply@sahabatgula.com>",
      to: email,
      subject: "Your activation code",
      html: `<p>Your activation code is: <strong>${otp}</strong></p>`,
    });
  }

  async verifyOtpAndActiveUser({ email, otp }) {
    // 1) Ambil profile by email
    const { data: profile, error: profileError } = await this._supabaseAdmin
      .from("profiles")
      .select("id, email, activation_otp, activation_otp_expires_at, is_active")
      .eq("email", email)
      .maybeSingle();

    console.log("Verify OTP profile:", profile, profileError);

    if (profileError) {
      console.error("verifyOtp profileError:", profileError);
      throw new InvariantError("Failed to lookup profile");
    }
    if (!profile) {
      throw new NotFoundError("Profile for this email not found.");
    }

    // 2) Validasi status & OTP
    if (profile.is_active) {
      throw new InvariantError("This account is already active.");
    }
    if (!profile.activation_otp || profile.activation_otp !== otp) {
      throw new AuthenticationError("Invalid OTP code.");
    }
    if (
      !profile.activation_otp_expires_at ||
      new Date() > new Date(profile.activation_otp_expires_at)
    ) {
      throw new AuthenticationError("OTP code has expired.");
    }

    // 3) Update aktifkan user + bersihkan OTP
    const { error: updateError } = await this._supabaseAdmin
      .from("profiles")
      .update({
        is_active: true,
        activation_otp: null,
        activation_otp_expires_at: null,
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("verifyOtp updateError:", updateError);
      throw new InvariantError("Failed to activate user account.");
    }

    // 4) Kembalikan profil lengkap
    return this._getUserProfile(profile.id);
  }

  async resendActivationOtp(email) {
    const { data: profiles, error: findError } = await this._supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (findError || !profiles) {
      throw new NotFoundError("User not found");
    }
    const user = profiles[0];
    const { data: profile, error: profileError } = await this._supabaseAdmin
      .from("profiles")
      .select("is_active")
      .eq("id", user.id)
      .single();

    if (profileError) throw new InvariantError("Failed to retrieve profile.");
    if (profile.is_active) {
      throw new InvariantError(
        "This account is already active, no need to verify again."
      );
    }
    const otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    const { error: updateError } = await this._supabaseAdmin
      .from("profiles")
      .update({ activation_otp: otp, activation_otp_expires_at: expiresAt })
      .eq("id", user.id);
    if (updateError) throw new InvariantError("Failed to save new OTP.");

    await this._resend.emails.send({
      from: "Sahabat Gula <noreply@sahabatgula.com>",
      to: email,
      subject: `Kode Aktivasi Akun Baru Anda: ${otp}`,
      html: `<p>Gunakan kode baru ini untuk mengaktifkan akun Anda: <strong>${otp}</strong></p>`,
    });
  }

  async loginUser({ email, password }) {
    const {
      data: { user },
      error: loginError,
    } = await this._supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      throw new AuthenticationError("Login failed: " + loginError.message);
    }

    const { data: profile, error: profileError } = await this._supabase
      .from("profiles")
      .select("is_active")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new NotFoundError("Profile not found");
    }

    if (!profile.is_active) {
      throw new AuthenticationError("User is not active");
    }

    return this._getUserProfile(user.id);
  }

  async handleGoogleAuth(supabaseAccessToken) {
    const {
      data: { user },
      error: authError,
    } = await this._supabase.auth.getUser(supabaseAccessToken);

    if (authError) {
      throw new AuthenticationError(
        "Google authentication failed: " + authError.message
      );
    }

    const { error: profileError } = await this._supabaseAdmin
      .from("profiles")
      .update({ is_active: true })
      .eq("id", user.id);

    if (profileError) {
      throw new InvariantError(
        "Failed to activate Google user: " + profileError.message
      );
    }

    return this._getUserProfile(user.id);
  }

  async createFirstAdmin({ username, email, password }) {
    const { data: admins, error: findError } = await this._supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (findError) {
      throw new NotFoundError("Admin not found");
    }

    if (admins.length > 0) {
      throw new InvariantError("Admin already exists");
    }

    const {
      data: { user },
      error: createError,
    } = await this._supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_meta_data: { username: username },
    });

    if (createError) {
      throw new InvariantError(
        "User registration failed: " + createError.message
      );
    }

    await this._supabaseAdmin
      .from("profiles")
      .update({
        role: "admin",
        is_active: true,
      })
      .eq("id", user.id);
  }

  async createAdmin(actorId, { username, email, password }) {
    const actor = await this._getUserProfile(actorId);
    if (actor.role !== "admin")
      throw new AuthorizationError("You are not authorized to create admin");

    const {
      data: { user },
      error: createError,
    } = await this._supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_meta_data: { username: username },
    });
    if (createError) throw new InvariantError(createError.message);

    await this._supabaseAdmin
      .from("profiles")
      .update({ role: "admin", is_active: true })
      .eq("id", user.id);
  }

  async requestPasswordReset(email) {
    const { data: users, error: userError } = await this._supabaseAdmin
      .from("users")
      .select("id, email")
      .in("email", [email])
      .limit(1);

    if (!userError && users.length > 0) {
      const user = users[0];

      const otp = otpGenerator.generate(6, {
        upperCase: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

      await this._supabaseAdmin
        .from("profiles")
        .update({ reset_otp: otp, reset_otp_expires_at: expiresAt })
        .eq("id", user.id);

      await this._resend.emails.send({
        from: "Sahabat Gula <noreply@sahabatgula.com>",
        to: user.email,
        subject: "Password Reset OTP",
        html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
      });
    }
  }

  async verifyPasswordResetOtp({ email, otp }) {
    const { data: users, error: userError } = await this._supabaseAdmin
      .from("users")
      .select("id")
      .in("email", [email])
      .limit(1);

    if (userError || users.length === 0) {
      throw new NotFoundError("User not found");
    }
    const user = users[0];

    const { data: profile } = await this._supabaseAdmin
      .from("profiles")
      .select("reset_otp, reset_otp_expires_at")
      .eq("id", user.id)
      .single();

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    if (profile.reset_otp !== otp) {
      throw new InvariantError("Invalid OTP");
    }

    if (profile.reset_otp_expires_at < new Date()) {
      throw new InvariantError("OTP has expired");
    }

    await this._supabaseAdmin
      .from("profiles")
      .update({ reset_otp: null, reset_otp_expires_at: null })
      .eq("id", user.id);

    return { id: user.id };
  }

  async resetPassword({ userId, newPassword }) {
    const { error: updateError } =
      await this._supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

    if (updateError) {
      throw new InvariantError(
        "Failed to reset password: " + updateError.message
      );
    }
  }

  async saveRefreshToken(token, userId) {
    await this._supabase
      .from("refresh_tokens")
      .insert({ token, user_id: userId });
  }

  async verifyRefreshTokenInDb(token) {
    const { data, error } = await this._supabase
      .from("refresh_tokens")
      .select("user_id")
      .eq("token", token)
      .single();

    if (error || !data) {
      throw new InvariantError(
        "Failed to verify refresh token: " + error.message
      );
    }

    return data.user_id;
  }

  async logoutUser(refreshToken) {
    await this._supabase
      .from("refresh_tokens")
      .delete()
      .eq("token", refreshToken);
  }

  async deleteUser(userId) {
    const { error } = await this._supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      throw new InvariantError("Failed to delete user: " + error.message);
    }
  }
}

export default AuthService;
