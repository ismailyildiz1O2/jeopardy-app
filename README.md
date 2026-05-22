# 🎯 Jeopardy – Gerçek Zamanlı Bilgi Yarışması

Öğretmenlerin Canva benzeri bir arayüzle soru hazırlayıp, sınıfta takımlar halinde oynatabildiği **gerçek zamanlı ortak çalışma** destekli Jeopardy web uygulaması.

## ✨ Özellikler

- **Edit Modu**: 7×7 grid üzerinde sorular hazırlayın, birden fazla kişi aynı anda düzenlesin
- **Play Modu**: Takımlar halinde yarışma, buzzer sistemi, zamanlayıcı
- **Gerçek Zamanlı**: Socket.io ile anlık güncelleme (çakışma önleme dahil)
- **%100 Mobil Uyumlu**: Yatay kaydırmalı grid, dokunmatik uyumlu
- **Medya Desteği**: Sorulara resim ekleyebilme
- **Premium Tasarım**: Jeopardy TV show temalı koyu arayüz, glassmorphism efektler

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| **Veritabanı** | Neon (PostgreSQL) + Drizzle ORM |
| **Arka Uç** | Node.js, Express, Socket.io |
| **Ön Yüz** | React 18, Vite, Tailwind CSS, Framer Motion |
| **Dağıtım** | Render (backend) + Vercel (frontend) |

## 📁 Proje Yapısı

```
jeopardy-app/
├── packages/
│   ├── backend/          # Node.js + Express + Socket.io
│   │   ├── src/
│   │   │   ├── db/       # Drizzle ORM şema & bağlantı
│   │   │   ├── routes/   # REST API endpoint'leri
│   │   │   ├── socket/   # Gerçek zamanlı event handler'lar
│   │   │   └── middleware/
│   │   └── drizzle.config.ts
│   └── frontend/         # React + Vite + Tailwind
│       ├── src/
│       │   ├── components/  # Board, Edit, Play, Layout
│       │   ├── context/     # Socket & Game context
│       │   ├── hooks/       # Custom React hooks
│       │   ├── pages/       # Home, GameEditor, GamePlay
│       │   └── lib/         # API client & Socket setup
│       └── vercel.json
├── package.json          # Root workspace
└── README.md
```

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+
- Neon PostgreSQL hesabı ([neon.tech](https://neon.tech))

### 1. Depo Klonlama

```bash
git clone https://github.com/YOUR_USERNAME/jeopardy-app.git
cd jeopardy-app
```

### 2. Ortam Değişkenleri

```bash
# Backend
cp packages/backend/.env.example packages/backend/.env
# .env dosyasını düzenleyin ve Neon connection string'ini ekleyin:
# DATABASE_URL=postgresql://user:password@host.neon.tech/jeopardy?sslmode=require
# PORT=3001
# FRONTEND_URL=http://localhost:5173

# Frontend
echo "VITE_API_URL=http://localhost:3001" > packages/frontend/.env
echo "VITE_SOCKET_URL=http://localhost:3001" >> packages/frontend/.env
```

### 3. Bağımlılıkları Yükleme

```bash
# Backend
cd packages/backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Veritabanı Kurulumu

```bash
cd packages/backend
npm run db:push    # Şemayı Neon'a push eder
```

### 5. Geliştirme Sunucularını Başlatma

```bash
# Backend (port 3001)
cd packages/backend && npm run dev

# Frontend (port 5173) - ayrı terminalde
cd packages/frontend && npm run dev
```

Tarayıcıda `http://localhost:5173` adresini açın.

## 🌐 Deployment (Dağıtım)

### GitHub'a Push

```bash
git init
git add .
git commit -m "Initial commit: Jeopardy app"
git remote add origin https://github.com/YOUR_USERNAME/jeopardy-app.git
git push -u origin main
```

### Render (Backend)

1. [render.com](https://render.com) → **New Web Service** → GitHub repo bağla
2. **Root Directory**: `packages/backend`
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   - `DATABASE_URL` → Neon connection string
   - `FRONTEND_URL` → Vercel URL (örn: `https://your-app.vercel.app`)

### Vercel (Frontend)

1. [vercel.com](https://vercel.com) → **Import Git Repository**
2. **Root Directory**: `packages/frontend`
3. **Framework**: Vite
4. **Environment Variables**:
   - `VITE_API_URL` → Render URL (örn: `https://your-backend.onrender.com`)
   - `VITE_SOCKET_URL` → Render URL (aynı)

## 🎮 Kullanım

1. **Ana Sayfa**: "Yeni Oyun Oluştur" ile yeni oyun başlatın
2. **Edit Modu**: Kategori adlarını ve soru/cevapları düzenleyin
3. **Paylaşım**: Paylaşım kodunu diğer öğretmenlerle paylaşın
4. **Play Modu**: "Oyunu Başlat" ile yarışmaya geçin
5. **Takımlar**: Takım ekleyin ve puan verin

## 📋 API Endpoint'leri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/games` | Yeni oyun oluştur |
| GET | `/api/games/:id` | Oyun detayı |
| GET | `/api/games/code/:code` | Paylaşım koduyla bul |
| PUT | `/api/games/:id` | Oyun güncelle |
| DELETE | `/api/games/:id` | Oyun sil |
| PUT | `/api/categories/:id` | Kategori güncelle |
| PUT | `/api/questions/:id` | Soru güncelle |
| POST | `/api/games/:id/teams` | Takım ekle |
| PUT | `/api/teams/:id/score` | Puan güncelle |

## 📄 Lisans

MIT
