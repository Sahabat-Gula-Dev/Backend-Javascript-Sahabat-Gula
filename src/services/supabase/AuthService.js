import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import otpGenerator from "otp-generator";
import InvariantError from "../../exceptions/InvariantError.js";
import AuthenticationError from "../../exceptions/AuthenticationError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";
