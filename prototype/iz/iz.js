/* ══════════════════════════════════════════════════════════════════════
   İZ · EstateMatch
   Binlerce ihtimalin içinden bir iz.

   Sistem üç parçadan oluşur:
   1. ALAN   — gerçek EstateMatch bilgi kategorilerinden kurulmuş, kameranın
               içinden geçtiği tek bir mekân. Bölüm yok, kart yok.
   2. İZ     — ziyaretçinin yönlendirdiği, yay fiziğiyle gecikip savrulan
               niyet ipliği. 2. perdede yanar, son kareye kadar sahnededir.
               Yakınından geçtiği her kanıtı yakar ve kaydeder.
   3. EŞİK   — klimaks. Fotoğraf kırıkları tek bir mülke kilitlenir; gerekçe
               ziyaretçinin geçtiği kanıtlarla, EstateMatch'in bulduğu ama
               ziyaretçinin hiç geçmediği kanıtlardan birlikte kurulur.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

var T = window.THREE;
var kok = document.documentElement;

/* ───────────────────── PERDELER ─────────────────────
   h = viewport yüksekliği cinsinden scroll payı.
   Zirve (eşik) en geniş payı alır; ondan önceki perde en dar olanıdır. */
var PERDE = [
  { id: 'alan',      h: 1.5, u: 0.000 },
  { id: 'niyet',     h: 1.5, u: 0.150 },
  { id: 'yaniltici', h: 1.4, u: 0.300 },
  { id: 'bag',       h: 1.5, u: 0.435 },
  { id: 'elenme',    h: 1.2, u: 0.580 },
  { id: 'esik',      h: 2.6, u: 0.700 },
  { id: 'insan',     h: 1.4, u: 0.860 },
  { id: 'davet',     h: 1.3, u: 0.930 }
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

/* Klimaksta EstateMatch'in bulduğu, ziyaretçinin cümlesinde geçmeyen kanıtlar. */
var BULUNAN = [
  ['SOKAK RİTMİ', 'Çıkmaz sokak · 07-09 arası transit yok'],
  ['SABAH IŞIĞI', 'Karşı bina 34 m · kışın bile gölgesiz'],
  ['GÜNLÜK AKIŞ', 'Market 90 m · eczane 180 m · park 220 m'],
  ['DAVRANIŞ', 'Aynı profildeki 3 müşteri bu sokakta karar verdi']
];
/* Dürüst taraf: karşılanmayanlar gizlenmez. */
var KARSILANMAYAN = [
  ['ODA', '2+1 yazdınız. Bu daire 2+1, ama salon 3+1 kullanımına kapalı.'],
  ['BÜTÇE', '17,8 mn + 400 bin yenileme. Yazdığınız sınırın üstünde.']
];

var CUMLE = '“Nişantaşı’na yakın olsun, 2+1 yeter, sabahları güneş görsün, çocuk okula yürüsün. Bütçem 18 milyon.”';

/* Sürekli renk gradı: perdeler arası kesme yok, tek bir akış. */
var GRAD = [
  /* u,     zemin,     sis,       murekkep */
  [0.00, 0x05090A, 0x05090A, 0xEDE7DA],
  [0.16, 0x060D10, 0x071016, 0xEDE7DA],
  [0.31, 0x0B0A08, 0x140F0A, 0xF2E9D8],  /* yanıltıcı sıcaklık */
  [0.45, 0x040C11, 0x061119, 0xE6EFF2],  /* ilişkiler soğur */
  [0.60, 0x070809, 0x0A0C0D, 0xDCD9D2],  /* eleme: rengi çekilir */
  [0.76, 0x04100D, 0x061A15, 0xF3EEE2],  /* eşik: tek gerçek zümrüt */
  [0.88, 0x0E1512, 0x1B241F, 0xF6F2E8],
  [1.00, 0x1A211C, 0x2A342D, 0xF8F5ED]
];

/* ───────────────────── SCROLL SÜRÜCÜSÜ ───────────────────── */
var toplamH = 0;
PERDE.forEach(function (p) { toplamH += p.h; });

var story = document.getElementById('story');
PERDE.forEach(function (p) {
  var d = document.createElement('div');
  d.className = 'pane';
  d.style.height = (p.h * 100) + 'svh';
  d.dataset.act = p.id;
  story.appendChild(d);
});

var P = 0, Pham = 0;        /* yumuşatılmış / ham genel ilerleme */
function okuScroll() {
  var max = document.documentElement.scrollHeight - window.innerHeight;
  Pham = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}

/* Perde yerel ilerlemesi */
function perdeP(i) {
  var a = 0, j;
  for (j = 0; j < i; j++) a += PERDE[j].h;
  var s = a / toplamH, e = (a + PERDE[i].h) / toplamH;
  return Math.min(1, Math.max(0, (P - s) / (e - s)));
}
function kapi(x, a, b) { return Math.min(1, Math.max(0, (x - a) / (b - a))); }
function yumusa(x) { return x * x * (3 - 2 * x); }
function karis(a, b, t) { return a + (b - a) * t; }

/* ───────────────────── SES (perde metinleri) ───────────────────── */
var sesler = [].slice.call(document.querySelectorAll('.say'));
var utterEl = document.getElementById('utter');
var meterN = document.getElementById('meterN');
var meterL = document.getElementById('meterL');
var reasonEl = document.getElementById('reason');
var hintEl = document.getElementById('hint');

function bicim(n) { return Math.round(n).toLocaleString('tr-TR'); }

/* ───────────────────── WEBGL YOK / HAREKET AZALTILMIŞ ───────────────────── */
var azHareket = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function glVar() {
  try {
    var c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

if (azHareket || !glVar() || !T) { durgunKur(); return; }
kok.className = 'live';

/* ══════════════════════════════════════════════════════════════════════
   SAHNE
   ══════════════════════════════════════════════════════════════════════ */
var cv = document.getElementById('gl');
var ren = new T.WebGLRenderer({ canvas: cv, antialias: false, alpha: false, powerPreference: 'high-performance' });
var mobil = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;
var DPR = Math.min(window.devicePixelRatio || 1, mobil ? 1.6 : 2);
ren.setPixelRatio(DPR);
ren.setClearColor(0x05090A, 1);
if (T.sRGBEncoding !== undefined) ren.outputEncoding = T.sRGBEncoding;
else if (T.SRGBColorSpace !== undefined) ren.outputColorSpace = T.SRGBColorSpace;

var sahne = new T.Scene();
sahne.fog = new T.FogExp2(0x05090A, 0.0085);
var kam = new T.PerspectiveCamera(58, 1, 0.5, 720);

/* ─────────── KAMERA YOLU ───────────
   Son üçte biri düz: eşik düzlemi eksen hizalı kurulabilsin diye. */
var yol = new T.CatmullRomCurve3([
  new T.Vector3(0, 6, 40), new T.Vector3(-14, 2, -30), new T.Vector3(12, -4, -104),
  new T.Vector3(-8, 5, -178), new T.Vector3(6, 1, -252), new T.Vector3(-3, -2, -322),
  new T.Vector3(0, 0, -392), new T.Vector3(0, 0, -452), new T.Vector3(0, 0, -510),
  new T.Vector3(0, 0, -560)
]);
yol.curveType = 'catmullrom'; yol.tension = 0.4;

/* Eşik istasyonu: klimaks düzlemi burada kurulur. */
var U_ESIK = 0.800;
var esikNok = yol.getPointAt(U_ESIK);
var mobilOn = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;
var ESIK_MERKEZ = new T.Vector3(
  esikNok.x,
  esikNok.y + (mobilOn ? 5.6 : 0.5),
  esikNok.z - (mobilOn ? 31 : 26));

/* ─────────── ALAN: kanıt evreni ─────────── */
var N = mobil ? 1500 : 3700;
var N_YANLIS = 247;   /* filtreye birebir uyanlar */
var N_BAG = mobil ? 90 : 190;  /* ilişki düğümleri */
var N_KALAN = 8;      /* gerekçeye dönüşen kanıtlar */
var N_ESIK = 28;      /* mülkü kuran fotoğraf kırıkları (7x4) */

function rnd(s) { var x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

var iPos = new Float32Array(N * 3), iTar = new Float32Array(N * 3);
var iRot = new Float32Array(N * 2), iSize = new Float32Array(N * 2);
var iSeed = new Float32Array(N), iKind = new Float32Array(N), iRole = new Float32Array(N);
var iUV = new Float32Array(N * 4);
var cpuPos = [];   /* etiket izdüşümü için CPU kopyası */

/* Rol dağıtımı: yazarlı, rastgele değil. */
var roller = new Float32Array(N);
var i, k;
for (i = 0; i < N; i++) roller[i] = 0;
/* Yanıltıcılar yolun ilk yarısına, kameraya yakın kuşağa yerleşir. */
var sayac = 0;
for (i = 0; i < N && sayac < N_YANLIS; i += 3) { roller[i] = 1; sayac++; }
for (i = 5; i < N && N_BAG > 0; i += 17) { if (roller[i] === 0) { roller[i] = 2; N_BAG--; } }
var kalanIdx = [], esikIdx = [];
for (i = 0; i < N_KALAN; i++) { var q = 40 + i * 7; roller[q] = 3; kalanIdx.push(q); }
for (i = 0; i < N_ESIK; i++) { var q2 = 400 + i * 11; roller[q2] = 4; esikIdx.push(q2); }

for (i = 0; i < N; i++) {
  var s = i / N, r1 = rnd(i + 1), r2 = rnd(i + 91), r3 = rnd(i + 401), r4 = rnd(i + 777);
  /* Yol boyunca uzanan bir koridor; kesitte şehir benzeri dağılım */
  var z = 46 - s * 640 - r1 * 22;
  var yari = 26 + 30 * Math.sin(s * 3.1);
  var ac = rnd(i * 7 + 555) * Math.PI * 2;
  var yc = Math.pow(r3, 0.62) * yari;
  var x = Math.cos(ac) * yc, y = Math.sin(ac) * yc * 0.62 + (r4 - 0.5) * 14;
  /* merkez koridoru boş bırak: kamera içinden geçebilsin */
  var d = Math.sqrt(x * x + y * y);
  var bos = 13 + 9 * Math.max(0, 1 - s * 5);          /* açılışta koridor daha geniş */
  if (d < bos) { var m = (bos + r4 * 5) / (d + 0.01); x *= m; y *= m; }

  iPos[i * 3] = x; iPos[i * 3 + 1] = y; iPos[i * 3 + 2] = z;
  cpuPos.push(new T.Vector3(x, y, z));

  var rol = roller[i];
  iRole[i] = rol;
  iSeed[i] = r1;
  /* Tür seçimi konumdan bağımsız bir akıştan gelir; aksi hâlde halkalar
     tek bir açıda kümeleniyor ve alan tek yandan duvar gibi okunuyordu. */
  var rk = rnd(i * 3 + 1213);

  /* Tür: cephe / plan / halka / kırık — hepsi gerçek bir bilgi kategorisi */
  var kind;
  if (rol === 4) kind = 3;
  else if (rk < 0.40) kind = 0;
  else if (rk < 0.78) kind = 1;
  else if (rk < 0.88) kind = 2;
  else kind = 0;
  iKind[i] = kind;

  /* Şehir gibi okusun: çoğu eksene hizalı, azı sapmış */
  var hiz = rk < 0.72 ? Math.round(r4 * 4) * (Math.PI / 2) : r4 * Math.PI * 2;
  iRot[i * 2] = (r1 - 0.5) * 0.5;
  iRot[i * 2 + 1] = hiz;

  var sc = 1;
  if (kind === 0) { iSize[i * 2] = 1.5 + r3 * 1.6; iSize[i * 2 + 1] = 4.5 + r4 * 7.5; }
  else if (kind === 1) { iSize[i * 2] = 2.2 + r3 * 2.0; iSize[i * 2 + 1] = iSize[i * 2]; }
  else { iSize[i * 2] = 2.8 + r4 * 4.2; iSize[i * 2 + 1] = iSize[i * 2]; }

  /* Atlas penceresi: kırıklar gerçek mülk fotoğrafından beslenir */
  iUV[i * 4] = (r2 < 0.5 ? 0 : 0.5) + r3 * 0.34;
  iUV[i * 4 + 1] = (r3 < 0.5 ? 0 : 0.5) + r4 * 0.34;
  iUV[i * 4 + 2] = 0.14; iUV[i * 4 + 3] = 0.14;

  iTar[i * 3] = x; iTar[i * 3 + 1] = y; iTar[i * 3 + 2] = z;
}

/* Eşik düzlemi: 28 kırık, Maçka hücresini (atlas 0,0-.5,.5) yeniden kurar */
var GW = 7, GH = 4, PW = mobilOn ? 11.6 : 19.6, PH = mobilOn ? 7.7 : 13.0;
for (i = 0; i < N_ESIK; i++) {
  var id = esikIdx[i], cx = i % GW, cy = Math.floor(i / GW);
  iTar[id * 3] = ESIK_MERKEZ.x + (cx - (GW - 1) / 2) * (PW / GW);
  iTar[id * 3 + 1] = ESIK_MERKEZ.y - (cy - (GH - 1) / 2) * (PH / GH);
  iTar[id * 3 + 2] = ESIK_MERKEZ.z;
  iSize[id * 2] = PW / GW + 0.012; iSize[id * 2 + 1] = PH / GH + 0.012;
  /* Doku flipY ile yüklenir: atlasın sol-üst karesi (Maçka) V'de üst yarıda kalır. */
  iUV[id * 4] = (cx / GW) * 0.5; iUV[id * 4 + 1] = 1.0 - ((cy + 1) / GH) * 0.5;
  iUV[id * 4 + 2] = 0.5 / GW; iUV[id * 4 + 3] = 0.5 / GH;
  /* Kırıklar alanın içinde dağınık başlar, eşikte kilitlenir */
  var aa = (i / N_ESIK) * Math.PI * 2, rr = 40 + rnd(id) * 46;
  iPos[id * 3] = ESIK_MERKEZ.x + Math.cos(aa) * rr;
  iPos[id * 3 + 1] = ESIK_MERKEZ.y + Math.sin(aa) * rr * 0.7;
  iPos[id * 3 + 2] = ESIK_MERKEZ.z + (rnd(id + 5) - 0.5) * 150;
  cpuPos[id].set(iPos[id * 3], iPos[id * 3 + 1], iPos[id * 3 + 2]);
}
/* Kalan 8 kanıt: eşik düzleminin çevresinde yörüngeye oturur.
   Yuvaları da zirvenin yakınındadır; yolculukları kamerayı kesmez. */
var kalanNok = new T.Vector3();
for (i = 0; i < N_KALAN; i++) {
  var kid0 = kalanIdx[i];
  yol.getPointAt(0.60 + (i / N_KALAN) * 0.13, kalanNok);
  var kga = rnd(kid0 * 31 + 7) * Math.PI * 2, kgr = 26 + rnd(kid0 * 17) * 22;
  iPos[kid0 * 3] = kalanNok.x + Math.cos(kga) * kgr;
  iPos[kid0 * 3 + 1] = kalanNok.y + Math.sin(kga) * kgr * 0.7;
  iPos[kid0 * 3 + 2] = kalanNok.z - 20 - rnd(kid0 * 13) * 40;
  cpuPos[kid0].set(iPos[kid0 * 3], iPos[kid0 * 3 + 1], iPos[kid0 * 3 + 2]);
}
for (i = 0; i < N_KALAN; i++) {
  var kid = kalanIdx[i], ka = (i / N_KALAN) * Math.PI * 2 - 0.4;
  iTar[kid * 3] = ESIK_MERKEZ.x + Math.cos(ka) * (mobilOn ? 9.2 : 17.4);
  iTar[kid * 3 + 1] = ESIK_MERKEZ.y + Math.sin(ka) * (mobilOn ? 6.6 : 8.4);
  iTar[kid * 3 + 2] = ESIK_MERKEZ.z + 5;
  iSize[kid * 2] = mobilOn ? 1.0 : 1.5; iSize[kid * 2 + 1] = iSize[kid * 2]; iKind[kid] = 2;
}

/* ─────────── ALAN MATERYALİ ───────────
   Her kırık türü kabuk shader'ında çizilir: cephe pencere ızgarası, plan
   çizgisi, mesafe halkası, fotoğraf kırığı. Doku atlası yalnızca kırıklar
   için okunur; gerisi prosedüreldir, dolayısıyla bellek maliyeti yoktur. */
var atlas = new T.TextureLoader().load(window.IZ_ATLAS);
if (T.SRGBColorSpace !== undefined) atlas.colorSpace = T.SRGBColorSpace;
else if (T.sRGBEncoding !== undefined) atlas.encoding = T.sRGBEncoding;
atlas.minFilter = T.LinearFilter; atlas.generateMipmaps = false;

var U = {
  uT: { value: 0 },
  uWake: { value: 0 }, uFalse: { value: 0 }, uRelate: { value: 0 },
  uCull: { value: 0 }, uAsm: { value: 0 }, uSettle: { value: 0 },
  uAtlas: { value: atlas },
  uHead: { value: new T.Vector3(0, 0, 40) },
  uInk: { value: new T.Color(0xEDE7DA) },
  uFog: { value: new T.Color(0x05090A) },
  uFogD: { value: 0.0085 },
  uWarm: { value: new T.Color(0xE8B25F) },
  uCool: { value: new T.Color(0x8FD8E8) },
  uGreen: { value: new T.Color(0x2FBF95) }
};

var ORTAK = [
  'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'vec3 rotXY(vec3 p,float rx,float ry){',
  '  float cx=cos(rx),sx=sin(rx); p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);',
  '  float cy=cos(ry),sy=sin(ry); return vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);}' 
].join('\n');

var VS = [
  'precision highp float;',
  'attribute vec3 position; attribute vec2 uv;',
  'attribute vec3 iPos; attribute vec3 iTar; attribute vec2 iRot; attribute vec2 iSize;',
  'attribute float iSeed; attribute float iKind; attribute float iRole; attribute vec4 iUV;',
  'uniform mat4 modelViewMatrix, projectionMatrix; uniform mat3 normalMatrix;',
  'uniform float uT,uWake,uFalse,uRelate,uCull,uAsm,uSettle; uniform vec3 uHead;',
  'varying vec2 vUv; varying float vKind,vRole,vSeed,vGlow,vFogF,vAsm,vNear;',
  'varying vec4 vRect;',
  ORTAK,
  'void main(){',
  '  vUv=uv; vKind=iKind; vRole=iRole; vSeed=iSeed; vRect=iUV;',
  '  float esik = step(3.5,iRole);',
  '  float kalan = step(2.5,iRole);',
  '  float kur = uAsm*esik;',
  '  float orb = uAsm*kalan*(1.0-esik);',
  '  float t = max(kur,orb);',
  '  vAsm=t;',
  /* konum: yuva -> sürüklenme -> eleme -> kilitlenme */
  '  vec3 wp=iPos;',
  '  float dr = 0.55 + iSeed*0.9;',
  '  wp += vec3(sin(uT*0.19+iSeed*39.1), cos(uT*0.15+iSeed*21.7), sin(uT*0.11+iSeed*13.3))*dr;',
  /* niyet uyanınca alan hafifçe koridora yaslanır */
  '  wp.xy *= 1.0 - uWake*0.045;',
  /* eleme: kalmayanlar dışarı çekilir ve söner */
  '  float dead = (1.0-kalan)*uCull;',
  '  vec2 dir = normalize(iPos.xy + vec2(0.001));',
  '  wp.xy += dir*dead*dead*128.0;',
  '  wp = mix(wp, iTar, smoothstep(0.0,1.0,t));',
  /* yerel köşe: eşikte dönüş düzleşir, mülk kameraya bakar */
  '  vec3 p = vec3(position.xy*iSize, 0.0);',
  '  vec3 pr = rotXY(p, iRot.x, iRot.y);',
  '  p = mix(pr, p, smoothstep(0.0,1.0,t));',
  '  p *= (1.0 - dead*0.55);',
  '  vec4 mv = modelViewMatrix * vec4(wp + p, 1.0);',
  /* izin başı yakınsa kanıt yanar */
  '  float dh = distance(wp, uHead);',
  '  vGlow = smoothstep(26.0, 4.0, dh) * uWake * (1.0 - step(2.5, iRole)) * (1.0 - uAsm);',
  '  vFogF = 1.0 - exp(-pow(max(-mv.z,0.0)*0.0088,1.7));',
  '  vNear = smoothstep(1.2, 9.0, -mv.z);',
  '  gl_Position = projectionMatrix * mv;',
  '}'
].join('\n');

var FS = [
  'precision highp float;',
  'uniform sampler2D uAtlas; uniform vec3 uInk,uFog,uWarm,uCool,uGreen;',
  'uniform float uT,uFalse,uRelate,uCull,uAsm,uSettle,uWake;',
  'varying vec2 vUv; varying float vKind,vRole,vSeed,vGlow,vFogF,vAsm,vNear; varying vec4 vRect;',
  ORTAK,
  'float cizgi(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}',
  'void main(){',
  '  vec3 c = uInk; float a = 0.0;',
  '  if(vKind < 0.5){',                       /* CEPHE: pencere ızgarası */
  '    vec2 g = vUv*vec2(3.0,7.0); vec2 f = fract(g);',
  '    float w = step(0.2,f.x)*step(f.x,0.8)*step(0.18,f.y)*step(f.y,0.8);',
  '    float lit = step(0.58, hash(floor(g)+vSeed*57.0));',
  '    float kenar = 1.0-step(0.028,min(min(vUv.x,1.0-vUv.x),min(vUv.y,1.0-vUv.y)));',
  '    a = 0.035 + w*(0.07+lit*0.42) + kenar*0.15;',
  '  } else if(vKind < 1.5){',                /* PLAN: dik çizgi glifi */
  '    float s1 = 0.25+vSeed*0.5, s2 = 0.3+fract(vSeed*7.0)*0.45;',
  '    float d = cizgi(vUv, vec2(0.12,0.15), vec2(0.12,s2));',
  '    d = min(d, cizgi(vUv, vec2(0.12,s2), vec2(s1,s2)));',
  '    d = min(d, cizgi(vUv, vec2(s1,s2), vec2(s1,0.86)));',
  '    d = min(d, cizgi(vUv, vec2(0.12,0.15), vec2(0.8,0.15)));',
  '    a = smoothstep(0.05,0.008,d)*0.62;',
  '  } else if(vKind < 2.5){',                /* HALKA: yürüme mesafesi */
  '    float r = length(vUv-0.5);',
  '    a = smoothstep(0.028,0.004,abs(r-0.40))*0.55;',
  '    a += smoothstep(0.02,0.0,abs(r-0.17))*0.28;',
  '  } else {',                               /* KIRIK: gerçek fotoğraf */
  '    vec4 tx = texture2D(uAtlas, vRect.xy + vUv*vRect.zw);',
  '    float dus = 1.0-step(0.985,max(abs(vUv.x-0.5),abs(vUv.y-0.5))*2.0);',
  '    c = tx.rgb; a = 0.52 + vAsm*0.48; c = mix(vec3(dot(c,vec3(0.33)))*1.75, c, 0.20+vAsm*0.80);',
  '    a *= dus;',
  '  }',
  /* rol renklendirmesi: anlatı buradan akar */
  '  if(vRole > 0.5 && vRole < 1.5){',        /* yanıltıcı: önce çeker, sonra söner */
  '    c = mix(c, uWarm, 0.20+uFalse*0.72); a *= 1.0 + uFalse*1.5;',
  '  }',
  '  if(vRole > 1.5 && vRole < 2.5){ c = mix(c, uCool, 0.25+uRelate*0.7); a *= 1.0+uRelate*1.15; }',
  '  if(vRole > 2.5 && vKind < 2.5){ c = mix(c, uGreen, 0.30+uAsm*0.5); a *= 1.5+uAsm*1.4; }',
  '  if(vKind > 2.5) c *= (1.0 + vAsm*0.22);',
  '  c += vGlow*0.85; a += vGlow*0.30;',
  '  a *= (1.0 - uCull*uCull*(1.0-step(2.5,vRole))*0.93);',
  '  a *= (1.0 - uRelate*0.58*(1.0-uCull)*(1.0-step(1.5,vRole)));',
  '  a *= (1.0 - vFogF) * vNear;',
  '  if(a < 0.004) discard;',
  '  gl_FragColor = vec4(mix(uFog,c,clamp(a*1.9,0.0,1.0)), clamp(a,0.0,1.0));',
  '}'
].join('\n');

var geo = new T.InstancedBufferGeometry();
var pg = new T.PlaneGeometry(1, 1);
geo.setAttribute('position', pg.getAttribute('position'));
geo.setAttribute('uv', pg.getAttribute('uv'));
geo.setIndex(pg.getIndex());
geo.setAttribute('iPos', new T.InstancedBufferAttribute(iPos, 3));
geo.setAttribute('iTar', new T.InstancedBufferAttribute(iTar, 3));
geo.setAttribute('iRot', new T.InstancedBufferAttribute(iRot, 2));
geo.setAttribute('iSize', new T.InstancedBufferAttribute(iSize, 2));
geo.setAttribute('iSeed', new T.InstancedBufferAttribute(iSeed, 1));
geo.setAttribute('iKind', new T.InstancedBufferAttribute(iKind, 1));
geo.setAttribute('iRole', new T.InstancedBufferAttribute(iRole, 1));
geo.setAttribute('iUV', new T.InstancedBufferAttribute(iUV, 4));
geo.instanceCount = N;
geo.boundingSphere = new T.Sphere(new T.Vector3(0, 0, -280), 900);

var mat = new T.RawShaderMaterial({
  uniforms: U, vertexShader: VS, fragmentShader: FS,
  transparent: true, depthWrite: false, depthTest: true,
  blending: T.NormalBlending, side: T.DoubleSide
});
var alan = new T.Mesh(geo, mat);
alan.frustumCulled = false;
sahne.add(alan);

/* ─────────── SİNYAL ZERRELERİ ───────────
   Tek tek nitelik sinyalleri. Ölçek duygusunu bunlar taşır. */
var NM = mobil ? 900 : 2400;
var mPos = new Float32Array(NM * 3), mSeed = new Float32Array(NM), mKal = new Float32Array(NM);
for (i = 0; i < NM; i++) {
  var ms = i / NM, mr1 = rnd(i + 3001), mr2 = rnd(i + 6007), mr3 = rnd(i + 9011);
  var mz = 46 - ms * 640 - mr1 * 26;
  var ma = mr2 * Math.PI * 2, mrad = 9 + Math.pow(mr3, 0.5) * (30 + 26 * Math.sin(ms * 3.1));
  mPos[i * 3] = Math.cos(ma) * mrad;
  mPos[i * 3 + 1] = Math.sin(ma) * mrad * 0.62 + (mr1 - 0.5) * 12;
  mPos[i * 3 + 2] = mz;
  mSeed[i] = mr1; mKal[i] = mr2 < 0.02 ? 1 : 0;
}
var mgeo = new T.BufferGeometry();
mgeo.setAttribute('position', new T.BufferAttribute(mPos, 3));
mgeo.setAttribute('aSeed', new T.BufferAttribute(mSeed, 1));
mgeo.setAttribute('aKal', new T.BufferAttribute(mKal, 1));
mgeo.boundingSphere = new T.Sphere(new T.Vector3(0, 0, -280), 900);
var mmat = new T.ShaderMaterial({
  uniforms: U, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
  vertexShader: [
    'attribute float aSeed, aKal;',
    'uniform float uT,uCull,uWake,uAsm; uniform vec3 uHead;',
    'varying float vA;',
    'void main(){',
    '  vec3 wp = position;',
    '  wp += vec3(sin(uT*0.23+aSeed*61.0),cos(uT*0.19+aSeed*33.0),0.0)*0.9;',
    '  float dead=(1.0-aKal)*uCull;',
    '  wp.xy += normalize(position.xy+vec2(0.001))*dead*dead*132.0;',
    '  vec4 mv = modelViewMatrix*vec4(wp,1.0);',
    '  float dh = distance(wp,uHead);',
    '  float glow = smoothstep(30.0,3.0,dh)*uWake;',
    '  float fog = 1.0-exp(-pow(max(-mv.z,0.0)*0.0088,1.7));',
    '  vA = (0.30+glow*0.9)*(1.0-fog)*(1.0-dead*dead*0.985)*(1.0-uAsm*0.55)*smoothstep(1.2,9.0,-mv.z);',
    '  gl_PointSize = (1.6+glow*4.5)*(300.0/max(-mv.z,1.0));',
    '  gl_Position = projectionMatrix*mv;',
    '}'
  ].join('\n'),
  fragmentShader: [
    'precision highp float; uniform vec3 uInk,uGreen; uniform float uAsm; varying float vA;',
    'void main(){',
    '  float d = length(gl_PointCoord-0.5);',
    '  if(d>0.5) discard;',
    '  float a = vA*smoothstep(0.5,0.05,d);',
    '  gl_FragColor = vec4(mix(uInk,uGreen,uAsm*0.5)*a, a);',
    '}'
  ].join('\n')
});
var zerre = new T.Points(mgeo, mmat);
zerre.frustumCulled = false;
sahne.add(zerre);

/* ─────────── İLİŞKİLER ───────────
   Görünmeyen bağ: anahtar kelime paylaşmayan ama davranış ve çevre verisinde
   akraba çıkan kanıtlar arasında kurulan ağ. Perde 4'te açılır.

   Düğümler kameranın o perdede geçtiği koridor parçasına toplanır. Alana
   eşit dağıtıldıklarında ağ hiçbir zaman tek kadrajda görünmüyordu; burada
   ölçek değil, ilişkinin kendisi anlatılıyor. */
var yanIdx = [];
for (i = 0; i < N; i++) if (iRole[i] === 1) yanIdx.push(i);
var yanNok = new T.Vector3();
for (i = 0; i < yanIdx.length; i++) {
  var yi = yanIdx[i];
  var yu = 0.225 + (i / yanIdx.length) * 0.40;        /* filtre perdesinden eleme perdesine */
  yol.getPointAt(yu, yanNok);
  var ya = rnd(yi * 3 + 71) * Math.PI * 2;
  var yr = 11 + Math.pow(rnd(yi * 9 + 23), 0.62) * 30;
  iPos[yi * 3] = yanNok.x + Math.cos(ya) * yr;
  iPos[yi * 3 + 1] = yanNok.y + Math.sin(ya) * yr * 0.7;
  iPos[yi * 3 + 2] = yanNok.z + (rnd(yi * 7 + 13) - 0.5) * 58;
  iTar[yi * 3] = iPos[yi * 3]; iTar[yi * 3 + 1] = iPos[yi * 3 + 1]; iTar[yi * 3 + 2] = iPos[yi * 3 + 2];
  cpuPos[yi].set(iPos[yi * 3], iPos[yi * 3 + 1], iPos[yi * 3 + 2]);
}

var bagIdx = [];
for (i = 0; i < N; i++) if (iRole[i] === 2) bagIdx.push(i);
var bagNok = new T.Vector3();
for (i = 0; i < bagIdx.length; i++) {
  var bi = bagIdx[i];
  var uu = 0.405 + (i / bagIdx.length) * 0.185;      /* 4. perdenin kamera aralığı */
  yol.getPointAt(uu, bagNok);
  var ba = rnd(bi * 5 + 17) * Math.PI * 2;
  var br = 15 + Math.pow(rnd(bi * 11 + 29), 0.7) * 27;
  iPos[bi * 3] = bagNok.x + Math.cos(ba) * br;
  iPos[bi * 3 + 1] = bagNok.y + Math.sin(ba) * br * 0.72;
  iPos[bi * 3 + 2] = bagNok.z + (rnd(bi * 13 + 41) - 0.5) * 46;
  iTar[bi * 3] = iPos[bi * 3]; iTar[bi * 3 + 1] = iPos[bi * 3 + 1]; iTar[bi * 3 + 2] = iPos[bi * 3 + 2];
  cpuPos[bi].set(iPos[bi * 3], iPos[bi * 3 + 1], iPos[bi * 3 + 2]);
  iKind[bi] = rnd(bi * 17 + 3) < 0.5 ? 1 : 2;
  iSize[bi * 2] = 2.0 + rnd(bi * 19) * 1.6; iSize[bi * 2 + 1] = iSize[bi * 2];
}
var ciftler = [];
for (i = 0; i < bagIdx.length; i++) {
  var a1 = bagIdx[i];
  for (k = i + 1; k < bagIdx.length && ciftler.length < 560; k++) {
    var b1 = bagIdx[k];
    var dx = iPos[a1 * 3] - iPos[b1 * 3], dy = iPos[a1 * 3 + 1] - iPos[b1 * 3 + 1], dz = iPos[a1 * 3 + 2] - iPos[b1 * 3 + 2];
    var dd = dx * dx + dy * dy + dz * dz;
    if (dd < 2100 && dd > 120) ciftler.push([a1, b1]);
  }
}
var NC = ciftler.length;
var cPos = new Float32Array(NC * 6), cDel = new Float32Array(NC * 2);
for (i = 0; i < NC; i++) {
  var pa = ciftler[i][0], pb = ciftler[i][1];
  cPos[i * 6] = iPos[pa * 3]; cPos[i * 6 + 1] = iPos[pa * 3 + 1]; cPos[i * 6 + 2] = iPos[pa * 3 + 2];
  cPos[i * 6 + 3] = iPos[pb * 3]; cPos[i * 6 + 4] = iPos[pb * 3 + 1]; cPos[i * 6 + 5] = iPos[pb * 3 + 2];
  var dl = i / NC; cDel[i * 2] = dl; cDel[i * 2 + 1] = dl;
}
var cgeo = new T.BufferGeometry();
cgeo.setAttribute('position', new T.BufferAttribute(cPos, 3));
cgeo.setAttribute('aDel', new T.BufferAttribute(cDel, 1));
cgeo.boundingSphere = new T.Sphere(new T.Vector3(0, 0, -280), 900);
var cmat = new T.ShaderMaterial({
  uniforms: U, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
  vertexShader: [
    'attribute float aDel; uniform float uRelate,uCull,uT; varying float vA;',
    'void main(){',
    '  vec4 mv = modelViewMatrix*vec4(position,1.0);',
    '  float fog = 1.0-exp(-pow(max(-mv.z,0.0)*0.0088,1.7));',
    '  float on = smoothstep(aDel*0.85, aDel*0.85+0.22, uRelate);',
    '  vA = on*(1.0-fog)*(1.0-uCull*0.95)*1.15;',
    '  gl_Position = projectionMatrix*mv;',
    '}'
  ].join('\n'),
  fragmentShader: 'precision highp float; uniform vec3 uCool; varying float vA; void main(){ if(vA<0.004) discard; gl_FragColor=vec4(uCool*vA,vA); }'
});
var aglar = new T.LineSegments(cgeo, cmat);
aglar.frustumCulled = false;
sahne.add(aglar);

/* ══════════════════════════════════════════════════════════════════════
   İZ — imza etkileşim
   Niyet ipliği. Kütlesi vardır: hedefe yay gibi asılır, gecikir, savrulur.
   2. perdede yanar ve son kareye kadar sahnededir. Yakınından geçtiği her
   kanıtı yakar; klimakste gerekçe bu kayıttan kurulur.
   ══════════════════════════════════════════════════════════════════════ */
var IZ_N = 190;
var IZ_SEG = 0.30;        /* düğümler arası sabit dünya uzunluğu: iz ~57 birim */
var izGec = [];                                   /* geçmiş noktalar */
var izBas = new T.Vector3(0, 0, 40);
var izHiz = new T.Vector3();
for (i = 0; i < IZ_N; i++) izGec.push(new T.Vector3(0, 0, 40 + i * 0.6));

var izPos = new Float32Array(IZ_N * 2 * 3), izT = new Float32Array(IZ_N * 2);
var izIdx = [];
for (i = 0; i < IZ_N - 1; i++) {
  var o = i * 2;
  izIdx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
}
for (i = 0; i < IZ_N; i++) { izT[i * 2] = i / (IZ_N - 1); izT[i * 2 + 1] = i / (IZ_N - 1); }
var izGeo = new T.BufferGeometry();
izGeo.setAttribute('position', new T.BufferAttribute(izPos, 3).setUsage(T.DynamicDrawUsage));
izGeo.setAttribute('aT', new T.BufferAttribute(izT, 1));
izGeo.setIndex(izIdx);
izGeo.boundingSphere = new T.Sphere(new T.Vector3(0, 0, -280), 900);
var izMat = new T.ShaderMaterial({
  uniforms: U, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
  vertexShader: [
    'attribute float aT; uniform float uWake,uT,uAsm,uSettle; varying float vT,vF;',
    'void main(){ vT=aT; vec4 mv=modelViewMatrix*vec4(position,1.0);',
    ' vF=1.0-exp(-pow(max(-mv.z,0.0)*0.0088,1.7));',
    ' gl_Position=projectionMatrix*mv; }'
  ].join('\n'),
  fragmentShader: [
    'precision highp float; uniform vec3 uGreen,uInk,uWarm; uniform float uWake,uT,uAsm,uSettle;',
    'varying float vT,vF;',
    'void main(){',
    '  float bas = smoothstep(0.62,1.0,vT);',        /* baş parlak, kuyruk sönük */
    '  float nabiz = 0.72+0.28*sin(vT*34.0 - uT*3.4);',
    '  float a = (0.045+bas*1.25)*nabiz*uWake*(1.0-vF)*(1.0-uSettle*0.86)*(1.0-uAsm*0.45)*smoothstep(0.0,0.14,vT);',
    '  vec3 c = mix(uGreen, mix(uInk,uWarm,uAsm*0.5), bas*0.55);',
    '  if(a<0.004) discard;',
    '  gl_FragColor = vec4(c*a, a);',
    '}'
  ].join('\n')
});
var iz = new T.Mesh(izGeo, izMat);
iz.frustumCulled = false;
sahne.add(iz);

/* İmleç / dokunuş: iz buradan yönlendirilir */
var pX = 0, pY = 0, pTX = 0, pTY = 0, dokundu = false;
window.addEventListener('pointermove', function (e) {
  pTX = (e.clientX / window.innerWidth) * 2 - 1;
  pTY = -((e.clientY / window.innerHeight) * 2 - 1);
  if (e.pointerType !== 'touch') dokundu = true;
}, { passive: true });
window.addEventListener('touchmove', function (e) {
  if (!e.touches.length) return;
  pTX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
  pTY = -((e.touches[0].clientY / window.innerHeight) * 2 - 1);
  dokundu = true;
}, { passive: true });

/* Geçilen kanıtların kaydı */
var gecilen = [];      /* {idx, kanit} */
var gecSet = {};
function kaydet(idx) {
  if (gecSet[idx]) return;
  gecSet[idx] = 1;
  gecilen.push({ i: idx, k: KANIT[idx % KANIT.length] });
  if (gecilen.length > 40) gecilen.shift();
}

/* ══════════════════════════════════════════════════════════════════════
   KAMERA, GRAD VE DÖNGÜ
   ══════════════════════════════════════════════════════════════════════ */
var U_AT = [0, 0.15, 0.30, 0.435, 0.58, 0.70, 0.800, 0.815];
var U_SON = 0.815;

function egriU() {
  var acc = 0, i2;
  for (i2 = 0; i2 < PERDE.length; i2++) {
    var s = acc / toplamH, e = (acc + PERDE[i2].h) / toplamH;
    acc += PERDE[i2].h;
    if (P <= e || i2 === PERDE.length - 1) {
      var l = Math.min(1, Math.max(0, (P - s) / (e - s)));
      var a = U_AT[i2], b = (i2 < U_AT.length - 1) ? U_AT[i2 + 1] : U_SON;
      /* eşiğe girerken yavaşla: kamera varır ve durur */
      if (i2 === 5) l = 1 - Math.pow(1 - l, 2.6);
      if (i2 === 6) l = yumusa(l);
      return karis(a, b, l);
    }
  }
  return U_SON;
}

var c1 = new T.Color(), c2 = new T.Color(), cTmp = new T.Color();
function gradAl(u, dizin, hedef) {
  var i3;
  for (i3 = 0; i3 < GRAD.length - 1; i3++) {
    if (u <= GRAD[i3 + 1][0] || i3 === GRAD.length - 2) {
      var t = (u - GRAD[i3][0]) / (GRAD[i3 + 1][0] - GRAD[i3][0]);
      t = Math.min(1, Math.max(0, t));
      c1.setHex(GRAD[i3][dizin]); c2.setHex(GRAD[i3 + 1][dizin]);
      hedef.copy(c1).lerp(c2, t);
      return hedef;
    }
  }
  return hedef;
}

/* Etiket havuzu: 3B'den izdüşen gerçek HTML metni */
var marksEl = document.getElementById('marks');
var MARK_N = mobil ? 3 : 6;
var marklar = [];
for (i = 0; i < MARK_N + 8; i++) {
  var md = document.createElement('div');
  md.className = 'mark';
  md.innerHTML = '<b></b><span></span>';
  marksEl.appendChild(md);
  marklar.push({ el: md, b: md.querySelector('b'), s: md.querySelector('span'), idx: -1, on: false });
}
var wiresEl = document.getElementById('wires');
var teller = [];
for (i = 0; i < 8; i++) {
  var ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  ln.setAttribute('stroke-width', '1');
  ln.setAttribute('opacity', '0');
  wiresEl.appendChild(ln);
  teller.push(ln);
}

var pv = new T.Vector3();
function izdusum(v) {
  pv.copy(v).project(kam);
  return { x: (pv.x * 0.5 + 0.5) * window.innerWidth, y: (-pv.y * 0.5 + 0.5) * window.innerHeight, z: pv.z };
}

/* Gerekçe listeleri */
var rVar = document.getElementById('rVar'), rBul = document.getElementById('rBul'), rYok = document.getElementById('rYok');
function liste(el, veri) {
  el.innerHTML = '';
  veri.forEach(function (d) {
    var li = document.createElement('li');
    li.innerHTML = '<b>' + d[0] + '</b>' + d[1];
    el.appendChild(li);
  });
}
liste(rBul, BULUNAN); liste(rYok, KARSILANMAYAN);
var sonVar = '';
function gerekceYaz() {
  var son = gecilen.slice(-4).map(function (g) { return g.k; });
  while (son.length < 4) son.push(KANIT[son.length * 5]);
  var imza = son.map(function (s) { return s[1]; }).join('|');
  if (imza === sonVar) return;
  sonVar = imza; liste(rVar, son);
}

/* Yazılan cümle */
var yaziIdx = 0, yaziSon = 0;
function cumleYaz(aktif, dt) {
  if (!aktif) return;
  yaziSon += dt;
  if (yaziSon > 0.018 && yaziIdx < CUMLE.length) {
    yaziSon = 0; yaziIdx += 1;
    utterEl.textContent = CUMLE.slice(0, yaziIdx);
    if (yaziIdx >= CUMLE.length) utterEl.classList.add('done');
  }
}

/* İnsan kararı: gerçek kontrol, gerçek sonuç */
function kaydir(actIdx, oran) {
  var acc = 0, j2;
  for (j2 = 0; j2 < actIdx; j2++) acc += PERDE[j2].h;
  var hedef = ((acc + PERDE[actIdx].h * (oran || 0.35)) / toplamH) *
    (document.documentElement.scrollHeight - window.innerHeight);
  window.scrollTo({ top: hedef, behavior: 'smooth' });
}
document.getElementById('goYes').addEventListener('click', function () { kaydir(7, 0.4); });
document.getElementById('goAgain').addEventListener('click', function () {
  gecilen.length = 0; gecSet = {}; sonVar = '';
  yaziIdx = 0; utterEl.textContent = ''; utterEl.classList.remove('done');
  kaydir(1, 0.05);
});

/* Film dokusu: bir kez üretilir, sabit katmanda durur */
(function () {
  var c = document.createElement('canvas'); c.width = c.height = 180;
  var x = c.getContext('2d'), d = x.createImageData(180, 180), p = d.data;
  for (var q = 0; q < p.length; q += 4) {
    var v = 128 + (Math.random() - 0.5) * 190;
    p[q] = p[q + 1] = p[q + 2] = v; p[q + 3] = 255;
  }
  x.putImageData(d, 0, 0);
  document.getElementById('grain').style.backgroundImage = 'url(' + c.toDataURL('image/png') + ')';
})();

/* ─────────── DÖNGÜ ─────────── */
var saat = new T.Clock();
var camFwd = new T.Vector3(), camRight = new T.Vector3(), camUp = new T.Vector3();
var hedefBas = new T.Vector3(), bakis = new T.Vector3(), ileri = new T.Vector3();
var yanV = new T.Vector3(), tanV = new T.Vector3(), tmpA = new T.Vector3(), tmpB = new T.Vector3();
var gradZ = new T.Color(), gradS = new T.Color(), gradI = new T.Color();
var izHedef = new T.Vector3(), markV = new T.Vector3(), sonYan = new T.Vector3(1, 0, 0), izBak = new T.Vector3(), zincir = new T.Vector3();
var tara = 0, sonMarkT = 0, ipuclu = false;

function boyut() {
  var w = window.innerWidth, h = window.innerHeight;
  ren.setSize(w, h, false);
  kam.aspect = w / h; kam.updateProjectionMatrix();
  wiresEl.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  wiresEl.setAttribute('width', w); wiresEl.setAttribute('height', h);
}
window.addEventListener('resize', boyut); boyut();

function dongu() {
  requestAnimationFrame(dongu);
  var dt = Math.min(saat.getDelta(), 0.05), t = saat.elapsedTime;

  okuScroll();
  P += (Pham - P) * (1 - Math.pow(0.0016, dt));   /* kütle: kamera anında yetişmez */

  /* Perde ilerlemeleri */
  var p0 = perdeP(0), p1 = perdeP(1), p2 = perdeP(2), p3 = perdeP(3);
  var p4 = perdeP(4), p5 = perdeP(5), p6 = perdeP(6), p7 = perdeP(7);

  var wake = kapi(P, 0.135, 0.20);                     /* niyet uyanır */
  var yanlis = kapi(P, 0.20, 0.30) * (1 - kapi(P, 0.40, 0.50));
  var iliski = kapi(P, 0.355, 0.50) * (1 - kapi(P, 0.63, 0.72) * 0.62);
  var geri = yumusa(kapi(P, 0.885, 1.0));
  var eleme = kapi(P, 0.495, 0.665) * (1 - geri * 0.42);   /* davette alan sakinleşerek geri döner */
  var asm = yumusa(kapi(P, 0.560, 0.755));
  var durul = kapi(P, 0.80, 0.875);

  U.uT.value = t; U.uWake.value = wake; U.uFalse.value = yanlis;
  U.uRelate.value = iliski; U.uCull.value = eleme; U.uAsm.value = asm; U.uSettle.value = durul;

  /* Renk gradı: kesintisiz akış */
  gradAl(P, 1, gradZ); gradAl(P, 2, gradS); gradAl(P, 3, gradI);
  ren.setClearColor(gradZ, 1);
  sahne.fog.color.copy(gradS);
  U.uFog.value.copy(gradS); U.uInk.value.copy(gradI);
  document.body.style.setProperty('--zemin', '#' + gradZ.getHexString());
  kok.style.setProperty('--sc', Math.round(gradZ.r * 255) + ',' + Math.round(gradZ.g * 255) + ',' + Math.round(gradZ.b * 255));

  /* Kamera */
  var u = egriU();
  yol.getPointAt(Math.min(u, 0.999), tmpA);
  pX += (pTX - pX) * 0.055; pY += (pTY - pY) * 0.055;
  kam.position.set(tmpA.x + pX * 2.4, tmpA.y + pY * 1.7, tmpA.z + geri * 96);

  yol.getPointAt(Math.min(u + 0.014, 1), ileri);
  bakis.copy(ileri);
  var bakEsik = Math.max(asm, durul) * (1 - geri * 0.35);
  if (bakEsik > 0.001) bakis.lerp(ESIK_MERKEZ, Math.min(1, bakEsik));
  kam.lookAt(bakis);
  kam.updateMatrixWorld();
  kam.getWorldDirection(camFwd);
  camRight.set(1, 0, 0).applyQuaternion(kam.quaternion);
  camUp.set(0, 1, 0).applyQuaternion(kam.quaternion);

  /* ── İZ: yay fiziğiyle yönlendirilen niyet ── */
  var oto = dokundu ? 0.25 : 1;                       /* dokunulmadıysa kendi dolaşır */
  var ax = pX * (dokundu ? 1 : 0) + Math.sin(t * 0.42) * 0.62 * oto;
  var ay = pY * (dokundu ? 1 : 0) + Math.cos(t * 0.33) * 0.42 * oto;
  hedefBas.copy(kam.position)
    .addScaledVector(camFwd, 27)
    .addScaledVector(camRight, ax * 21)
    .addScaledVector(camUp, ay * 12);
  if (asm > 0.01) {
    izHedef.set(ESIK_MERKEZ.x, ESIK_MERKEZ.y - 9.5, ESIK_MERKEZ.z + 8);
    hedefBas.lerp(izHedef, asm * 0.92);
  }

  tmpB.copy(hedefBas).sub(izBas).multiplyScalar(0.075);
  izHiz.add(tmpB).multiplyScalar(0.885);
  izBas.add(izHiz);
  U.uHead.value.copy(izBas);

  /* İz bir halat gibi çözülür: her düğüm bir öncekini sabit bir segment
     uzunluğunda takip eder. Kare başına bir nokta itmek yerine bu kısıt
     kullanıldığı için izin dünya uzunluğu her zaman aynıdır; kare hızı ya
     da scroll hızı ne olursa olsun ekranı kateden bir şeride dönüşemez. */
  izGec[IZ_N - 1].copy(izBas);
  for (i = IZ_N - 2; i >= 0; i--) {
    zincir.copy(izGec[i]).sub(izGec[i + 1]);
    var zl = zincir.length();
    if (zl < 1e-5) { zincir.set(0, 0, IZ_SEG); zl = IZ_SEG; }
    zincir.multiplyScalar(Math.min(zl, IZ_SEG) / zl);
    izGec[i].copy(izGec[i + 1]).add(zincir);
  }
  for (i = 0; i < IZ_N; i++) {
    var pp = izGec[i];
    var pa2 = izGec[Math.max(0, i - 1)], pb2 = izGec[Math.min(IZ_N - 1, i + 1)];
    tanV.copy(pb2).sub(pa2);
    if (tanV.lengthSq() < 1e-8) tanV.copy(camRight); else tanV.normalize();
    /* Genişlik ekseni her nokta için kameraya döner. Sabit bir ileri yön
       alındığında eksenden uzak parçalar yandan görünüp levhalaşıyordu. */
    izBak.copy(kam.position).sub(pp);
    var uzak = izBak.length();
    if (uzak > 1e-4) izBak.multiplyScalar(1 / uzak); else izBak.copy(camFwd);
    yanV.crossVectors(tanV, izBak);
    if (yanV.lengthSq() < 1e-6) yanV.copy(sonYan); else { yanV.normalize(); sonYan.copy(yanV); }
    var kk = i / (IZ_N - 1);
    /* İki uçta da sıfıra iner: en kalın nokta baştan biraz geride kalır */
    var w = (0.040 + 0.20 * Math.pow(kk, 3.2)) * (1 - Math.pow(Math.max(0, kk - 0.94) / 0.06, 2)) * (1 + asm * 0.3);
    /* İz yerel bir filamenttir, sahneyi baştan sona kateden bir şerit değil.
       Üç sınır birlikte çalışır:
       1) kameranın arkasında kalan geçmiş sıfırlanır,
       2) baştan belli bir uzaklığın ötesindeki kuyruk sönümlenir,
       3) kamera hızlanınca kopan segmentler çizilmez.
       Bunlar olmadan hızlı scroll'da iz ekranı kaplayan bir levhaya dönüşüyordu. */
    var onde = (pp.x - kam.position.x) * camFwd.x + (pp.y - kam.position.y) * camFwd.y + (pp.z - kam.position.z) * camFwd.z;
    w *= Math.min(1, Math.max(0, (onde - 1.5) / 13));

    izPos[i * 6] = pp.x - yanV.x * w; izPos[i * 6 + 1] = pp.y - yanV.y * w; izPos[i * 6 + 2] = pp.z - yanV.z * w;
    izPos[i * 6 + 3] = pp.x + yanV.x * w; izPos[i * 6 + 4] = pp.y + yanV.y * w; izPos[i * 6 + 5] = pp.z + yanV.z * w;
  }
  izGeo.getAttribute('position').needsUpdate = true;

  /* ── İzin yaktığı kanıtlar: her karede bir dilim taranır ── */
  if (wake > 0.05 && eleme < 0.9) {
    var adim = mobil ? 160 : 320;
    for (i = 0; i < adim; i++) {
      var id2 = (tara + i) % N;
      var cp = cpuPos[id2];
      var ddx = cp.x - izBas.x, ddy = cp.y - izBas.y, ddz = cp.z - izBas.z;
      if (ddx * ddx + ddy * ddy + ddz * ddz < 380) kaydet(id2);
    }
    tara = (tara + adim) % N;
  }

  /* ── Etiketler: yalnızca bağlam gerektirdiğinde belirir ── */
  if (t - sonMarkT > 0.14) {
    sonMarkT = t;
    var aday = gecilen.slice(-MARK_N);
    for (i = 0; i < marklar.length; i++) {
      var m = marklar[i];
      if (asm > 0.5 && i < 8) continue;               /* klimaks etiketleri ayrı yönetilir */
      var src = aday[i];
      if (!src || asm > 0.5) { m.el.classList.remove('on'); continue; }
      var sp = izdusum(cpuPos[src.i]);
      if (sp.z > 1 || sp.x < 90 || sp.x > window.innerWidth - 90 || sp.y < 80 || sp.y > window.innerHeight - 120) {
        m.el.classList.remove('on'); continue;
      }
      if (m.idx !== src.i) { m.idx = src.i; m.b.textContent = src.k[0]; m.s.textContent = src.k[1]; }
      m.el.style.transform = 'translate(' + Math.round(sp.x) + 'px,' + Math.round(sp.y) + 'px) translate(-50%,-50%)';
      m.el.className = 'mark mark--gecti on';
    }

    /* Klimaks: gerekçe yapısı mülkün çevresinde kurulur */
    if (asm > 0.45 && geri < 0.55) {
      var mp = izdusum(ESIK_MERKEZ);
      var kn = mobil ? 4 : 8, yari = kn / 2;
      var gec4 = gecilen.slice(-yari);
      for (i = 0; i < kn; i++) {
        var mm = marklar[i], kid2 = kalanIdx[mobil ? i * 2 : i];
        var wp2 = markV.set(iTar[kid2 * 3], iTar[kid2 * 3 + 1], iTar[kid2 * 3 + 2]);
        var sp2 = izdusum(wp2);
        var kenar = mobil ? 76 : 150;
        sp2.x = Math.min(window.innerWidth - kenar, Math.max(kenar, sp2.x));
        sp2.y = Math.min(window.innerHeight * (mobil ? 0.46 : 0.74), Math.max(mobil ? 84 : 96, sp2.y));
        var veri = i < yari
          ? (gec4[i] ? gec4[i].k : KANIT[i * 3])
          : BULUNAN[i - yari];
        mm.b.textContent = ''; mm.s.textContent = veri[0];
        mm.el.className = 'mark ' + (i < yari ? 'mark--gecti' : 'mark--bulundu') + ' on';
        mm.el.style.transform = 'translate(' + Math.round(sp2.x) + 'px,' + Math.round(sp2.y) + 'px) translate(-50%,-50%)';
        var ln2 = teller[i];
        ln2.setAttribute('x1', sp2.x); ln2.setAttribute('y1', sp2.y);
        ln2.setAttribute('x2', mp.x); ln2.setAttribute('y2', mp.y);
        ln2.setAttribute('stroke', i < yari ? '#8FD8E8' : '#E8B25F');
        ln2.setAttribute('opacity', (0.30 * Math.min(1, (asm - 0.45) / 0.3) * (1 - durul * 0.55) * (1 - kapi(geri, 0.0, 0.5))).toFixed(3));
      }
    } else {
      for (i = 0; i < 8; i++) {
        teller[i].setAttribute('opacity', '0');
        if (asm > 0.45) marklar[i].el.classList.remove('on');
      }
    }
  }

  /* ── Ölçü: sahnedeki gerçek sayıyı okur ── */
  var canli, etiket;
  if (yanlis > 0.35 && eleme < 0.05) { canli = karis(N + NM, N_YANLIS, kapi(P, 0.215, 0.29)); etiket = 'filtreye uyan ilan'; }
  else if (eleme > 0.02) { canli = karis(N_YANLIS, asm > 0.5 ? 1 : N_KALAN + 1, Math.max(eleme, asm)); etiket = asm > 0.5 ? 'eşleşme' : 'ayakta kalan'; }
  else { canli = N + NM; etiket = 'ihtimal'; }
  meterN.textContent = bicim(canli);
  meterL.textContent = etiket;

  /* ── Ses: perdeler çapraz geçer, hiçbiri kesilmez ── */
  for (i = 0; i < sesler.length; i++) {
    var lp = perdeP(i);
    var g = Math.min(kapi(lp, 0.0, 0.20), 1 - kapi(lp, 0.80, 1.0));
    if (i === 0) g = 1 - kapi(lp, 0.70, 1.0);          /* açılış ilk karede tam görünür */
    if (i === 5) g = Math.min(kapi(lp, 0.10, 0.30), 1 - kapi(lp, 0.92, 1.0));
    if (i === 7) g = kapi(lp, 0.0, 0.22);
    var el2 = sesler[i];
    el2.style.opacity = g.toFixed(3);
    el2.style.transform = 'translateY(' + ((1 - g) * 22).toFixed(1) + 'px)';
    el2.classList.toggle('act', g > 0.6);
  }
  cumleYaz(p1 > 0.05 && p1 < 1, dt);
  if (asm > 0.55 && geri < 0.35) { gerekceYaz(); reasonEl.classList.add('on'); } else reasonEl.classList.remove('on');

  if (!ipuclu && P > 0.02 && P < 0.13 && !dokundu) { hintEl.classList.add('on'); }
  if (dokundu || P > 0.15) { hintEl.classList.remove('on'); if (dokundu) ipuclu = true; }

  ren.render(sahne, kam);
}
requestAnimationFrame(dongu);

/* ══════════════════════════════════════════════════════════════════════
   DURGUN SÜRÜM
   WebGL yoksa ya da hareket azaltılmışsa: aynı anlatı, aynı sıra, aynı
   bilgi. Kırık bir sayfa ya da "desteklenmiyor" uyarısı değil; kameranın
   duran hâli. Tüm kanıt ve gerekçe okunur durumda kalır.
   ══════════════════════════════════════════════════════════════════════ */
function durgunKur() {
  kok.className = 'still';
  document.getElementById('utter').textContent = CUMLE;
  document.getElementById('utter').classList.add('done');
  document.getElementById('meterN').textContent = bicim(4200);
  liste(document.getElementById('rBul'), BULUNAN);
  liste(document.getElementById('rYok'), KARSILANMAYAN);
  liste(document.getElementById('rVar'), [KANIT[0], KANIT[2], KANIT[3], KANIT[4]]);

  var NS = 'http://www.w3.org/2000/svg';
  function el(n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function svg(vb) { var s = el('svg', { viewBox: vb, role: 'img' }); return s; }
  function tohum(i) { var x = Math.sin(i * 91.7) * 4375.85; return x - Math.floor(x); }

  /* Her perde için tek bir figür: alanın o andaki hâli. */
  function figur(perde) {
    var s = svg('0 0 900 460'), i, g;
    var W = 900, H = 460, CX = 450, CY = 230;
    function nokta(i) {
      var a = tohum(i) * Math.PI * 2, r = 24 + Math.pow(tohum(i + 7), 0.6) * 210;
      return { x: CX + Math.cos(a) * r * 1.7, y: CY + Math.sin(a) * r * 0.82 };
    }
    if (perde === 0 || perde === 1) {
      for (i = 0; i < 420; i++) {
        var p = nokta(i); if (p.x < 4 || p.x > W - 4 || p.y < 4 || p.y > H - 4) continue;
        var h = 3 + tohum(i + 31) * 16;
        s.appendChild(el('rect', { x: p.x.toFixed(1), y: p.y.toFixed(1), width: 1.6, height: h.toFixed(1),
          fill: '#EDE7DA', opacity: (0.07 + tohum(i + 5) * 0.34).toFixed(2) }));
      }
      if (perde === 1) {
        s.appendChild(el('path', { d: 'M30 400 C 260 340, 300 150, 470 190 S 760 300, 872 120',
          fill: 'none', stroke: '#2FBF95', 'stroke-width': 2, opacity: .95 }));
      }
    } else if (perde === 2) {
      for (i = 0; i < 420; i++) {
        var p2 = nokta(i); if (p2.x < 4 || p2.x > W - 4 || p2.y < 4 || p2.y > H - 4) continue;
        var yan = i % 7 === 0;
        s.appendChild(el('rect', { x: p2.x.toFixed(1), y: p2.y.toFixed(1), width: yan ? 3 : 1.6,
          height: (3 + tohum(i + 31) * 16).toFixed(1), fill: yan ? '#E8B25F' : '#EDE7DA',
          opacity: yan ? 0.92 : 0.1 }));
      }
    } else if (perde === 3) {
      for (i = 0; i < 120; i++) {
        var a3 = nokta(i * 3), b3 = nokta(i * 3 + 11);
        if (Math.abs(a3.x - b3.x) > 260) continue;
        s.appendChild(el('line', { x1: a3.x.toFixed(1), y1: a3.y.toFixed(1), x2: b3.x.toFixed(1), y2: b3.y.toFixed(1),
          stroke: '#8FD8E8', 'stroke-width': .7, opacity: .34 }));
      }
      for (i = 0; i < 120; i += 3) {
        var c3 = nokta(i * 3);
        s.appendChild(el('circle', { cx: c3.x.toFixed(1), cy: c3.y.toFixed(1), r: 2.2, fill: '#8FD8E8', opacity: .8 }));
      }
    } else if (perde === 4) {
      for (i = 0; i < 420; i++) {
        var p4 = nokta(i); if (p4.x < 4 || p4.x > W - 4 || p4.y < 4 || p4.y > H - 4) continue;
        var kal = i % 47 === 0;
        s.appendChild(el('rect', { x: p4.x.toFixed(1), y: p4.y.toFixed(1), width: kal ? 3.4 : 1.4,
          height: (3 + tohum(i + 31) * 16).toFixed(1), fill: kal ? '#2FBF95' : '#EDE7DA',
          opacity: kal ? 1 : 0.055 }));
      }
    } else if (perde === 5) {
      s.appendChild(el('rect', { x: 300, y: 118, width: 300, height: 224, fill: 'none',
        stroke: '#2FBF95', 'stroke-width': 1.4, opacity: .9 }));
      for (i = 0; i < 28; i++) {
        s.appendChild(el('rect', { x: 300 + (i % 7) * (300 / 7), y: 118 + Math.floor(i / 7) * 56,
          width: 300 / 7 - 1.5, height: 54.5, fill: '#2FBF95',
          opacity: (0.10 + tohum(i + 3) * 0.20).toFixed(2) }));
      }
      var ac2 = [-0.4, 0.38, 1.16, 1.94, 2.72, 3.5, 4.28, 5.06];
      for (i = 0; i < 8; i++) {
        var xx = 450 + Math.cos(ac2[i]) * 330, yy = 230 + Math.sin(ac2[i]) * 175;
        var renk = i < 4 ? '#8FD8E8' : '#E8B25F';
        s.appendChild(el('line', { x1: xx, y1: yy, x2: 450, y2: 230, stroke: renk, 'stroke-width': .8, opacity: .45 }));
        s.appendChild(el('circle', { cx: xx, cy: yy, r: 3.4, fill: 'none', stroke: renk, 'stroke-width': 1 }));
      }
    } else {
      s.appendChild(el('rect', { x: 330, y: 140, width: 240, height: 180, fill: 'none',
        stroke: '#2FBF95', 'stroke-width': 1.4, opacity: .8 }));
      for (i = 0; i < 300; i++) {
        var p6 = nokta(i); if (p6.x < 4 || p6.x > W - 4 || p6.y < 4 || p6.y > H - 4) continue;
        s.appendChild(el('rect', { x: p6.x.toFixed(1), y: p6.y.toFixed(1), width: 1.4,
          height: (3 + tohum(i + 31) * 12).toFixed(1), fill: '#EDE7DA', opacity: .08 }));
      }
    }
    return s;
  }

  var says = [].slice.call(document.querySelectorAll('.say'));
  says.forEach(function (sec, idx) {
    if (idx === 7) return;
    var f = document.createElement('div');
    f.className = 'stillfig';
    f.style.margin = '2.5rem 0 0';
    f.appendChild(figur(idx));
    sec.appendChild(f);
  });

  /* Gerekçe klimaksın altına, okunur biçimde yerleşir */
  var esikSec = says[5];
  esikSec.parentNode.insertBefore(document.getElementById('reason'), esikSec.nextSibling);

  var not = document.createElement('p');
  not.className = 'sub';
  not.style.marginTop = '2.5rem';
  not.textContent = azHareket
    ? 'Hareket tercihiniz azaltılmış olduğu için alan durgun gösteriliyor. Anlatının tamamı ve tüm kanıtlar burada.'
    : 'Tarayıcınızda WebGL kullanılamadığı için alan durgun gösteriliyor. Anlatının tamamı ve tüm kanıtlar burada.';
  says[7].appendChild(not);
}

})();
