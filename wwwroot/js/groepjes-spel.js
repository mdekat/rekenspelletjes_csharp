let niveau = 10;
let stap = 1;   // 1 = alle getallen, 5 = veelvouden van 5, 10 = veelvouden van 10
let modus = 'blokken';
let goed = 0, fout = 0, reeks = 0;
const reeksDoelwit = 10;
let juisteAntwoord = 0;
let bezig = false;
let vorigeSleutel = '';

function setLevel(n, s) {
  niveau = n;
  stap = s;
  document.querySelectorAll('.level-btn').forEach(b =>
    b.classList.toggle('active',
      parseInt(b.dataset.niveau) === n && parseInt(b.dataset.stap) === s));
  goed = 0; fout = 0; reeks = 0;
  updateScore();
  nieuweVraag();
}

function setModus(m) {
  modus = m;
  document.querySelectorAll('.modus-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.modus === m));
  nieuweVraag();
}

function updateScore() {
  document.getElementById('scoreGoed').textContent = goed;
  document.getElementById('scoreFout').textContent = fout;
  document.getElementById('scoreReeks').textContent = reeks;
  document.getElementById('progressBar').style.width = (reeks / reeksDoelwit * 100) + '%';
}

function genereerBord() {
  let n;
  if (stap === 1) {
    n = randomInt(1, niveau);
  } else {
    n = randomInt(1, Math.floor(niveau / stap)) * stap;
  }
  if (n === 0) n = stap;
  return {
    sleutel: 'bord-' + n,
    antwoord: n,
    label: 'Hoeveel stippen zie je?',
    render: () => renderBord(n, niveau)
  };
}

function kiesVraagType() {
  return genereerBord;
}

function nieuweVraag() {
  bezig = false;
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';

  let vraag;
  let pogingen = 0;
  do {
    vraag = kiesVraagType()();
    pogingen++;
  } while (vraag.sleutel === vorigeSleutel && pogingen < 20);
  vorigeSleutel = vraag.sleutel;
  juisteAntwoord = vraag.antwoord;

  document.getElementById('vraagLabel').textContent = vraag.label;
  document.getElementById('visualisatie').innerHTML = '';
  document.getElementById('visualisatie').appendChild(vraag.render());

  const opties = genereerOpties(juisteAntwoord, niveau, Math.max(stap, 1));
  const grid = document.getElementById('answersGrid');
  grid.innerHTML = '';
  grid.style.pointerEvents = 'none';
  opties.forEach(o => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = o;
    btn.onclick = () => kiesAntwoord(btn, o);
    grid.appendChild(btn);
  });
  setTimeout(() => { grid.style.pointerEvents = ''; }, 0);
}

function genereerOpties(juist, max, s) {
  const set = new Set([juist]);
  let p = 0;
  while (set.size < 4 && p++ < 300) {
    const delta = (Math.floor(Math.random() * 5) + 1) * s * (Math.random() < 0.5 ? 1 : -1);
    const k = juist + delta;
    if (k >= s && k <= max && !set.has(k)) set.add(k);
  }
  // Fallback: altijd veelvouden van s pakken
  while (set.size < 4) {
    const k = s > 1
      ? randomInt(1, Math.floor(max / s)) * s
      : randomInt(Math.max(1, juist - 5), Math.min(max, juist + 5));
    if (!set.has(k) && k >= 1 && k <= max) set.add(k);
  }
  return shuffle([...set]);
}

function renderBord(n, niv) {
  const wrap = document.createElement('div');
  wrap.className = 'borden-wrap';

  if (modus === 'lineair') {
    wrap.classList.add('lineair');
  } else {
    const aantalBorden = niv / 10;
    if (aantalBorden > 4) wrap.classList.add('micro');
    else if (aantalBorden > 2) wrap.classList.add('mini');
  }

  const aantalBorden = niv / 10;
  for (let b = 0; b < aantalBorden; b++) {
    const gevuld = Math.min(10, Math.max(0, n - b * 10));
    wrap.appendChild(maakFrame(gevuld));
  }
  return wrap;
}

function maakFrame(gevuld) {
  const frame = document.createElement('div');
  frame.className = modus === 'lineair' ? 'tientalsbord lineair' : 'tientalsbord rij2';
  for (let i = 1; i <= 10; i++) {
    const stip = document.createElement('div');
    stip.className = 'stip';
    if (i <= gevuld) {
      stip.classList.add(i <= 5 ? 'rood' : 'blauw');
      stip.style.animationDelay = ((i - 1) * 0.07) + 's';
    } else {
      stip.classList.add('leeg');
    }
    frame.appendChild(stip);
  }
  return frame;
}

function kiesAntwoord(btn, waarde) {
  if (bezig) return;
  bezig = true;
  const alleKnoppen = document.querySelectorAll('.answer-btn');
  alleKnoppen.forEach(b => b.disabled = true);

  if (waarde === juisteAntwoord) {
    btn.classList.add('goed');
    goed++; reeks++;
    toonFeedback(FEEDBACK_GOED, 'goed');
    updateScore();
    if (reeks >= reeksDoelwit) {
      setTimeout(() => toonBeloning(`Je hebt ${reeksDoelwit} vragen goed beantwoord!`), 700);
    } else {
      setTimeout(nieuweVraag, 900);
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
  reeks = 0; updateScore(); nieuweVraag();
}

nieuweVraag();
