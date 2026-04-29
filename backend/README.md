# Diet App Backend (MVP)

## Kurulum

1. `npm install`
2. `.env.example` dosyasini `.env` olarak kopyala
3. Ortam degiskenlerini doldur:
   - `NODE_ENV`
   - `PORT`
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
4. Gelistirme modu: `npm run start:dev`

## API Prefix

- Tum endpointler `api` prefix'i ile yayinlanir.
- Ornek: `GET /api/profile`

## Validation ve Response Standardi

- Global validation pipe aktif:
  - whitelist
  - forbidNonWhitelisted
  - transform
- Basarili response:
  - `success: true`
  - `data`
  - `meta.timestamp`
- Hata response:
  - `success: false`
  - `error.code`
  - `error.message`
  - `error.details`

## Tarih/Timezone Davranisi (MVP)

- Water/Weight/Stats aggregations UTC gun sinirlariyla hesaplanir.
- Gun bazli query paramleri (`date`, `from`, `to`) `YYYY-MM-DD` formatinda gonderilmelidir.
- Bu davranis frontend tarafiyla ayni formatta kullanilmali; release sonrasi istenirse user timezone bazli aggregation genisletilebilir.
