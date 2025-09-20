import { createClient } from "@supabase/supabase-js";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";
import crypto from "crypto";

export default class ActivityService {
  constructor() {
    this._supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  async _getCategoryById(id) {
    const { data, error } = await this._supabaseAdmin
      .from("activity_categories")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan kategori aktivitas: " + error.message
      );
    return data || null;
  }

  async _getCategoryByName(name) {
    const { data, error } = await this._supabaseAdmin
      .from("activity_categories")
      .select("id, name")
      .eq("name", name)
      .maybeSingle();
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan kategori aktivitas: " + error.message
      );
    return data || null;
  }

  async _getOrCreateCategoryByName(name) {
    const existing = await this._getCategoryByName(name);
    if (existing) return existing;

    const { data, error } = await this._supabaseAdmin
      .from("activity_categories")
      .insert({ name })
      .select("id, name")
      .single();

    if (error)
      throw new InvariantError(
        "Gagal membuat kategori aktivitas: " + error.message
      );
    return data;
  }

  async listCategories({ q, page = 1 }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this._supabaseAdmin
      .from("activity_categories")
      .select("id, name", { count: "exact" })
      .order("id", { ascending: true })
      .range(from, to);

    if (q) query = query.ilike("name", `%${q}%`);

    const { data, error, count } = await query;
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan kategori aktivitas: " + error.message
      );

    return { data, meta: { page, total: count ?? 0 } };
  }

  async createCategory({ name }) {
    const existing = await this._getCategoryByName(name);
    if (existing) return existing;

    const { data, error } = await this._supabaseAdmin
      .from("activity_categories")
      .insert({ name })
      .select("id, name")
      .single();

    if (error)
      throw new InvariantError(
        "Gagal membuat kategori aktivitas: " + error.message
      );
    return data;
  }

  async updateCategory(id, { name }) {
    const { data, error } = await this._supabaseAdmin
      .from("activity_categories")
      .update({ name })
      .eq("id", id)
      .select("id, name")
      .single();

    if (error)
      throw new InvariantError(
        "Gagal memperbarui kategori aktivitas: " + error.message
      );
    if (!data) throw new NotFoundError("Kategori aktivitas tidak ditemukan");

    return data;
  }

  async deleteCategory(id) {
    const { error } = await this._supabaseAdmin
      .from("activity_categories")
      .delete()
      .eq("id", id);
    if (error)
      throw new InvariantError(
        "Gagal menghapus kategori aktivitas: " + error.message
      );
  }

  async _uploadPhoto(file) {
    const fileExt = file.hapi.filename.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error } = await this._supabaseAdmin.storage
      .from("activities") // bucket name khusus activities
      .upload(fileName, file._data, {
        upsert: true,
        contentType: file.hapi.headers["content-type"],
      });

    if (error)
      throw new InvariantError("Gagal upload foto aktivitas: " + error.message);

    return `${process.env.SUPABASE_URL}/storage/v1/object/public/activities/${fileName}`;
  }

  async listActivities({
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
      .from("activities")
      .select(
        "id, name, photo_url, description, category_id, calories_burned, duration, duration_unit, created_at, activity_categories:category_id(id, name)",
        { count: "exact" }
      )
      .range(from, to);

    if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);

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
        "Gagal mendapatkan daftar aktivitas: " + error.message
      );

    return { data, meta: { page, limit, total: count ?? 0 } };
  }

  async getActivityById(id) {
    const { data, error } = await this._supabaseAdmin
      .from("activities")
      .select(
        "id, name, photo_url, description, category_id, calories_burned, duration, duration_unit, created_at, activity_categories:category_id(id, name)"
      )
      .eq("id", id)
      .maybeSingle();

    if (error)
      throw new InvariantError("Gagal mendapatkan aktivitas: " + error.message);
    return data;
  }

  async createActivity(payload) {
    let categoryId = payload.category_id ?? null;
    if (!categoryId && payload.category_name) {
      const category = await this._getOrCreateCategoryByName(
        payload.category_name
      );
      categoryId = category.id;
    }

    if (categoryId) {
      const category = await this._getCategoryById(categoryId);
      if (!category)
        throw new InvariantError("Kategori aktivitas tidak ditemukan");
    }

    let photoUrl = payload.photo_url ?? null;
    if (payload.photo_file)
      photoUrl = await this._uploadPhoto(payload.photo_file);

    const insertPayload = {
      name: payload.name,
      photo_url: photoUrl,
      description: payload.description ?? null,
      category_id: categoryId,
      calories_burned: payload.calories_burned ?? null,
      duration: payload.duration ?? null,
      duration_unit: payload.duration_unit ?? null,
    };

    const { data, error } = await this._supabaseAdmin
      .from("activities")
      .insert(insertPayload)
      .select(
        "id, name, photo_url, description, category_id, calories_burned, duration, duration_unit, created_at"
      )
      .single();

    if (error)
      throw new InvariantError("Gagal menambahkan aktivitas: " + error.message);
    return data;
  }

  async updateActivity(id, payload, { photo_file } = {}) {
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
      if (!category)
        throw new InvariantError("Kategori aktivitas tidak ditemukan");
    }

    let photoUrl = payload.photo_url ?? undefined;
    if (photo_file) photoUrl = await this._uploadPhoto(photo_file);

    const updatePayload = {
      ...(payload.name !== undefined && { name: payload.name }),
      ...(photoUrl !== undefined && { photo_url: photoUrl }),
      ...(payload.description !== undefined && {
        description: payload.description,
      }),
      ...(categoryId !== undefined && { category_id: categoryId }),
      ...(payload.calories_burned !== undefined && {
        calories_burned: payload.calories_burned,
      }),
      ...(payload.duration !== undefined && { duration: payload.duration }),
      ...(payload.duration_unit !== undefined && {
        duration_unit: payload.duration_unit,
      }),
    };

    const { data, error } = await this._supabaseAdmin
      .from("activities")
      .update(updatePayload)
      .eq("id", id)
      .select(
        "id, name, photo_url, description, category_id, calories_burned, duration, duration_unit, created_at"
      )
      .maybeSingle();

    if (error)
      throw new InvariantError("Gagal memperbarui aktivitas: " + error.message);
    if (!data) throw new NotFoundError("Aktivitas tidak ditemukan");

    return data;
  }

  async deleteActivity(id) {
    const { error } = await this._supabaseAdmin
      .from("activities")
      .delete()
      .eq("id", id);
    if (error)
      throw new InvariantError("Gagal menghapus aktivitas: " + error.message);
  }
}
