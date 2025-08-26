"use strict";

// 1. Impor semua dependency
require("dotenv").config();
const Hapi = require("@hapi/hapi");

// ... (impor dependency lain akan kita tambahkan nanti)

// 2. Fungsi untuk menginisialisasi dan menjalankan server
const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000, // Gunakan port dari .env atau default 3000
    host: "localhost",
    routes: {
      cors: {
        origin: ["*"], // Izinkan semua origin untuk development
      },
    },
  });

  // Di sini kita akan menambahkan semua endpoint API kita
  // server.route([...]);

  await server.start();
  console.log("🚀 Server berjalan di %s", server.info.uri);
};

// 3. Menangani error dan memulai server
process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
