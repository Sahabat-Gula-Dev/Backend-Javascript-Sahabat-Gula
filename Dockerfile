# Tahap 1: Gunakan base image Node.js versi 18 yang ringan (alpine)
FROM node:18-alpine

# Tentukan direktori kerja di dalam container
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json (jika ada) terlebih dahulu
# Ini memanfaatkan cache Docker untuk mempercepat build
COPY package*.json ./

# Install dependencies untuk production saja
RUN npm install --only=production

# Salin seluruh kode aplikasi Anda
COPY . .

# Beri tahu Docker bahwa container akan berjalan di port 3000
EXPOSE 3000

# Perintah default untuk menjalankan aplikasi saat container dimulai
CMD [ "node", "src/server.js" ]