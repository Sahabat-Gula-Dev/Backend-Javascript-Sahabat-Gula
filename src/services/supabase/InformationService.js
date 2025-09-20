import { createClient } from "@supabase/supabase-js";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";

export default class InformationService {
  constructor() {
    this._supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  async getRandomInformation() {
    const { data, error } = await this._supabaseAdmin
      .from("informations")
      .select("id, heading, content, created_at");

    if (error)
      throw new InvariantError(
        "Gagal mendapatkan daftar informations: " + error.message
      );

    if (!data || data.length === 0)
      throw new NotFoundError("Information tidak ditemukan");

    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  }

  async getInformationById(id) {
    const { data, error } = await this._supabaseAdmin
      .from("informations")
      .select("id, heading, content, created_at")
      .eq("id", id)
      .maybeSingle();
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan information: " + error.message
      );
    if (!data) throw new NotFoundError("Information tidak ditemukan");
    return data;
  }

  async createInformation(payload) {
    const insertPayload = {
      heading: payload.heading ?? null,
      content: payload.content ?? null,
    };

    const { data, error } = await this._supabaseAdmin
      .from("informations")
      .insert(insertPayload)
      .select("id, heading, content, created_at")
      .single();
    if (error)
      throw new InvariantError(
        "Gagal menambahkan information: " + error.message
      );

    return data;
  }

  async updateInformation(id, payload) {
    const updatePayload = {
      ...(payload.heading !== undefined && { heading: payload.heading }),
      ...(payload.content !== undefined && { content: payload.content }),
    };

    const { data, error } = await this._supabaseAdmin
      .from("informations")
      .update(updatePayload)
      .eq("id", id)
      .select("id, heading, content, created_at")
      .maybeSingle();

    if (error)
      throw new InvariantError(
        "Gagal memperbarui information: " + error.message
      );
    if (!data) throw new NotFoundError("Information tidak ditemukan");
    return data;
  }

  async deleteInformation(id) {
    const { error } = await this._supabaseAdmin
      .from("informations")
      .delete()
      .eq("id", id);
    if (error)
      throw new InvariantError("Gagal menghapus information: " + error.message);
  }
}
