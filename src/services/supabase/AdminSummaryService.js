import { createClient } from "@supabase/supabase-js";
import InvariantError from "../../exceptions/InvariantError.js";

export default class AdminSummaryService {
  constructor() {
    this._supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  _fix(val) {
    return Number((val ?? 0).toFixed(2));
  }

  _getUtcDate(date) {
    return new Date(date).toISOString().split("T")[0];
  }

  /* =========================
     A. STATISTIK PENGGUNA
  ========================== */
  async getUserStats() {
    const { data, error } = await this._supabase
      .from("profiles")
      .select("gender, height, weight, bmi_score, risk_index, created_at")
      .eq("role", "user");

    if (error) throw new InvariantError("Gagal mengambil data pengguna.");

    const totalUsers = data.length;
    const male = data.filter((d) => d.gender === "Laki-laki");
    const female = data.filter((d) => d.gender === "Perempuan");

    const avg = (arr, key) =>
      arr.length
        ? arr.reduce((sum, x) => sum + (x[key] ?? 0), 0) / arr.length
        : 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const monthlyGrowth = Array.from({ length: 12 }, (_, i) => {
      const monthUsers = data.filter((u) => {
        const created = new Date(u.created_at);
        return (
          created.getFullYear() === currentYear && created.getMonth() === i
        );
      }).length;
      return { month: i + 1, users: monthUsers };
    });

    return {
      total_users: totalUsers,
      gender_distribution: { male: male.length, female: female.length },
      avg_height: {
        male: this._fix(avg(male, "height")),
        female: this._fix(avg(female, "height")),
        overall: this._fix(avg(data, "height")),
      },
      avg_weight: {
        male: this._fix(avg(male, "weight")),
        female: this._fix(avg(female, "weight")),
        overall: this._fix(avg(data, "weight")),
      },
      avg_bmi: {
        male: this._fix(avg(male, "bmi_score")),
        female: this._fix(avg(female, "bmi_score")),
        overall: this._fix(avg(data, "bmi_score")),
      },
      avg_risk_index: {
        male: this._fix(avg(male, "risk_index")),
        female: this._fix(avg(female, "risk_index")),
        overall: this._fix(avg(data, "risk_index")),
      },
      growth_this_year: monthlyGrowth,
    };
  }

  /* ======================================
     B. STATISTIK NUTRISI GLOBAL (7 HARI)
  ======================================= */
  async getNutritionStats(days = 7) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));

    const startStr = `${this._getUtcDate(start)}T00:00:00Z`;
    const endStr = `${this._getUtcDate(end)}T23:59:59Z`;

    const { data, error } = await this._supabase
      .from("food_consumption_logs")
      .select("portion, foods(calories, sugar), logged_at")
      .gte("logged_at", startStr)
      .lte("logged_at", endStr);

    if (error) throw new InvariantError("Gagal mengambil data nutrisi global.");

    const dailyMap = {};
    data.forEach((log) => {
      const date = this._getUtcDate(log.logged_at);
      const cal = (log.foods?.calories ?? 0) * (log.portion ?? 1);
      const sugar = (log.foods?.sugar ?? 0) * (log.portion ?? 1);
      if (!dailyMap[date]) dailyMap[date] = { calories: 0, sugar: 0, count: 0 };
      dailyMap[date].calories += cal;
      dailyMap[date].sugar += sugar;
      dailyMap[date].count += 1;
    });

    const range = [];
    const current = new Date(start);
    while (current <= end) {
      const date = this._getUtcDate(current);
      const record = dailyMap[date] || { calories: 0, sugar: 0, count: 0 };
      range.push({
        date,
        avg_calories: this._fix(
          record.count ? record.calories / record.count : 0
        ),
        avg_sugar: this._fix(record.count ? record.sugar / record.count : 0),
      });
      current.setDate(current.getDate() + 1);
    }

    const totalCal = range.reduce((s, r) => s + r.avg_calories, 0);
    const totalSugar = range.reduce((s, r) => s + r.avg_sugar, 0);

    return {
      period: `${this._getUtcDate(start)} - ${this._getUtcDate(end)}`,
      daily: range,
      overall_avg_calories: this._fix(totalCal / range.length),
      overall_avg_sugar: this._fix(totalSugar / range.length),
    };
  }

  /* ======================================
     C. EVENT & KONTEN TERBARU
  ======================================= */
  async getLatestContent() {
    const today = this._getUtcDate(new Date());

    const fetchTable = async (table, limit = 5, filter = {}) => {
      const { data, error } = await this._supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw new InvariantError(`Gagal ambil data ${table}`);
      return data;
    };

    const { data: upcomingEvents } = await this._supabase
      .from("events")
      .select("*")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(5);

    return {
      upcoming_events: upcomingEvents || [],
      latest_events: await fetchTable("events"),
      latest_articles: await fetchTable("articles"),
      latest_activities: await fetchTable("activities"),
      latest_foods: await fetchTable("foods"),
      carousels: await fetchTable("carousels", 10),
    };
  }

  /* ======================================
     D. DATA OPSIONAL TAMBAHAN
  ======================================= */
  async getExtendedStats() {
    const results = {};

    // 1. Aktivitas: total & rata-rata kalori terbakar
    const { data: actLogs, error: actErr } = await this._supabase
      .from("activity_logs")
      .select("activities(calories_burned)");
    if (actErr) throw new InvariantError("Gagal ambil aktivitas log.");
    const totalAct = actLogs?.length ?? 0;
    const avgBurn = this._fix(
      actLogs?.reduce((s, a) => s + (a.activities?.calories_burned ?? 0), 0) /
        (totalAct || 1)
    );
    results.activity = { total_logs: totalAct, avg_calories_burned: avgBurn };

    // 2. Food Logs: total makanan & pengguna paling aktif
    const { data: foodLogs, error: foodErr } = await this._supabase
      .from("food_consumption_logs")
      .select("user_id");
    if (foodErr) throw new InvariantError("Gagal ambil food logs.");
    const totalFoodLogs = foodLogs?.length ?? 0;
    const userCount = {};
    foodLogs.forEach(
      (f) => (userCount[f.user_id] = (userCount[f.user_id] ?? 0) + 1)
    );
    const mostActiveUser = Object.entries(userCount).sort(
      (a, b) => b[1] - a[1]
    )[0] || [null, 0];
    results.food_logs = {
      total_logs: totalFoodLogs,
      most_active_user_id: mostActiveUser[0],
      total_logs_by_user: mostActiveUser[1],
    };

    // 3. Artikel per kategori
    const { data: artCats } = await this._supabase
      .from("articles")
      .select("category_id");
    const articleCount = {};
    artCats?.forEach(
      (a) =>
        (articleCount[a.category_id] = (articleCount[a.category_id] ?? 0) + 1)
    );
    results.articles_by_category = articleCount;

    // 4. Event per kategori
    const { data: eventCats } = await this._supabase
      .from("events")
      .select("category_id");
    const eventCount = {};
    eventCats?.forEach(
      (a) => (eventCount[a.category_id] = (eventCount[a.category_id] ?? 0) + 1)
    );
    results.events_by_category = eventCount;

    return results;
  }

  /* =========================
     KOMBINASI SEMUA DATA
  ========================== */
  async getAdminDashboard() {
    const [users, nutrition, content, extended] = await Promise.all([
      this.getUserStats(),
      this.getNutritionStats(),
      this.getLatestContent(),
      this.getExtendedStats(),
    ]);

    return { users, nutrition, content, extended };
  }
}
