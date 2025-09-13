import { createClient } from "@supabase/supabase-js";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";
import crypto from "crypto";

export default class FoodService {
  constructor() {
    this._supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  // ================= CATEGORY =================
  async _getCategoryById(id) {
    const { data, error } = await this._supabaseAdmin
      .from("food_categories")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan kategori makanan: " + error.message
      );

    return data || null;
  }

  async _getCategoryByName(name) {
    const { data, error } = await this._supabaseAdmin
      .from("food_categories")
      .select("id, name")
      .eq("name", name)
      .maybeSingle();
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan kategori makanan: " + error.message
      );

    return data || null;
  }

  async _getOrCreateCategoryByName(name) {
    const existing = await this._getCategoryByName(name);
    if (existing) {
      return existing;
    }

    const { data, error } = await this._supabaseAdmin
      .from("food_categories")
      .insert({ name })
      .select("id, name")
      .single();

    if (error)
      throw new InvariantError(
        "Gagal membuat kategori makanan: " + error.message
      );

    return data;
  }

  async listCategories({ q, page = 1, limit = 20 }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this._supabaseAdmin
      .from("food_categories")
      .select("id, name", { count: "exact" })
      .order("id", { ascending: true })
      .range(from, to);
    if (q) query = query.ilike("name", `%${q}%`);
    const { data, error, count } = await query;
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan kategori makanan: " + error.message
      );

    return { data, meta: { page, limit, total: count ?? 0 } };
  }

  async createCategory({ name }) {
    const existing = await this._getCategoryByName(name);
    if (existing) {
      return existing;
    }

    const { data, error } = await this._supabaseAdmin
      .from("food_categories")
      .insert({ name })
      .select("id, name")
      .single();

    if (error)
      throw new InvariantError(
        "Gagal membuat kategori makanan: " + error.message
      );

    return data;
  }

  async updateCategory(id, { name }) {
    const { data, error } = await this._supabaseAdmin
      .from("food_categories")
      .update({ name })
      .eq("id", id)
      .select("id, name")
      .single();
    if (error)
      throw new InvariantError(
        "Gagal memperbarui kategori makanan: " + error.message
      );
    if (!data) throw new NotFoundError("Kategori makanan tidak ditemukan");

    return data;
  }

  async deleteCategory(id) {
    const { error } = await this._supabaseAdmin
      .from("food_categories")
      .delete()
      .eq("id", id);
    if (error)
      throw new InvariantError(
        "Gagal menghapus kategori makanan: " + error.message
      );

    return;
  }

  // ================= FOODS =================
  async _uploadPhoto(file) {
    const fileExt = file.hapi.filename.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error } = await this._supabaseAdmin.storage
      .from("foods") // bucket name
      .upload(fileName, file._data, {
        upsert: true,
        contentType: file.hapi.headers["content-type"],
      });

    if (error)
      throw new InvariantError("Gagal upload foto makanan: " + error.message);

    const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/foods/${fileName}`;

    return url;
  }

  async listFoods({
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
      .from("foods")
      .select(
        "id, name, photo_url, description, category_id, serving_size, serving_unit, weight_size, weight_unit, calories, created_at, food_categories:category_id(id, name)",
        { count: "exact" }
      )
      .range(from, to);

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (category_id) {
      query = query.eq("category_id", category_id);
    } else if (category_name) {
      const cat = await this._getCategoryByName(category_name);
      if (!cat) {
        return { data: [], meta: { page, limit, total: 0 } };
      }
      query = query.eq("category_id", cat.id);
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
        "Gagal mendapatkan daftar makanan: " + error.message
      );

    return { data, meta: { page, limit, total: count ?? 0 } };
  }

  async getFoodById(id) {
    const { data, error } = await this._supabaseAdmin
      .from("foods")
      .select(
        "id, name, photo_url, description, category_id, serving_size, serving_unit, weight_size, weight_unit, calories, carbs, protein, fat, sugar, sodium, fiber, potassium, created_at, food_categories:category_id(id, name)"
      )
      .eq("id", id)
      .maybeSingle();

    if (error)
      throw new InvariantError("Gagal mendapatkan makanan: " + error.message);

    return data;
  }

  async createFood(payload) {
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
        throw new InvariantError("Kategori makanan tidak ditemukan");
    }

    let photoUrl = payload.photo_url ?? null;
    if (payload.photo_file) {
      photoUrl = await this._uploadPhoto(payload.photo_file);
    }

    const insertPayload = {
      name: payload.name,
      photo_url: photoUrl,
      description: payload.description ?? null,
      category_id: categoryId,
      serving_size: payload.serving_size,
      serving_unit: payload.serving_unit ?? null,
      weight_size: payload.weight_size,
      weight_unit: payload.weight_unit ?? null,
      calories: payload.calories ?? null,
      carbs: payload.carbs ?? null,
      protein: payload.protein ?? null,
      fat: payload.fat ?? null,
      sugar: payload.sugar ?? null,
      sodium: payload.sodium ?? null,
      fiber: payload.fiber ?? null,
      potassium: payload.potassium ?? null,
    };

    const { data, error } = await this._supabaseAdmin
      .from("foods")
      .insert(insertPayload)
      .select(
        "id, name, photo_url, description, category_id, serving_size, serving_unit, weight_size, weight_unit, calories, carbs, protein, fat, sugar, sodium, fiber, potassium, created_at"
      )
      .single();

    if (error)
      throw new InvariantError("Gagal menambahkan makanan: " + error.message);

    return data;
  }

  async updateFood(id, payload, { photo_file } = {}) {
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
        throw new InvariantError("Kategori makanan tidak ditemukan");
    }

    let photoUrl = payload.photo_url ?? undefined;
    if (photo_file) {
      photoUrl = await this._uploadPhoto(photo_file);
    }

    const updatePayload = {
      ...(payload.name !== undefined && { name: payload.name }),
      ...(photoUrl !== undefined && { photo_url: photoUrl }),
      ...(payload.description !== undefined && {
        description: payload.description,
      }),
      ...(categoryId !== undefined && { category_id: categoryId }),
      ...(payload.serving_size !== undefined && {
        serving_size: payload.serving_size,
      }),
      ...(payload.serving_unit !== undefined && {
        serving_unit: payload.serving_unit,
      }),
      ...(payload.weight_size !== undefined && {
        weight_size: payload.weight_size,
      }),
      ...(payload.weight_unit !== undefined && {
        weight_unit: payload.weight_unit,
      }),
      ...(payload.calories !== undefined && { calories: payload.calories }),
      ...(payload.carbs !== undefined && { carbs: payload.carbs }),
      ...(payload.protein !== undefined && { protein: payload.protein }),
      ...(payload.fat !== undefined && { fat: payload.fat }),
      ...(payload.sugar !== undefined && { sugar: payload.sugar }),
      ...(payload.sodium !== undefined && { sodium: payload.sodium }),
      ...(payload.fiber !== undefined && { fiber: payload.fiber }),
      ...(payload.potassium !== undefined && { potassium: payload.potassium }),
    };

    const { data, error } = await this._supabaseAdmin
      .from("foods")
      .update(updatePayload)
      .eq("id", id)
      .select(
        "id, name, photo_url, description, category_id, serving_size, serving_unit, weight_size, weight_unit, calories, carbs, protein, fat, sugar, sodium, fiber, potassium, created_at"
      )
      .maybeSingle();

    if (error)
      throw new InvariantError("Gagal memperbarui makanan: " + error.message);
    if (!data) throw new NotFoundError("Makanan tidak ditemukan");

    return data;
  }

  async deleteFood(id) {
    const { error } = await this._supabaseAdmin
      .from("foods")
      .delete()
      .eq("id", id);
    if (error)
      throw new InvariantError("Gagal menghapus makanan: " + error.message);
  }
}
