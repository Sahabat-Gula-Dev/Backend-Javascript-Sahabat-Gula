import { createClient } from "@supabase/supabase-js";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";
import crypto from "crypto";

export default class EventService {
  constructor() {
    this._supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  async _getCategoryById(id) {
    const { data, error } = await this._supabaseAdmin
      .from("event_categories")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan kategori event: " + error.message
      );
    return data || null;
  }

  async _getCategoryByName(name) {
    const { data, error } = await this._supabaseAdmin
      .from("event_categories")
      .select("id, name")
      .eq("name", name)
      .maybeSingle();
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan kategori event: " + error.message
      );
    return data || null;
  }

  async _getOrCreateCategoryByName(name) {
    const existing = await this._getCategoryByName(name);
    if (existing) return existing;

    const { data, error } = await this._supabaseAdmin
      .from("event_categories")
      .insert({ name })
      .select("id, name")
      .single();
    if (error)
      throw new InvariantError(
        "Gagal membuat kategori event: " + error.message
      );

    return data;
  }

  async listCategories({ q, page = 1, limit = 20 }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this._supabaseAdmin
      .from("event_categories")
      .select("id, name", { count: "exact" })
      .order("id", { ascending: true })
      .range(from, to);

    if (q) query = query.ilike("name", `%${q}%`);

    const { data, error, count } = await query;
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan kategori event: " + error.message
      );

    return { data, meta: { page, limit, total: count ?? 0 } };
  }

  async createCategory({ name }) {
    const existing = await this._getCategoryByName(name);
    if (existing) return existing;

    const { data, error } = await this._supabaseAdmin
      .from("event_categories")
      .insert({ name })
      .select("id, name")
      .single();

    if (error)
      throw new InvariantError(
        "Gagal membuat kategori event: " + error.message
      );
    return data;
  }

  async updateCategory(id, { name }) {
    const { data, error } = await this._supabaseAdmin
      .from("event_categories")
      .update({ name })
      .eq("id", id)
      .select("id, name")
      .single();

    if (error)
      throw new InvariantError(
        "Gagal memperbarui kategori event: " + error.message
      );
    if (!data) throw new NotFoundError("Kategori event tidak ditemukan");
    return data;
  }

  async deleteCategory(id) {
    const { error } = await this._supabaseAdmin
      .from("event_categories")
      .delete()
      .eq("id", id);
    if (error)
      throw new InvariantError(
        "Gagal menghapus kategori event: " + error.message
      );
  }

  async _uploadCover(file) {
    const fileExt = file.hapi.filename.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error } = await this._supabaseAdmin.storage
      .from("events")
      .upload(fileName, file._data, {
        upsert: true,
        contentType: file.hapi.headers["content-type"],
      });

    if (error)
      throw new InvariantError("Gagal upload cover event: " + error.message);

    return `${process.env.SUPABASE_URL}/storage/v1/object/public/events/${fileName}`;
  }

  async listEvents({
    q,
    category_id,
    category_name,
    page = 1,
    limit = 20,
    sort = "created_at.desc",
  }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this._supabaseAdmin
      .from("events")
      .select(
        "id, author_id, title, event_date, event_start, event_end, location, location_detail, cover_url, content, created_at, category_id, event_categories:category_id(id, name)",
        { count: "exact" }
      )
      .range(from, to);

    if (q) query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);

    if (category_id) {
      query = query.eq("category_id", category_id);
    } else if (category_name) {
      const category = await this._getCategoryByName(category_name);
      if (!category) return { data: [], meta: { page, limit, total: 0 } };
      query = query.eq("category_id", category.id);
    }

    if (sort) {
      const [field, direction] = String(sort).split(".");
      query = query.order(field || "created_at", {
        ascending: (direction || "desc") === "asc",
      });
    }

    const { data, error, count } = await query;
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan daftar event: " + error.message
      );

    return { data, meta: { page, limit, total: count ?? 0 } };
  }

  async getEventById(id) {
    const { data, error } = await this._supabaseAdmin
      .from("events")
      .select(
        "id, author_id, title, event_date, event_start, event_end, location, location_detail, cover_url, content, created_at, category_id, event_categories:category_id(id, name)"
      )
      .eq("id", id)
      .maybeSingle();

    if (error)
      throw new InvariantError("Gagal mendapatkan event: " + error.message);
    return data;
  }

  async createEvent(payload, { cover_file } = {}) {
    let categoryId = payload.category_id ?? null;
    if (!categoryId && payload.category_name) {
      const category = await this._getOrCreateCategoryByName(
        payload.category_name
      );
      categoryId = category.id;
    }

    if (categoryId) {
      const category = await this._getCategoryById(categoryId);
      if (!category) throw new InvariantError("Kategori event tidak ditemukan");
    }

    let coverUrl = payload.cover_url ?? null;
    if (cover_file) coverUrl = await this._uploadCover(cover_file);

    const insertPayload = {
      author_id: payload.author_id,
      title: payload.title,
      event_date: payload.event_date,
      event_start: payload.event_start,
      event_end: payload.event_end,
      location: payload.location ?? null,
      location_detail: payload.location_detail ?? null,
      cover_url: coverUrl,
      content: payload.content ?? null,
      category_id: categoryId,
    };

    const { data, error } = await this._supabaseAdmin
      .from("events")
      .insert(insertPayload)
      .select(
        "id, author_id, title, event_date, event_start, event_end, location, location_detail, cover_url, content, created_at, category_id"
      )
      .single();

    if (error)
      throw new InvariantError("Gagal menambahkan event: " + error.message);
    return data;
  }

  async updateEvent(id, payload, { cover_file } = {}) {
    let categoryId =
      payload.category_id !== undefined ? payload.category_id : undefined;
    if (payload.category_name) {
      const category = await this._getOrCreateCategoryByName(
        payload.category_name
      );
      categoryId = category.id;
    }

    if (categoryId) {
      const category = await this._getCategoryById(categoryId);
      if (!category) throw new InvariantError("Kategori event tidak ditemukan");
    }

    let coverUrl = payload.cover_url ?? undefined;
    if (cover_file) coverUrl = await this._uploadCover(cover_file);

    const updatePayload = {
      ...(payload.title !== undefined && { title: payload.title }),
      ...(payload.event_date !== undefined && {
        event_date: payload.event_date,
      }),
      ...(payload.event_start !== undefined && {
        event_start: payload.event_start,
      }),
      ...(payload.event_end !== undefined && { event_end: payload.event_end }),
      ...(payload.location !== undefined && { location: payload.location }),
      ...(payload.location_detail !== undefined && {
        location_detail: payload.location_detail,
      }),
      ...(coverUrl !== undefined && { cover_url: coverUrl }),
      ...(payload.content !== undefined && { content: payload.content }),
      ...(categoryId !== undefined && { category_id: categoryId }),
    };

    const { data, error } = await this._supabaseAdmin
      .from("events")
      .update(updatePayload)
      .eq("id", id)
      .select(
        "id, author_id, title, event_date, event_start, event_end, location, location_detail, cover_url, content, created_at, category_id"
      )
      .maybeSingle();

    if (error)
      throw new InvariantError("Gagal memperbarui event: " + error.message);
    if (!data) throw new NotFoundError("Event tidak ditemukan");

    return data;
  }

  async deleteEvent(id) {
    const { error } = await this._supabaseAdmin
      .from("events")
      .delete()
      .eq("id", id);
    if (error)
      throw new InvariantError("Gagal menghapus event: " + error.message);
  }
}
