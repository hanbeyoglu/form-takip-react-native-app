# Diet App Frontend (MVP)

## Kurulum

1. `npm install`
2. Metro: `npm run start`
3. iOS: `npm run ios`
4. Android: `npm run android`

## API Baglantisi

- API adresi: `src/services/api/client.ts` icindeki `BASE_URL`
- Emulatorde ortama gore guncelle:
  - iOS simulator: `http://localhost:3000/api`
  - Android emulator: `http://10.0.2.2:3000/api`

## Notification Notlari

- Local notification motoru Notifee ile calisir.
- Ilk calismada native notifee kurulumu platform adimlari tamamlanmalidir.
- MVP davranisi:
  - Meal ve water reminder scheduling cihazda local olarak yapilir.
  - Tercihler backend'den gelir, scheduling frontend tarafinda uygulanir.
  - Permission denied durumunda fallback metni ve manuel izin tetigi vardir.

## MVP Tarih Davranisi

- Diet plan hafta alanlari `YYYY-MM-DD` formatinda gonderilir.
- Water/weight ekranlari ve stats bu formatla senkron calisir.
- Dashboard, water/weight eklemelerinden sonra tekrar tazelenir.
