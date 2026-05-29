let delerVan = 2;
let maxA = 10;

let goed = 0;
let fout = 0;
let reeks = 0;
const reeksDoelwit = 10;

let juisteAntwoord = 0;
let huidigDeler = 2;
let bezig = false;
let vorigeSom = '';

function setDeler(n) {
  delerVan = n;
  document.querySelectorAll('.tafel-btn').forEach(b =>
    b.classList.toggle('active', parseInt(b.textContent) === n));
  resetScore();
}

function setMaxA(n) {
  maxA = n;
  document.querySelectorAll('.max-btn').forEach(b =>
    b.classList.toggle('active', parseInt(b.textContent) === n));
  resetScore();
}

function resetScore() {
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
  document.getElementById('visualisatie').innerHTML = '';

  let a, somTekst;
  do {
    a = randomInt(1, maxA);
    juisteAntwoord = a;
    somTekst = `${a * delerVan} ÷ ${delerVan}`;
  } while (somTekst === vorigeSom && maxA > 1);
  vorigeSom = somTekst;
  huidigDeler = delerVan;

  document.getElementById('somDisplay').textContent = somTekst;

  const opties = genereerOpties(juisteAntwoord, maxA);
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
  while (set.size < 4 && pogingen < 300) {
    pogingen++;
    const delta = randomInt(-3, 3);
    if (delta === 0) continue;
    const kandidaat = juist + delta;
    if (kandidaat >= 1 && kandidaat <= max + 3 && !set.has(kandidaat)) set.add(kandidaat);
  }
  while (set.size < 4) {
    const kandidaat = randomInt(Math.max(1, juist - 3), juist + 3);
    if (!set.has(kandidaat)) set.add(kandidaat);
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
      setTimeout(() => toonBeloning(`Je hebt ${reeksDoelwit} deelsommen goed beantwoord!`), 700);
    } else {
      setTimeout(() => nieuweVraag(), 900);
    }
  } else {
    btn.classList.add('fout');
    fout++;
    toonFeedback(FEEDBACK_FOUT, 'fout');
    updateScore();
    // Toon visualisatie als ondersteuning bij fout antwoord
    const vizEl = document.getElementById('visualisatie');
    vizEl.innerHTML = '';
    vizEl.appendChild(renderVisualisatie(juisteAntwoord, huidigDeler));
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

// Visualisatie: juisteAntwoord groepjes van huidigDeler stippen
function renderVisualisatie(a, b) {
  const wrap = document.createElement('div');
  wrap.className = 'viz-wrap';
  if (a > 5 || b > 5) wrap.classList.add('mini');
  if (a > 7 || b > 7) wrap.classList.add('micro');

  for (let r = 0; r < a; r++) {
    const rij = document.createElement('div');
    const kolommen = Math.min(b, 5);
    const rijAantal = b <= 5 ? 1 : 2;
    rij.className = 'viz-groep';
    rij.style.gridTemplateColumns = `repeat(${kolommen}, 1fr)`;
    rij.style.gridTemplateRows = `repeat(${rijAantal}, 1fr)`;

    for (let i = 0; i < b; i++) {
      const stip = document.createElement('div');
      stip.className = 'viz-stip ' + (i < 5 ? 'rood' : 'blauw');
      stip.style.animationDelay = ((r * b + i) * 0.04) + 's';
      rij.appendChild(stip);
    }
    wrap.appendChild(rij);
  }
  return wrap;
}

nieuweVraag();
