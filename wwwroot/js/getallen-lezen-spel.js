const MIC_SVG = `<svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg>Druk om te spreken`;

let huidigGetal  = null;
let huidigMax    = 20;
let scoreGoed    = 0;
let scoreFout    = 0;
let reeks        = 0;
const REEKS_DOEL = 10;
const HALF       = 5;

let bezig        = false;
let herkenner    = null;
let aftelTimer   = null;
let kleinGetoond = false;

const getalDisplay = document.getElementById('getalDisplay');
const aftelEl      = document.getElementById('aftelling');
const micBtn       = document.getElementById('micBtn');
const statusEl     = document.getElementById('status');
const herkendEl    = document.getElementById('herkend');
const feedbackEl   = document.getElementById('feedback');
const volgendBtn   = document.getElementById('volgendBtn');
const progressBar  = document.getElementById('progressBar');

// ─── Getal → woord ──────────────────────────────────────────────────────────
const KLEIN = ['','één','twee','drie','vier','vijf','zes','zeven','acht','negen',
  'tien','elf','twaalf','dertien','veertien','vijftien','zestien',
  'zeventien','achttien','negentien'];
const SAMEN = ['','een','twee','drie','vier','vijf','zes','zeven','acht','negen'];
const TIEN  = ['','','twintig','dertig','veertig','vijftig','zestig','zeventig','tachtig','negentig'];

function getalNaarWoord(n) {
  if (n === 1000) return 'duizend';
  if (n <= 19) return KLEIN[n];
  if (n < 100) {
    const t = Math.floor(n / 10), e = n % 10;
    if (e === 0) return TIEN[t];
    return SAMEN[e] + ((e === 2 || e === 3) ? 'ën' : 'en') + TIEN[t];
  }
  const h = Math.floor(n / 100), r = n % 100;
  return (h === 1 ? '' : SAMEN[h]) + 'honderd' + (r ? getalNaarWoord(r) : '');
}

function normaliseer(s) {
  return s.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
}

function isCorrect(getal, alternatieven) {
  const varianten = new Set([normaliseer(getalNaarWoord(getal)), String(getal)]);
  return alternatieven.some(t => varianten.has(normaliseer(t)));
}

// ─── Score & voortgang ───────────────────────────────────────────────────────
function updateScore() {
  document.getElementById('scoreGoed').textContent = scoreGoed;
  document.getElementById('scoreFout').textContent = scoreFout;
  document.getElementById('scoreReeks').textContent = reeks;
  const pct = reeks / REEKS_DOEL * 100;
  progressBar.style.width = pct + '%';
  progressBar.className = 'progress-bar' + (reeks >= HALF ? ' half' : '');
}

// ─── Speech Recognition ──────────────────────────────────────────────────────
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SR) {
  document.getElementById('nietOndersteund').style.display = 'block';
  micBtn.disabled = true;
}

micBtn.addEventListener('click', () => {
  if (bezig || !SR) return;
  bezig = true;
  micBtn.disabled = true;
  volgendBtn.style.display = 'none';
  herkendEl.textContent = '';
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';

  herkenner = new SR();
  herkenner.lang = 'nl-NL';
  herkenner.continuous = false;
  herkenner.interimResults = false;
  herkenner.maxAlternatives = 5;

  herkenner.onresult = (event) => {
    const res = event.results[0];
    const alt = Array.from({ length: res.length }, (_, i) => res[i].transcript.trim());
    herkendEl.textContent = `Je zei: "${alt[0]}"`;
    controleer(huidigGetal, alt);
  };

  herkenner.onerror = (event) => {
    clearTimeout(aftelTimer);
    klaar();
    statusEl.textContent = event.error === 'no-speech'
      ? 'Niets gehoord — probeer opnieuw'
      : event.error === 'not-allowed'
        ? 'Microfoon geweigerd — geef toestemming'
        : 'Fout: ' + event.error;
    volgendBtn.style.display = 'inline-block';
  };

  herkenner.onend = () => { if (bezig) klaar(); };
  herkenner.start();

  const stappen = ['3', '2', '1', '🎤 Spreek!'];
  let i = 0;
  function volgendeStap() {
    if (i < stappen.length) {
      const isSpreek = i === stappen.length - 1;
      aftelEl.className = 'aftelling ' + (isSpreek ? 'spreek' : 'tellen');
      aftelEl.textContent = stappen[i];
      micBtn.className = 'mic-btn ' + (isSpreek ? 'luistert' : 'aftellen');
      statusEl.textContent = isSpreek ? 'Spreek het getal duidelijk uit!' : 'Klaar maken…';
      i++;
      aftelTimer = setTimeout(volgendeStap, isSpreek ? 100 : 800);
    }
  }
  volgendeStap();
});

function klaar() {
  bezig = false;
  aftelEl.className = 'aftelling leeg';
  aftelEl.textContent = '';
  micBtn.className = 'mic-btn';
  micBtn.disabled = false;
  micBtn.innerHTML = MIC_SVG;
}

// ─── Level keuze ─────────────────────────────────────────────────────────────
document.querySelectorAll('.level-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    huidigMax = parseInt(btn.dataset.max);
    resetRonde();
    nieuwGetal();
  });
});

volgendBtn.addEventListener('click', nieuwGetal);

function resetRonde() {
  reeks = 0;
  kleinGetoond = false;
  updateScore();
}

function nieuwGetal() {
  huidigGetal = Math.floor(Math.random() * huidigMax) + 1;
  getalDisplay.textContent = huidigGetal;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
  herkendEl.textContent = '';
  statusEl.textContent = 'Druk op de microfoon en spreek het getal';
  volgendBtn.style.display = 'none';
}

function controleer(getal, alternatieven) {
  bezig = false;
  aftelEl.className = 'aftelling leeg';
  aftelEl.textContent = '';
  micBtn.className = 'mic-btn';
  micBtn.disabled = false;
  micBtn.innerHTML = MIC_SVG;

  if (isCorrect(getal, alternatieven)) {
    scoreGoed++;
    reeks++;
    updateScore();
    feedbackEl.textContent = '🎉 Super goed!';
    feedbackEl.className = 'feedback goed';
    statusEl.textContent = '';

    if (reeks >= REEKS_DOEL) {
      setTimeout(() => toonGroteViering(), 700);
    } else if (reeks === HALF && !kleinGetoond) {
      kleinGetoond = true;
      setTimeout(() => toonKleineViering(), 700);
    } else {
      volgendBtn.style.display = 'inline-block';
    }
  } else {
    scoreFout++;
    updateScore();
    feedbackEl.textContent = '😅 Probeer opnieuw!';
    feedbackEl.className = 'feedback fout';
    statusEl.textContent = 'Druk op de microfoon en spreek het getal';
    volgendBtn.style.display = 'inline-block';
  }
}

// ─── Kleine viering (halverwege) ─────────────────────────────────────────────
function toonKleineViering() {
  const iconen = ['⭐ ⭐ ⭐', '🌟 🌟 🌟', '👏 👏 👏', '🎈 🎈 🎈'];
  document.getElementById('kleinIcoon').textContent =
    iconen[Math.floor(Math.random() * iconen.length)];
  document.getElementById('overlayKlein').classList.add('show');
  animRollen();
}

function sluitKlein() {
  document.getElementById('overlayKlein').classList.remove('show');
  volgendBtn.style.display = 'inline-block';
}

// ─── Grote viering (10 goed) ─────────────────────────────────────────────────
const GROTE_BELONINGEN = BELONINGEN.filter(b => b.animatie !== animRollen);

function toonGroteViering() {
  const b = GROTE_BELONINGEN[Math.floor(Math.random() * GROTE_BELONINGEN.length)];
  document.getElementById('grootIcoon').textContent = b.icoon;
  document.getElementById('grootTitel').textContent = b.titel;
  document.getElementById('overlayGroot').classList.add('show');
  b.animatie();
}

function nieuweRonde() {
  document.getElementById('overlayGroot').classList.remove('show');
  resetRonde();
  nieuwGetal();
}

// ─── Start ───────────────────────────────────────────────────────────────────
updateScore();
nieuwGetal();
