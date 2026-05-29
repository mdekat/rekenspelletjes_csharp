const PUZZEL_AFBEELDINGEN = [
  '/img/vierkant/eenhoorn2_square.jpg',
  '/img/vierkant/eenhoorn3_square.jpg',
  '/img/vierkant/eenhoorn4_square.jpg',
  '/img/vierkant/eenhoorn5_square.jpg',
  '/img/vierkant/bear_square.jpg',
  '/img/vierkant/animals_square.jpg',
  '/img/vierkant/animals2_square.jpg',
  '/img/vierkant/kittens_square.jpg',
  '/img/vierkant/kittens2_square.jpg',
  '/img/vierkant/cubs_square.jpg',
  '/img/vierkant/owls_square.jpg',
  '/img/vierkant/rainbow_square.jpg',
  '/img/vierkant/elfje_square.jpg',
  '/img/vierkant/einhorn-und-regenbogen_square.jpg',
  '/img/vierkant/eenhoorn1.jpg',
];

const PUZZEL_KLAAR_BERICHTEN = [
  'Goed zo! Je hebt het plaatje vrijgespeeld!',
  'Super! De puzzel is compleet!',
  'Wauw! Het plaatje is onthuld!',
  'Geweldig! Alle stukjes zijn weg!',
  'Bravo! Jij bent een puzzelkampioen!',
  'Yes! Zo snel! Mooi plaatje he?',
];

const FEEDBACK_GOED = ['Super!', 'Goed zo!', 'Top!', 'Ja!', 'Bravo!', 'Prima!', 'Wauw!'];
const FEEDBACK_FOUT = ['Helaas...', 'Niet goed!', 'Probeer opnieuw!', 'Oeps!'];

let niveau = 10;
let goed = 0;
let fout = 0;
let puzzelStukjes = 0;
const puzzelDoelwit = 9;

let juisteAntwoord = 0;
let bezig = false;
let vorigeSom = '';
let huidigeAfbeelding = '';
let verwijderdeVakjes = [];

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

function setLevel(n) {
  niveau = n;
  document.querySelectorAll('.level-btn').forEach(b =>
    b.classList.toggle('active', b.textContent == n));
  goed = 0;
  fout = 0;
  updateScore();
  initialiseerPuzzel();
  nieuweVraag();
}

function updateScore() {
  document.getElementById('scoreGoed').textContent = goed;
  document.getElementById('scoreFout').textContent = fout;
  document.getElementById('scorePuzzel').textContent = puzzelStukjes;
}

function initialiseerPuzzel() {
  puzzelStukjes = 0;
  verwijderdeVakjes = [];

  let keuze;
  do {
    keuze = PUZZEL_AFBEELDINGEN[Math.floor(Math.random() * PUZZEL_AFBEELDINGEN.length)];
  } while (keuze === huidigeAfbeelding && PUZZEL_AFBEELDINGEN.length > 1);
  huidigeAfbeelding = keuze;
  document.getElementById('puzzleImg').src = keuze;

  const grid = document.getElementById('puzzleGrid');
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const square = document.createElement('div');
    square.className = 'puzzle-square';
    square.dataset.index = i;
    grid.appendChild(square);
  }

  updateScore();
}

function verwijderStukje() {
  const nog = [];
  for (let i = 0; i < 9; i++) {
    if (!verwijderdeVakjes.includes(i)) nog.push(i);
  }
  if (nog.length === 0) return;

  // Middentegel (index 4) altijd als laatste
  let kandidaten = nog.filter(i => i !== 4);
  if (kandidaten.length === 0) kandidaten = nog;

  const keuze = kandidaten[Math.floor(Math.random() * kandidaten.length)];
  verwijderdeVakjes.push(keuze);
  puzzelStukjes++;

  const square = document.querySelector(`.puzzle-square[data-index="${keuze}"]`);
  if (square) {
    square.classList.add('verdwijn');
    // Niet uit DOM verwijderen — tegel onzichtbaar maken zodat positie behouden blijft
    square.addEventListener('animationend', () => {
      square.classList.remove('verdwijn');
      square.style.visibility = 'hidden';
    }, { once: true });
  }

  updateScore();

  if (puzzelStukjes >= puzzelDoelwit) {
    setTimeout(toonPuzzelKlaar, 500);
  }
}

function toonPuzzelKlaar() {
  document.getElementById('gameInteractie').classList.add('verborgen');
  const tekst = PUZZEL_KLAAR_BERICHTEN[Math.floor(Math.random() * PUZZEL_KLAAR_BERICHTEN.length)];
  document.getElementById('puzzelKlaarTekst').textContent = tekst;
  document.getElementById('puzzelKlaar').classList.add('toon');
}

function nieuwPlaatje() {
  document.getElementById('gameInteractie').classList.remove('verborgen');
  document.getElementById('puzzelKlaar').classList.remove('toon');
  initialiseerPuzzel();
  nieuweVraag();
}

function nieuweVraag() {
  bezig = false;
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';

  let a, b, somTekst;
  do {
    a = randomInt(1, niveau - 1);
    b = randomInt(1, niveau - a);
    juisteAntwoord = a + b;
    somTekst = `${a} + ${b}`;
  } while (somTekst === vorigeSom);
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
  while (set.size < 4) set.add(randomInt(0, max));
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
    const el = document.getElementById('feedback');
    el.textContent = FEEDBACK_GOED[Math.floor(Math.random() * FEEDBACK_GOED.length)];
    el.className = 'feedback goed';
    updateScore();
    verwijderStukje();
    if (puzzelStukjes < puzzelDoelwit) {
      setTimeout(() => nieuweVraag(), 900);
    }
  } else {
    btn.classList.add('fout');
    fout++;
    const el = document.getElementById('feedback');
    el.textContent = FEEDBACK_FOUT[Math.floor(Math.random() * FEEDBACK_FOUT.length)];
    el.className = 'feedback fout';
    updateScore();
    setTimeout(() => {
      btn.classList.remove('fout');
      alleKnoppen.forEach(b => b.disabled = false);
      bezig = false;
    }, 700);
  }
}

initialiseerPuzzel();
nieuweVraag();
