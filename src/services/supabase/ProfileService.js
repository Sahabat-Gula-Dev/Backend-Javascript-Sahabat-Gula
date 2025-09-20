import { createClient } from "@supabase/supabase-js";
import {
  calculateBmi,
  calculateRiskIndex,
  calculateCalories,
  calculateNutrients,
} from "../../utils/healthUtils.js";
import NotFoundError from "../../exceptions/NotFoundError.js";
import InvariantError from "../../exceptions/InvariantError.js";

export default class ProfileService {
  constructor() {
    this._supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  async setupProfile(id, input) {
    const bmi = calculateBmi(input.weight, input.height);
    const riskIndex = calculateRiskIndex(input, bmi);
    const maxCalories = calculateCalories({ ...input, riskIndex });
    const nutrients = calculateNutrients(maxCalories);

    const { error } = await this._supabaseAdmin
      .from("profiles")
      .update({
        gender: input.gender,
        age: input.age,
        height: input.height,
        weight: input.weight,
        waist_circumference: input.waist_circumference,
        blood_pressure: input.blood_pressure,
        blood_sugar: input.blood_sugar,
        eat_vegetables: input.eat_vegetables,
        diabetes_family: input.diabetes_family,
        activity_level: input.activity_level,
        bmi_score: bmi,
        risk_index: riskIndex,
        max_calories: maxCalories,
        max_carbs: nutrients.carbs,
        max_protein: nutrients.protein,
        max_fat: nutrients.fat,
        max_sugar: nutrients.sugar,
      })
      .eq("id", id);

    if (error)
      throw new InvariantError("Gagal menyimpan profil: " + error.message);

    return { bmi, riskIndex, maxCalories, ...nutrients };
  }

  async getProfileDataSetup(id) {
    const { data, error } = await this._supabaseAdmin
      .from("profiles")
      .select(
        "id, username, email, bmi_score, risk_index, max_calories, max_carbs, max_protein, max_fat, max_sugar, max_natrium, max_fiber, max_potassium"
      )
      .eq("id", id)
      .single();

    if (error)
      throw new InvariantError(
        "Gagal mendapatkan data profil: " + error.message
      );
    if (!data) throw new NotFoundError("Profil tidak ditemukan");

    return data;
  }
}
