import { createClient } from "@supabase/supabase-js";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";
import crypto from "crypto";

export default class CarouselService {
  constructor() {
    this._supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  async _uploadImage(file) {
    const fileExt = file.hapi.filename.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error } = await this._supabaseAdmin.storage
      .from("carousels") // bucket khusus carousel
      .upload(fileName, file._data, {
        upsert: true,
        contentType: file.hapi.headers["content-type"],
      });

    if (error)
      throw new InvariantError(
        "Gagal upload gambar carousel: " + error.message
      );

    return `${process.env.SUPABASE_URL}/storage/v1/object/public/carousels/${fileName}`;
  }

  async listCarousels({ page = 1, limit = 20, sort = "created_at.desc" }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this._supabaseAdmin
      .from("carousels")
      .select("id, image_url, target_url, created_at", { count: "exact" })
      .range(from, to);

    if (sort) {
      const [field, direction] = String(sort).split(".");
      query = query.order(field || "created_at", {
        ascending: (direction || "desc") === "asc",
      });
    }

    const { data, error, count } = await query;
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan daftar carousel: " + error.message
      );

    return { data, meta: { page, limit, total: count ?? 0 } };
  }

  async getCarouselById(id) {
    const { data, error } = await this._supabaseAdmin
      .from("carousels")
      .select("id, image_url, target_url, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error)
      throw new InvariantError("Gagal mendapatkan carousel: " + error.message);
    return data;
  }

  async createCarousel(payload, { image_file } = {}) {
    let imageUrl = payload.image_url ?? null;
    if (image_file) imageUrl = await this._uploadImage(image_file);

    const insertPayload = {
      image_url: imageUrl,
      target_url: payload.target_url ?? null,
    };

    const { data, error } = await this._supabaseAdmin
      .from("carousels")
      .insert(insertPayload)
      .select("id, image_url, target_url, created_at")
      .single();

    if (error)
      throw new InvariantError("Gagal menambahkan carousel: " + error.message);
    return data;
  }

  async updateCarousel(id, payload, { image_file } = {}) {
    let imageUrl = payload.image_url ?? undefined;
    if (image_file) imageUrl = await this._uploadImage(image_file);

    const updatePayload = {
      ...(imageUrl !== undefined && { image_url: imageUrl }),
      ...(payload.target_url !== undefined && {
        target_url: payload.target_url,
      }),
    };

    const { data, error } = await this._supabaseAdmin
      .from("carousels")
      .update(updatePayload)
      .eq("id", id)
      .select("id, image_url, target_url, created_at")
      .maybeSingle();

    if (error)
      throw new InvariantError("Gagal memperbarui carousel: " + error.message);
    if (!data) throw new NotFoundError("Carousel tidak ditemukan");
    return data;
  }

  async deleteCarousel(id) {
    const { error } = await this._supabaseAdmin
      .from("carousels")
      .delete()
      .eq("id", id);
    if (error)
      throw new InvariantError("Gagal menghapus carousel: " + error.message);
  }
}
