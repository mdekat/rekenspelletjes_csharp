let tafelVan = 2;
let maxA = 10;
let goed = 0;
let fout = 0;
let reeks = 0;
const reeksDoelwit = 10;

let huidigA = 1;
let huidigB = 2;
let vorigeA = 0;
let bezig = false;

function setTafel(n) {
  tafelVan = n;
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
  huidigA = nieuweA;
  vorigeA = huidigA;
  huidigB = tafelVan;

  // Visualisatie: huidigA rijen van huidigB stippen
  const vizEl = document.getElementById('visualisatie');
  vizEl.innerHTML = '';
  vizEl.appendChild(renderVisualisatie(huidigA, huidigB));

  // Invulvelden leegmaken en stijl resetten
  ['inputA', 'inputB', 'inputAntwoord'].forEach(id => {
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

  // Verwijder eventuele volgende-knop van vorige vraag
  const oudeKnop = document.getElementById('volgendeBtnInline');
  if (oudeKnop) oudeKnop.remove();

  // Focus op eerste invulveld
  setTimeout(() => document.getElementById('inputA').focus(), 50);
}

function controleer() {
  if (bezig) return;

  const valA      = parseInt(document.getElementById('inputA').value);
  const valB      = parseInt(document.getElementById('inputB').value);
  const valAntw   = parseInt(document.getElementById('inputAntwoord').value);

  // Alle velden moeten ingevuld zijn
  if (isNaN(valA) || isNaN(valB) || isNaN(valAntw)) {
    toonFeedbackTekst('Vul alle velden in!', 'fout');
    return;
  }

  bezig = true;
  document.getElementById('controleerBtn').disabled = true;

  const exactGoed    = valA === huidigA && valB === huidigB;
  const omgekeerd    = valA === huidigB && valB === huidigA && !exactGoed;
  const antwoordKlopt = valAntw === huidigA * huidigB;

  if (exactGoed && antwoordKlopt) {
    // Helemaal goed
    markeerVelden('goed', 'goed', 'goed');
    goed++; reeks++;
    toonFeedbackTekst(FEEDBACK_GOED[Math.floor(Math.random() * FEEDBACK_GOED.length)], 'goed');
    updateScore();
    if (reeks >= reeksDoelwit) {
      setTimeout(() => toonBeloning(`Je hebt ${reeksDoelwit} sommen goed ingevuld!`), 700);
    } else {
      toonVolgendKnop();
    }
  } else if (omgekeerd && antwoordKlopt) {
    // Som omgedraaid, antwoord klopt wel — hint geven, opnieuw proberen
    markeerVelden('bijna', 'bijna', 'goed');
    toonFeedbackTekst('Bijna! Kijk nog eens goed naar de rijen en de groepjes.', 'bijna');
    setTimeout(() => {
      document.getElementById('inputA').classList.remove('bijna');
      document.getElementById('inputB').classList.remove('bijna');
      document.getElementById('inputA').disabled = false;
      document.getElementById('inputB').disabled = false;
      document.getElementById('controleerBtn').disabled = false;
      bezig = false;
    }, 1400);
  } else {
    // Fout
    const clsA    = (valA === huidigA) ? 'goed' : 'fout';
    const clsB    = (valB === huidigB) ? 'goed' : 'fout';
    const clsAntw = antwoordKlopt ? 'goed' : 'fout';
    markeerVelden(clsA, clsB, clsAntw);

    fout++;
    updateScore();
    toonFeedbackTekst(
      `Het was: ${huidigA} × ${huidigB} = ${huidigA * huidigB}`,
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

function markeerVelden(clsA, clsB, clsAntw) {
  document.getElementById('inputA').classList.add(clsA);
  document.getElementById('inputB').classList.add(clsB);
  document.getElementById('inputAntwoord').classList.add(clsAntw);
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

// Visualisatie: a rijen, elke rij een groepjes-bord met b stippen
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

// Enter-toets springt van veld naar veld, en activeert Controleer vanuit het laatste veld
document.addEventListener('DOMContentLoaded', () => {
  const volgorde = ['inputA', 'inputB', 'inputAntwoord'];
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
