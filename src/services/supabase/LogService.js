import { createClient } from "@supabase/supabase-js";
import InvariantError from "../../exceptions/InvariantError.js";

export default class LogService {
  constructor() {
    this._supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  _nowLocal() {
    return new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Makassar" })
      .replace(" ", "T");
  }

  async logFoods(userId, foods) {
    const now = this._nowLocal();

    const inserts = foods.map((f) => ({
      user_id: userId,
      food_id: f.food_id,
      portion: f.portion ?? 1,
      logged_at: now,
    }));

    const { data, error } = await this._supabaseAdmin
      .from("food_consumption_logs")
      .insert(inserts)
      .select("id, food_id, portion, logged_at");

    if (error)
      throw new InvariantError(
        "Gagal mencatat konsumsi makanan: " + error.message
      );

    const foodIds = foods.map((f) => f.food_id);
    const { data: foodData, error: foodError } = await this._supabaseAdmin
      .from("foods")
      .select(
        "id, name, calories, carbs, protein, fat, sugar, sodium, fiber, potassium"
      )
      .in("id", foodIds);

    if (foodError)
      throw new InvariantError(
        "Gagal mengambil data makanan: " + foodError.message
      );

    const totals = {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      sugar: 0,
      sodium: 0,
      fiber: 0,
      potassium: 0,
    };
    foods.forEach((f) => {
      const food = foodData.find((x) => x.id === f.food_id);
      if (food) {
        const portion = f.portion ?? 1;
        totals.calories += (food.calories ?? 0) * portion;
        totals.carbs += (food.carbs ?? 0) * portion;
        totals.protein += (food.protein ?? 0) * portion;
        totals.fat += (food.fat ?? 0) * portion;
        totals.sugar += (food.sugar ?? 0) * portion;
        totals.sodium += (food.sodium ?? 0) * portion;
        totals.fiber += (food.fiber ?? 0) * portion;
        totals.potassium += (food.potassium ?? 0) * portion;
      }
    });

    const { data: profile } = await this._supabaseAdmin
      .from("profiles")
      .select("max_calories, max_sugar")
      .eq("id", userId)
      .maybeSingle();

    const ratios = {
      calories_ratio: profile?.max_calories
        ? totals.calories / profile.max_calories
        : null,
      sugar_ratio: profile?.max_sugar ? totals.sugar / profile.max_sugar : null,
    };

    return { logs: data, totals, ratios };
  }

  async logActivities(userId, activities) {
    const now = this._nowLocal();

    const inserts = activities.map((a) => ({
      user_id: userId,
      activity_id: a.activity_id,
      logged_at: now,
    }));

    const { data, error } = await this._supabaseAdmin
      .from("activity_logs")
      .insert(inserts)
      .select("id, activity_id, logged_at");

    if (error)
      throw new InvariantError("Gagal mencatat aktivitas: " + error.message);

    const activityIds = activities.map((a) => a.activity_id);
    const { data: activityData, error: actError } = await this._supabaseAdmin
      .from("activities")
      .select("id, name, calories_burned")
      .in("id", activityIds);

    if (actError)
      throw new InvariantError(
        "Gagal mengambil data aktivitas: " + actError.message
      );

    const totalBurned = activityData.reduce(
      (sum, a) => sum + (a.calories_burned ?? 0),
      0
    );

    return { logs: data, total_burned: totalBurned };
  }

  async logSteps(userId, steps) {
    const now = this._nowLocal();

    const { data, error } = await this._supabaseAdmin
      .from("step_logs")
      .insert({ user_id: userId, steps, logged_at: now })
      .select("id, steps, logged_at")
      .single();

    if (error)
      throw new InvariantError("Gagal mencatat langkah: " + error.message);

    return data;
  }

  async logWater(userId, amount) {
    const now = this._nowLocal();

    const { data, error } = await this._supabaseAdmin
      .from("water_logs")
      .insert({ user_id: userId, amount, logged_at: now })
      .select("id, amount, logged_at")
      .single();

    if (error)
      throw new InvariantError("Gagal mencatat konsumsi air: " + error.message);

    return data;
  }
}
