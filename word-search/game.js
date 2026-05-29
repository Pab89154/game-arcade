const SIZE = 12;
const THEMES = {
  animals: { name: "Animals", words: ["CAT", "DOG", "BEAR", "FISH", "BIRD", "LION", "FROG", "DUCK"] },
  space: { name: "Space", words: ["MOON", "STAR", "MARS", "SUN", "COMET", "ROCKET", "PLANET", "ALIEN"] },
  food: { name: "Food", words: ["PIZZA", "CAKE", "APPLE", "CORN", "RICE", "BEAN", "MILK", "BREAD"] },
};

const DIRS = [
  [0, 1], [1, 0], [1, 1], [1, -1], [-1, 1], [0, -1], [-1, 0], [-1, -1],
];

let themeKey = "animals";
let grid = [];
let words = [];
let found = new Set();
let placements = [];
let dragStart = null;
let dragCells = [];

const gridEl = document.getElementById("grid");
const wordListEl = document.getElementById("wordList");
const statusEl = document.getElementById("status");
const themesEl = document.getElementById("themes");
const newBtn = document.getElementById("newBtn");

function randLetter() {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

function canPlace(word, r, c, dr, dc) {
  for (let i = 0; i < word.length; i++) {
    const nr = r + dr * i;
    const nc = c + dc * i;
    if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) return false;
    const ch = grid[nr][nc];
    if (ch && ch !== word[i]) return false;
  }
  return true;
}

function placeWord(word) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
    const r = Math.floor(Math.random() * SIZE);
    const c = Math.floor(Math.random() * SIZE);
    if (!canPlace(word, r, c, dir[0], dir[1])) continue;
    const cells = [];
    for (let i = 0; i < word.length; i++) {
      const nr = r + dir[0] * i;
      const nc = c + dir[1] * i;
      grid[nr][nc] = word[i];
      cells.push(nr * SIZE + nc);
    }
    placements.push({ word, cells });
    return true;
  }
  return false;
}

function buildPuzzle() {
  grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
  placements = [];
  found = new Set();
  words = [...THEMES[themeKey].words].sort((a, b) => b.length - a.length);
  const toPlace = [...words];
  for (const w of toPlace) {
    if (!placeWord(w)) return buildPuzzle();
  }
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!grid[r][c]) grid[r][c] = randLetter();
    }
  }
  render();
}

function render() {
  gridEl.innerHTML = "";
  for (let i = 0; i < SIZE * SIZE; i++) {
    const cell = document.createElement("div");
    cell.className = "ws-cell";
    cell.dataset.i = i;
    cell.textContent = grid[Math.floor(i / SIZE)][i % SIZE];
    if (foundCells().has(i)) cell.classList.add("found");
    gridEl.appendChild(cell);
  }
  wordListEl.innerHTML = "";
  words.forEach((w) => {
    const span = document.createElement("span");
    span.textContent = w;
    if (found.has(w)) span.classList.add("found");
    wordListEl.appendChild(span);
  });
  if (found.size === words.length) {
    statusEl.textContent = "You found them all! 🎉";
  } else {
    statusEl.textContent = "Drag across letters to find words!";
  }
}

function foundCells() {
  const set = new Set();
  placements.forEach((p) => {
    if (found.has(p.word)) p.cells.forEach((i) => set.add(i));
  });
  return set;
}

function cellsInLine(a, b) {
  const ar = Math.floor(a / SIZE), ac = a % SIZE;
  const br = Math.floor(b / SIZE), bc = b % SIZE;
  const dr = br - ar, dc = bc - ac;
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) return [a];
  const sr = dr === 0 ? 0 : dr / Math.abs(dr);
  const sc = dc === 0 ? 0 : dc / Math.abs(dc);
  const out = [];
  for (let i = 0; i <= steps; i++) out.push((ar + sr * i) * SIZE + (ac + sc * i));
  return out;
}

function highlightCells(indices) {
  gridEl.querySelectorAll(".ws-cell").forEach((el) => el.classList.remove("selected"));
  indices.forEach((i) => {
    const el = gridEl.querySelector('[data-i="' + i + '"]');
    if (el) el.classList.add("selected");
  });
}

function checkSelection(indices) {
  const sorted = indices.slice().sort((a, b) => a - b);
  const str = sorted.map((i) => grid[Math.floor(i / SIZE)][i % SIZE]).join("");
  const rev = str.split("").reverse().join("");
  for (const p of placements) {
    if ((str === p.word || rev === p.word) && !found.has(p.word)) {
      found.add(p.word);
      render();
      return;
    }
  }
}

function onPointerDown(i) {
  dragStart = i;
  dragCells = [i];
  highlightCells(dragCells);
}

function onPointerEnter(i) {
  if (dragStart === null) return;
  const line = cellsInLine(dragStart, i);
  if (line) {
    dragCells = line;
    highlightCells(dragCells);
  }
}

function onPointerUp() {
  if (dragCells.length) checkSelection(dragCells);
  dragStart = null;
  dragCells = [];
  highlightCells([]);
}

function bindGridEvents() {
  gridEl.addEventListener("mousedown", (e) => {
    const t = e.target.closest(".ws-cell");
    if (t) onPointerDown(+t.dataset.i);
  });
  gridEl.addEventListener("mouseover", (e) => {
    const t = e.target.closest(".ws-cell");
    if (t && dragStart !== null) onPointerEnter(+t.dataset.i);
  });
  window.addEventListener("mouseup", onPointerUp);
  gridEl.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const t = e.target.closest(".ws-cell");
    if (t) onPointerDown(+t.dataset.i);
  }, { passive: false });
  gridEl.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const t = el && el.closest(".ws-cell");
    if (t && dragStart !== null) onPointerEnter(+t.dataset.i);
  }, { passive: false });
  window.addEventListener("touchend", onPointerUp);
}

Object.keys(THEMES).forEach((key) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "theme-btn" + (key === themeKey ? " active" : "");
  btn.textContent = THEMES[key].name;
  btn.addEventListener("click", () => {
    themeKey = key;
    themesEl.querySelectorAll(".theme-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    buildPuzzle();
  });
  themesEl.appendChild(btn);
});

newBtn.addEventListener("click", buildPuzzle);
bindGridEvents();
buildPuzzle();
