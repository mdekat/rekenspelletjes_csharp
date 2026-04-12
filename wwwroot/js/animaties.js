// Gedeelde JavaScript voor alle rekenspelletjes
// Bevat: hulpfuncties, animaties, beloningssysteem, feedbackconstanten

// ── Hulpfuncties ─────────────────────────────────────────────────────────────

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Feedback constanten ───────────────────────────────────────────────────────

const FEEDBACK_GOED = ['Super!', 'Goed zo!', 'Top!', 'Ja!', 'Bravo!', 'Prima!', 'Wauw!'];
const FEEDBACK_FOUT = ['Helaas...', 'Niet goed!', 'Probeer opnieuw!', 'Oeps!'];

function toonFeedback(lijstje, cls) {
  const el = document.getElementById('feedback');
  el.textContent = lijstje[Math.floor(Math.random() * lijstje.length)];
  el.className = 'feedback ' + cls;
}

// ── Animaties ─────────────────────────────────────────────────────────────────

function ballonSVG(kleur) {
  return `<svg viewBox="0 0 100 145" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <ellipse cx="50" cy="50" rx="42" ry="46" fill="${kleur}"/>
    <path d="M50 96 Q43 107 50 112 Q57 107 50 96" fill="${kleur}"/>
    <ellipse cx="31" cy="29" rx="13" ry="8" fill="rgba(255,255,255,0.45)" transform="rotate(-30 31 29)"/>
    <ellipse cx="27" cy="42" rx="5" ry="3" fill="rgba(255,255,255,0.2)" transform="rotate(-30 27 42)"/>
    <path d="M50 112 Q46 118 50 122 Q54 118 50 112" fill="rgba(0,0,0,0.28)"/>
    <path d="M50 122 Q41 133 50 145" stroke="rgba(0,0,0,0.25)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function animConfetti() {
  const colors = ['#ffd200','#f7971e','#56ab2f','#a8e063','#667eea','#ff6b6b','#48dbfb','#ff9ff3'];
  for (let i = 0; i < 90; i++) {
    const el = document.createElement('div');
    el.className = 'deeltje';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = '-20px';
    el.style.width = (8 + Math.random() * 8) + 'px';
    el.style.height = (12 + Math.random() * 10) + 'px';
    el.style.borderRadius = '2px';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animation = `confettiFall ${1.2 + Math.random() * 2.5}s ${Math.random() * 0.8}s linear forwards`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

function animBallonnen() {
  const kleuren = ['#ff6b6b','#ffd200','#56ab2f','#48dbfb','#ff9ff3','#a78bfa','#fb923c','#f97316'];
  for (let i = 0; i < 16; i++) {
    const kleur = kleuren[Math.floor(Math.random() * kleuren.length)];
    const el = document.createElement('div');
    el.className = 'deeltje';
    const size = 52 + Math.random() * 32;
    el.style.width = size + 'px';
    el.style.height = (size * 1.45) + 'px';
    el.innerHTML = ballonSVG(kleur);
    el.style.left = (3 + Math.random() * 94) + 'vw';
    el.style.bottom = '-130px';
    el.style.top = 'auto';
    el.style.setProperty('--sway', (Math.random() * 90 - 45) + 'px');
    el.style.animation = `ballonOmhoog ${2.8 + Math.random() * 2}s ${Math.random() * 1.4}s ease-in forwards`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

function animVuurwerk() {
  const colors = ['#ffd200','#ff6b6b','#48dbfb','#ff9ff3','#56ab2f','#a78bfa','#fb923c','white'];
  for (let e = 0; e < 5; e++) {
    const cx = 10 + Math.random() * 80;
    const cy = 8 + Math.random() * 60;
    const delayBase = e * 0.4;
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * 2 * Math.PI;
      const dist = 90 + Math.random() * 140;
      const el = document.createElement('div');
      el.className = 'deeltje';
      el.style.left = cx + 'vw';
      el.style.top = cy + 'vh';
      el.style.width = (6 + Math.random() * 7) + 'px';
      el.style.height = (6 + Math.random() * 7) + 'px';
      el.style.borderRadius = '50%';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      el.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      el.style.animation = `vuurwerkDeeltje ${0.7 + Math.random() * 0.6}s ${delayBase}s ease-out forwards`;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }
  }
}

function animRollen() {
  const emojis = ['⚽','🏀','🎾','🎱','🏈','🌈','⭐','🎯','🎳','🍭'];
  const shuffled = shuffle([...emojis]);
  for (let i = 0; i < 7; i++) {
    const el = document.createElement('div');
    el.className = 'deeltje';
    el.textContent = shuffled[i % shuffled.length];
    el.style.fontSize = (30 + Math.random() * 28) + 'px';
    el.style.top = (15 + Math.random() * 65) + 'vh';
    el.style.left = '0';
    el.style.lineHeight = 1;
    el.style.animation = `rollenOver ${1.6 + Math.random() * 1.8}s ${i * 0.28}s linear forwards`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

function animExplosie() {
  const emojis = ['⭐','🌟','✨','💥','🎊','🎉','💫','🔥','🎈','🏆'];
  const count = 22;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
    const dist = 140 + Math.random() * 180;
    const el = document.createElement('div');
    el.className = 'deeltje';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.fontSize = (22 + Math.random() * 22) + 'px';
    el.style.left = '50vw';
    el.style.top = '50vh';
    el.style.lineHeight = 1;
    el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    el.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
    el.style.animation = `explosieBurst ${0.9 + Math.random() * 0.7}s ${Math.random() * 0.25}s ease-out forwards`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

function animParade() {
  const dieren = ['🦄','🐸','🦊','🐻','🦁','🐧','🐼','🐨','🦋','🐬'];
  const keuze = shuffle([...dieren]).slice(0, 6);
  keuze.forEach((dier, i) => {
    const el = document.createElement('div');
    el.className = 'deeltje';
    el.textContent = dier;
    el.style.fontSize = (40 + Math.random() * 16) + 'px';
    el.style.top = (40 + Math.random() * 20) + 'vh';
    el.style.left = '0';
    el.style.lineHeight = 1;
    el.style.animation = `paradeDier ${3.2 + Math.random() * 0.8}s ${i * 0.45}s ease-in-out forwards`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  });
}

// ── Beloningssysteem ──────────────────────────────────────────────────────────

const BELONINGEN = [
  { animatie: animConfetti,  icoon: '🎊 🎉 🎊', titel: 'Geweldig!' },
  { animatie: animBallonnen, icoon: '🎈 🎈 🎈', titel: 'Zo goed gedaan!' },
  { animatie: animVuurwerk,  icoon: '🎆 ✨ 🎆', titel: 'Knal goed!' },
  { animatie: animRollen,    icoon: '⚽ 🎾 🏀',  titel: 'Op rooooool!' },
  { animatie: animExplosie,  icoon: '💥 🌟 💥',  titel: 'Boem! Fantastisch!' },
  { animatie: animParade,    icoon: '🦄 🐸 🦊',  titel: 'Feestparade!' },
];

// berichtTekst: de tekst die in de reward-overlay wordt getoond
// Verwacht DOM-elementen: #rewardIcoon, #rewardTitel, #rewardText, #rewardOverlay
function toonBeloning(berichtTekst) {
  const b = BELONINGEN[Math.floor(Math.random() * BELONINGEN.length)];
  document.getElementById('rewardIcoon').textContent = b.icoon;
  document.getElementById('rewardTitel').textContent = b.titel;
  document.getElementById('rewardText').textContent = berichtTekst;
  document.getElementById('rewardOverlay').classList.add('show');
  b.animatie();
}
