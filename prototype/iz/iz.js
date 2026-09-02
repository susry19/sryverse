/* ══════════════════════════════════════════════════════════════════════
   İZ · EstateMatch by SRYVERSE

   Korunan mekanikler (önceki yinelemeden):
   · kütleli tek scroll sürücüsü (kamera anında yetişmez)
   · perde başına eğri eşlemesi; zirveye girerken yavaşlayan kamera
   · GPU'da hesaplanan instanced alan; perde uniform'ları
   · halat kısıtlı niyet ipliği (kare hızından bağımsız)
   · çapraz geçen sabit ses katmanı; kesintisiz renk gradı
   · sahneye izdüşen gerçek HTML etiketler

   Değişen: ışık dünyası (sıcak kırık beyaz, taş, adaçayı, orman yeşili),
   on ürün aşaması ve gerçek arayüz anları (A, C, D, E, F, G).
   ══════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

var T = window.THREE;
var kok = document.documentElement;
var mobil = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;

/* ───────────────────── PERDELER ─────────────────────
   h = viewport yüksekliği cinsinden scroll payı. Zirve en geniş.
   Mobilde sabitlenmiş süreler kısalır. */
var KIS = mobil ? 0.82 : 1;
var PERDE = [
  { id: 'acilis', h: 1.3 * KIS }, { id: 'niyet', h: 1.7 * KIS }, { id: 'alan', h: 1.3 * KIS },
  { id: 'baglar', h: 1.5 * KIS }, { id: 'tarti', h: 1.4 * KIS }, { id: 'esik', h: 2.4 * KIS },
  { id: 'neden', h: 1.6 * KIS }, { id: 'kars', h: 1.5 * KIS }, { id: 'karar', h: 1.2 * KIS },
  { id: 'ray', h: 1.5 * KIS }
];

/* Kanıt havuzu: hepsi gerçek EstateMatch bilgi kategorileri. */
var KANIT = [
  ['CEPHE', 'Kuzeydoğu · sabah 07:10'], ['GÜRÜLTÜ', 'Sokak 38 dB · gece 31'],
  ['YÜRÜME', 'Metro 4 dk'],             ['YÜRÜME', 'İlkokul 6 dk'],
  ['KAT', '6. kat · ufuk açık'],        ['BİNA', '2021 · 3 yaşında'],
  ['ISITMA', 'Yerden ısıtma'],          ['ALAN', '128 m² net'],
  ['ODA', '2+1'],                       ['FİYAT', '17,8 mn TL'],
  ['AİDAT', '4.200 TL / ay'],           ['MANZARA', 'Boğaz dilimi 12°'],
  ['OTOPARK', 'Kapalı · 1 araç'],       ['ASANSÖR', '2 adet'],
  ['SOKAK', 'Çıkmaz · transit yok'],    ['KOMŞULUK', '%38 aile'],
  ['YEŞİL', 'Park 220 m'],              ['ECZANE', '180 m'],
  ['MARKET', '90 m'],                   ['DEPREM', '2018 sonrası yönetmelik'],
  ['GÜNEŞ', 'Kışın 4s 20dk / gün'],     ['NEM', 'Kuzey cephe · %54'],
  ['GEÇMİŞ', '9 ay ilanda · 1 indirim'],['DAVRANIŞ', 'Benzer profil 3 kez baktı'],
  ['TALEP', 'Bölgede 2+1 talebi ↑%17'], ['KİRA', 'Getiri %4,1'],
  ['TAPU', 'Kat mülkiyeti'],            ['SİTE', '24 daire · düşük yoğunluk'],
  ['ZİL', 'Okul zili menzili dışında'], ['IŞIK', 'Karşı bina 34 m · gölge yok'],
  ['ISI', 'Yaz iç sıcaklık +2,1°'],     ['SU', 'Bağımsız depo']
];
/* Gerekçe perdesinde (E) mülke bağlanan kanıt etiketleri */
var NEDEN = [
  ['METRO', 'Yürüyüş 4 dk · Osmanbey'], ['OKUL', 'İlkokul 6 dk yürüme'],
  ['SABAH IŞIĞI', 'Kuzeydoğu cephe · 07:10'], ['SOKAK RİTMİ', 'Çıkmaz · 07-09 transit yok'],
  ['PLAN', '2+1 · 128 m² · geniş salon'], ['BÜTÇE', '17,8 mn + ~400 bin yenileme'],
  ['SÖYLENEN', 'Yeni bina · metro · bütçe'], ['ÇIKARILAN', 'Sabah ışığı · sessizlik · okul']
];
var CUMLE_PARCA = ['“Nişantaşı veya Fulya,', ' 3+1,', ' yeni bina,', ' metroya yakın,', ' 18 milyon TL’ye kadar.”'];
var CUMLE = CUMLE_PARCA.join('');

/* Sürekli renk gradı: hep aydınlık, hep SRYVERSE. Kesme yok.
   [u, zemin, sis, mürekkep] */
var GRAD = [
  [0.00, 0xF3F2EE, 0xF3F2EE, 0x111614],
  [0.14, 0xF4F3EF, 0xF4F3EF, 0x111614],
  [0.30, 0xF2F1EA, 0xF3F2EC, 0x111614],   /* beklenen küme: hafif sıcak taş */
  [0.42, 0xEEF1EE, 0xEFF2EF, 0x0F1512],   /* bağlar: mineral */
  [0.50, 0xF5F5F2, 0xF6F6F3, 0x111614],   /* eleme: sakin */
  [0.62, 0xEEF3EF, 0xF0F4F1, 0x0E1512],   /* eşleşme: adaçayı nefesi */
  [0.82, 0xF2F3EF, 0xF3F4F0, 0x111614],
  [1.00, 0xF3F2EE, 0xF3F2EE, 0x111614]
];

/* ───────────────────── SCROLL SÜRÜCÜSÜ (korundu) ───────────────────── */
var toplamH = 0;
PERDE.forEach(function (p) { toplamH += p.h; });
var story = document.getElementById('story');
PERDE.forEach(function (p) {
  var d = document.createElement('div');
  d.style.height = (p.h * 100) + 'svh'; d.dataset.act = p.id; story.appendChild(d);
});
var P = 0, Pham = 0;
function okuScroll() {
  var max = document.documentElement.scrollHeight - window.innerHeight;
  Pham = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}
var SINIR = [];
(function () { var a = 0; PERDE.forEach(function (p) { SINIR.push([a / toplamH, (a + p.h) / toplamH]); a += p.h; }); })();
function perdeP(i) { var s = SINIR[i][0], e = SINIR[i][1]; return Math.min(1, Math.max(0, (P - s) / (e - s))); }
function kapi(x, a, b) { return Math.min(1, Math.max(0, (x - a) / (b - a))); }
function yumusa(x) { return x * x * (3 - 2 * x); }
function karis(a, b, t) { return a + (b - a) * t; }
function bicim(n) { return Math.round(n).toLocaleString('tr-TR'); }

/* Perde metinleri ve arayüz anları */
var sesler = [].slice.call(document.querySelectorAll('.say'));
var utterEl = document.getElementById('utter');
var meterN = document.getElementById('meterN'), meterL = document.getElementById('meterL');
var esikEl = document.getElementById('esik');
var pAd = document.getElementById('pAd'), pGuc = document.getElementById('pGuc'), pDik = document.getElementById('pDik'), pNot = document.getElementById('pNot');
var anlaLi = [].slice.call(document.querySelectorAll('.anla li'));
var tartiBar = [].slice.call(document.querySelectorAll('#tarti i'));
var rayLi = [].slice.call(document.querySelectorAll('#ray > div'));
var hintEl = document.getElementById('hint');
var durumEl = document.getElementById('durum');

/* Cümle: parçalara ayrılmış, her parça bir <mark> */
utterEl.innerHTML = CUMLE_PARCA.map(function (p, i) { return '<mark data-m="' + i + '"></mark>'; }).join('');
var markEls = [].slice.call(utterEl.querySelectorAll('mark'));
function cumleYaz(oran) {
  /* oran 0..1 → yazılan karakter sayısı */
  var n = Math.round(oran * CUMLE.length), acc = 0;
  for (var i = 0; i < CUMLE_PARCA.length; i++) {
    var p = CUMLE_PARCA[i], al = Math.max(0, Math.min(p.length, n - acc));
    markEls[i].textContent = p.slice(0, al); acc += p.length;
  }
  utterEl.classList.toggle('done', n >= CUMLE.length);
}

/* ───────────────────── DANIŞMAN EYLEMLERİ (F): gerçek durum ───────────────────── */
(function () {
  var kars = document.getElementById('kars');
  if (!kars) return;
  kars.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-e]'); if (!b) return;
    var aday = b.closest('.aday'), ad = aday.querySelector('h3').textContent, e2 = b.dataset.e;
    if (e2 === 'incele') { b.classList.toggle('on'); durumEl.textContent = b.classList.contains('on') ? ad + ' inceleniyor: plan, cephe, sokak' : ''; }
    if (e2 === 'onc') {
      var vardi = aday.classList.contains('onc');
      [].forEach.call(kars.querySelectorAll('.aday'), function (a) { a.classList.remove('onc'); a.querySelector('[data-e=onc]').classList.remove('on'); });
      if (!vardi) { aday.classList.add('onc'); b.classList.add('on'); durumEl.textContent = ad + ' öncelik olarak işaretlendi'; }
      else durumEl.textContent = '';
    }
    if (e2 === 'red') { aday.classList.toggle('red'); b.classList.toggle('on'); durumEl.textContent = aday.classList.contains('red') ? ad + ' bu müşteri için reddedildi' : ''; }
    if (e2 === 'not') { var nk = document.getElementById('notkutu'); nk.classList.toggle('on'); b.classList.toggle('on'); if (nk.classList.contains('on')) nk.querySelector('textarea').focus(); }
  });
  document.getElementById('gonder').addEventListener('click', function () {
    this.classList.add('on'); this.textContent = 'Gönderildi';
    durumEl.textContent = 'Maçka Residence, gerekçesiyle birlikte müşteriye gönderildi';
  });
})();

/* ───────────────────── DURGUN SÜRÜM KAPISI ───────────────────── */
var azHareket = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function glVar() {
  try { var c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
}
if (azHareket || !glVar() || !T) { durgunKur(); return; }
kok.className = 'live';

/* ══════════════════════════════════════════════════════════════════════
   SAHNE — ışık dünyası
   ══════════════════════════════════════════════════════════════════════ */
var cv = document.getElementById('gl');
var ren = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, powerPreference: 'high-performance' });
var DPR = Math.min(window.devicePixelRatio || 1, mobil ? 1.6 : 2);
ren.setPixelRatio(DPR);
ren.setClearColor(0xF3F2EE, 1);
if (T.sRGBEncoding !== undefined) ren.outputEncoding = T.sRGBEncoding;
else if (T.SRGBColorSpace !== undefined) ren.outputColorSpace = T.SRGBColorSpace;

var sahne = new T.Scene();
var kam = new T.PerspectiveCamera(56, 1, 0.5, 720);

/* Kamera yolu (korundu): son üçte biri düz, eşik düzlemi eksen hizalı */
var yol = new T.CatmullRomCurve3([
  new T.Vector3(0, 6, 40), new T.Vector3(-14, 2, -30), new T.Vector3(12, -4, -104),
  new T.Vector3(-8, 5, -178), new T.Vector3(6, 1, -252), new T.Vector3(-3, -2, -322),
  new T.Vector3(0, 0, -392), new T.Vector3(0, 0, -452), new T.Vector3(0, 0, -510), new T.Vector3(0, 0, -560)
]);
yol.curveType = 'catmullrom'; yol.tension = 0.4;
var U_ESIK = 0.80;
var esikNok = yol.getPointAt(U_ESIK);
var ESIK_MERKEZ = new T.Vector3(esikNok.x + (mobil ? 0 : -3.5), esikNok.y + (mobil ? 5.4 : 0.6), esikNok.z - (mobil ? 31 : 26));

/* ─────────── ALAN: kanıt evreni ─────────── */
var N = mobil ? 1500 : 3700;
var N_YANLIS = 247, N_BAG = mobil ? 90 : 190, N_KALAN = 8, N_ESIK = 28;
function rnd(s) { var x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

var iPos = new Float32Array(N * 3), iTar = new Float32Array(N * 3), iRot = new Float32Array(N * 2), iSize = new Float32Array(N * 2);
var iSeed = new Float32Array(N), iKind = new Float32Array(N), iRole = new Float32Array(N), iUV = new Float32Array(N * 4);
var cpuPos = [];
var roller = new Float32Array(N), i, k;
var sayac = 0;
for (i = 0; i < N && sayac < N_YANLIS; i += 3) { roller[i] = 1; sayac++; }
for (i = 5; i < N && N_BAG > 0; i += 17) { if (roller[i] === 0) { roller[i] = 2; N_BAG--; } }
var kalanIdx = [], esikIdx = [];
for (i = 0; i < N_KALAN; i++) { roller[40 + i * 7] = 3; kalanIdx.push(40 + i * 7); }
for (i = 0; i < N_ESIK; i++) { roller[400 + i * 11] = 4; esikIdx.push(400 + i * 11); }

for (i = 0; i < N; i++) {
  var s = i / N, r1 = rnd(i + 1), r2 = rnd(i + 91), r3 = rnd(i + 401), r4 = rnd(i + 777);
  var z = 46 - s * 640 - r1 * 22;
  var yari = 26 + 30 * Math.sin(s * 3.1);
  var ac = rnd(i * 7 + 555) * Math.PI * 2, yc = Math.pow(r3, 0.62) * yari;
  var x = Math.cos(ac) * yc, y = Math.sin(ac) * yc * 0.62 + (r4 - 0.5) * 14;
  var d = Math.sqrt(x * x + y * y), bos = 13 + 9 * Math.max(0, 1 - s * 5);
  if (d < bos) { var m = (bos + r4 * 5) / (d + 0.01); x *= m; y *= m; }
  iPos[i * 3] = x; iPos[i * 3 + 1] = y; iPos[i * 3 + 2] = z;
  cpuPos.push(new T.Vector3(x, y, z));
  var rol = roller[i]; iRole[i] = rol; iSeed[i] = r1;
  var rk = rnd(i * 3 + 1213), kind;
  if (rol === 4) kind = 3; else if (rk < 0.40) kind = 0; else if (rk < 0.78) kind = 1; else if (rk < 0.88) kind = 2; else kind = 0;
  iKind[i] = kind;
  iRot[i * 2] = (r1 - 0.5) * 0.5;
  iRot[i * 2 + 1] = rk < 0.72 ? Math.round(r4 * 4) * (Math.PI / 2) : r4 * Math.PI * 2;
  if (kind === 0) { iSize[i * 2] = 1.5 + r3 * 1.6; iSize[i * 2 + 1] = 4.5 + r4 * 7.5; }
  else if (kind === 1) { iSize[i * 2] = 2.2 + r3 * 2.0; iSize[i * 2 + 1] = iSize[i * 2]; }
  else { iSize[i * 2] = 2.8 + r4 * 4.2; iSize[i * 2 + 1] = iSize[i * 2]; }
  iUV[i * 4] = (r2 < 0.5 ? 0 : 0.5) + r3 * 0.34; iUV[i * 4 + 1] = (r3 < 0.5 ? 0 : 0.5) + r4 * 0.34;
  iUV[i * 4 + 2] = 0.14; iUV[i * 4 + 3] = 0.14;
  iTar[i * 3] = x; iTar[i * 3 + 1] = y; iTar[i * 3 + 2] = z;
}

/* Eşik düzlemi: 28 kırık, Maçka karesini (atlas sol-üst) yeniden kurar */
var GW = 7, GH = 4, PW = mobil ? 11.6 : 17.2, PH = mobil ? 7.7 : 11.4;
for (i = 0; i < N_ESIK; i++) {
  var id = esikIdx[i], cx = i % GW, cy = Math.floor(i / GW);
  iTar[id * 3] = ESIK_MERKEZ.x + (cx - (GW - 1) / 2) * (PW / GW);
  iTar[id * 3 + 1] = ESIK_MERKEZ.y - (cy - (GH - 1) / 2) * (PH / GH);
  iTar[id * 3 + 2] = ESIK_MERKEZ.z;
  iSize[id * 2] = PW / GW + 0.012; iSize[id * 2 + 1] = PH / GH + 0.012;
  iUV[id * 4] = (cx / GW) * 0.5; iUV[id * 4 + 1] = 1.0 - ((cy + 1) / GH) * 0.5;
  iUV[id * 4 + 2] = 0.5 / GW; iUV[id * 4 + 3] = 0.5 / GH;
  /* Kümenin dışında, görünür ama sıradan olmayan bir ihtimal olarak başlar */
  var aa = (i / N_ESIK) * Math.PI * 2, rr = 34 + rnd(id) * 40;
  iPos[id * 3] = ESIK_MERKEZ.x + Math.cos(aa) * rr;
  iPos[id * 3 + 1] = ESIK_MERKEZ.y + Math.sin(aa) * rr * 0.7;
  iPos[id * 3 + 2] = ESIK_MERKEZ.z + 60 + (rnd(id + 5) - 0.5) * 160;
  cpuPos[id].set(iPos[id * 3], iPos[id * 3 + 1], iPos[id * 3 + 2]);
}
/* Ayakta kalan 8 kanıt: zirveye yakın doğar, mülkün çevresinde yörüngeye oturur */
var kalanNok = new T.Vector3();
for (i = 0; i < N_KALAN; i++) {
  var kid = kalanIdx[i];
  yol.getPointAt(0.60 + (i / N_KALAN) * 0.13, kalanNok);
  var kga = rnd(kid * 31 + 7) * Math.PI * 2, kgr = 26 + rnd(kid * 17) * 22;
  iPos[kid * 3] = kalanNok.x + Math.cos(kga) * kgr; iPos[kid * 3 + 1] = kalanNok.y + Math.sin(kga) * kgr * 0.7;
  iPos[kid * 3 + 2] = kalanNok.z - 20 - rnd(kid * 13) * 40;
  cpuPos[kid].set(iPos[kid * 3], iPos[kid * 3 + 1], iPos[kid * 3 + 2]);
  var ka = (i / N_KALAN) * Math.PI * 2 - 0.4;
  iTar[kid * 3] = ESIK_MERKEZ.x + Math.cos(ka) * (mobil ? 9.2 : 15.4);
  iTar[kid * 3 + 1] = ESIK_MERKEZ.y + Math.sin(ka) * (mobil ? 6.6 : 7.8);
  iTar[kid * 3 + 2] = ESIK_MERKEZ.z + 5;
  iSize[kid * 2] = mobil ? 1.0 : 1.4; iSize[kid * 2 + 1] = iSize[kid * 2]; iKind[kid] = 2;
}
/* 247 beklenen: kameranın 3-5. perdede geçtiği koridora toplanır */
var yanIdx = []; for (i = 0; i < N; i++) if (iRole[i] === 1) yanIdx.push(i);
var yanNok = new T.Vector3();
for (i = 0; i < yanIdx.length; i++) {
  var yi = yanIdx[i]; yol.getPointAt(0.24 + (i / yanIdx.length) * 0.36, yanNok);
  var ya = rnd(yi * 3 + 71) * Math.PI * 2, yr = 11 + Math.pow(rnd(yi * 9 + 23), 0.62) * 30;
  iPos[yi * 3] = yanNok.x + Math.cos(ya) * yr; iPos[yi * 3 + 1] = yanNok.y + Math.sin(ya) * yr * 0.7;
  iPos[yi * 3 + 2] = yanNok.z + (rnd(yi * 7 + 13) - 0.5) * 58;
  iTar[yi * 3] = iPos[yi * 3]; iTar[yi * 3 + 1] = iPos[yi * 3 + 1]; iTar[yi * 3 + 2] = iPos[yi * 3 + 2];
  cpuPos[yi].set(iPos[yi * 3], iPos[yi * 3 + 1], iPos[yi * 3 + 2]);
}
/* İlişki düğümleri: 4. perdenin koridoruna kümelenir */
var bagIdx = []; for (i = 0; i < N; i++) if (iRole[i] === 2) bagIdx.push(i);
var bagNok = new T.Vector3();
for (i = 0; i < bagIdx.length; i++) {
  var bi = bagIdx[i]; yol.getPointAt(0.33 + (i / bagIdx.length) * 0.19, bagNok);
  var ba = rnd(bi * 5 + 17) * Math.PI * 2, br = 15 + Math.pow(rnd(bi * 11 + 29), 0.7) * 27;
  iPos[bi * 3] = bagNok.x + Math.cos(ba) * br; iPos[bi * 3 + 1] = bagNok.y + Math.sin(ba) * br * 0.72;
  iPos[bi * 3 + 2] = bagNok.z + (rnd(bi * 13 + 41) - 0.5) * 46;
  iTar[bi * 3] = iPos[bi * 3]; iTar[bi * 3 + 1] = iPos[bi * 3 + 1]; iTar[bi * 3 + 2] = iPos[bi * 3 + 2];
  cpuPos[bi].set(iPos[bi * 3], iPos[bi * 3 + 1], iPos[bi * 3 + 2]);
  iKind[bi] = rnd(bi * 17 + 3) < 0.5 ? 1 : 2; iSize[bi * 2] = 2.0 + rnd(bi * 19) * 1.6; iSize[bi * 2 + 1] = iSize[bi * 2];
}

/* ─────────── MATERYAL: ince mürekkep çizgileri, açık zemin ─────────── */
var atlas = new T.TextureLoader().load(window.IZ_ATLAS);
if (T.SRGBColorSpace !== undefined) atlas.colorSpace = T.SRGBColorSpace; else if (T.sRGBEncoding !== undefined) atlas.encoding = T.sRGBEncoding;
atlas.minFilter = T.LinearFilter; atlas.generateMipmaps = false;

var U = {
  uT: { value: 0 }, uWake: { value: 0 }, uFalse: { value: 0 }, uRelate: { value: 0 }, uHint: { value: 0 },
  uCull: { value: 0 }, uAsm: { value: 0 }, uSettle: { value: 0 },
  uAtlas: { value: atlas }, uHead: { value: new T.Vector3(0, 0, 40) },
  uInk: { value: new T.Color(0x111614) }, uFog: { value: new T.Color(0xF3F2EE) },
  uSage: { value: new T.Color(0x7CA08E) }, uGreen: { value: new T.Color(0x0B6B57) }, uStone: { value: new T.Color(0xC9C6BC) }
};
var ORTAK = [
  'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'vec3 rotXY(vec3 p,float rx,float ry){ float cx=cos(rx),sx=sin(rx); p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);',
  '  float cy=cos(ry),sy=sin(ry); return vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);}'
].join('\n');
var VS = [
  'precision highp float;',
  'attribute vec3 position; attribute vec2 uv;',
  'attribute vec3 iPos; attribute vec3 iTar; attribute vec2 iRot; attribute vec2 iSize;',
  'attribute float iSeed; attribute float iKind; attribute float iRole; attribute vec4 iUV;',
  'uniform mat4 modelViewMatrix, projectionMatrix;',
  'uniform float uT,uWake,uCull,uAsm; uniform vec3 uHead;',
  'varying vec2 vUv; varying float vKind,vRole,vSeed,vGlow,vFogF,vAsm,vNear; varying vec4 vRect;',
  ORTAK,
  'void main(){',
  '  vUv=uv; vKind=iKind; vRole=iRole; vSeed=iSeed; vRect=iUV;',
  '  float esik=step(3.5,iRole), kalan=step(2.5,iRole);',
  '  float kur=uAsm*esik, orb=uAsm*kalan*(1.0-esik); float t=max(kur,orb); vAsm=t;',
  '  vec3 wp=iPos;',
  '  wp += vec3(sin(uT*0.19+iSeed*39.1), cos(uT*0.15+iSeed*21.7), sin(uT*0.11+iSeed*13.3))*(0.55+iSeed*0.9);',
  '  wp.xy *= 1.0 - uWake*0.045;',
  '  float dead=(1.0-kalan)*uCull; vec2 dir=normalize(iPos.xy+vec2(0.001));',
  '  wp.xy += dir*dead*dead*128.0;',
  '  wp = mix(wp, iTar, smoothstep(0.0,1.0,t));',
  '  vec3 p=vec3(position.xy*iSize,0.0); vec3 pr=rotXY(p,iRot.x,iRot.y);',
  '  p = mix(pr,p,smoothstep(0.0,1.0,t)); p *= (1.0-dead*0.55);',
  '  vec4 mv = modelViewMatrix*vec4(wp+p,1.0);',
  '  float dh=distance(wp,uHead);',
  '  vGlow = smoothstep(26.0,4.0,dh)*uWake*(1.0-step(2.5,iRole))*(1.0-uAsm);',
  '  vFogF = 1.0-exp(-pow(max(-mv.z,0.0)*0.0092,1.6));',
  '  vNear = smoothstep(1.2,9.0,-mv.z);',
  '  gl_Position = projectionMatrix*mv;',
  '}'
].join('\n');
var FS = [
  'precision highp float;',
  'uniform sampler2D uAtlas; uniform vec3 uInk,uFog,uSage,uGreen,uStone;',
  'uniform float uFalse,uRelate,uHint,uCull,uAsm;',
  'varying vec2 vUv; varying float vKind,vRole,vSeed,vGlow,vFogF,vAsm,vNear; varying vec4 vRect;',
  ORTAK,
  'float cizgi(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}',
  'void main(){',
  '  vec3 c=uInk; float a=0.0;',
  '  if(vKind<0.5){',                     /* CEPHE: ince çerçeve + pencere hücreleri */
  '    vec2 g=vUv*vec2(3.0,7.0); vec2 f=fract(g);',
  '    float w=step(0.22,f.x)*step(f.x,0.78)*step(0.2,f.y)*step(f.y,0.78);',
  '    float lit=step(0.55,hash(floor(g)+vSeed*57.0));',
  '    float kenar=1.0-step(0.03,min(min(vUv.x,1.0-vUv.x),min(vUv.y,1.0-vUv.y)));',
  '    a = 0.03 + w*(0.05+lit*0.22) + kenar*0.42;',
  '  } else if(vKind<1.5){',              /* PLAN: dik çizgi glifi */
  '    float s1=0.25+vSeed*0.5, s2=0.3+fract(vSeed*7.0)*0.45;',
  '    float d=cizgi(vUv,vec2(0.12,0.15),vec2(0.12,s2)); d=min(d,cizgi(vUv,vec2(0.12,s2),vec2(s1,s2)));',
  '    d=min(d,cizgi(vUv,vec2(s1,s2),vec2(s1,0.86))); d=min(d,cizgi(vUv,vec2(0.12,0.15),vec2(0.8,0.15)));',
  '    a = smoothstep(0.045,0.008,d)*0.62;',
  '  } else if(vKind<2.5){',              /* HALKA: yürüme mesafesi */
  '    float r=length(vUv-0.5); a = smoothstep(0.024,0.004,abs(r-0.40))*0.5 + smoothstep(0.018,0.0,abs(r-0.17))*0.3;',
  '  } else {',                           /* KIRIK: gerçek fotoğraf */
  '    vec4 tx=texture2D(uAtlas, vRect.xy+vUv*vRect.zw);',
  '    float dus=1.0-step(0.985,max(abs(vUv.x-0.5),abs(vUv.y-0.5))*2.0);',
  '    c = mix(mix(uStone, tx.rgb, 0.45), tx.rgb, vAsm); a = (0.55+vAsm*0.45)*dus;',
  '    float ker=1.0-step(0.02,min(min(vUv.x,1.0-vUv.x),min(vUv.y,1.0-vUv.y)));',
  '    c = mix(c, uGreen, ker*uHint*(1.0-vAsm)*0.9);',   /* kümenin dışındaki ihtimal: orman kenar */
  '  }',
  '  if(vRole>0.5&&vRole<1.5){ c=mix(c,uSage,0.25+uFalse*0.75); a*=1.0+uFalse*2.2; }',
  '  if(vRole>1.5&&vRole<2.5){ c=mix(c,uGreen,0.2+uRelate*0.75); a*=1.0+uRelate*1.3; }',
  '  if(vRole>2.5&&vKind<2.5){ c=mix(c,uGreen,0.35+uAsm*0.55); a*=1.4+uAsm*1.4; }',
  '  c = mix(c,uGreen,vGlow*0.9); a += vGlow*0.35;',
  '  a *= (1.0 - uCull*uCull*(1.0-step(2.5,vRole))*0.93);',
  '  a *= (1.0 - uRelate*0.55*(1.0-uCull)*(1.0-step(1.5,vRole)));',
  '  a *= (1.0-vFogF*(1.0-vAsm*0.9))*vNear;',
  '  if(a<0.004) discard;',
  '  gl_FragColor = vec4(c, clamp(a,0.0,1.0));',
  '}'
].join('\n');
var geo = new T.InstancedBufferGeometry(), pg = new T.PlaneGeometry(1, 1);
geo.setAttribute('position', pg.getAttribute('position')); geo.setAttribute('uv', pg.getAttribute('uv')); geo.setIndex(pg.getIndex());
geo.setAttribute('iPos', new T.InstancedBufferAttribute(iPos, 3)); geo.setAttribute('iTar', new T.InstancedBufferAttribute(iTar, 3));
geo.setAttribute('iRot', new T.InstancedBufferAttribute(iRot, 2)); geo.setAttribute('iSize', new T.InstancedBufferAttribute(iSize, 2));
geo.setAttribute('iSeed', new T.InstancedBufferAttribute(iSeed, 1)); geo.setAttribute('iKind', new T.InstancedBufferAttribute(iKind, 1));
geo.setAttribute('iRole', new T.InstancedBufferAttribute(iRole, 1)); geo.setAttribute('iUV', new T.InstancedBufferAttribute(iUV, 4));
geo.instanceCount = N; geo.boundingSphere = new T.Sphere(new T.Vector3(0, 0, -280), 900);
var alan = new T.Mesh(geo, new T.RawShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, blending: T.NormalBlending, side: T.DoubleSide }));
alan.frustumCulled = false; sahne.add(alan);

/* Sinyal zerreleri: koyu benekler, ölçek duygusu */
var NM = mobil ? 900 : 2400;
var mPos = new Float32Array(NM * 3), mSeed = new Float32Array(NM), mKal = new Float32Array(NM);
for (i = 0; i < NM; i++) {
  var ms = i / NM, mr1 = rnd(i + 3001), mr2 = rnd(i + 6007), mr3 = rnd(i + 9011);
  var ma = mr2 * Math.PI * 2, mrad = 9 + Math.pow(mr3, 0.5) * (30 + 26 * Math.sin(ms * 3.1));
  mPos[i * 3] = Math.cos(ma) * mrad; mPos[i * 3 + 1] = Math.sin(ma) * mrad * 0.62 + (mr1 - 0.5) * 12; mPos[i * 3 + 2] = 46 - ms * 640 - mr1 * 26;
  mSeed[i] = mr1; mKal[i] = mr2 < 0.02 ? 1 : 0;
}
var mgeo = new T.BufferGeometry();
mgeo.setAttribute('position', new T.BufferAttribute(mPos, 3)); mgeo.setAttribute('aSeed', new T.BufferAttribute(mSeed, 1)); mgeo.setAttribute('aKal', new T.BufferAttribute(mKal, 1));
mgeo.boundingSphere = new T.Sphere(new T.Vector3(0, 0, -280), 900);
var zerre = new T.Points(mgeo, new T.ShaderMaterial({
  uniforms: U, transparent: true, depthWrite: false, blending: T.NormalBlending,
  vertexShader: ['attribute float aSeed,aKal; uniform float uT,uCull,uWake,uAsm; uniform vec3 uHead; varying float vA,vG;',
    'void main(){ vec3 wp=position+vec3(sin(uT*0.23+aSeed*61.0),cos(uT*0.19+aSeed*33.0),0.0)*0.9;',
    ' float dead=(1.0-aKal)*uCull; wp.xy+=normalize(position.xy+vec2(0.001))*dead*dead*132.0;',
    ' vec4 mv=modelViewMatrix*vec4(wp,1.0); float dh=distance(wp,uHead); vG=smoothstep(30.0,3.0,dh)*uWake;',
    ' float fog=1.0-exp(-pow(max(-mv.z,0.0)*0.0092,1.6));',
    ' vA=(0.34+vG*0.5)*(1.0-fog)*(1.0-dead*dead*0.985)*(1.0-uAsm*0.55)*smoothstep(1.2,9.0,-mv.z);',
    ' gl_PointSize=(1.7+vG*3.0)*(300.0/max(-mv.z,1.0)); gl_Position=projectionMatrix*mv; }'].join('\n'),
  fragmentShader: ['precision highp float; uniform vec3 uInk,uGreen; varying float vA,vG;',
    'void main(){ float d=length(gl_PointCoord-0.5); if(d>0.5) discard; float a=vA*smoothstep(0.5,0.1,d);',
    ' gl_FragColor=vec4(mix(uInk,uGreen,vG), a); }'].join('\n')
}));
zerre.frustumCulled = false; sahne.add(zerre);

/* İlişkiler: orman yeşili ince hatlar */
var ciftler = [];
for (i = 0; i < bagIdx.length; i++) { var a1 = bagIdx[i];
  for (k = i + 1; k < bagIdx.length && ciftler.length < 560; k++) { var b1 = bagIdx[k];
    var dx = iPos[a1 * 3] - iPos[b1 * 3], dy = iPos[a1 * 3 + 1] - iPos[b1 * 3 + 1], dz = iPos[a1 * 3 + 2] - iPos[b1 * 3 + 2];
    var dd = dx * dx + dy * dy + dz * dz; if (dd < 2100 && dd > 120) ciftler.push([a1, b1]); } }
var NC = ciftler.length, cPos = new Float32Array(NC * 6), cDel = new Float32Array(NC * 2);
for (i = 0; i < NC; i++) { var pa = ciftler[i][0], pb = ciftler[i][1];
  cPos[i * 6] = iPos[pa * 3]; cPos[i * 6 + 1] = iPos[pa * 3 + 1]; cPos[i * 6 + 2] = iPos[pa * 3 + 2];
  cPos[i * 6 + 3] = iPos[pb * 3]; cPos[i * 6 + 4] = iPos[pb * 3 + 1]; cPos[i * 6 + 5] = iPos[pb * 3 + 2];
  cDel[i * 2] = i / NC; cDel[i * 2 + 1] = i / NC; }
var cgeo = new T.BufferGeometry();
cgeo.setAttribute('position', new T.BufferAttribute(cPos, 3)); cgeo.setAttribute('aDel', new T.BufferAttribute(cDel, 1));
cgeo.boundingSphere = new T.Sphere(new T.Vector3(0, 0, -280), 900);
var aglar = new T.LineSegments(cgeo, new T.ShaderMaterial({
  uniforms: U, transparent: true, depthWrite: false, blending: T.NormalBlending,
  vertexShader: ['attribute float aDel; uniform float uRelate,uCull; varying float vA;',
    'void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); float fog=1.0-exp(-pow(max(-mv.z,0.0)*0.0092,1.6));',
    ' float on=smoothstep(aDel*0.85,aDel*0.85+0.22,uRelate); vA=on*(1.0-fog)*(1.0-uCull*0.95)*0.62; gl_Position=projectionMatrix*mv; }'].join('\n'),
  fragmentShader: 'precision highp float; uniform vec3 uGreen; varying float vA; void main(){ if(vA<0.004) discard; gl_FragColor=vec4(uGreen,vA); }'
}));
aglar.frustumCulled = false; sahne.add(aglar);

/* ─────────── İZ: niyet ipliği (halat kısıtı korundu) ─────────── */
var IZ_N = 190, IZ_SEG = 0.30;
var izGec = [], izBas = new T.Vector3(0, 0, 40), izHiz = new T.Vector3();
for (i = 0; i < IZ_N; i++) izGec.push(new T.Vector3(0, 0, 40 + i * 0.3));
var izPos = new Float32Array(IZ_N * 6), izT = new Float32Array(IZ_N * 2), izIdx = [];
for (i = 0; i < IZ_N - 1; i++) { var o = i * 2; izIdx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2); }
for (i = 0; i < IZ_N; i++) { izT[i * 2] = i / (IZ_N - 1); izT[i * 2 + 1] = i / (IZ_N - 1); }
var izGeo = new T.BufferGeometry();
izGeo.setAttribute('position', new T.BufferAttribute(izPos, 3).setUsage(T.DynamicDrawUsage)); izGeo.setAttribute('aT', new T.BufferAttribute(izT, 1)); izGeo.setIndex(izIdx);
izGeo.boundingSphere = new T.Sphere(new T.Vector3(0, 0, -280), 900);
var iz = new T.Mesh(izGeo, new T.ShaderMaterial({
  uniforms: U, transparent: true, depthWrite: false, blending: T.NormalBlending, side: T.DoubleSide,
  vertexShader: 'attribute float aT; varying float vT,vF; void main(){ vT=aT; vec4 mv=modelViewMatrix*vec4(position,1.0); vF=1.0-exp(-pow(max(-mv.z,0.0)*0.0092,1.6)); gl_Position=projectionMatrix*mv; }',
  fragmentShader: ['precision highp float; uniform vec3 uGreen; uniform float uWake,uT,uSettle; varying float vT,vF;',
    'void main(){ float bas=smoothstep(0.55,1.0,vT); float nabiz=0.8+0.2*sin(vT*34.0-uT*3.4);',
    ' float a=(0.06+bas*0.72)*nabiz*uWake*(1.0-vF)*(1.0-uSettle*0.82)*smoothstep(0.0,0.14,vT);',
    ' if(a<0.004) discard; gl_FragColor=vec4(uGreen,a); }'].join('\n')
}));
iz.frustumCulled = false; sahne.add(iz);

var pX = 0, pY = 0, pTX = 0, pTY = 0, dokundu = false;
window.addEventListener('pointermove', function (e) { pTX = (e.clientX / innerWidth) * 2 - 1; pTY = -((e.clientY / innerHeight) * 2 - 1); if (e.pointerType !== 'touch') dokundu = true; }, { passive: true });
window.addEventListener('touchmove', function (e) { if (!e.touches.length) return; pTX = (e.touches[0].clientX / innerWidth) * 2 - 1; pTY = -((e.touches[0].clientY / innerHeight) * 2 - 1); dokundu = true; }, { passive: true });
var gecilen = [], gecSet = {};
function kaydet(idx) { if (gecSet[idx]) return; gecSet[idx] = 1; gecilen.push({ i: idx, k: KANIT[idx % KANIT.length] }); if (gecilen.length > 40) gecilen.shift(); }

/* ══════════════════════════════════════════════════════════════════════
   KAMERA, GRAD, DÖNGÜ
   ══════════════════════════════════════════════════════════════════════ */
var U_AT = [0, 0.08, 0.20, 0.34, 0.50, 0.64, 0.800, 0.804, 0.808, 0.812], U_SON = 0.812;
function egriU() {
  for (var i2 = 0; i2 < PERDE.length; i2++) {
    var s = SINIR[i2][0], e = SINIR[i2][1];
    if (P <= e || i2 === PERDE.length - 1) {
      var l = Math.min(1, Math.max(0, (P - s) / (e - s)));
      var a = U_AT[i2], b = i2 < U_AT.length - 1 ? U_AT[i2 + 1] : U_SON;
      if (i2 === 5) l = 1 - Math.pow(1 - l, 2.6);        /* eşiğe girerken yavaşla ve dur */
      if (i2 > 5) l = yumusa(l);
      return karis(a, b, l);
    }
  }
  return U_SON;
}
var c1 = new T.Color(), c2 = new T.Color();
function gradAl(u, dizin, hedef) {
  for (var i3 = 0; i3 < GRAD.length - 1; i3++) {
    if (u <= GRAD[i3 + 1][0] || i3 === GRAD.length - 2) {
      var t = Math.min(1, Math.max(0, (u - GRAD[i3][0]) / (GRAD[i3 + 1][0] - GRAD[i3][0])));
      c1.setHex(GRAD[i3][dizin]); c2.setHex(GRAD[i3 + 1][dizin]); return hedef.copy(c1).lerp(c2, t);
    }
  }
  return hedef;
}

/* Etiket havuzu ve teller */
var marksEl = document.getElementById('marks'), MARK_N = mobil ? 3 : 6, marklar = [];
for (i = 0; i < MARK_N + 8; i++) {
  var md = document.createElement('div'); md.className = 'mark'; md.innerHTML = '<b></b><span></span>'; marksEl.appendChild(md);
  marklar.push({ el: md, b: md.querySelector('b'), s: md.querySelector('span'), idx: -1 });
}
var wiresEl = document.getElementById('wires'), figEl = document.getElementById('fig'), teller = [];
var NS = 'http://www.w3.org/2000/svg';
for (i = 0; i < 8; i++) { var ln = document.createElementNS(NS, 'line'); ln.setAttribute('stroke-width', '1'); ln.setAttribute('opacity', '0'); wiresEl.appendChild(ln); teller.push(ln); }
/* Gerekçe çizimleri (E): metro yürüyüş yolu, plan konturu, sabah ışığı yayı */
var figMetro = document.createElementNS(NS, 'path'), figPlan = document.createElementNS(NS, 'path'), figGunes = document.createElementNS(NS, 'path');
[figMetro, figPlan, figGunes].forEach(function (p) { p.setAttribute('fill', 'none'); p.setAttribute('stroke', '#0B6B57'); p.setAttribute('stroke-width', '1.1'); p.setAttribute('opacity', '0'); figEl.appendChild(p); });
figMetro.setAttribute('stroke-dasharray', '4 4'); figGunes.setAttribute('stroke-dasharray', '2 5');

var pv = new T.Vector3();
function izdusum(v) { pv.copy(v).project(kam); return { x: (pv.x * 0.5 + 0.5) * innerWidth, y: (-pv.y * 0.5 + 0.5) * innerHeight, z: pv.z }; }
var koseV = new T.Vector3();
function esikKutu() {
  /* Mülk düzleminin ekran dikdörtgeni */
  var a = izdusum(koseV.set(ESIK_MERKEZ.x - PW / 2, ESIK_MERKEZ.y + PH / 2, ESIK_MERKEZ.z));
  var b = izdusum(koseV.set(ESIK_MERKEZ.x + PW / 2, ESIK_MERKEZ.y - PH / 2, ESIK_MERKEZ.z));
  return { l: a.x, t: a.y, r: b.x, b: b.y, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, w: b.x - a.x, h: b.y - a.y };
}
function yerlestir(el, x, y, sag, alt) {
  el.style.left = sag ? 'auto' : Math.round(x) + 'px'; el.style.right = sag ? Math.round(innerWidth - x) + 'px' : 'auto';
  el.style.top = alt ? 'auto' : Math.round(y) + 'px'; el.style.bottom = alt ? Math.round(innerHeight - y) + 'px' : 'auto';
}

/* Kaydırma kontrolleri: gerçek sonuç */
function kaydir(actIdx, oran) {
  var hedef = (SINIR[actIdx][0] + (SINIR[actIdx][1] - SINIR[actIdx][0]) * (oran || 0.3)) * (document.documentElement.scrollHeight - innerHeight);
  window.scrollTo({ top: hedef, behavior: 'smooth' });
}
function yenidenIz() { gecilen.length = 0; gecSet = {}; kaydir(1, 0.02); }
document.getElementById('goYes').addEventListener('click', function () { kaydir(9, 0.35); });
document.getElementById('goAgain').addEventListener('click', yenidenIz);
document.getElementById('yeni').addEventListener('click', function () { durumEl.textContent = 'Yeni eşleşme isteniyor'; yenidenIz(); });

/* Film dokusu */
(function () { var c = document.createElement('canvas'); c.width = c.height = 180; var x = c.getContext('2d'), d = x.createImageData(180, 180), p = d.data;
  for (var q = 0; q < p.length; q += 4) { var v = 128 + (Math.random() - 0.5) * 150; p[q] = p[q + 1] = p[q + 2] = v; p[q + 3] = 255; }
  x.putImageData(d, 0, 0); document.getElementById('grain').style.backgroundImage = 'url(' + c.toDataURL('image/png') + ')'; })();

var saat = new T.Clock();
var camFwd = new T.Vector3(), camRight = new T.Vector3(), camUp = new T.Vector3();
var hedefBas = new T.Vector3(), bakis = new T.Vector3(), ileri = new T.Vector3(), yanV = new T.Vector3(), tanV = new T.Vector3(), tmpA = new T.Vector3(), tmpB = new T.Vector3();
var gradZ = new T.Color(), gradS = new T.Color(), gradI = new T.Color();
var izHedef = new T.Vector3(), markV = new T.Vector3(), sonYan = new T.Vector3(1, 0, 0), izBak = new T.Vector3(), zincir = new T.Vector3();
var tara = 0, sonMarkT = 0, ipuclu = false;

function boyut() { var w = innerWidth, h = innerHeight; ren.setSize(w, h, false); kam.aspect = w / h; kam.updateProjectionMatrix();
  [wiresEl, figEl].forEach(function (s) { s.setAttribute('viewBox', '0 0 ' + w + ' ' + h); s.setAttribute('width', w); s.setAttribute('height', h); }); }
window.addEventListener('resize', boyut); boyut();

function dongu() {
  requestAnimationFrame(dongu);
  var dt = Math.min(saat.getDelta(), 0.05), t = saat.elapsedTime;
  okuScroll();
  P += (Pham - P) * (1 - Math.pow(0.0016, dt));       /* korundu: kütle */

  var p1 = perdeP(1), p4 = perdeP(4), p5 = perdeP(5), p6 = perdeP(6), p7 = perdeP(7), p9 = perdeP(9);
  var wake = kapi(P, SINIR[1][0] + 0.02, SINIR[1][0] + 0.07);
  var yanlis = kapi(P, SINIR[3][0], SINIR[3][0] + 0.05) * (1 - kapi(P, SINIR[4][0] + 0.03, SINIR[4][1]));
  var iliski = kapi(P, SINIR[3][0] + 0.02, SINIR[3][1] - 0.02) * (1 - kapi(P, SINIR[4][1] - 0.02, SINIR[5][0] + 0.06) * 0.7);
  var hint = kapi(P, SINIR[3][0] + 0.03, SINIR[3][1]) * (1 - kapi(P, SINIR[5][0], SINIR[5][0] + 0.05));
  var geri = yumusa(kapi(P, SINIR[9][0], SINIR[9][0] + 0.06));
  var eleme = kapi(P, SINIR[4][0] + 0.015, SINIR[4][1]) * (1 - geri * 0.5);
  var asm = yumusa(kapi(P, SINIR[5][0] - 0.01, SINIR[5][0] + 0.075));
  var durul = kapi(P, SINIR[8][0], SINIR[8][0] + 0.05);
  U.uT.value = t; U.uWake.value = wake; U.uFalse.value = yanlis; U.uRelate.value = iliski; U.uHint.value = hint;
  U.uCull.value = eleme; U.uAsm.value = asm; U.uSettle.value = durul;

  /* Grad (korundu) */
  gradAl(P, 1, gradZ); gradAl(P, 2, gradS); gradAl(P, 3, gradI);
  ren.setClearColor(gradZ, 1); U.uFog.value.copy(gradS); U.uInk.value.copy(gradI);
  document.body.style.setProperty('--zemin', '#' + gradZ.getHexString());
  kok.style.setProperty('--sc', Math.round(gradZ.r * 255) + ',' + Math.round(gradZ.g * 255) + ',' + Math.round(gradZ.b * 255));

  /* Kamera (korundu) */
  var u = egriU(); yol.getPointAt(Math.min(u, 0.999), tmpA);
  pX += (pTX - pX) * 0.055; pY += (pTY - pY) * 0.055;
  var geriMesafe = 22 * geri + 9 * kapi(p7, 0, 1) * (1 - geri);     /* karşılaştırmada hafif geri, davette daha geri */
  kam.position.set(tmpA.x + pX * 2.2, tmpA.y + pY * 1.5, tmpA.z + geriMesafe);
  yol.getPointAt(Math.min(u + 0.014, 1), ileri); bakis.copy(ileri);
  var bakEsik = Math.max(asm, durul);
  if (bakEsik > 0.001) bakis.lerp(ESIK_MERKEZ, Math.min(1, bakEsik));
  kam.lookAt(bakis); kam.updateMatrixWorld(); kam.getWorldDirection(camFwd);
  camRight.set(1, 0, 0).applyQuaternion(kam.quaternion); camUp.set(0, 1, 0).applyQuaternion(kam.quaternion);

  /* İZ (korundu: yay + halat) */
  var oto = dokundu ? 0.25 : 1, ax = pX * (dokundu ? 1 : 0) + Math.sin(t * 0.42) * 0.62 * oto, ay = pY * (dokundu ? 1 : 0) + Math.cos(t * 0.33) * 0.42 * oto;
  hedefBas.copy(kam.position).addScaledVector(camFwd, 27).addScaledVector(camRight, ax * 21).addScaledVector(camUp, ay * 12);
  if (asm > 0.01) { izHedef.set(ESIK_MERKEZ.x, ESIK_MERKEZ.y - PH / 2 - 2.2, ESIK_MERKEZ.z + 6); hedefBas.lerp(izHedef, asm * 0.94); }
  tmpB.copy(hedefBas).sub(izBas).multiplyScalar(0.075); izHiz.add(tmpB).multiplyScalar(0.885); izBas.add(izHiz);
  U.uHead.value.copy(izBas);
  izGec[IZ_N - 1].copy(izBas);
  for (i = IZ_N - 2; i >= 0; i--) { zincir.copy(izGec[i]).sub(izGec[i + 1]); var zl = zincir.length();
    if (zl < 1e-5) { zincir.set(0, 0, IZ_SEG); zl = IZ_SEG; } zincir.multiplyScalar(Math.min(zl, IZ_SEG) / zl); izGec[i].copy(izGec[i + 1]).add(zincir); }
  for (i = 0; i < IZ_N; i++) {
    var pp = izGec[i], pa2 = izGec[Math.max(0, i - 1)], pb2 = izGec[Math.min(IZ_N - 1, i + 1)];
    tanV.copy(pb2).sub(pa2); if (tanV.lengthSq() < 1e-8) tanV.copy(camRight); else tanV.normalize();
    izBak.copy(kam.position).sub(pp); var uzak = izBak.length(); if (uzak > 1e-4) izBak.multiplyScalar(1 / uzak); else izBak.copy(camFwd);
    yanV.crossVectors(tanV, izBak); if (yanV.lengthSq() < 1e-6) yanV.copy(sonYan); else { yanV.normalize(); sonYan.copy(yanV); }
    var kk = i / (IZ_N - 1), w = (0.035 + 0.13 * Math.pow(kk, 3.0)) * (1 - Math.pow(Math.max(0, kk - 0.94) / 0.06, 2)) * (1 - asm * 0.45);
    var onde = (pp.x - kam.position.x) * camFwd.x + (pp.y - kam.position.y) * camFwd.y + (pp.z - kam.position.z) * camFwd.z;
    w *= Math.min(1, Math.max(0, (onde - 1.5) / 13));
    izPos[i * 6] = pp.x - yanV.x * w; izPos[i * 6 + 1] = pp.y - yanV.y * w; izPos[i * 6 + 2] = pp.z - yanV.z * w;
    izPos[i * 6 + 3] = pp.x + yanV.x * w; izPos[i * 6 + 4] = pp.y + yanV.y * w; izPos[i * 6 + 5] = pp.z + yanV.z * w;
  }
  izGeo.getAttribute('position').needsUpdate = true;

  if (wake > 0.05 && eleme < 0.9) { var adim = mobil ? 160 : 320;
    for (i = 0; i < adim; i++) { var id2 = (tara + i) % N, cp = cpuPos[id2]; var ddx = cp.x - izBas.x, ddy = cp.y - izBas.y, ddz = cp.z - izBas.z;
      if (ddx * ddx + ddy * ddy + ddz * ddz < 380) kaydet(id2); } tara = (tara + adim) % N; }

  /* ── Arayüz anı A: cümle → yapı ── */
  cumleYaz(kapi(p1, 0.02, 0.34));
  var adimA = Math.floor(kapi(p1, 0.30, 0.86) * 9.99);          /* 0..9 satır */
  for (i = 0; i < markEls.length; i++) markEls[i].classList.toggle('on', adimA > i);
  for (i = 0; i < anlaLi.length; i++) anlaLi[i].classList.toggle('on', adimA > i);

  /* ── Arayüz anı C: değerlendirme çubukları ── */
  for (i = 0; i < tartiBar.length; i++) tartiBar[i].style.setProperty('--p', kapi(p4, 0.08 + i * 0.07, 0.42 + i * 0.07).toFixed(3));

  /* ── Etiketler ve klimaks yapısı ── */
  if (t - sonMarkT > 0.12) {
    sonMarkT = t;
    var klimaks = asm > 0.5;
    var aday = gecilen.slice(-MARK_N);
    for (i = 0; i < marklar.length; i++) {
      var m = marklar[i];
      if (klimaks && i < 8) continue;
      var src = aday[i];
      if (!src || klimaks || P < SINIR[2][0] || P > SINIR[3][1] - 0.01) { m.el.classList.remove('on'); continue; }
      var sp = izdusum(cpuPos[src.i]);
      if (sp.z > 1 || sp.x < 90 || sp.x > innerWidth - 90 || sp.y < 110 || sp.y > innerHeight - 90) { m.el.classList.remove('on'); continue; }
      if (m.idx !== src.i) { m.idx = src.i; m.b.textContent = src.k[0]; m.s.textContent = src.k[1]; }
      m.el.style.transform = 'translate(' + Math.round(sp.x) + 'px,' + Math.round(sp.y) + 'px) translate(-50%,-50%)';
      m.el.className = 'mark mark--gecti on';
    }

    if (klimaks && geri < 0.6) {
      var kb = esikKutu();
      /* D: eşleşme parçaları mülkün çevresine kurulur */
      var dParca = kapi(p5, 0.30, 0.95), eGir = kapi(p6, 0.04, 0.16);
      pAd.classList.toggle('on', dParca > 0.12 && p6 < 0.94 && p7 < 0.05);
      pGuc.classList.toggle('on', dParca > 0.32 && eGir < 0.5);
      pDik.classList.toggle('on', dParca > 0.52 && eGir < 0.5);
      pNot.classList.toggle('on', dParca > 0.72 && eGir < 0.5);
      if (mobil) {
        yerlestir(pAd, 20, kb.t - 14, false, true);
        yerlestir(pGuc, 20, kb.b + 14, false, false);
        yerlestir(pDik, innerWidth - 20, kb.b + 14, true, false); pDik.style.maxWidth = '46vw'; pGuc.style.maxWidth = '46vw';
        yerlestir(pNot, 20, innerHeight - 18, false, true);
      } else {
        yerlestir(pAd, kb.l - 30, kb.t + 4, true, false);
        yerlestir(pGuc, kb.r + 26, kb.t + 4, false, false);
        yerlestir(pDik, kb.l - 30, kb.b, true, true);
        yerlestir(pNot, kb.r + 26, kb.b, false, true);
      }
      esikEl.classList.toggle('on', dParca > 0.1 && p7 < 0.05);

      /* E: gerekçe kanıtları ve çizimleri */
      var eAc = kapi(p6, 0.05, 0.4) * (1 - kapi(p6, 0.9, 1)) * (p7 < 0.02 ? 1 : 0);
      var kn = mobil ? 4 : 8;
      for (i = 0; i < 8; i++) {
        var mm = marklar[i];
        if (i >= kn || eAc < 0.02) { mm.el.classList.remove('on'); teller[i].setAttribute('opacity', '0'); continue; }
        var veri = NEDEN[mobil ? [0, 2, 4, 5][i] : i];
        var sol = i < 4, satir = i % 4;
        mm.b.textContent = veri[0]; mm.s.textContent = veri[1];
        mm.el.className = 'mark ' + (i >= (mobil ? 3 : 6) ? 'mark--bulundu' : 'mark--gecti') + (kapi(p6, 0.05 + i * 0.04, 0.2 + i * 0.04) > 0.5 ? ' on' : '');
        var gen = mm.el.offsetWidth || 200, mx, my, ankr;
        if (mobil) { mx = 16; my = kb.b + 26 + i * 34; ankr = '0'; }
        else if (sol) { mx = Math.max(16 + gen, kb.l - 56 - satir * 22); my = kb.t + 44 + satir * ((kb.h - 54) / 3); ankr = '-100%'; }
        else { mx = Math.min(innerWidth - 16 - gen, kb.r + 56 + satir * 22); my = kb.t + 10 + satir * ((kb.h - 20) / 3); ankr = '0'; }
        mm.el.style.transform = 'translate(' + Math.round(mx) + 'px,' + Math.round(my) + 'px) translate(' + ankr + ',-50%)';
        var ln2 = teller[i], ex = sol ? kb.l : kb.r, ey = Math.min(kb.b, Math.max(kb.t, my));
        if (mobil) { ln2.setAttribute('opacity', '0'); continue; }
        ln2.setAttribute('x1', mx); ln2.setAttribute('y1', my); ln2.setAttribute('x2', ex); ln2.setAttribute('y2', ey);
        ln2.setAttribute('stroke', '#0B6B57'); ln2.setAttribute('opacity', (0.4 * eAc).toFixed(3));
      }
      /* Çizimler: metro yolu (kırık noktalı), plan konturu, sabah ışığı yayı */
      var fx = kb.l, fy = kb.b, W = kb.w;
      figMetro.setAttribute('d', 'M' + (fx + W * 0.62) + ' ' + fy + ' l 0 ' + (W * 0.09) + ' l ' + (W * 0.2) + ' 0 l 0 ' + (W * 0.07) + ' l ' + (W * 0.22) + ' 0');
      figPlan.setAttribute('d', 'M' + (fx + W * 0.06) + ' ' + (fy + W * 0.05) + ' h ' + (W * 0.16) + ' v ' + (W * 0.12) + ' h ' + (-W * 0.06) + ' v ' + (W * 0.06) + ' h ' + (-W * 0.1) + ' z m ' + (W * 0.06) + ' 0 v ' + (W * 0.12));
      figGunes.setAttribute('d', 'M' + (fx + W * 0.36) + ' ' + (kb.t - 6) + ' q ' + (W * 0.16) + ' ' + (-W * 0.12) + ' ' + (W * 0.34) + ' 0');
      figMetro.setAttribute('opacity', mobil ? '0' : (eAc * kapi(p6, 0.1, 0.3)).toFixed(3)); figPlan.setAttribute('opacity', mobil ? '0' : (eAc * kapi(p6, 0.2, 0.4)).toFixed(3)); figGunes.setAttribute('opacity', (eAc * kapi(p6, 0.15, 0.35)).toFixed(3));
    } else {
      esikEl.classList.remove('on');
      for (i = 0; i < 8; i++) { teller[i].setAttribute('opacity', '0'); if (klimaks) marklar[i].el.classList.remove('on'); }
      [figMetro, figPlan, figGunes].forEach(function (f) { f.setAttribute('opacity', '0'); });
    }
    /* G: iş akışı rayı sırayla açılır */
    for (i = 0; i < rayLi.length; i++) rayLi[i].classList.toggle('on', kapi(p9, 0.08 + i * 0.05, 0.2 + i * 0.05) > 0.5);
  }

  /* Ölçü: sahnedeki gerçek sayı */
  var canli, etiket;
  if (asm > 0.5) { canli = 1; etiket = 'eşleşme'; }
  else if (eleme > 0.02) { canli = karis(N_YANLIS, N_KALAN + 1, eleme); etiket = 'ayakta kalan'; }
  else if (yanlis > 0.3) { canli = karis(N + NM, N_YANLIS, kapi(P, SINIR[3][0], SINIR[3][0] + 0.06)); etiket = 'filtreye uyan ilan'; }
  else { canli = N + NM; etiket = 'ilan ve sinyal'; }
  if (p9 > 0.1) { canli = 1240; etiket = 'portföydeki ilan'; }
  meterN.textContent = bicim(canli); meterL.textContent = etiket;

  /* Ses: perdeler çapraz geçer (korundu) */
  for (i = 0; i < sesler.length; i++) {
    var lp = perdeP(i), g = Math.min(kapi(lp, 0.0, 0.18), 1 - kapi(lp, 0.84, 1.0));
    if (i === 0) g = 1 - kapi(lp, 0.7, 1.0);
    if (i === 1) g = Math.min(kapi(lp, 0.0, 0.1), 1 - kapi(lp, 0.9, 1.0));
    if (i === 5) g = Math.min(kapi(lp, 0.25, 0.4), 1 - kapi(lp, 0.94, 1.0));
    if (i === 9) g = kapi(lp, 0.0, 0.2);
    var el2 = sesler[i]; el2.style.opacity = g.toFixed(3); el2.style.transform = 'translateY(' + ((1 - g) * 18).toFixed(1) + 'px)';
    el2.classList.toggle('act', g > 0.6);
  }
  if (!ipuclu && P > 0.02 && P < SINIR[1][0] && !dokundu) hintEl.classList.add('on');
  if (dokundu || P > SINIR[1][0]) { hintEl.classList.remove('on'); if (dokundu) ipuclu = true; }

  ren.render(sahne, kam);
}
requestAnimationFrame(dongu);

/* ══════════════════════════════════════════════════════════════════════
   DURGUN SÜRÜM: aynı on aşama, aynı arayüz anları, hareketsiz.
   ══════════════════════════════════════════════════════════════════════ */
function durgunKur() {
  kok.className = 'still';
  document.getElementById('meterN').textContent = bicim(6100);
  cumleYaz(1);
  markEls.forEach(function (m) { m.classList.add('on'); });
  anlaLi.forEach(function (l) { l.classList.add('on'); });
  tartiBar.forEach(function (b, i) { b.style.setProperty('--p', (0.55 + (i % 3) * 0.15).toFixed(2)); });
  rayLi.forEach(function (r) { r.classList.add('on'); });
  [pAd, pGuc, pDik, pNot].forEach(function (p) { p.classList.add('on'); });
  var says = [].slice.call(document.querySelectorAll('.say'));
  /* Eşleşme parçaları 5. perdenin altına, okunur biçimde yerleşir */
  says[5].parentNode.insertBefore(esikEl, says[5].nextSibling);
  function el(n, a) { var e = document.createElementNS(NS, n); for (var q in a) e.setAttribute(q, a[q]); return e; }
  function tohum(i) { var x = Math.sin(i * 91.7) * 4375.85; return x - Math.floor(x); }
  function figur(perde) {
    var s = el('svg', { viewBox: '0 0 900 380', role: 'img', 'aria-label': 'Alan durumu' }), W = 900, H = 380, CX = 450, CY = 190, i;
    function nokta(i) { var a = tohum(i) * Math.PI * 2, r = 20 + Math.pow(tohum(i + 7), 0.6) * 170; return { x: CX + Math.cos(a) * r * 1.7, y: CY + Math.sin(a) * r * 0.82 }; }
    for (i = 0; i < 380; i++) { var p = nokta(i); if (p.x < 4 || p.x > W - 4 || p.y < 4 || p.y > H - 4) continue;
      var rol = perde === 3 && i % 7 === 0 ? 'sage' : perde === 4 && i % 47 === 0 ? 'green' : 'ink';
      var hh = 4 + tohum(i + 31) * 18;
      if (perde === 4 && rol === 'ink') continue;
      s.appendChild(el('rect', { x: p.x.toFixed(1), y: p.y.toFixed(1), width: rol === 'ink' ? 1.2 : 3, height: hh.toFixed(1),
        fill: rol === 'sage' ? '#9DB8A8' : rol === 'green' ? '#0B6B57' : '#111614', opacity: rol === 'ink' ? (0.08 + tohum(i + 5) * 0.3).toFixed(2) : 0.95 })); }
    if (perde === 2) s.appendChild(el('path', { d: 'M30 330 C 260 280, 300 120, 470 160 S 760 250, 872 100', fill: 'none', stroke: '#0B6B57', 'stroke-width': 1.6 }));
    if (perde === 3) for (i = 0; i < 90; i++) { var a3 = nokta(i * 3), b3 = nokta(i * 3 + 11); if (Math.abs(a3.x - b3.x) > 240) continue;
      s.appendChild(el('line', { x1: a3.x, y1: a3.y, x2: b3.x, y2: b3.y, stroke: '#0B6B57', 'stroke-width': .6, opacity: .35 })); }
    if (perde === 5 || perde === 6) { s.appendChild(el('rect', { x: 300, y: 92, width: 300, height: 196, fill: 'none', stroke: '#0B6B57', 'stroke-width': 1.2 }));
      for (i = 0; i < 28; i++) s.appendChild(el('rect', { x: 300 + (i % 7) * (300 / 7), y: 92 + Math.floor(i / 7) * 49, width: 300 / 7 - 1.2, height: 47.8, fill: '#0B6B57', opacity: (0.08 + tohum(i + 3) * 0.16).toFixed(2) })); }
    return s;
  }
  [2, 3, 4, 5].forEach(function (idx) { var f = document.createElement('div'); f.className = 'stillfig'; f.appendChild(figur(idx)); says[idx].appendChild(f); });
  var not = document.createElement('p'); not.className = 'sub'; not.style.marginTop = '2rem';
  not.textContent = azHareket ? 'Hareket tercihiniz azaltılmış olduğu için alan durgun gösteriliyor. Anlatının, arayüz anlarının ve kontrollerin tamamı burada.'
    : 'Tarayıcınızda WebGL kullanılamadığı için alan durgun gösteriliyor. Anlatının, arayüz anlarının ve kontrollerin tamamı burada.';
  says[9].appendChild(not);
  document.getElementById('goYes').addEventListener('click', function () { says[9].scrollIntoView({ behavior: 'smooth' }); });
  document.getElementById('goAgain').addEventListener('click', function () { says[1].scrollIntoView({ behavior: 'smooth' }); });
  document.getElementById('yeni').addEventListener('click', function () { says[1].scrollIntoView({ behavior: 'smooth' }); });
}
})();
