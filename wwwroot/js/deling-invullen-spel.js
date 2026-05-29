let delerVan = 2;
let maxA = 10;
let goed = 0;
let fout = 0;
let reeks = 0;
const reeksDoelwit = 10;

let huidigKwotient = 1;
let huidigDeler = 2;
let huidigDeeltal = 2;
let vorigeA = 0;
let bezig = false;

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

  let nieuweA;
  do {
    nieuweA = randomInt(1, maxA);
  } while (nieuweA === vorigeA && maxA > 1);
  huidigKwotient = nieuweA;
  vorigeA = huidigKwotient;
  huidigDeler = delerVan;
  huidigDeeltal = huidigKwotient * huidigDeler;

  // Visualisatie: huidigKwotient groepjes van huidigDeler stippen
  const vizEl = document.getElementById('visualisatie');
  vizEl.innerHTML = '';
  vizEl.appendChild(renderVisualisatie(huidigKwotient, huidigDeler));

  ['inputDeeltal', 'inputDeler', 'inputAntwoord'].forEach(id => {
    const el = document.getElementById(id);
    el.value = '';
    el.classList.remove('goed', 'fout');
    el.disabled = false;
  });

  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';
  const btn = document.getElementById('controleerBtn');
  btn.textContent = '✓ Controleer';
  btn.onclick = controleer;
  btn.disabled = false;

  const oudeKnop = document.getElementById('volgendeBtnInline');
  if (oudeKnop) oudeKnop.remove();

  setTimeout(() => document.getElementById('inputDeeltal').focus(), 50);
}

function controleer() {
  if (bezig) return;

  const valDeeltal  = parseInt(document.getElementById('inputDeeltal').value);
  const valDeler    = parseInt(document.getElementById('inputDeler').value);
  const valAntwoord = parseInt(document.getElementById('inputAntwoord').value);

  if (isNaN(valDeeltal) || isNaN(valDeler) || isNaN(valAntwoord)) {
    toonFeedbackTekst('Vul alle velden in!', 'fout');
    return;
  }

  bezig = true;
  document.getElementById('controleerBtn').disabled = true;

  const deeltalKlopt  = valDeeltal  === huidigDeeltal;
  const delerKlopt    = valDeler    === huidigDeler;
  const antwoordKlopt = valAntwoord === huidigKwotient;

  if (deeltalKlopt && delerKlopt && antwoordKlopt) {
    markeerVelden('goed', 'goed', 'goed');
    goed++; reeks++;
    toonFeedbackTekst(FEEDBACK_GOED[Math.floor(Math.random() * FEEDBACK_GOED.length)], 'goed');
    updateScore();
    if (reeks >= reeksDoelwit) {
      setTimeout(() => toonBeloning(`Je hebt ${reeksDoelwit} deelsommen goed ingevuld!`), 700);
    } else {
      toonVolgendKnop();
    }
  } else {
    const clsDeeltal  = deeltalKlopt  ? 'goed' : 'fout';
    const clsDeler    = delerKlopt    ? 'goed' : 'fout';
    const clsAntwoord = antwoordKlopt ? 'goed' : 'fout';
    markeerVelden(clsDeeltal, clsDeler, clsAntwoord);

    fout++;
    updateScore();
    toonFeedbackTekst(
      `Het was: ${huidigDeeltal} ÷ ${huidigDeler} = ${huidigKwotient}`,
      'fout'
    );

    setTimeout(() => {
      const btn = document.getElementById('controleerBtn');
      btn.textContent = '▶ Volgende som';
      btn.disabled = false;
      btn.onclick = () => {
        btn.textContent = '✓ Controleer';
        btn.onclick = controleer;
        nieuweVraag();
      };
      bezig = false;
    }, 1200);
  }
}

function markeerVelden(clsDeeltal, clsDeler, clsAntwoord) {
  document.getElementById('inputDeeltal').classList.add(clsDeeltal);
  document.getElementById('inputDeler').classList.add(clsDeler);
  document.getElementById('inputAntwoord').classList.add(clsAntwoord);
}

function toonFeedbackTekst(tekst, cls) {
  const el = document.getElementById('feedback');
  el.textContent = tekst;
  el.className = 'feedback ' + cls;
}

function toonVolgendKnop() {
  const btn = document.createElement('button');
  btn.id = 'volgendeBtnInline';
  btn.className = 'volgende-btn';
  btn.textContent = '▶ Volgende som';
  btn.onclick = nieuweVraag;
  document.getElementById('feedback').insertAdjacentElement('afterend', btn);
}

function volgende() {
  document.getElementById('rewardOverlay').classList.remove('show');
  reeks = 0;
  updateScore();
  nieuweVraag();
}

// Visualisatie: a groepjes van b stippen
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

document.addEventListener('DOMContentLoaded', () => {
  const volgorde = ['inputDeeltal', 'inputDeler', 'inputAntwoord'];
  volgorde.forEach((id, i) => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        if (i < volgorde.length - 1) {
          document.getElementById(volgorde[i + 1]).focus();
        } else {
          controleer();
        }
      }
    });
  });
});

nieuweVraag();
