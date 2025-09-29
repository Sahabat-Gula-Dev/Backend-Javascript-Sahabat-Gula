import axios from "axios";
import FormData from "form-data";
import { createClient } from "@supabase/supabase-js";
import InvariantError from "../../exceptions/InvariantError.js";
import NotFoundError from "../../exceptions/NotFoundError.js";
import crypto from "crypto";

export default class PredictionService {
  constructor(foodService) {
    this._supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    this._foodService = foodService;
    this._modelEndpoint = process.env.API_MODEL_ENDPOINT;
  }

  async _uploadImage(file) {
    const fileExt = file.hapi.filename.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error } = await this._supabaseAdmin.storage
      .from("predictions")
      .upload(fileName, file._data, {
        upsert: true,
        contentType: file.hapi.headers["content-type"],
      });

    if (error)
      throw new InvariantError("Gagal upload gambar: " + error.message);

    const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/predictions/${fileName}`;
    return { url, fileName };
  }

  async predict(file) {
    const formData = new FormData();
    formData.append("image", file._data, {
      filename: file.hapi.filename || "photo.jpg",
      contentType: file.hapi.headers["content-type"] || "image/jpeg",
    });

    let result;
    try {
      const res = await axios.post(this._modelEndpoint, formData, {
        headers: { ...formData.getHeaders() },
      });
      result = res.data;
    } catch (err) {
      throw new InvariantError(
        `Gagal request model API: ${err.response?.status} ${
          err.response?.statusText
        } - ${JSON.stringify(err.response?.data)}`
      );
    }

    if (!result.best?.name) {
      throw new NotFoundError("Model tidak mengembalikan hasil yang valid");
    }

    const { url } = await this._uploadImage(file);

    const foods = await this._foodService.listFoods({
      q: result.best.name,
      page: 1,
      limit: 10,
    });

    return {
      predicted_name: result.best.name,
      predicted_confidence: result.best.confidence,
      image_url: url,
      foods: foods.data,
      meta: foods.meta,
    };
  }
}
