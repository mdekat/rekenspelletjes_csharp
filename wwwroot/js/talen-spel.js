// ── Speldata ──────────────────────────────────────────────────────────────────

const TALEN = {
  fr: {
    naam: 'Frans',
    vlag: '🇫🇷',
    taalCode: 'fr-FR',
    getallen: ['un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'],
    bravo:  ['Super !', 'Bravo !', 'Excellent !', 'Génial !', 'Parfait !', 'Magnifique !'],
    helaas: ['Hélas…', 'Non !', 'Essaie encore !', 'Zut !'],
    beloningTitel: 'Félicitations !',
    beloningTekst: 'Tu connais les nombres en français ! Bravo ! 🇫🇷',
    kleuren: ['#002395', '#ffffff', '#ED2939'],
    boxKlasse: 'taal-fr',
  },
  en: {
    naam: 'Engels',
    vlag: '🇬🇧',
    taalCode: 'en-GB',
    getallen: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
    bravo:  ['Super!', 'Well done!', 'Excellent!', 'Great!', 'Perfect!', 'Amazing!'],
    helaas: ['Oops!', 'Not quite!', 'Try again!', 'Oh no!'],
    beloningTitel: 'Congratulations!',
    beloningTekst: 'You know the numbers in English! Well done! 🇬🇧',
    kleuren: ['#012169', '#ffffff', '#C8102E'],
    boxKlasse: 'taal-en',
  },
  de: {
    naam: 'Duits',
    vlag: '🇩🇪',
    taalCode: 'de-DE',
    getallen: ['eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'],
    bravo:  ['Super!', 'Toll!', 'Ausgezeichnet!', 'Wunderbar!', 'Prima!', 'Klasse!'],
    helaas: ['Schade…', 'Nein!', 'Versuch es nochmal!', 'Ups!'],
    beloningTitel: 'Herzlichen Glückwunsch!',
    beloningTekst: 'Du kennst die Zahlen auf Deutsch! Toll gemacht! 🇩🇪',
    kleuren: ['#000000', '#DD0000', '#FFCE00'],
    boxKlasse: 'taal-de',
  },
};

// ── Spelstatus ────────────────────────────────────────────────────────────────

let huidigeTaal  = 'fr';
let huidigeModus = 'oefenen';   // 'oefenen' | 'spelen'
let huidigGetal  = 1;           // 1–10
let goed   = 0;
let fout   = 0;
let reeks  = 0;
const reeksDoelwit = 10;
let bezig  = false;

// ── Web Speech: voice-selectie ────────────────────────────────────────────────
// Sommige browsers laden stemmen asynchroon; we slaan ze op zodra ze klaar zijn.

let beschikbareVoices = [];

function laadVoices() {
  beschikbareVoices = speechSynthesis.getVoices();
}
laadVoices();
if (window.speechSynthesis) {
  speechSynthesis.onvoiceschanged = laadVoices;
}

function kiesVoice(taalCode) {
  const prefix = taalCode.split('-')[0];
  // Voorkeur: exacte match (bijv. fr-FR), anders taalprefix (bijv. fr)
  return beschikbareVoices.find(v => v.lang === taalCode)
      || beschikbareVoices.find(v => v.lang.startsWith(prefix))
      || null;
}

function spreekUit(woord, taalCode) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(woord);
  u.lang  = taalCode;
  u.rate  = 0.82;
  u.pitch = 1.1;
  const voice = kiesVoice(taalCode);
  if (voice) u.voice = voice;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// ── Modus wisselen ────────────────────────────────────────────────────────────

function setModus(modus) {
  huidigeModus = modus;

  document.querySelectorAll('.modus-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.modus === modus);
  });

  const oefeBox   = document.getElementById('oefeBox');
  const spelSectie = document.getElementById('spelSectie');

  if (modus === 'oefenen') {
    oefeBox.style.display    = '';
    spelSectie.classList.remove('actief');
    updateOefenKaarten();
  } else {
    oefeBox.style.display    = 'none';
    spelSectie.classList.add('actief');
    goed = 0; fout = 0; reeks = 0;
    updateScore();
    nieuweVraag();
  }
}

// ── Taal wisselen ─────────────────────────────────────────────────────────────

function setTaal(taal) {
  huidigeTaal = taal;

  document.querySelectorAll('.taal-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.taal === taal);
  });

  const t = TALEN[taal];
  document.getElementById('taalLabel').textContent = `${t.vlag} ${t.naam}`;

  if (huidigeModus === 'oefenen') {
    updateOefenKaarten();
  } else {
    goed = 0; fout = 0; reeks = 0;
    updateScore();
    nieuweVraag();
  }
}

// ── Oefenmodus ────────────────────────────────────────────────────────────────

function updateOefenKaarten() {
  const t    = TALEN[huidigeTaal];
  const grid = document.getElementById('oefeGrid');
  grid.innerHTML = '';

  for (let i = 1; i <= 10; i++) {
    const woord = t.getallen[i - 1];

    const kaart = document.createElement('div');
    kaart.className = `oefen-kaart taal-${huidigeTaal}`;
    kaart.title     = `Klik om "${woord}" te horen`;

    kaart.innerHTML = `
      <span class="oefen-cijfer">${i}</span>
      <span class="oefen-woord">${woord}</span>
      <span class="oefen-speaker">🔊</span>`;

    kaart.addEventListener('click', () => {
      kaart.classList.add('spreekt');
      spreekUit(woord, t.taalCode);
      setTimeout(() => kaart.classList.remove('spreekt'), 350);
    });

    grid.appendChild(kaart);
  }
}

// ── Spelmodus: score ──────────────────────────────────────────────────────────

function updateScore() {
  document.getElementById('scoreGoed').textContent  = goed;
  document.getElementById('scoreFout').textContent  = fout;
  document.getElementById('scoreReeks').textContent = reeks;
  document.getElementById('progressBar').style.width =
    (reeks / reeksDoelwit * 100) + '%';
}

// ── Spelmodus: nieuwe vraag ───────────────────────────────────────────────────

function nieuweVraag() {
  bezig = false;

  const feedbackEl = document.getElementById('feedback');
  feedbackEl.textContent = '';
  feedbackEl.className   = 'feedback';

  document.querySelectorAll('.answer-btn').forEach(b => {
    b.disabled  = false;
    b.className = 'answer-btn';
  });

  huidigGetal = Math.floor(Math.random() * 10) + 1;
  const t     = TALEN[huidigeTaal];
  const woord = t.getallen[huidigGetal - 1];

  const display = document.getElementById('woordDisplay');
  display.textContent = woord;
  display.className   = 'woord-display taal-' + huidigeTaal;
  display.style.animation = 'none';
  void display.offsetWidth;
  display.style.animation = '';

  setTimeout(() => spreekUit(woord, t.taalCode), 200);
}

// ── Spelmodus: antwoord verwerken ─────────────────────────────────────────────

function kiesAntwoord(btn, waarde) {
  if (bezig) return;
  bezig = true;

  const alleKnoppen = document.querySelectorAll('.answer-btn');
  alleKnoppen.forEach(b => b.disabled = true);

  const t = TALEN[huidigeTaal];

  if (waarde === huidigGetal) {
    btn.classList.add('goed');
    goed++;
    reeks++;

    const el = document.getElementById('feedback');
    el.textContent = t.bravo[Math.floor(Math.random() * t.bravo.length)];
    el.className   = 'feedback goed';

    updateScore();

    if (reeks >= reeksDoelwit) {
      setTimeout(() => toonTaalBeloning(), 700);
    } else {
      setTimeout(() => nieuweVraag(), 950);
    }
  } else {
    btn.classList.add('fout');
    fout++;

    const el = document.getElementById('feedback');
    el.textContent = t.helaas[Math.floor(Math.random() * t.helaas.length)];
    el.className   = 'feedback fout';

    // Markeer het goede antwoord kort goud
    const juisteBtn = document.querySelector(`.answer-btn[data-waarde="${huidigGetal}"]`);
    if (juisteBtn) juisteBtn.classList.add('hint');

    updateScore();

    setTimeout(() => {
      btn.classList.remove('fout');
      if (juisteBtn) juisteBtn.classList.remove('hint');
      alleKnoppen.forEach(b => b.disabled = false);
      bezig = false;
    }, 1100);
  }
}

// ── Spelmodus: herhaal uitspraak via flashcard-klik ───────────────────────────

function herhalenUitspreken() {
  const t = TALEN[huidigeTaal];
  spreekUit(t.getallen[huidigGetal - 1], t.taalCode);
}

// ── Celebration ───────────────────────────────────────────────────────────────

function animVlagConfetti(kleuren) {
  for (let i = 0; i < 85; i++) {
    const el = document.createElement('div');
    el.className = 'deeltje';
    el.style.left   = Math.random() * 100 + 'vw';
    el.style.top    = '-20px';
    el.style.width  = (8  + Math.random() * 10) + 'px';
    el.style.height = (14 + Math.random() * 10) + 'px';
    el.style.borderRadius = Math.random() > 0.45 ? '50%' : '2px';
    el.style.background   = kleuren[Math.floor(Math.random() * kleuren.length)];
    el.style.animation    =
      `confettiFall ${1.4 + Math.random() * 2.2}s ${Math.random() * 1}s linear forwards`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

function animVlagRegen(vlagEmoji) {
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.className    = 'deeltje';
    el.textContent  = vlagEmoji;
    el.style.fontSize   = (22 + Math.random() * 24) + 'px';
    el.style.left       = Math.random() * 100 + 'vw';
    el.style.top        = '-40px';
    el.style.lineHeight = 1;
    el.style.animation  =
      `confettiFall ${2.5 + Math.random() * 2.5}s ${Math.random() * 1.5}s linear forwards`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

function toonTaalBeloning() {
  const t = TALEN[huidigeTaal];

  const vlagEl = document.getElementById('rewardVlag');
  vlagEl.textContent = t.vlag;
  vlagEl.classList.remove('zwaai');
  vlagEl.style.animation = 'none';
  void vlagEl.offsetWidth;
  vlagEl.style.animation = '';

  document.getElementById('rewardIcoon').textContent = `${t.vlag}  ${t.vlag}  ${t.vlag}`;
  document.getElementById('rewardTitel').textContent  = t.beloningTitel;
  document.getElementById('rewardText').textContent   = t.beloningTekst;

  const box = document.getElementById('rewardBox');
  box.className = 'reward-box ' + t.boxKlasse;

  document.getElementById('rewardOverlay').classList.add('show');
  setTimeout(() => vlagEl.classList.add('zwaai'), 950);

  animVlagConfetti(t.kleuren);
  setTimeout(() => animVlagRegen(t.vlag), 350);
  setTimeout(() => animVuurwerk(),        650);
}

// ── Volgende ronde ────────────────────────────────────────────────────────────

function volgende() {
  document.getElementById('rewardOverlay').classList.remove('show');
  document.getElementById('rewardVlag').classList.remove('zwaai');
  reeks = 0;
  updateScore();
  nieuweVraag();
}

// ── Init: antwoordknoppen aanmaken (spelmodus, één keer) ──────────────────────

function maakAntwoordGrid() {
  const grid = document.getElementById('answersGrid');
  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.className    = 'answer-btn';
    btn.textContent  = i;
    btn.dataset.waarde = i;
    btn.onclick      = () => kiesAntwoord(btn, i);
    grid.appendChild(btn);
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────

maakAntwoordGrid();
setModus('oefenen');   // begin in oefenmodus
setTaal('fr');
