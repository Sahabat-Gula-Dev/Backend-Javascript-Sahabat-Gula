import { createClient } from "@supabase/supabase-js";
import InvariantError from "../../exceptions/InvariantError.js";

export default class SummaryService {
  constructor() {
    this._supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  // === Helpers ===
  _getLocalDate(date) {
    return new Date(date).toLocaleDateString("en-CA", {
      timeZone: "Asia/Makassar",
    });
  }

  _fix(val) {
    return Number((val ?? 0).toFixed(2));
  }

  _generateDateRange(start, end) {
    const range = [];
    const current = new Date(start);
    while (current <= end) {
      range.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return range;
  }

  // === Summary per periode ===
  async _getSummaryByDate(userId, startDate, endDate) {
    const tz = "Asia/Makassar";
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T23:59:59");

    const startStr =
      start.toLocaleString("sv-SE", { timeZone: tz }).replace(" ", "T") + "Z";
    const endStr =
      end.toLocaleString("sv-SE", { timeZone: tz }).replace(" ", "T") + "Z";

    // --- Food
    const { data: foodLogs, error: foodError } = await this._supabaseAdmin
      .from("food_consumption_logs")
      .select("portion, foods(*)")
      .eq("user_id", userId)
      .gte("logged_at", startStr)
      .lte("logged_at", endStr);

    if (foodError)
      throw new InvariantError(`Gagal mengambil data: ${foodError.message}`);

    const nutrients = {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      sugar: 0,
      sodium: 0,
      fiber: 0,
      potassium: 0,
    };

    foodLogs?.forEach((log) => {
      const f = log.foods;
      const portion = log.portion ?? 1;
      nutrients.calories += (f.calories ?? 0) * portion;
      nutrients.carbs += (f.carbs ?? 0) * portion;
      nutrients.protein += (f.protein ?? 0) * portion;
      nutrients.fat += (f.fat ?? 0) * portion;
      nutrients.sugar += (f.sugar ?? 0) * portion;
      nutrients.sodium += (f.sodium ?? 0) * portion;
      nutrients.fiber += (f.fiber ?? 0) * portion;
      nutrients.potassium += (f.potassium ?? 0) * portion;
    });

    // apply fix
    for (const key in nutrients) nutrients[key] = this._fix(nutrients[key]);

    // --- Activity
    const { data: actLogs } = await this._supabaseAdmin
      .from("activity_logs")
      .select("activities(calories_burned)")
      .eq("user_id", userId)
      .gte("logged_at", startStr)
      .lte("logged_at", endStr);

    const totalBurned =
      actLogs?.reduce(
        (sum, a) => sum + (a.activities?.calories_burned ?? 0),
        0
      ) ?? 0;

    // --- Steps
    const { data: stepsData } = await this._supabaseAdmin
      .from("step_logs")
      .select("steps")
      .eq("user_id", userId)
      .gte("logged_at", startStr)
      .lte("logged_at", endStr);

    const steps = stepsData?.reduce((s, x) => s + x.steps, 0) ?? 0;

    // --- Water
    const { data: waterData } = await this._supabaseAdmin
      .from("water_logs")
      .select("amount")
      .eq("user_id", userId)
      .gte("logged_at", startStr)
      .lte("logged_at", endStr);

    const water = waterData?.reduce((s, x) => s + x.amount, 0) ?? 0;

    return {
      date: startDate,
      nutrients,
      activities: { burned: this._fix(totalBurned) },
      steps,
      water,
    };
  }

  async getTodaySummary(userId) {
    const today = this._getLocalDate(new Date());
    return this._getSummaryByDate(userId, today, today);
  }

  async getWeeklySummary(userId) {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);

    const range = this._generateDateRange(startDate, today);
    const results = [];

    for (const d of range) {
      const dateStr = this._getLocalDate(d);
      const summary = await this._getSummaryByDate(userId, dateStr, dateStr);
      results.push(summary);
    }

    return results;
  }

  async getMonthlySummary(userId) {
    const today = new Date();
    const results = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = d
        .toLocaleDateString("en-CA", { timeZone: "Asia/Makassar" })
        .slice(0, 7);

      const start = `${month}-01`;
      const end = new Date(
        d.getFullYear(),
        d.getMonth() + 1,
        0
      ).toLocaleDateString("en-CA", { timeZone: "Asia/Makassar" });

      const summary = await this._getSummaryByDate(userId, start, end);
      summary.date = month;
      results.push(summary);
    }

    return results;
  }

  async getHistory(userId, limit = 3) {
    const today = new Date();
    const results = [];

    for (let i = 0; i < limit; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      const dateStr = this._getLocalDate(d);
      const foods = await this._getFoodLogsByDate(userId, dateStr);
      const activities = await this._getActivityLogsByDate(userId, dateStr);

      results.push({ date: dateStr, foods, activities });
    }

    return results;
  }

  // === Food & Activity history ===
  async _getFoodLogsByDate(userId, date) {
    const { data, error } = await this._supabaseAdmin
      .from("food_consumption_logs")
      .select(
        `
        id, portion, logged_at,
        foods (
          id, name, photo_url, description,
          serving_size, serving_unit,
          weight_size, weight_unit,
          calories
        )
      `
      )
      .eq("user_id", userId)
      .gte("logged_at", `${date}T00:00:00Z`)
      .lte("logged_at", `${date}T23:59:59Z`);

    if (error) throw new InvariantError("Gagal ambil log makanan");

    return (
      data?.map((f) => ({
        id: f.foods.id,
        name: f.foods.name,
        photo_url: f.foods.photo_url,
        description: f.foods.description,
        serving_size: f.foods.serving_size,
        serving_unit: f.foods.serving_unit,
        weight_size: f.foods.weight_size,
        weight_unit: f.foods.weight_unit,
        calories: this._fix((f.foods.calories ?? 0) * (f.portion ?? 1)),
        portion: f.portion ?? 1,
        time: f.logged_at,
      })) ?? []
    );
  }

  async _getActivityLogsByDate(userId, date) {
    const { data, error } = await this._supabaseAdmin
      .from("activity_logs")
      .select(
        `
        id, logged_at,
        activities (
          id, name, photo_url, description,
          category_id, calories_burned,
          duration, duration_unit
        )
      `
      )
      .eq("user_id", userId)
      .gte("logged_at", `${date}T00:00:00Z`)
      .lte("logged_at", `${date}T23:59:59Z`);

    if (error) throw new InvariantError("Gagal ambil log aktivitas");

    return (
      data?.map((a) => ({
        id: a.activities.id,
        name: a.activities.name,
        photo_url: a.activities.photo_url,
        description: a.activities.description,
        category_id: a.activities.category_id,
        calories_burned: this._fix(a.activities.calories_burned),
        duration: a.activities.duration,
        duration_unit: a.activities.duration_unit,
        time: a.logged_at,
      })) ?? []
    );
  }
}
