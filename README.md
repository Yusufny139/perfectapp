# ikigai × matematik

**Kişisel matematik pusulası.** “Matematik öğren” demiyor; *senin* matematiğinin hangi alanda olduğunu buluyor, o alanda 90 günlük bir rota çiziyor ve rotayı her gün ölçüyor.

Sıfır bağımlılık, sıfır sunucu, sıfır takip. Tüm veriler tarayıcının `localStorage`’ında kalır.

---

## Neden bu, diğer “matematik öğren” uygulamalarından farklı?

| Alışıldık yaklaşım | Buradaki yaklaşım |
| --- | --- |
| Herkese aynı müfredat | İkigai’nin dört dairesine göre kişisel eşleştirme |
| “Hangi dersten kaldın?” | “Zamanı unuttuğun şey ne?” |
| Konu listesi | 12 haftalık, haftalık **çıktı** üreten rota |
| Rastgele quiz | Zayıf kategoriye ağırlık veren uyarlanmış antrenman |
| Formül anlatımı | Altı interaktif deneyle *görerek* anlama |
| Başarı rozetleri | Üst üste gün (streak) + kategori gücü |

---

## İçindekiler

### 1. Pusula (İkigai ölçümü)
- **16 ifade → 4 eksen:** Sevdiğin şey · İyi olduğun şey · Dünyanın ihtiyacı · Sana gelir sağlayan.
- Her eksen 0–100 arası bir puana gerilir.
- **8 matematik alanı** profiliyle *korelasyon* (merkezlenmiş kosinüs) hesaplanır. En yüksek puan değil, en benzer **şekil** kazanır; küçük bir düzey-uyumu payı eklenir.
- **Güven etiketi:** eksen farkı ve birinci–ikinci alan marjı küçükse sonuç “düşük güven” olarak işaretlenir.
- **İkigai indeksi:** dört puanın geometrik ortalaması. Bir halka zayıfsa indeks gizlemez.
- Sonuç: radar grafiği, eşleşme sıralaması, kişisel manifesto (kopyalanabilir) ve alan dosyası.

Alanlar: Sayılar Teorisi & Kriptografi · Olasılık & İstatistik · Optimizasyon & Yöneylem · Diferansiyel Denklemler & Modelleme · Ayrık Matematik & Algoritmalar · Geometri & Topoloji · Hesaplamalı Matematik & Veri · Matematik Eğitimi & İletişim.

### 2. Laboratuvar (6 interaktif deney)
Canvas üzerinde, kaydırıcıyla oynanan canlı matematik:

1. **Fourier çarkları** — dönen çemberler kare dalgayı nasıl kurar.
2. **Ulam spirali** — asalların spiralde bıraktığı çapraz çizgiler (açık problem!).
3. **Pascal fraktalı** — binom katsayıları mod p’de Sierpinski üretir.
4. **Galton tahtası** — yazı tura atan toplar çan eğrisine dizilir.
5. **Riemann toplamı** — dilim inceldikçe hatanın sıfıra yakınsaması.
6. **Julia kümesi** — tek parametreyle sonsuz çeşitlilik.

Her deneyin altında “bu nerede işe yarar?” notu var: soyut kavramı mesleğe bağlar.

### 3. Antrenman
- 6 kategori × 40 soru (mantık, olasılık, sayılar, cebir, geometri, algoritma).
- Her seans 10 soru; **zayıf kategoriye daha çok ağırlık**.
- Her cevaptan sonra *neden*’i anlatan kısa çözüm.
- Klavye ile hızlı akış: `1–4` cevap, `Enter` sonraki.
- Seri (streak), doğruluk, kategori gücü çubukları ve son 14 gün ısı haritası.

### 4. Yol Haritası
- Seçilen alan + günlük süreye (15/30/60/120 dk) göre **12 hafta, 3 faz**:
  - Faz 1 · Temel (1–4), Faz 2 · Derinleşme (5–8), Faz 3 · Üretim (9–12).
- Her hafta: konu, süreye uyarlanmış görevler ve **elle tutulur bir çıktı** (özet, ispat notu, kod, mini proje).
- “Yazdır / PDF” ile duvara asılacak hâli.

### 5. Kütüphane
12 seçilmiş kaynak (video, kurs, kitap, araç, veritabanı) + seçili alanın özel kaynak listesi. Ücretsiz olanlar işaretli.

---

## Çalıştırma

Sunucu gerekmez; ama modül (`type="module"`) ve service worker için basit bir sunucu önerilir:

```bash
python3 -m http.server 8080
# http://localhost:8080
```

Tek dosya olarak dağıtmak istersen `assets/*.js` dosyalarını bir paketleyiciyle birleştirebilirsin (esbuild/rollup); kod bu durumda da çalışır.

---

## Dosya yapısı

```
index.html               # iskelet: beş görünüm, tek sayfa
assets/
  style.css              # tema, radar, laboratuvar, yazdırma stilleri
  data.js                # eksenler, 16 ifade, 8 alan profili, kaynaklar
  questions.js           # 40 soruluk antrenman bankası + kategoriler
  lab.js                 # altı canvas deneyi (bağımsız)
  app.js                 # durum, yönlendirme, puanlama, antrenman, plan
  icon.svg
manifest.webmanifest     # yüklenebilir uygulama (PWA)
sw.js                    # çevrimdışı önbellek
```

## Teknik notlar

- **Bağımlılık yok.** Ne framework, ne CDN, ne font isteği.
- **Gizlilik:** ağ isteği yok; veri `localStorage` anahtarı `ikigai-math-v1` altında.
- **Erişilebilirlik:** semantik bölümler, `aria-label`’lar, klavye kısayolları, odak halkaları, `prefers-reduced-motion`’a saygı duyacak şekilde sade animasyon.
- **Yazdırma:** yol haritası yazdırma/PDF için ayrı stil taşır.
- **Çevrimdışı:** service worker statik dosyaları önbelleğe alır, HTML’i ağdan tazeler.

## Yöntemin sınırları (dürüstlük notu)

Puanlama bir ölçüm değil, bir *düzenleme* aracıdır. 16 ifade dört ekseni kabaca temsil eder; alan profilleri de yazarın pedagojik yargısıdır. Sonucu kesin bir teşhis değil, **denenebilir bir hipotez** olarak kullan: 6 hafta sonra yeniden doldur, değişime bak. Asıl veri, antrenman istatistiklerin ve bitirdiğin projelerdir.

## Yol haritası (sürüm 2 fikirleri)

- Alan içi “kavram haritası” ve ön koşul grafiği.
- Antrenman sorularının zorluk seviyesine göre otomatik kalibrasyonu (IRT benzeri).
- Öğrenme günlüğü: her seans sonunda tek soruluk yansıma kaydı.
- Arkadaşla “haftalık çıktı” paylaşımı (yalnızca dışa aktarılan metin).

---

**Tek cümle:** Matematik bir yetenek testi değil, bir birikim sanatıdır — küçük ama her gün.
