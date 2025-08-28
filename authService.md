# Dokumentasi API Sahabat Gula - Auth Service

Dokumentasi ini mencakup semua endpoint yang diperlukan untuk service autentikasi pengguna dan admin.

## Base URL
```
http://<localhost>:<port>
```
**Contoh:** `http://localhost:3000`

---

## 1. Autentikasi Pengguna (User)

Bagian ini mencakup semua alur untuk pengguna biasa.

### 1.1 Registrasi Akun Baru (Reguler)

Mendaftarkan pengguna baru menggunakan email, username, dan password. Setelah berhasil, server akan mengirimkan kode OTP ke email yang didaftarkan.

**Endpoint:** `POST /auth/register`

**Request Body:** `application/json`

```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully. Please verify your email to activate your account."
}
```

**Error Response (400, 409):**
Jika payload tidak valid atau email sudah ada.

---

### 1.2 Verifikasi OTP & Aktivasi Akun

Mengirimkan OTP yang diterima dari email untuk mengaktifkan akun dan mendapatkan token.

**Endpoint:** `POST /auth/verify-otp`

**Request Body:** `application/json`

```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "OTP verified successfully",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

**Error Response (400, 404):**
Jika OTP salah, kedaluwarsa, atau email tidak ditemukan.

---

### 1.3 Login Pengguna (Reguler)

Masuk ke aplikasi menggunakan email dan password untuk mendapatkan token.

**Endpoint:** `POST /auth/login`

**Request Body:** `application/json`

```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

**Error Response (401, 403, 404):**
Jika email/password salah atau akun belum aktif.

---

### 1.4 Login/Registrasi dengan Google

Menyelesaikan proses autentikasi setelah pengguna login dengan Google di sisi klien dan mendapatkan token dari Supabase.

**Endpoint:** `POST /auth/google`

**Request Body:** `application/json`

```json
{
  "supabaseAccessToken": "token_didapat_dari_sdk_supabase_di_klien"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Google authentication successful",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

**Error Response (401):**
Jika supabaseAccessToken tidak valid.

---

## 2. Manajemen Sesi

### 2.1 Memperbarui Access Token

Gunakan refreshToken untuk mendapatkan accessToken baru tanpa harus login ulang.

**Endpoint:** `POST /auth/refresh-token`

**Request Body:** `application/json`

```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOi..."
  }
}
```

**Error Response (400):**
Jika refreshToken tidak valid atau sudah di-logout.

---

### 2.2 Logout Pengguna

Membatalkan refreshToken saat ini agar tidak bisa digunakan lagi.

**Endpoint:** `POST /auth/logout`

**Request Body:** `application/json`

```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "User logged out successfully"
}
```

---

## 3. Pemulihan Akun

### 3.1 Meminta Reset Password

Memulai alur lupa password dengan mengirimkan OTP ke email terdaftar.

**Endpoint:** `POST /auth/forgot-password`

**Request Body:** `application/json`

```json
{
  "email": "john.doe@example.com"
}
```

**Success Response (200):**

Server akan selalu mengembalikan respons sukses untuk mencegah user enumeration.

```json
{
  "status": "success",
  "message": "Password reset email sent"
}
```

---

### 3.2 Verifikasi OTP Reset Password

Memverifikasi OTP yang diterima untuk mendapatkan token reset sementara.

**Endpoint:** `POST /auth/verify-reset-otp`

**Request Body:** `application/json`

```json
{
  "email": "john.doe@example.com",
  "otp": "654321"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Reset token created successfully",
  "data": {
    "resetToken": "eyJhbGciOi..."
  }
}
```

---

### 3.3 Mengatur Password Baru

Menggunakan resetToken untuk mengatur password baru.

**Endpoint:** `POST /auth/reset-password`

**Request Body:** `application/json`

```json
{
  "resetToken": "eyJhbGciOi...",
  "newPassword": "newpassword456"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Password reset successfully"
}
```

---

## 4. Manajemen Akun

### 4.1 Menghapus Akun

Menghapus akun pengguna yang sedang login. Memerlukan otentikasi.

**Endpoint:** `DELETE /users/me`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "User account deleted successfully"
}
```

**Error Response (401):**
Jika accessToken tidak valid atau tidak disertakan.

---

## Catatan Penting

- Semua request body menggunakan format `application/json`
- Access token memiliki masa berlaku terbatas, gunakan refresh token untuk memperbarui
- Untuk endpoint yang memerlukan autentikasi, sertakan header `Authorization: Bearer <accessToken>`
- OTP memiliki masa berlaku terbatas, pastikan untuk memverifikasi sesegera mungkin setelah menerima (berlaku 1 menit)