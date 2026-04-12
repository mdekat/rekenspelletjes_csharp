let stap = 10;
let niveau = 100;
let goed = 0;
let fout = 0;
let reeks = 0;
const reeksDoelwit = 10;

let juisteAntwoord = 0;
let bezig = false;
let vorigeSom = '';

function setStap(s) {
  stap = s;
  document.querySelectorAll('.stap-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-val') == s);
  });
  reset();
}

function setNiveau(n) {
  niveau = n;
  document.querySelectorAll('.niveau-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-val') == n);
  });
  reset();
}

function reset() {
  goed = 0; fout = 0; reeks = 0;
  updateScore();
  nieuweVraag();
}

function updateScore() {
  document.getElementById('scoreGoed').textContent = goed;
  document.getElementById('scoreFout').textContent = fout;
  document.getElementById('scoreReeks').textContent = reeks;
  document.getElementById('progressBar').style.width = (reeks / reeksDoelwit * 100) + '%';
}

function nieuweVraag() {
  bezig = false;
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';

  let a, b, somTekst;
  do {
    const maxStappenA = Math.floor(niveau / stap);
    a = stap * randomInt(2, maxStappenA);
    const maxStappenB = Math.floor((a - stap) / stap);
    b = stap * randomInt(1, maxStappenB);
    juisteAntwoord = a - b;
    somTekst = `${a} - ${b}`;
  } while (somTekst === vorigeSom);
  vorigeSom = somTekst;

  document.getElementById('somDisplay').textContent = somTekst;

  const opties = genereerOpties(juisteAntwoord, stap, niveau);
  const grid = document.getElementById('answersGrid');
  grid.innerHTML = '';
  grid.style.pointerEvents = 'none';
  opties.forEach(optie => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = optie;
    btn.onclick = () => kiesAntwoord(btn, optie);
    grid.appendChild(btn);
  });
  setTimeout(() => { grid.style.pointerEvents = ''; }, 0);

  const sd = document.getElementById('somDisplay');
  sd.style.animation = 'none';
  void sd.offsetWidth;
  sd.style.animation = '';
}

function genereerOpties(juist, stap, max) {
  const set = new Set([juist]);
  let pogingen = 0;
  while (set.size < 4 && pogingen < 300) {
    pogingen++;
    const delta = (randomInt(1, 4) * (Math.random() < 0.5 ? 1 : -1)) * stap;
    const kandidaat = juist + delta;
    if (kandidaat > 0 && kandidaat <= max && kandidaat !== juist && !set.has(kandidaat)) {
      set.add(kandidaat);
    }
  }
  while (set.size < 4) {
    const kandidaat = stap * randomInt(1, Math.floor(max / stap));
    set.add(kandidaat);
  }
  return shuffle([...set]);
}

function kiesAntwoord(btn, waarde) {
  if (bezig) return;
  bezig = true;

  const alleKnoppen = document.querySelectorAll('.answer-btn');
  alleKnoppen.forEach(b => b.disabled = true);

  if (waarde === juisteAntwoord) {
    btn.classList.add('goed');
    goed++;
    reeks++;
    toonFeedback(FEEDBACK_GOED, 'goed');
    updateScore();
    if (reeks >= reeksDoelwit) {
      setTimeout(() => toonBeloning(`Je hebt ${reeksDoelwit} sommen goed beantwoord!`), 700);
    } else {
      setTimeout(() => nieuweVraag(), 900);
    }
  } else {
    btn.classList.add('fout');
    fout++;
    toonFeedback(FEEDBACK_FOUT, 'fout');
    updateScore();
    setTimeout(() => {
      btn.classList.remove('fout');
      alleKnoppen.forEach(b => b.disabled = false);
      bezig = false;
    }, 700);
  }
}

function volgende() {
  document.getElementById('rewardOverlay').classList.remove('show');
  reeks = 0;
  updateScore();
  nieuweVraag();
}

nieuweVraag();
