import { createClient } from "@supabase/supabase-js";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";
import crypto from "crypto";

export default class ArticleService {
  constructor() {
    this._supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  async _getCategoryById(id) {
    const { data, error } = await this._supabaseAdmin
      .from("article_categories")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan kategori artikel: " + error.message
      );
    return data || null;
  }

  async _getCategoryByName(name) {
    const { data, error } = await this._supabaseAdmin
      .from("article_categories")
      .select("id, name")
      .eq("name", name)
      .maybeSingle();
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan kategori artikel: " + error.message
      );
    return data || null;
  }

  async _getOrCreateCategoryByName(name) {
    const existing = await this._getCategoryByName(name);
    if (existing) return existing;

    const { data, error } = await this._supabaseAdmin
      .from("article_categories")
      .insert({ name })
      .select("id, name")
      .single();

    if (error)
      throw new InvariantError(
        "Gagal membuat kategori artikel: " + error.message
      );
    return data;
  }

  async listCategories({ q, page = 1, limit = 20 }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this._supabaseAdmin
      .from("article_categories")
      .select("id, name", { count: "exact" })
      .order("id", { ascending: true })
      .range(from, to);

    if (q) query = query.ilike("name", `%${q}%`);

    const { data, error, count } = await query;
    if (error)
      throw new InvariantError(
        "Gagal mendapatkan kategori artikel: " + error.message
      );

    return { data, meta: { page, limit, total: count ?? 0 } };
  }

  async createCategory({ name }) {
    const existing = await this._getCategoryByName(name);
    if (existing) return existing;

    const { data, error } = await this._supabaseAdmin
      .from("article_categories")
      .insert({ name })
      .select("id, name")
      .single();

    if (error)
      throw new InvariantError(
        "Gagal membuat kategori artikel: " + error.message
      );
    return data;
  }

  async updateCategory(id, { name }) {
    const { data, error } = await this._supabaseAdmin
      .from("article_categories")
      .update({ name })
      .eq("id", id)
      .select("id, name")
      .single();

    if (error)
      throw new InvariantError(
        "Gagal memperbarui kategori artikel: " + error.message
      );
    if (!data) throw new NotFoundError("Kategori artikel tidak ditemukan");

    return data;
  }

  async deleteCategory(id) {
    const { error } = await this._supabaseAdmin
      .from("article_categories")
      .delete()
      .eq("id", id);
    if (error)
      throw new InvariantError(
        "Gagal menghapus kategori artikel: " + error.message
      );
  }

  async _uploadCover(file) {
    const fileExt = file.hapi.filename.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error } = await this._supabaseAdmin.storage
      .from("articles") // bucket name khusus cover artikel
      .upload(fileName, file._data, {
        upsert: true,
        contentType: file.hapi.headers["content-type"],
      });

    if (error)
      throw new InvariantError("Gagal upload cover artikel: " + error.message);

    return `${process.env.SUPABASE_URL}/storage/v1/object/public/articles/${fileName}`;
  }

  async listArticles({
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
      .from("articles")
      .select(
        "id, author_id, title, cover_url, content, created_at, category_id, article_categories:category_id(id, name)",
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
        "Gagal mendapatkan daftar artikel: " + error.message
      );

    return { data, meta: { page, limit, total: count ?? 0 } };
  }

  async getArticleById(id) {
    const { data, error } = await this._supabaseAdmin
      .from("articles")
      .select(
        "id, author_id, title, cover_url, content, created_at, category_id, article_categories:category_id(id, name)"
      )
      .eq("id", id)
      .maybeSingle();

    if (error)
      throw new InvariantError("Gagal mendapatkan artikel: " + error.message);
    return data;
  }

  async createArticle(payload, { cover_file } = {}) {
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
        throw new InvariantError("Kategori artikel tidak ditemukan");
    }

    let coverUrl = payload.cover_url ?? null;
    if (cover_file) coverUrl = await this._uploadCover(cover_file);

    const insertPayload = {
      author_id: payload.author_id,
      title: payload.title,
      cover_url: coverUrl,
      content: payload.content ?? null,
      category_id: categoryId,
    };

    const { data, error } = await this._supabaseAdmin
      .from("articles")
      .insert(insertPayload)
      .select(
        "id, author_id, title, cover_url, content, created_at, category_id"
      )
      .single();

    if (error)
      throw new InvariantError("Gagal menambahkan artikel: " + error.message);
    return data;
  }

  async updateArticle(id, payload, { cover_file } = {}) {
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
        throw new InvariantError("Kategori artikel tidak ditemukan");
    }

    let coverUrl = payload.cover_url ?? undefined;
    if (cover_file) coverUrl = await this._uploadCover(cover_file);

    const updatePayload = {
      ...(payload.title !== undefined && { title: payload.title }),
      ...(coverUrl !== undefined && { cover_url: coverUrl }),
      ...(payload.content !== undefined && { content: payload.content }),
      ...(categoryId !== undefined && { category_id: categoryId }),
    };

    const { data, error } = await this._supabaseAdmin
      .from("articles")
      .update(updatePayload)
      .eq("id", id)
      .select(
        "id, author_id, title, cover_url, content, created_at, category_id"
      )
      .maybeSingle();

    if (error)
      throw new InvariantError("Gagal memperbarui artikel: " + error.message);
    if (!data) throw new NotFoundError("Artikel tidak ditemukan");

    return data;
  }

  async deleteArticle(id) {
    const { error } = await this._supabaseAdmin
      .from("articles")
      .delete()
      .eq("id", id);
    if (error)
      throw new InvariantError("Gagal menghapus artikel: " + error.message);
  }
}
