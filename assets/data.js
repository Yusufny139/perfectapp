/* =========================================================
   İKİGAİ × MATEMATİK — içerik katmanı
   Tüm metinler Türkçe; hiçbir dış bağımlılık yok.
   ========================================================= */

export const AXES = {
  sev: {
    key: 'sev',
    name: 'Sevdiğin şey',
    short: 'SEV',
    color: '#E8A33D',
    blurb: 'Zamanı unuttuğun, seni kendiliğinden çeken uğraş.',
  },
  yet: {
    key: 'yet',
    name: 'İyi olduğun şey',
    short: 'YET',
    color: '#3FB8A6',
    blurb: 'Zorlanmadan, hatta farkında olmadan yaptığın şey.',
  },
  dunya: {
    key: 'dunya',
    name: 'Dünyanın ihtiyacı',
    short: 'DÜNYA',
    color: '#8B7BF7',
    blurb: 'Sen yapmazsan eksik kalacak olan katkı.',
  },
  ekonomi: {
    key: 'ekonomi',
    name: 'Sana gelir sağlayan',
    short: 'EKONOMİ',
    color: '#E0645E',
    blurb: 'Emeğinin karşılığını alabildiğin, sürdürülebilir zemin.',
  },
};

export const AXIS_ORDER = ['sev', 'yet', 'dunya', 'ekonomi'];

export const LIKERT = [
  { value: 1, label: 'Hiç değil', hint: '1' },
  { value: 2, label: 'Nadiren', hint: '2' },
  { value: 3, label: 'Bazen', hint: '3' },
  { value: 4, label: 'Sık sık', hint: '4' },
  { value: 5, label: 'Tam beni anlatıyor', hint: '5' },
];

export const QUESTIONS = [
  { id: 'q1', axis: 'sev', text: 'Bir problemi çözerken saatlerin nasıl geçtiğini fark etmiyorum.' },
  { id: 'q2', axis: 'sev', text: 'Sayılar, şekiller veya örüntüler arasında saklı bir düzen bulmak beni heyecanlandırıyor.' },
  { id: 'q3', axis: 'sev', text: 'Boş zamanımda bir mantık sorusu ya da bulmacayla uğraşmak bana keyif veriyor.' },
  { id: 'q4', axis: 'sev', text: 'Bir şeyin “neden böyle çalıştığını” sonsuza kadar kurcalamaktan keyif alıyorum.' },

  { id: 'q5', axis: 'yet', text: 'Soyut bir fikri somut bir örneğe, şekle veya koda dönüştürmekte iyiyim.' },
  { id: 'q6', axis: 'yet', text: 'Karmaşık bir problemi küçük ve çözülebilir parçalara ayırabiliyorum.' },
  { id: 'q7', axis: 'yet', text: 'Bir hatayı gördüğümde nerede yanlış gittiğini adım adım izleyebiliyorum.' },
  { id: 'q8', axis: 'yet', text: 'Öğrendiğim bir yöntemi bambaşka bir alana taşıyıp kullanabiliyorum.' },

  { id: 'q9', axis: 'dunya', text: 'İnsanların “ben matematik yapamıyorum” korkusunu kırmak istiyorum.' },
  { id: 'q10', axis: 'dunya', text: 'Kararların veriye ve sağlam mantığa dayanması gerektiğine inanıyorum.' },
  { id: 'q11', axis: 'dunya', text: 'İklim, sağlık, adalet veya güvenlik gibi gerçek problemleri matematikle çözmek istiyorum.' },
  { id: 'q12', axis: 'dunya', text: 'Bir konuyu anlatırken karşımdakinin gözündeki “aaa!” anını görmek beni besliyor.' },

  { id: 'q13', axis: 'ekonomi', text: 'Matematik bilgimi doğrudan gelir getiren bir işe dönüştürmek istiyorum.' },
  { id: 'q14', axis: 'ekonomi', text: 'Ölçülebilir, kanıtlanabilir ve öngörülebilir çıktı üreten işler bana güven veriyor.' },
  { id: 'q15', axis: 'ekonomi', text: 'Uzmanlığımı danışmanlık, içerik veya ürün olarak satabileceğim bir konum istiyorum.' },
  { id: 'q16', axis: 'ekonomi', text: 'Yüksek talep gören beceriler öğrenmek benim için önemli.' },
];

/* ---------------------------------------------------------
   ALANLAR — her alan dört eksende 0..1 ağırlık taşır
   --------------------------------------------------------- */
export const FIELDS = [
  {
    id: 'sayilar',
    name: 'Sayılar Teorisi & Kriptografi',
    short: 'Sayılar & Kripto',
    tagline: 'Görünmeyen kuralların bekçisi: asallar, şifreler, gizli düzen.',
    icon: '∏',
    axes: { sev: 0.92, yet: 0.78, dunya: 0.62, ekonomi: 0.88 },
    careers: ['Kriptografi mühendisi', 'Güvenlik araştırmacısı', 'Blokzincir sistem tasarımcısı', 'Araştırma matematikçisi'],
    first: 'Bugün ilk 40 asal sayıyı yaz, komşu asallar arasındaki farkları işaretle. Farkların neden hep çift olduğunu (2 hariç) tek cümleyle açıkla.',
    foundation: [
      'Modüler aritmetik: a ≡ b (mod n) ve kalan sınıfları',
      'Bölünebilme kuralları, EBOB/EKOK, asallık',
      'Tümevarım ve iyi sıralama ilkesi',
      'İspat teknikleri: doğrudan, çelişki, karşı örnek',
    ],
    core: [
      'Fermat–Euler teoremi ve modüler üs alma',
      'RSA’nın sıfırdan inşası (anahtar üretimi → şifreleme → kırılma)',
      'Lineer Diophant denklemleri ve kongrüans sistemleri',
      'Asal dağılımına ilk bakış: π(x), asal boşlukları, ikiz asallar',
    ],
    applied: [
      'Python ile mini RSA prototipi ve hız testi',
      'Klasik şifre kırma alıştırmaları (CTF tarzı)',
      'Büyük sayılarda modüler üs alma optimizasyonu',
    ],
    projects: [
      'Sıfırdan mini RSA kütüphanesi + 2 sayfalık teknik rapor',
      'Project Euler sayılar teorisi serisi (ilk 20 problem)',
      'Asal boşluklarını görselleştiren interaktif bir sayfa',
    ],
    resources: ['AoPS — Number Theory', 'Project Euler', 'Khan Academy — Cryptography', 'Niven — An Introduction to the Theory of Numbers'],
  },
  {
    id: 'olasilik',
    name: 'Olasılık & İstatistik',
    short: 'Olasılık & İstatistik',
    tagline: 'Belirsizliğin dili: riski ölç, geleceğe bahis oyna.',
    icon: 'σ',
    axes: { sev: 0.62, yet: 0.7, dunya: 0.9, ekonomi: 0.92 },
    careers: ['Aktüer', 'Veri analisti', 'Risk modelleme uzmanı', 'Klinik araştırma istatistikçisi'],
    first: 'Bir madeni parayı 100 kez atıp yazı oranını kaydet. Sonra 1000 kez simüle et. İki sayı arasındaki farkı “büyük sayılar yasası” ile tek paragrafta açıkla.',
    foundation: [
      'Kombinasyon, permütasyon ve sayma ilkeleri',
      'Koşullu olasılık ve Bayes teoremi',
      'Rassal değişken, beklenen değer, varyans',
      'Dağılımlar: binom, Poisson, normal',
    ],
    core: [
      'Büyük sayılar yasası ve merkezi limit teoremi (simülasyonla)',
      'Güven aralığı ve hipotez testi mantığı (p-değeri ne değildir?)',
      'Regresyon: en küçük kareler, katsayı yorumu',
      'Aktüerya sezgisi: yaşam tabloları, prim, rezerv',
    ],
    applied: [
      'Bir veri setiyle uçtan uca analiz (temizle → modelle → yorumla)',
      'A/B testi tasarımı ve güç hesabı',
      'Monte Carlo ile π ve risk simülasyonu',
    ],
    projects: [
      'Bir şehir için yağış/olasılık simülatörü',
      '“Bu haber istatistiksel olarak doğru mu?” analiz yazısı',
      'Kişisel harcama verisinden tahmin modeli',
    ],
    resources: ['Blitzstein & Hwang — Introduction to Probability', 'Khan Academy — Statistics', 'StatQuest (video)', 'R / Python (pandas) alıştırmaları'],
  },
  {
    id: 'optimizasyon',
    name: 'Optimizasyon & Yöneylem',
    short: 'Optimizasyon',
    tagline: 'Kıt kaynakla en iyi kararı verme sanatı.',
    icon: 'min',
    axes: { sev: 0.68, yet: 0.86, dunya: 0.86, ekonomi: 0.9 },
    careers: ['Yöneylem araştırmacısı', 'Lojistik/şebeke tasarımcısı', 'Veri bilimci', 'Danışman'],
    first: 'Evin için “en kısa market turu” problemini kağıda yaz: noktaları ve mesafeleri koy, kısıtı (zaman) ve amacı (mesafe) açıkça etiketle. Çözümü değil, modeli kur.',
    foundation: [
      'Fonksiyon, türev ve ekstremum sezgisi',
      'Lineer denklem sistemleri ve matrisler',
      'Eşitsizlikler, kısıt kümeleri, grafik çözüm',
      'Algoritmik düşünme: karmaşıklık, sınırlar',
    ],
    core: [
      'Lineer programlama ve simpleks fikri',
      'Dualite ve gölge fiyat (bir kısıtın değeri)',
      'Ağ problemleri: en kısa yol, akış, atama',
      'Tamsayı programlama ve NP-zorluğa giriş',
    ],
    applied: [
      'Python (PuLP/OR-Tools) ile vardiya planlama modeli',
      'Gezgin satıcı için sezgisel çözüm + karşılaştırma',
      'Duyarlılık analiziyle “neyi iyileştirmeliyim?” raporu',
    ],
    projects: [
      'Kampüs/kargo için rota optimizasyonu',
      'Bütçe dağıtım modeli (reklam veya enerji)',
      'Bir oyun için kaynak yönetimi motoru',
    ],
    resources: ['MIT OCW — Optimization Methods', 'Hillier & Lieberman — Introduction to Operations Research', 'Google OR-Tools dokümanları', 'Brilliant — Optimization'],
  },
  {
    id: 'modelleme',
    name: 'Diferansiyel Denklemler & Modelleme',
    short: 'Modelleme',
    tagline: 'Değişimin matematiği: salgın, iklim, devre, büyüme.',
    icon: '∂',
    axes: { sev: 0.88, yet: 0.74, dunya: 0.92, ekonomi: 0.66 },
    careers: ['Uygulamalı matematikçi', 'İklim/biyomedikal modelleme', 'Simülasyon mühendisi', 'Araştırmacı'],
    first: 'Bir bardak çayın soğumasını 10 dakikada bir ölç. Sıcaklık farkının azalma hızının farkla orantılı olduğunu gösteren tek satırlık denklemi yaz (Newton soğuma yasası).',
    foundation: [
      'Türev ve integralin anlamı (hız, birikim)',
      'Birinci mertebe denklemler ve ayrılabilir çözümler',
      'Üstel büyüme/bozunma, lojistik eğri',
      'Sayısal çözüm: Euler yöntemi',
    ],
    core: [
      'Lineer sistemler ve faz portreleri',
      'Salgın modelleri: SIR ve parametrelerin anlamı',
      'Salınım: harmonik osilatör, sönümleme',
      'Kararlılık analizi: ne zaman dengeye döner?',
    ],
    applied: [
      'Python ile SIR simülasyonu ve senaryo karşılaştırması',
      'Gerçek veriye eğri uydurma (fit) ve artık analizi',
      'Kaos ve başlangıç koşullarına hassasiyet deneyi',
    ],
    projects: [
      'Şehrin sıcaklık/enerji tüketimi için basit model',
      'Bir salgın veya sosyal yayılım simülatörü',
      'Modelini anlatan 5 dakikalık teknik sunum',
    ],
    resources: ['3Blue1Brown — Differential Equations', 'MIT OCW — 18.03', 'Strogatz — Nonlinear Dynamics and Chaos', 'Paul’s Online Math Notes'],
  },
  {
    id: 'ayrik',
    name: 'Ayrık Matematik & Algoritmalar',
    short: 'Ayrık Matematik',
    tagline: 'Bilgisayarın altındaki matematik: sayma, çizge, ispat.',
    icon: '⌘',
    axes: { sev: 0.82, yet: 0.9, dunya: 0.7, ekonomi: 0.94 },
    careers: ['Yazılım mühendisi', 'Algoritma geliştirici', 'Veri yapıları mimarı', 'Rekabetçi programcı'],
    first: 'Kendi çevrenden 6 kişiyi düğüm, arkadaşlıkları kenar yaparak bir çizge çiz. “Herkesin derecesi kaç?” ve “Euler yolu var mı?” sorularını yanıtla.',
    foundation: [
      'Mantık, kümeler, bağıntılar, fonksiyonlar',
      'Sayma: toplama/çarpma ilkesi, güvercin yuvası',
      'Tümevarım ve rekürans bağıntıları',
      'Asimptotik gösterim: O, Ω, Θ',
    ],
    core: [
      'Çizge kuramı: ağaç, derece, bağlantılılık, Euler/Hamilton',
      'Sıralama ve arama algoritmalarının analizi',
      'Dinamik programlama ve alt problem fikri',
      'Üretici fonksiyonlara giriş',
    ],
    applied: [
      'Sıfırdan hash tablosu / grafik algoritması yazmak',
      'LeetCode–Codeforces düzenli seri (haftada 5 problem)',
      'Algoritma karmaşıklığını ölçen benchmark',
    ],
    projects: [
      'Kendi yol bulma görselleştiricin (BFS/DFS/A*)',
      'Bir oyun için yapay zekâ (minimax)',
      'Açık kaynak bir algoritma kütüphanesine katkı',
    ],
    resources: ['Rosen — Discrete Mathematics and Its Applications', 'CLRS — Introduction to Algorithms', 'CP Algorithms (cp-algorithms.com)', 'Khan Academy — Algorithms'],
  },
  {
    id: 'geometri',
    name: 'Geometri & Topoloji',
    short: 'Geometri & Topoloji',
    tagline: 'Şeklin mantığı: görsel sezgi, ispat ve uzayın bükülmesi.',
    icon: '△',
    axes: { sev: 0.95, yet: 0.72, dunya: 0.58, ekonomi: 0.6 },
    careers: ['Geometri araştırmacısı', 'Mimari/hesaplamalı tasarım', 'Bilgisayarlı görü uzmanı', 'Matematik öğretmeni'],
    first: 'Bir kağıda rastgele üç nokta koy, üçgenin dokuz nokta çemberini (kenar orta noktaları, yükseklik ayakları) çizmeye çalış. Neden aynı çemberden geçtiklerini araştır.',
    foundation: [
      'Açı, benzerlik, alan ve trigonometri',
      'Çember geometrisi ve teoremler',
      'Koordinat geometrisi ve vektörler',
      'İspat yazımı: verilen → istenen → gerekçe zinciri',
    ],
    core: [
      'Dönüşümler: öteleme, dönme, homoteti, inversiyon',
      'Klasik teoremler: Menelaus, Ceva, Ptolemy, Euler doğrusu',
      'Topolojiye giriş: süreklilik, homeomorfizma, Euler karakteristiği',
      'Eğriler ve yüzeyler: Gauss eğriliği sezgisi',
    ],
    applied: [
      'GeoGebra/Desmos ile teorem keşfi',
      'Python (matplotlib/shapely) ile geometrik dönüşüm demoları',
      'Hesaplamalı geometri: konveks örtü, kesişim',
    ],
    projects: [
      'Bir geometri teoreminin interaktif ispatı (sürüklenebilir)',
      'Origami matematiği üzerine mini sergi/yazı',
      'Görüntü işlemede geometri: perspektif düzeltme',
    ],
    resources: ['Evan Chen — Euclidean Geometry in Mathematical Olympiads', 'GeoGebra', '3Blue1Brown — Topology / “But why?”', 'Cut the Knot (cut-the-knot.org)'],
  },
  {
    id: 'hesaplamali',
    name: 'Hesaplamalı Matematik & Veri',
    short: 'Hesaplamalı & Veri',
    tagline: 'Matematiği koda döken köprü: lineer cebir + makine.',
    icon: '∑',
    axes: { sev: 0.8, yet: 0.88, dunya: 0.82, ekonomi: 0.96 },
    careers: ['Makine öğrenmesi mühendisi', 'Nicel analist', 'Simülasyon uzmanı', 'Araştırma bilimcisi'],
    first: 'Bir matrisin bir vektörü nasıl döndürüp gerdiğini gözle gör: 2×2 bir matris seç, 20 vektörü dönüştür ve önce/sonra hallerini çiz. Özvektörü bul.',
    foundation: [
      'Lineer cebir: vektör uzayı, baz, matris çarpımı',
      'Özdeğer/özvektör ve köşegenleştirme',
      'Türev–gradyan ve gradyan inişi',
      'Olasılık temelleri ve sayısal kararlılık',
    ],
    core: [
      'En küçük kareler, SVD ve boyut indirgeme',
      'Optimizasyon: gradyan inişi, momentum, öğrenme oranı',
      'Sayısal yöntemler: Newton, interpolasyon, integrasyon',
      'Model değerlendirme: aşırı öğrenme, çapraz doğrulama',
    ],
    applied: [
      'NumPy ile sıfırdan gradyan inişi',
      'Bir regresyon modelini uçtan uca kurmak',
      'SVD ile görüntü sıkıştırma deneyi',
    ],
    projects: [
      'Kendi mini derin öğrenme kütüphanen (tek katman → ağ)',
      'Açık veriyle tahmin yarışması (Kaggle)',
      'Matematiksel bir makalenin kodla yeniden üretimi',
    ],
    resources: ['Deisenroth — Mathematics for Machine Learning', '3Blue1Brown — Essence of Linear Algebra', 'Axler — Linear Algebra Done Right', 'Numerical Recipes / SciPy dokümanları'],
  },
  {
    id: 'egitim',
    name: 'Matematik Eğitimi & İletişim',
    short: 'Eğitim & İletişim',
    tagline: 'Matematiği sevdiren köprü: anlatma, tasarlama, dönüştürme.',
    icon: 'π',
    axes: { sev: 0.9, yet: 0.66, dunya: 0.98, ekonomi: 0.72 },
    careers: ['Matematik öğretmeni', 'Eğitim içeriği tasarımcısı', 'Bilim iletişimcisi', 'Özel ders / kurs girişimcisi'],
    first: 'En sevdiğin matematik fikrini, hiç matematik bilmeyen birine 5 cümlede anlat. Yazdıktan sonra “hangi cümle teknikti?” diye işaretle ve onu değiştir.',
    foundation: [
      'Kavramsal anlama: neden, nasıl’dan önce gelir',
      'Temsil dönüşümleri: sözel ↔ görsel ↔ cebirsel ↔ sayısal',
      'Yaygın kavram yanılgıları ve teşhis yöntemleri',
      'Soru tasarımı ve iskeleleme (scaffolding)',
    ],
    core: [
      'Açık uçlu problem tasarımı ve rubrik',
      'Görselleştirme araçları: Desmos, GeoGebra, animasyon',
      'Anlatı yapısı: merak → çatışma → çözüm',
      'Ölçme: neyi, nasıl kanıtlayacaksın?',
    ],
    applied: [
      'Bir konuyu 3 dakikalık videoya sığdırmak',
      '10 soruluk teşhis testi + yanılgı haritası',
      'Bir ders planını ters-yüz (flipped) tasarlamak',
    ],
    projects: [
      'Kendi mini ders serisi (5 bölüm, yayınlanmış)',
      '“Matematik korkusu” üzerine atölye tasarımı',
      'Etkileşimli bir öğrenme aracı (bu uygulama gibi)',
    ],
    resources: ['Pólya — How to Solve It', 'Khan Academy (öğretmen kaynakları)', '3Blue1Brown (anlatım stili)', 'NCTM — Principles to Actions'],
  },
];

/* ---------------------------------------------------------
   KAYNAK KÜTÜPHANESİ
   --------------------------------------------------------- */
export const LIBRARY = [
  { name: '3Blue1Brown', type: 'Video', why: 'Sezgiyi görselleştirir: lineer cebir, kalkülüs, differansiyel denklemler.', url: 'https://www.3blue1brown.com/', free: true },
  { name: 'Khan Academy', type: 'Kurs', why: 'Sıfırdan sağlam temel; alıştırma + ilerleme takibi.', url: 'https://tr.khanacademy.org/', free: true },
  { name: 'Art of Problem Solving (AoPS)', type: 'Topluluk', why: 'Olimpiyat düzeyi problem çözme kültürü ve forum.', url: 'https://artofproblemsolving.com/', free: false },
  { name: 'Project Euler', type: 'Problem seti', why: 'Matematiği kodla birleştiren 900+ problem; sabır ve zarafet.', url: 'https://projecteuler.net/', free: true },
  { name: 'MIT OpenCourseWare', type: 'Ders', why: 'Üniversite düzeyinde tam ders arşivi, ücretsiz.', url: 'https://ocw.mit.edu/', free: true },
  { name: 'GeoGebra / Desmos', type: 'Araç', why: 'Sürükleyerek keşfetme; teoremleri görsel olarak test etme.', url: 'https://www.geogebra.org/', free: true },
  { name: 'OEIS', type: 'Veritabanı', why: 'Bir dizinin daha önce görülüp görülmediğini söyler: keşif hızlandırıcı.', url: 'https://oeis.org/', free: true },
  { name: 'Pólya — How to Solve It', type: 'Kitap', why: 'Problem çözmenin dört adımı: anla, planla, uygula, geriye bak.', url: '', free: false },
  { name: 'Brilliant', type: 'Kurs', why: 'Kısa, etkileşimli matematik dersleri; günlük alışkanlık için uygun.', url: 'https://brilliant.org/', free: false },
  { name: 'Paul’s Online Math Notes', type: 'Not', why: 'Kalkülüs ve diferansiyel denklemler için hızlı, net özetler.', url: 'https://tutorial.math.lamar.edu/', free: true },
  { name: 'CP Algorithms', type: 'Referans', why: 'Yarışma programcılığı algoritmalarının ispatlı anlatımı.', url: 'https://cp-algorithms.com/', free: true },
  { name: 'Mathematics for Machine Learning', type: 'Kitap', why: 'Lineer cebir + olasılık + optimizasyonu ML bağlamında kurar (ücretsiz PDF).', url: 'https://mml-book.github.io/', free: true },
];
