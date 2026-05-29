const PUZZLES = [
  {
    puzzle: [5,3,0,0,7,0,0,0,0,6,0,0,1,9,5,0,0,0,0,9,8,0,0,0,0,6,0,0,0,0,0,6,0,0,0,3,0,0,0,8,0,3,0,0,1,0,0,0,0,2,0,0,0,6,0,6,0,0,0,0,2,8,0,0,0,0,4,1,9,0,0,5,0,0,0,0,8,0,0,7,9],
    solution: [5,3,4,6,7,8,9,1,2,6,7,2,1,9,5,3,4,8,1,9,8,3,4,2,5,6,7,8,5,9,7,6,1,4,2,3,4,2,6,8,5,3,7,9,1,7,1,3,9,2,4,8,5,6,9,6,1,5,3,7,2,8,4,2,8,7,4,1,9,6,3,5,3,4,5,2,8,6,1,7,9],
  },
  {
    puzzle: [0,0,3,0,2,0,6,0,0,0,0,0,1,0,5,0,0,0,0,0,8,0,0,0,9,0,0,0,7,0,8,0,0,0,1,0,0,0,0,4,0,3,0,0,0,6,0,1,0,9,0,7,0,0,0,0,0,0,0,0,0,5,0,0,2,0,1,0,9,0,4,0,0,0,8,0,0,0,6,0,0],
    solution: [1,4,3,7,2,6,5,8,9,6,9,2,1,8,5,4,3,7,5,7,8,4,3,9,1,2,6,2,1,5,8,9,7,3,6,4,9,6,7,5,4,3,2,1,8,8,3,4,6,1,2,7,9,5,7,8,1,9,6,4,2,5,3,3,2,6,5,7,9,8,4,1,4,5,9,2,8,1,6,7,3],
  },
  {
    puzzle: [0,0,0,2,6,0,0,4,0,1,0,0,0,5,0,0,0,0,0,0,0,3,0,7,0,0,0,3,0,4,0,0,0,0,0,0,8,9,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,8,0,3,0,0,0,0,0,5,2,4,0,0,0,0,0,0,0,0,0,0,0,0],
    solution: [4,8,3,9,2,1,6,5,7,9,1,2,5,4,3,8,7,6,2,5,6,3,7,8,4,9,1,1,3,4,2,6,9,5,8,7,5,7,8,1,3,4,9,2,6,6,2,9,7,8,1,3,4,5,8,4,1,6,9,7,2,3,5,3,6,5,4,1,2,7,9,8,7,9,8,3,5,6,1,2,4],
  },
];

let puzzleIndex = 0;
let given = [];
let board = [];
let selected = -1;

const gridEl = document.getElementById("grid");
const statusEl = document.getElementById("status");
const numpadEl = document.getElementById("numpad");
const checkBtn = document.getElementById("checkBtn");
const hintBtn = document.getElementById("hintBtn");
const newBtn = document.getElementById("newBtn");

function loadPuzzle(index) {
  const p = PUZZLES[index % PUZZLES.length];
  given = p.puzzle.map((n, i) => (n !== 0 ? i : -1)).filter((i) => i >= 0);
  board = p.puzzle.slice();
  selected = -1;
  statusEl.textContent = "Fill every row, column, and box with 1–9";
  render();
}

function solutionAt(index) {
  return PUZZLES[puzzleIndex % PUZZLES.length].solution[index];
}

function render() {
  gridEl.innerHTML = "";
  for (let i = 0; i < 81; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cell";
    const isGiven = given.includes(i);
    if (isGiven) btn.classList.add("given");
    if (i === selected) btn.classList.add("selected");
    btn.textContent = board[i] || "";
    btn.addEventListener("click", () => {
      if (!isGiven) {
        selected = i;
        render();
      }
    });
    gridEl.appendChild(btn);
  }
}

function setCell(val) {
  if (selected < 0 || given.includes(selected)) return;
  board[selected] = val;
  render();
  if (isComplete() && isCorrect()) win();
}

function isComplete() {
  return board.every((n) => n >= 1 && n <= 9);
}

function isCorrect() {
  return board.every((n, i) => n === solutionAt(i));
}

function win() {
  statusEl.textContent = "You solved it! 🎉";
}

function checkAnswer() {
  let wrong = false;
  const cells = gridEl.querySelectorAll(".cell");
  board.forEach((n, i) => {
    if (given.includes(i) || !n) return;
    if (n !== solutionAt(i)) {
      cells[i].classList.add("wrong");
      wrong = true;
    }
  });
  if (isComplete() && isCorrect()) win();
  else if (wrong) statusEl.textContent = "Some numbers are wrong. Keep trying!";
  else if (isComplete()) statusEl.textContent = "Not quite right yet.";
  else statusEl.textContent = "Keep going — fill all the cells!";
}

function giveHint() {
  const empty = [];
  for (let i = 0; i < 81; i++) {
    if (!given.includes(i) && board[i] !== solutionAt(i)) empty.push(i);
  }
  if (!empty.length) return;
  const i = empty[Math.floor(Math.random() * empty.length)];
  board[i] = solutionAt(i);
  selected = i;
  render();
  if (isComplete() && isCorrect()) win();
}

for (let n = 1; n <= 9; n++) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = n;
  b.addEventListener("click", () => setCell(n));
  numpadEl.appendChild(b);
}
const erase = document.createElement("button");
erase.type = "button";
erase.textContent = "⌫";
erase.addEventListener("click", () => setCell(0));
numpadEl.appendChild(erase);

checkBtn.addEventListener("click", checkAnswer);
hintBtn.addEventListener("click", giveHint);
newBtn.addEventListener("click", () => {
  puzzleIndex = (puzzleIndex + 1) % PUZZLES.length;
  loadPuzzle(puzzleIndex);
});

loadPuzzle(0);
