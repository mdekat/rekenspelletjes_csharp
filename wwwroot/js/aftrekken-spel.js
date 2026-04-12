let niveau = 10;
let goed = 0;
let fout = 0;
let reeks = 0;
const reeksDoelwit = 10;

let juisteAntwoord = 0;
let bezig = false;
let vorigeSom = '';

function setLevel(n) {
  niveau = n;
  document.querySelectorAll('.level-btn').forEach(b => {
    b.classList.toggle('active', b.textContent == n);
  });
  reeks = 0;
  goed = 0;
  fout = 0;
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
    a = randomInt(2, niveau);
    b = randomInt(1, a - 1);
    somTekst = `${a} - ${b}`;
  } while (somTekst === vorigeSom);
  juisteAntwoord = a - b;
  vorigeSom = somTekst;

  document.getElementById('somDisplay').textContent = somTekst;

  const opties = genereerOpties(juisteAntwoord, niveau);
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

function genereerOpties(juist, max) {
  const set = new Set([juist]);
  let pogingen = 0;
  while (set.size < 4 && pogingen < 200) {
    pogingen++;
    const delta = randomInt(-Math.max(3, Math.floor(max / 5)), Math.max(3, Math.floor(max / 5)));
    const kandidaat = juist + delta;
    if (kandidaat !== juist && kandidaat >= 0 && kandidaat <= max && !set.has(kandidaat)) {
      set.add(kandidaat);
    }
  }
  while (set.size < 4) {
    set.add(randomInt(0, max));
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
      setTimeout(() => toonBeloning(`Je hebt ${reeksDoelwit} minsommen goed beantwoord!`), 700);
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
