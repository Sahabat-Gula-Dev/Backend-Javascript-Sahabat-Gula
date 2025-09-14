import { createClient } from "@supabase/supabase-js";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";

export default class TipsService {
  constructor() {
    this._supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  async getRandomTip() {
    const { data, error } = await this._supabaseAdmin
      .from("tips")
      .select("id, heading, content, created_at");

    if (error) {
      throw new InvariantError(
        "Gagal mendapatkan daftar tips: " + error.message
      );
    }

    if (!data || data.length === 0) {
      throw new NotFoundError("Tips tidak ditemukan");
    }

    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  }

  async getTipById(id) {
    const { data, error } = await this._supabaseAdmin
      .from("tips")
      .select("id, heading, content, created_at")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      throw new InvariantError("Gagal mendapatkan tips: " + error.message);
    }
    if (!data) throw new NotFoundError("Tips tidak ditemukan");
    return data;
  }

  async createTip(payload) {
    const insertPayload = {
      heading: payload.heading ?? null,
      content: payload.content ?? null,
    };

    const { data, error } = await this._supabaseAdmin
      .from("tips")
      .insert(insertPayload)
      .select("id, heading, content, created_at")
      .single();
    if (error) {
      throw new InvariantError("Gagal menambahkan tips: " + error.message);
    }

    return data;
  }

  async updateTip(id, payload) {
    const updatePayload = {
      ...(payload.heading !== undefined && { heading: payload.heading }),
      ...(payload.content !== undefined && { content: payload.content }),
    };

    const { data, error } = await this._supabaseAdmin
      .from("tips")
      .update(updatePayload)
      .eq("id", id)
      .select("id, heading, content, created_at")
      .maybeSingle();

    if (error) {
      throw new InvariantError("Gagal memperbarui tips: " + error.message);
    }
    if (!data) throw new NotFoundError("Tips tidak ditemukan");
    return data;
  }

  async deleteTip(id) {
    const { error } = await this._supabaseAdmin
      .from("tips")
      .delete()
      .eq("id", id);
    if (error) {
      throw new InvariantError("Gagal menghapus tips: " + error.message);
    }
  }
}
