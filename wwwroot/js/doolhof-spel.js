const RIJEN = 9, KOLOMMEN = 9;
const MAX_LEVENS = 3;
const LEVENS_ICOON = ['', '&#x2764;', '&#x2764;&#x2764;', '&#x2764;&#x2764;&#x2764;'];

let doelsom = 8;
let startR = 0, startC = 0, finishR = 0, finishC = 0;
let sums = [], pad = new Set();
let playerR = 0, playerC = 0;
let bezocht = new Set();
let levens = MAX_LEVENS;
let spelKlaar = false;

(function bouwGetalBar() {
  const bar = document.getElementById('getalBar');
  for (let n = 2; n <= 20; n++) {
    const btn = document.createElement('button');
    btn.className = 'getal-btn' + (n === doelsom ? ' active' : '');
    btn.textContent = n;
    btn.onclick = () => setDoelsom(n);
    bar.appendChild(btn);
  }
})();

function setDoelsom(n) {
  doelsom = n;
  document.querySelectorAll('.getal-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.textContent) === n);
  });
  document.getElementById('doelgetal').textContent = n;
  nieuwSpel();
}

function nieuwSpel() {
  document.getElementById('winOverlay').classList.remove('show');
  document.getElementById('afgelopenOverlay').classList.remove('show');
  levens = MAX_LEVENS;
  spelKlaar = false;
  document.getElementById('levensBadge').innerHTML = LEVENS_ICOON[levens];

  [startR, startC, finishR, finishC] = pickStartFinish();
  playerR = startR; playerC = startC;
  bezocht = new Set([`${startR},${startC}`]);

  pad = genereerPad(startR, startC, finishR, finishC);
  sums = wijsSommenToe(pad);
  toonDoolhof();
}

function pickStartFinish() {
  const configs = [
    () => [randomInt(0, RIJEN-1), 0,          randomInt(0, RIJEN-1), KOLOMMEN-1],
    () => [0,          randomInt(0, KOLOMMEN-1), RIJEN-1,   randomInt(0, KOLOMMEN-1)],
    () => [randomInt(0, RIJEN-1), 0,          RIJEN-1,   randomInt(0, KOLOMMEN-1)],
    () => [0,          randomInt(0, KOLOMMEN-1), randomInt(0, RIJEN-1), KOLOMMEN-1],
  ];
  return shuffle(configs)[0]();
}

function genereerPad(sr, sc, fr, fc) {
  const ber = Array.from({length: RIJEN}, () => Array(KOLOMMEN).fill(false));
  ber[sr][sc] = true;

  function dfs(r, c) {
    if (r === fr && c === fc) return [[r, c]];
    for (const [dr, dc] of shuffle([[0,1],[1,0],[0,-1],[-1,0]])) {
      const nr = r+dr, nc = c+dc;
      if (nr >= 0 && nr < RIJEN && nc >= 0 && nc < KOLOMMEN && !ber[nr][nc]) {
        ber[nr][nc] = true;
        const rest = dfs(nr, nc);
        if (rest !== null) return [[r, c], ...rest];
        ber[nr][nc] = false;
      }
    }
    return null;
  }

  const gevonden = dfs(sr, sc);
  return new Set((gevonden || []).map(([r, c]) => `${r},${c}`));
}

function wijsSommenToe(padSet) {
  const s = [];
  for (let r = 0; r < RIJEN; r++) {
    s.push([]);
    for (let c = 0; c < KOLOMMEN; c++) {
      if (padSet.has(`${r},${c}`)) {
        const a = randomInt(0, doelsom);
        s[r].push({ a, b: doelsom - a });
      } else {
        let a, b;
        do {
          const afwijking = randomInt(1, 3) * (Math.random() < 0.5 ? 1 : -1);
          const fout = Math.max(0, Math.min(20, doelsom + afwijking));
          a = randomInt(0, fout);
          b = fout - a;
        } while (a + b === doelsom);
        s[r].push({ a, b });
      }
    }
  }
  return s;
}

function toonDoolhof() {
  const tbody = document.getElementById('mazeBody');
  tbody.innerHTML = '';

  for (let r = 0; r < RIJEN; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < KOLOMMEN; c++) {
      const td = document.createElement('td');
      td.className = 'cel';
      td.dataset.r = r; td.dataset.c = c;

      const key = `${r},${c}`;
      const isStart  = r === startR  && c === startC;
      const isFinish = r === finishR && c === finishC;
      const isHuidig = r === playerR && c === playerC;

      if (isHuidig)              td.classList.add('huidig');
      else if (bezocht.has(key)) td.classList.add('bezocht');
      else if (isStart)          td.classList.add('start-cel');
      else if (isFinish)         td.classList.add('finish-cel');

      const {a, b} = sums[r][c];
      if (isFinish) {
        td.innerHTML = `${a}+${b}<br>&#x1F3C1;`;
      } else {
        td.textContent = `${a}+${b}`;
      }

      td.addEventListener('click', () => handleKlik(r, c));
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

function handleKlik(r, c) {
  if (spelKlaar) return;
  if (!isAangrenzend(playerR, playerC, r, c)) return;

  const key = `${r},${c}`;

  if (bezocht.has(key)) {
    playerR = r; playerC = c;
    toonDoolhof();
    return;
  }

  const {a, b} = sums[r][c];
  if (a + b === doelsom) {
    bezocht.add(key);
    playerR = r; playerC = c;
    toonDoolhof();
    if (r === finishR && c === finishC) gewonnen();
  } else {
    levens--;
    document.getElementById('levensBadge').innerHTML = LEVENS_ICOON[levens];
    flitsRood(r, c);
    if (levens <= 0) {
      spelKlaar = true;
      setTimeout(() => document.getElementById('afgelopenOverlay').classList.add('show'), 600);
    }
  }
}

function isAangrenzend(r1, c1, r2, c2) {
  return (Math.abs(r1-r2) + Math.abs(c1-c2)) === 1;
}

function flitsRood(r, c) {
  const td = document.querySelector(`td[data-r="${r}"][data-c="${c}"]`);
  if (!td) return;
  td.classList.remove('fout-flits');
  void td.offsetWidth;
  td.classList.add('fout-flits');
  td.addEventListener('animationend', () => td.classList.remove('fout-flits'), {once: true});
}

function gewonnen() {
  spelKlaar = true;
  const fouten = MAX_LEVENS - levens;
  document.getElementById('winTekst').textContent = fouten === 0
    ? 'Zonder één fout — perfect!'
    : `Met ${fouten} fout${fouten === 1 ? '' : 'en'}. Geweldig!`;
  setTimeout(() => {
    document.getElementById('winOverlay').classList.add('show');
    animConfetti();
  }, 400);
}

nieuwSpel();
