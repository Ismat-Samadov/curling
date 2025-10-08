# Azərbaycan Bazarı üçün Lokallaşdırma

## Tamamlanmış Dəyişikliklər

Bütün platforma Azərbaycan bazarı üçün tam Azərbaycan dilinə çevrilmişdir.

### 1. Brend Dəyişikliyi
- **Əvvəlki ad**: BoardAds
- **Yeni ad**: ReklamLövhə.az
- Bütün səhifələrdə brend adı yenilənmişdir

### 2. Valyuta Dəyişikliyi
- **Əvvəlki**: USD ($)
- **Yeni**: AZN (₼)
- Bütün qiymətlər manatla (₼) göstərilir

### 3. Tərcümə edilmiş Səhifələr

#### Ana Səhifə (`/`)
- Başlıq: "Reklam Lövhələrinizdən Gəlir əldə edin"
- Naviqasiya: "Lövhələr", "Lövhə Yerləşdir"
- Xüsusiyyətlər:
  - Məkan Əsaslı
  - Vizual Siyahı
  - Sadə Qiymətləndirmə

#### Lövhələr Səhifəsi (`/boards`)
- Başlıq: "Mövcud Reklam Lövhələri"
- Filter: "Bütün Şəhərlər"
- Görünüş rejimi: "Siyahı" / "Xəritə"
- Status: "Yüklənir..." / "Hələ lövhə yoxdur"
- Qiymət formatı: "50 ₼/gün"

#### Lövhə Təfərrüatı (`/boards/[id]`)
Tərcümə edilən hissələr:
- "Lövhələrə Qayıt"
- "Ünvan" (Məkan bölməsi)
- "Ölçülər", "Növ"
- "Qiymətlər": Günlük, Həftəlik, Aylıq
- "Rezerv Et" / "Ləğv et" düyməsi
- Rezervasiya Forması:
  - Ad Soyad
  - E-poçt
  - Telefon
  - Şirkət Adı
  - Başlama Tarixi
  - Bitmə Tarixi
  - Qeydlər
  - "Rezervasiya Sorğusu Göndər"

#### Admin Səhifəsi (`/admin`)
3 addımlı forma:

**Addım 1: Əsas Məlumat**
- Lövhə Başlığı
- Təsvir
- En (metr)
- Hündürlük (metr)
- Lövhə Növü:
  - Bilbord
  - Rəqəmsal Ekran
  - Poster Lövhəsi
  - Divar Lövhəsi
  - Nəqliyyat Reklamı

**Addım 2: Ünvan və Şəkillər**
- Şəhər (məs., Bakı)
- Ölkə (məs., Azərbaycan)
- Ünvan (interaktiv xəritə)
- Şəkil Yüklə
- "Cari Mövqeyi İstifadə Et" düyməsi

**Addım 3: Qiymət və Əlaqə**
- Günlük Qiymət (₼)
- Həftəlik Qiymət (₼)
- Aylıq Qiymət (₼)
- Adınız
- E-poçt
- Telefon

### 4. Komponentlər

#### LocationPicker
- "Cari Mövqeyi İstifadə Et" düyməsi
- "Seçilmiş: [ünvan]"
- "Məkan seçmək üçün xəritədə klikləyin"
- Xəta mesajları Azərbaycan dilində

#### MapView
- Popup məlumatları:
  - Lövhə başlığı
  - Ünvan
  - "50 ₼/gün"

### 5. Bildiriş Mesajları

Bütün alert və xəta mesajları tərcümə edilmişdir:
- "Rezervasiya sorğusu uğurla göndərildi! Sahibkar tezliklə sizinlə əlaqə saxlayacaq."
- "Rezervasiya sorğusu göndərilmədi"
- "Lövhə uğurla yerləşdirildi!"
- "Lövhə yerləşdirilmədi"
- "Şəkillər yüklənir..."
- "Şəkillər yüklənmədi"
- "Yüklənir..."
- "Lövhə tapılmadı"
- "Məkanınız alınmadı. Xahiş edirik xəritədə klikləyərək məkan seçin."
- "Brauzeriniz geolokasiyaya dəstək vermir"

### 6. SEO və Metadata

```typescript
title: "Reklam Lövhələri - Azərbaycanda Reklam Yerləri"
description: "Azərbaycanda fiziki reklam lövhələri kəşf edin və rezerv edin"
```

## İstifadə Nümunələri

### Tipik İstifadə Ssenarisləri

**Lövhə Sahibi üçün:**
1. `/admin` səhifəsinə daxil olun
2. Lövhə məlumatlarını Azərbaycan dilində daxil edin
3. Bakı və ya digər Azərbaycan şəhərlərini seçin
4. Qiymətləri manatla (₼) təyin edin
5. "Lövhəmi Yerləşdir" düyməsinə klikləyin

**Reklamçı üçün:**
1. `/boards` səhifəsində lövhələrə baxın
2. Şəhər üzrə filtr edin
3. Xəritə və ya siyahı görünüşündə baxın
4. Lövhə detallarına keçin
5. "Rezerv Et" düyməsinə klikləyin
6. Formanı Azərbaycan dilində doldurun

## Texniki Detallar

### Dil Seçimi
- Bütün UI elementləri Azərbaycan dilindədir
- Placeholder mətnlər yerli nümunələrlə (məs., "Bakı", "Azərbaycan")
- Form validasiya mesajları Azərbaycan dilində

### Valyuta Formatı
- Symbol: ₼ (Azərbaycan manatı)
- Format: "50 ₼" və ya "50 ₼/gün"
- Bütün qiymətlər qəpik (santim) vahidində saxlanılır

### Xəritə İnteqrasiyası
- OpenStreetMap istifadə olunur
- Reverse geocoding Azərbaycan ünvanları üçün işləyir
- GPS koordinatları dəstəklənir

## Gələcək Təkmilləşdirmələr

Mümkün əlavə lokallaşdırma:
- [ ] Azərbaycan mobil nömrə formatı validasiyası (+994)
- [ ] Yerli ödəniş inteqrasiyaları (Kapital Bank, ABB, etc.)
- [ ] Azərbaycan tatil günləri üçün xüsusi qiymətlər
- [ ] SMS bildirişləri Azərbaycan dilində
- [ ] WhatsApp inteqrasiyası (+994 formatı)
- [ ] Azərbaycan şəhərlərinin dropdown menyu
- [ ] Rayon/məhəllə filtrasiyası

## Test Etmək

Lokallaşdırmanı test etmək üçün:

```bash
npm run dev
```

Sonra bu səhifələri yoxlayın:
- http://localhost:3003 - Ana səhifə
- http://localhost:3003/boards - Lövhələr siyahısı
- http://localhost:3003/admin - Lövhə yerləşdirmə

Bütün səhifələr tam Azərbaycan dilində olmalıdır!

## Deployment

Vercel-də deploy edərkən heç bir əlavə konfiqurasiya tələb olunmur.
Bütün tərcümələr kodda birbaşa mövcuddur.

---

**Hazırlandı**: Azərbaycan bazarı üçün
**Dil**: Azərbaycan dili (Latın əlifbası)
**Valyuta**: AZN (₼)
**Status**: ✅ Hazır
