# DietApp

> Diet, su ve kilo takibini tek mobil deneyimde toplayan React Native + NestJS uygulamasi.

![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB?style=for-the-badge&logo=react&logoColor=111)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

DietApp, kullanicinin diyet planini, gunluk su tuketimini, kilo degisimini ve genel ilerlemesini takip edebilmesi icin gelistirilmis tam yigin bir mobil uygulamadir. Proje; native mobil arayuz, JWT tabanli API, MongoDB veri modeli, Firebase telefon dogrulama ve lokal bildirim akisini birlikte kullanir.

## One Cikanlar

- Telefon numarasi ile kayit, OTP dogrulama, giris ve sifre yenileme akislari
- Profil kurulumu ve profil duzenleme ekranlari
- Aktif diyet plani olusturma, duzenleme, detay goruntuleme ve plan gecmisi
- Gunluk su takibi ve ilerleme gosterimi
- Kilo takibi, hedef odakli ilerleme ve temel istatistikler
- Dashboard uzerinden gunluk durum ozeti
- Yemek ve su hatirlaticilari icin bildirim tercihleri
- Coklu dil destegi: Turkce, Ingilizce, Almanca ve Arapca
- Standart API response yapisi, global validation ve merkezi hata formati

## Ekran Akislari

| Auth | Uygulama |
| --- | --- |
| Onboarding | Dashboard |
| Login / Register | Profil kurulumu ve duzenleme |
| OTP dogrulama | Aktif diyet plani |
| Sifre sifirlama | Su ve kilo takibi |
| | Bildirim ve dil ayarlari |

## Teknoloji Stack

### Frontend

- React Native 0.74
- TypeScript
- React Navigation
- Zustand
- React Hook Form + Zod
- i18next / react-i18next
- Notifee local notifications
- Firebase Auth

### Backend

- NestJS 10
- TypeScript
- MongoDB + Mongoose
- Passport JWT
- class-validator / class-transformer
- bcrypt
- Global exception filter, interceptor ve validation pipe

## Proje Yapisi

```text
.
├── backend/   # NestJS API, MongoDB modelleri, auth ve domain modulleri
└── frontend/  # React Native mobil uygulama
```

Backend modulleri:

- `auth`
- `users`
- `diet-plans`
- `water-logs`
- `weight-logs`
- `stats`
- `notification-prefs`

Frontend ana alanlari:

- `features/auth`
- `features/home`
- `features/diet-plan`
- `features/water`
- `features/weight`
- `features/profile`
- `features/notifications`
- `localization`
- `services`
- `store`

## Kurulum

### Gereksinimler

- Node.js 18+
- npm
- MongoDB
- React Native gelistirme ortami
- iOS icin Xcode ve CocoaPods
- Android icin Android Studio / SDK

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

`.env` icin temel alanlar:

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/diet-app
JWT_SECRET=replace_with_secure_secret
JWT_EXPIRES_IN=7d
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_WEB_API_KEY=your_firebase_web_api_key
```

API varsayilan olarak su adreste calisir:

```text
http://localhost:3000/api
```

### Frontend

```bash
cd frontend
npm install
npm run start
```

Yeni bir terminalde platformu baslatin:

```bash
npm run ios
# veya
npm run android
```

API adresi [frontend/src/services/api/client.ts](frontend/src/services/api/client.ts) icinde platforma gore belirlenir:

- iOS simulator: `http://localhost:3000/api`
- Android emulator: `http://10.0.2.2:3000/api`

## Komutlar

| Alan | Komut | Aciklama |
| --- | --- | --- |
| Backend | `npm run start:dev` | API'yi watch modunda calistirir |
| Backend | `npm run build` | NestJS build alir |
| Backend | `npm run lint` | Backend TypeScript dosyalarini lint eder |
| Frontend | `npm run start` | Metro bundler baslatir |
| Frontend | `npm run ios` | iOS simulator uzerinde calistirir |
| Frontend | `npm run android` | Android emulator uzerinde calistirir |
| Frontend | `npm run lint` | Frontend TypeScript dosyalarini lint eder |

## API Notlari

- Tum endpointler `/api` prefix'i altinda yayinlanir.
- Basarili cevaplar `success`, `data` ve `meta.timestamp` alanlariyla doner.
- Hata cevaplari `success`, `error.code`, `error.message` ve `error.details` alanlarini icerir.
- Gun bazli tarih parametreleri `YYYY-MM-DD` formatinda kullanilir.

## Dil ve Bildirimler

Uygulamada `tr`, `en`, `de` ve `ar` lokalizasyon dosyalari bulunur. Bildirim tercihleri backend tarafinda saklanir; lokal notification zamanlama islemleri mobil istemcide Notifee ile uygulanir.

## Gelistirme Notlari

- Backend global validation pipe ile bilinmeyen alanlari reddeder.
- JWT korumali endpointlerde token `Authorization: Bearer <token>` olarak gonderilir.
- Water, weight ve stats akislari ayni tarih formatiyla senkron calisir.
- Native bildirimler icin iOS/Android tarafinda ilgili izinlerin ve Firebase kurulumunun tamamlanmis olmasi gerekir.

## Lisans

Bu repo icin henuz lisans dosyasi eklenmemis.
