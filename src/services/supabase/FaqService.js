import { createClient } from "@supabase/supabase-js";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";

export default class FaqService {
  constructor() {
    this._supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  /* CATEGORY */
  async _getCategoryById(id) {
    const { data, error } = await this._supabaseAdmin
      .from("faq_categories")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan kategori FAQ: " + error.message
      );
    return data || null;
  }

  async _getCategoryByName(name) {
    const { data, error } = await this._supabaseAdmin
      .from("faq_categories")
      .select("id, name")
      .eq("name", name)
      .maybeSingle();
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan kategori FAQ: " + error.message
      );
    return data || null;
  }

  async _getOrCreateCategoryByName(name) {
    const existing = await this._getCategoryByName(name);
    if (existing) return existing;

    const { data, error } = await this._supabaseAdmin
      .from("faq_categories")
      .insert({ name })
      .select("id, name")
      .single();
    if (error)
      throw new InvariantError("Gagal membuat kategori FAQ: " + error.message);
    return data;
  }

  async listCategories({ q, page = 1, limit = 20 }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this._supabaseAdmin
      .from("faq_categories")
      .select("id, name", { count: "exact" })
      .order("id", { ascending: true })
      .range(from, to);

    if (q) query = query.ilike("name", `%${q}%`);

    const { data, error, count } = await query;
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan kategori FAQ: " + error.message
      );
    return { data, meta: { page, limit, total: count ?? 0 } };
  }

  async createCategory({ name }) {
    const existing = await this._getCategoryByName(name);
    if (existing) return existing;

    const { data, error } = await this._supabaseAdmin
      .from("faq_categories")
      .insert({ name })
      .select("id, name")
      .single();
    if (error)
      throw new InvariantError("Gagal membuat kategori FAQ: " + error.message);
    return data;
  }

  async updateCategory(id, { name }) {
    const { data, error } = await this._supabaseAdmin
      .from("faq_categories")
      .update({ name })
      .eq("id", id)
      .select("id, name")
      .single();
    if (error)
      throw new InvariantError(
        "Gagal memperbarui kategori FAQ: " + error.message
      );
    if (!data) throw new NotFoundError("Kategori FAQ tidak ditemukan");
    return data;
  }

  async deleteCategory(id) {
    const { error } = await this._supabaseAdmin
      .from("faq_categories")
      .delete()
      .eq("id", id);
    if (error)
      throw new InvariantError(
        "Gagal menghapus kategori FAQ: " + error.message
      );
  }

  /* FAQ CRUD */
  async listFaqs({
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
      .from("faqs")
      .select(
        "id, question, answer, created_at, category_id, faq_categories:category_id(id, name)",
        {
          count: "exact",
        }
      )
      .range(from, to);

    if (q) query = query.or(`question.ilike.%${q}%,answer.ilike.%${q}%`);

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
        "Gagal mendapatkan daftar FAQ: " + error.message
      );

    return { data, meta: { page, limit, total: count ?? 0 } };
  }

  async getFaqById(id) {
    const { data, error } = await this._supabaseAdmin
      .from("faqs")
      .select(
        "id, question, answer, created_at, category_id, faq_categories:category_id(id, name)"
      )
      .eq("id", id)
      .maybeSingle();
    if (error)
      throw new InvariantError("Gagal mendapatkan FAQ: " + error.message);
    return data;
  }

  async createFaq(payload) {
    let categoryId = payload.category_id ?? null;
    if (!categoryId && payload.category_name) {
      const category = await this._getOrCreateCategoryByName(
        payload.category_name
      );
      categoryId = category.id;
    }
    if (categoryId) {
      const category = await this._getCategoryById(categoryId);
      if (!category) throw new InvariantError("Kategori FAQ tidak ditemukan");
    }

    const insertPayload = {
      question: payload.question,
      answer: payload.answer,
      category_id: categoryId,
    };

    const { data, error } = await this._supabaseAdmin
      .from("faqs")
      .insert(insertPayload)
      .select("id, question, answer, created_at, category_id")
      .single();
    if (error)
      throw new InvariantError("Gagal menambahkan FAQ: " + error.message);

    return data;
  }

  async updateFaq(id, payload) {
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
      if (!category) throw new InvariantError("Kategori FAQ tidak ditemukan");
    }

    const updatePayload = {
      ...(payload.question !== undefined && { question: payload.question }),
      ...(payload.answer !== undefined && { answer: payload.answer }),
      ...(categoryId !== undefined && { category_id: categoryId }),
    };

    const { data, error } = await this._supabaseAdmin
      .from("faqs")
      .update(updatePayload)
      .eq("id", id)
      .select("id, question, answer, created_at, category_id")
      .maybeSingle();

    if (error)
      throw new InvariantError("Gagal memperbarui FAQ: " + error.message);
    if (!data) throw new NotFoundError("FAQ tidak ditemukan");
    return data;
  }

  async deleteFaq(id) {
    const { error } = await this._supabaseAdmin
      .from("faqs")
      .delete()
      .eq("id", id);
    if (error)
      throw new InvariantError("Gagal menghapus FAQ: " + error.message);
  }
}
