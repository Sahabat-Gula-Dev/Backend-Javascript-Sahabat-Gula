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
      .select(
        "username, email:auth.users(email), role, is_active:auth.users(is_active)"
      )
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
      is_active: profile.is_active.is_active,
    };

    return user;
  }

  async registerUser({ username, email, password }) {
    const {
      data: { user },
      error: createError,
    } = await this._supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_meta_data: { username },
    });

    if (createError) {
      throw new InvariantError(
        "User registration failed: " + createError.message
      );
    }

    const otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const { error: updateError } = await this._supabaseAdmin
      .from("profiles")
      .update({ activation_otp: otp, activation_otp_expires_at: expiresAt })
      .eq("id", user.id);
    if (updateError) {
      throw new InvariantError("Failed to save OTP: " + updateError.message);
    }

    await this._resend.emails.send({
      from: "Sahabat Gula <noreply@sahabatgula.com>",
      to: email,
      subject: "Activate your account",
      html: `<p>Your activation code is: <strong>${otp}</strong></p>`,
    });
  }

  async verifyOtpAndActiveUser({ email, otp }) {
    const { data: user, error: userError } =
      await this._supabaseAdmin.auth.admin.getUserByEmail(email);
    if (userError || !user) {
      throw new NotFoundError("User not found");
    }

    const { data: profile, error: profileError } = await this._supabase
      .from("profiles")
      .select("activation_otp, activation_otp_expires_at")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new NotFoundError("Profile not found");
    }

    if (profile.activation_otp !== otp) {
      throw new AuthenticationError("Invalid OTP");
    }

    if (new Date() > profile.activation_otp_expires_at) {
      throw new AuthenticationError("OTP expired");
    }

    const { error: updateError } = await this._supabaseAdmin
      .from("profiles")
      .update({
        is_active: true,
        activation_otp: null,
        activation_otp_expires_at: null,
      })
      .eq("id", user.id);
    if (updateError) {
      throw new InvariantError(
        "Failed to activate user: " + updateError.message
      );
    }

    return this._getUserProfile(user.id);
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

    const { data: profile, error: profileError } = await this._supabaseAdmin
      .from("profiles")
      .select({ is_active: true })
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

    const { data: user, error: createError } =
      await this._supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_meta_data: { username },
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
      user_meta_data: { username },
    });
    if (createError) throw new InvariantError(createError.message);

    await this._supabaseAdmin
      .from("profiles")
      .update({ role: "admin", is_active: true })
      .eq("id", user.id);
  }
}

export default AuthService;
