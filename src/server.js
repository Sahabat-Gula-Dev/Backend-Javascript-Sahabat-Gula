"use strict";

import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
import HapiAuthJwt2 from "hapi-auth-jwt2";
import TokenManager from "./tokenize/TokenManager.js";
import ClientError from "./exceptions/ClientError.js";

// for auth
import auth from "./api/auth/index.js";
import AuthService from "./services/supabase/AuthService.js";

// for admin-auth
import adminAuth from "./api/admin-auth/index.js";
import AdminAuthService from "./services/supabase/AdminAuthService.js";

// for google-auth
import googleAuth from "./api/google-auth/index.js";
import GoogleAuthService from "./services/supabase/GoogleAuthService.js";

// for profile
import profile from "./api/profile/index.js";
import ProfileService from "./services/supabase/ProfileService.js";

// for data makanan (foods)
import foods from "./api/foods/index.js";
import FoodService from "./services/supabase/FoodService.js";

// for aktivitas (activities)
import activities from "./api/activities/index.js";
import ActivityService from "./services/supabase/ActivityService.js";

// for informations
import informations from "./api/informations/index.js";
import InformationService from "./services/supabase/InformationService.js";

// for tips
import tips from "./api/tips/index.js";
import TipsService from "./services/supabase/TipsService.js";

// for faqs
import faqs from "./api/faqs/index.js";
import FaqService from "./services/supabase/FaqService.js";

// for carousels
import carousels from "./api/carousels/index.js";
import CarouselService from "./services/supabase/CarouselService.js";

// for articles
import articles from "./api/articles/index.js";
import ArticleService from "./services/supabase/ArticleService.js";

// for events
import events from "./api/events/index.js";
import EventService from "./services/supabase/EventService.js";

// for predictions
import predictions from "./api/predictions/index.js";
import PredictionService from "./services/supabase/PredictionService.js";

// for logs
import logs from "./api/logs/index.js";
import LogService from "./services/supabase/LogService.js";

dotenv.config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: "localhost",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  const authService = new AuthService();
  const adminAuthService = new AdminAuthService();
  const googleAuthService = new GoogleAuthService();
  const profileService = new ProfileService();
  const foodsService = new FoodService();
  const activitiesService = new ActivityService();
  const informationService = new InformationService();
  const tipsService = new TipsService();
  const faqService = new FaqService();
  const carouselService = new CarouselService();
  const articleService = new ArticleService();
  const eventService = new EventService();
  const predictionService = new PredictionService(foodsService);
  const logService = new LogService();

  await server.register(HapiAuthJwt2);

  server.auth.strategy("jwt", "jwt", {
    key: process.env.JWT_SECRET,
    validate: async (decoded, request, h) => {
      const user = await authService._getUserProfile(decoded.id);
      if (!user || !user.is_active) {
        return {
          isValid: false,
        };
      }

      return {
        isValid: true,
        credentials: { ...decoded, scope: decoded.role },
      };
    },
  });

  await server.register({
    plugin: auth,
    options: {
      service: authService,
      tokenManager: TokenManager,
    },
  });

  await server.register({
    plugin: adminAuth,
    options: {
      service: adminAuthService,
      tokenManager: TokenManager,
    },
  });

  await server.register({
    plugin: googleAuth,
    options: {
      service: googleAuthService,
      tokenManager: TokenManager,
    },
  });

  await server.register({
    plugin: profile,
    options: {
      service: profileService,
      tokenManager: TokenManager,
    },
  });

  await server.register({
    plugin: foods,
    options: {
      service: foodsService,
      tokenManager: TokenManager,
    },
  });

  await server.register({
    plugin: activities,
    options: {
      service: activitiesService,
      tokenManager: TokenManager,
    },
  });

  await server.register({
    plugin: tips,
    options: {
      service: tipsService,
      tokenManager: TokenManager,
    },
  });

  await server.register({
    plugin: informations,
    options: {
      service: informationService,
      tokenManager: TokenManager,
    },
  });

  await server.register({
    plugin: faqs,
    options: {
      service: faqService,
      tokenManager: TokenManager,
    },
  });

  await server.register({
    plugin: carousels,
    options: {
      service: carouselService,
      tokenManager: TokenManager,
    },
  });

  await server.register({
    plugin: articles,
    options: {
      service: articleService,
      tokenManager: TokenManager,
    },
  });

  await server.register({
    plugin: events,
    options: {
      service: eventService,
      tokenManager: TokenManager,
    },
  });

  await server.register({
    plugin: predictions,
    options: {
      service: predictionService,
      tokenManager: TokenManager,
    },
  });

  await server.register({
    plugin: logs,
    options: {
      service: logService,
      tokenManager: TokenManager,
    },
  });

  server.ext("onPreResponse", (request, h) => {
    const response = request.response;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        return h
          .response({
            status: "fail",
            message: response.message,
          })
          .code(response.statusCode);
      }

      if (response.isBoom) {
        return h
          .response({
            status: "error",
            message: response.output.payload.message || "terjadi kegagalan",
          })
          .code(response.output.statusCode);
      }

      return h
        .response({
          status: "error",
          message: "terjadi kegagalan pada server kami",
        })
        .code(500);
    }
    return h.continue;
  });

  await server.start();
  console.log(`Server is running on ${server.info.uri}`);
};

init();
