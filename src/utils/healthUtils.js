export function calculateBmi(weight, height) {
  height = height / 100; // convert cm to m
  return Number((weight / (height * height)).toFixed(2));
}

export function calculateRiskIndex(input, bmi) {
  let risk = 0;

  // umur
  if (input.age >= 45 && input.age <= 54) risk += 2;
  else if (input.age >= 55 && input.age <= 64) risk += 3;
  else if (input.age > 64) risk += 4;

  // BMI
  if (bmi >= 25 && bmi <= 30) risk += 1;
  else if (bmi > 30) risk += 3;

  // lingkar pinggang
  if (input.gender === "Laki-laki") {
    if (input.waist_circumference >= 94 && input.waist_circumference <= 101)
      risk += 3;
    else if (input.waist_circumference >= 102) risk += 4;
  } else {
    if (input.waist_circumference >= 80 && input.waist_circumference <= 87)
      risk += 3;
    else if (input.waist_circumference >= 88) risk += 4;
  }

  // riwayat
  if (input.blood_pressure) risk += 2;
  if (input.blood_sugar) risk += 5;

  // activitas
  if (input.activity_level === "Tidak Aktif") risk += 2;

  // sayur
  if (!input.eat_vegetables) risk += 1;

  // diabetes family
  if (input.diabetes_family === "Tingkat Satu") risk += 5;
  else if (input.diabetes_family === "Tingkat Dua") risk += 3;

  return risk;
}

export function calculateCalories({
  gender,
  weight,
  height,
  age,
  activity_level,
  riskIndex,
}) {
  // mifflin - st jeor equation
  let bmr =
    gender === "Laki-laki"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  // faktor aktivitas
  const factor = {
    "Tidak Aktif": 1.2,
    Ringan: 1.375,
    Sedang: 1.55,
    Berat: 1.725,
    "Sangat Berat": 1.9,
  };
  bmr *= factor[activity_level] || 1.2;

  // faktor umur
  if (age >= 40 && age <= 59) bmr *= 0.95;
  else if (age >= 60 && age <= 69) bmr *= 0.9;
  else if (age >= 70) bmr *= 0.85;

  // faktor risiko
  if (riskIndex > 13) bmr *= 0.75;

  return Math.round(bmr);
}

export function calculateNutrients(maxCalories) {
  const carbs = (0.6 * maxCalories) / 4;
  const protein = (0.15 * maxCalories) / 4;
  const fat = (0.25 * maxCalories) / 9;
  const sugar = (0.1 * maxCalories) / 4;

  return {
    carbs: Number(carbs.toFixed(2)),
    protein: Number(protein.toFixed(2)),
    fat: Number(fat.toFixed(2)),
    sugar: Number(sugar.toFixed(2)),
  };
}
