let target = 10, pendingTarget = 10, cols = 4, rows = 4;
let tiles = [], selectedIndex = null;
let foundPairs = 0, totalPairs = 0, wrongMoves = 0;
let msgTimeout = null;
let images = ['animals2_square.jpg', 'animals_square.jpg', 'bear_square.jpg', 'cubs_square.jpg', 'eenhoorn1.jpg', 'eenhoorn2_square.jpg', 'eenhoorn3_square.jpg', 'eenhoorn4_square.jpg', 'eenhoorn5_square.jpg', 'einhorn-und-regenbogen_square.jpg', 'elfje2.jpg', 'elfje_square.jpg', 'kittens2_square.jpg', 'kittens_square.jpg', 'owls_square.jpg', 'rainbow_square.jpg'];

function setTarget(n, btn) {
  pendingTarget = n;
  document.querySelectorAll('.target-buttons .btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function startGame() {
  target = pendingTarget;
  cols = 4;
  rows = 4;

  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('winScreen').classList.remove('show');
  document.getElementById('gameControls').style.display = 'block';
  document.getElementById('gameScreen').style.display = 'block';
  document.getElementById('targetNumber').textContent = target;
  document.getElementById('tileGrid').className = 'grid cols-' + cols;

  const randomImage = images[Math.floor(Math.random() * images.length)];
  document.getElementById('tileGrid').style.backgroundImage = 'url(../img/vierkant/' + randomImage + ')';

  generateTiles();
  selectedIndex = null;
  foundPairs = 0;
  wrongMoves = 0;
  totalPairs = Math.floor((cols * rows) / 2);
  updateScore();
  setMessage('Klik op het eerste getal!', 'info');
  renderTiles();
}

function generateTiles() {
  const count = cols * rows;
  const validPairs = [];
  for (let a = 1; a < target; a++) {
    validPairs.push([a, target - a]);
  }
  const pairsNeeded = count / 2;
  const nums = [];
  for (let i = 0; i < pairsNeeded; i++) {
    const p = validPairs[i % validPairs.length];
    nums.push(p[0]);
    nums.push(p[1]);
  }
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  tiles = nums.map((n, i) => ({ value: n, found: false, id: i }));
}

function renderTiles() {
  const grid = document.getElementById('tileGrid');
  grid.innerHTML = '';
  tiles.forEach((tile, i) => {
    const div = document.createElement('div');
    div.className = 'tile' +
      (tile.found ? ' found' : '') +
      (selectedIndex === i ? ' selected' : '');

    const valueSpan = document.createElement('span');
    valueSpan.className = 'tile-text';
    valueSpan.textContent = tile.found ? '' : tile.value;
    div.appendChild(valueSpan);

    div.addEventListener('click', () => clickTile(i));
    grid.appendChild(div);
  });
}

function clickTile(i) {
  const tile = tiles[i];
  if (tile.found) return;

  if (selectedIndex === i) {
    selectedIndex = null;
    renderTiles();
    setMessage('Klik op het eerste getal!', 'info');
    return;
  }

  if (selectedIndex === null) {
    selectedIndex = i;
    renderTiles();
    setMessage('Goed! Klik nu op het tweede getal!', 'info');
  } else {
    const first = tiles[selectedIndex];
    const second = tile;
    const si = selectedIndex;
    selectedIndex = null;

    if (first.value + second.value === target) {
      first.found = true;
      second.found = true;
      foundPairs++;
      renderTiles();
      updateScore();
      if (foundPairs === totalPairs) {
        setTimeout(showWin, 600);
      } else {
        setMessage('Super! ' + first.value + ' + ' + second.value + ' = ' + target, 'good');
        clearTimeout(msgTimeout);
        msgTimeout = setTimeout(() => setMessage('Klik op het eerste getal!', 'info'), 1800);
      }
    } else {
      wrongMoves++;
      flashWrong(si, i);
      updateScore();
      setMessage(first.value + ' + ' + second.value + ' = ' + (first.value + second.value) + '. Probeer opnieuw!', 'bad');
      clearTimeout(msgTimeout);
      msgTimeout = setTimeout(() => setMessage('Klik op het eerste getal!', 'info'), 2000);
    }
  }
}

function flashWrong(i1, i2) {
  renderTiles();
  const td = document.querySelectorAll('.tile');
  if (td[i1]) td[i1].classList.add('wrong');
  if (td[i2]) td[i2].classList.add('wrong');
  setTimeout(() => renderTiles(), 600);
}

function updateScore() {
  document.getElementById('foundCount').textContent = foundPairs;
  document.getElementById('wrongCount').textContent = wrongMoves;
  document.getElementById('pairsLeft').textContent = totalPairs - foundPairs;
  const pct = totalPairs > 0 ? (foundPairs / totalPairs * 100) : 0;
  document.getElementById('progressBar').style.width = pct + '%';
}

function setMessage(text, type) {
  const el = document.getElementById('message');
  el.textContent = text;
  el.className = 'message ' + type;
}

function showWin() {
  document.getElementById('gameControls').style.display = 'none';
  document.getElementById('winScreen').classList.add('show');
  document.getElementById('winStats').textContent =
    'Je vond alle ' + totalPairs + ' paren! Fouten gemaakt: ' + wrongMoves + '.';
  launchConfetti();
}

function launchConfetti() {
  const container = document.getElementById('confettiContainer');
  container.innerHTML = '';
  const colors = ['#e040fb', '#7c4dff', '#00bcd4', '#4caf50', '#ffd200', '#ff5722'];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = (Math.random() * 100) + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    piece.style.animationDuration = (1.5 + Math.random() * 2.5) + 's';
    piece.style.animationDelay = (Math.random() * 1.5) + 's';
    piece.style.width = (8 + Math.random() * 14) + 'px';
    piece.style.height = (8 + Math.random() * 14) + 'px';
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 5000);
  }
}
