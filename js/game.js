/* Умничка — игры для детей 4–7 лет */

const ANIMALS = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
const COUNT_EMOJI = ["🍎", "⭐", "🌸", "🎈", "🐟", "🍋", "🦋", "🍓"];

const MEMORY_ROWS = 25;
const MEMORY_COLS = 25;
const MEMORY_CELLS = MEMORY_ROWS * MEMORY_COLS;
const MEMORY_PAIR_COUNT = Math.floor(MEMORY_CELLS / 2);

const PICTURE_EMOJI = [
  ...ANIMALS,
  ...COUNT_EMOJI,
  "🐮", "🐷", "🐸", "🐵", "🦁", "🐯", "🐨", "🐔", "🐧", "🐦",
  "🦆", "🦉", "🐴", "🦄", "🐢", "🐍", "🦎", "🐙", "🦀", "🐡",
  "🍌", "🍊", "🍇", "🍉", "🍒", "🥕", "🌽", "🍕", "🍰", "🍪",
  "⚽", "🏀", "🎾", "🎸", "🎨", "🚗", "🚌", "✈️", "🚀", "🚲",
  "🌞", "🌙", "☁️", "❄️", "🌈", "🌳", "🍄", "🌻", "🌺", "💎",
  "👑", "🎁", "🎀", "🧸", "🪁", "⛄", "🔔", "🎃", "🦋", "🐝",
];

const ODD_ROUNDS = [
  { items: ["🐶", "🐱", "🐰", "🚗"], odd: 3 },
  { items: ["🍎", "🍌", "🍊", "⚽"], odd: 3 },
  { items: ["☀️", "🌙", "⭐", "🐸"], odd: 3 },
  { items: ["🚗", "🚌", "✈️", "🚲"], odd: 2 },
  { items: ["🌸", "🌳", "🍄", "📱"], odd: 3 },
  { items: ["🐟", "🐠", "🐙", "🍕"], odd: 3 },
  { items: ["❄️", "🌧️", "☁️", "🍦"], odd: 3 },
  { items: ["👕", "👖", "🧦", "🍉"], odd: 3 },
];

const memoryBoardEl = document.getElementById("memory-board");
const memoryScoreEl = document.getElementById("memory-score");
const memoryWinEl = document.getElementById("memory-win");
const memoryLoadingEl = document.getElementById("memory-loading");

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelector(".app").classList.toggle("wide", id === "screen-memory");
}

document.querySelectorAll(".menu-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const game = btn.dataset.game;
    if (game === "memory") startMemory();
    if (game === "count") startCountRound();
    if (game === "odd") startOddRound();
    showScreen(`screen-${game}`);
  });
});

document.querySelectorAll("[data-back]").forEach((btn) => {
  btn.addEventListener("click", () => showScreen("screen-menu"));
});

/* ─── Найди пару ─── */
let memoryState = { flipped: [], moves: 0, matchedPairs: 0, lock: false };
let pairPoolCache = null;

function buildPairPool() {
  if (pairPoolCache) return pairPoolCache;
  const pool = [];
  for (let i = 0; i < PICTURE_EMOJI.length; i++) {
    const emoji = PICTURE_EMOJI[i];
    for (let hue = 0; hue < 360; hue += 12) {
      pool.push({ emoji, hue });
    }
  }
  pairPoolCache = pool;
  return pool;
}

function buildRandomPairs() {
  return shuffle(buildPairPool())
    .slice(0, MEMORY_PAIR_COUNT)
    .map((item, id) => ({ id, emoji: item.emoji, hue: item.hue }));
}

function updateMemoryScore(showPairs = true) {
  if (showPairs) {
    memoryScoreEl.textContent =
      `Ходы: ${memoryState.moves} · Пары: ${memoryState.matchedPairs}/${MEMORY_PAIR_COUNT}`;
    return;
  }
  memoryScoreEl.textContent = `Ходы: ${memoryState.moves}`;
}

function hideMemoryCard(card) {
  card.classList.remove("flipped", "matched");
  card.classList.add("hidden-face");
  card.style.removeProperty("background-color");
}

function showMemoryCard(card) {
  card.classList.add("flipped");
  card.classList.remove("hidden-face");
  card.style.backgroundColor = card.dataset.color;
}

function renderMemoryBoard(slots) {
  const chunks = [];
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (!slot) {
      chunks.push('<div class="card-gap" aria-hidden="true"></div>');
      continue;
    }
    chunks.push(
      `<button type="button" class="card hidden-face" data-pair-id="${slot.id}" data-color="hsl(${slot.hue},72%,78%)" aria-label="Карточка"><span class="card-emoji">${slot.emoji}</span></button>`
    );
  }
  memoryBoardEl.innerHTML = chunks.join("");
}

function startMemory() {
  memoryState = { flipped: [], moves: 0, matchedPairs: 0, lock: false };
  memoryWinEl.classList.add("hidden");
  memoryLoadingEl.classList.remove("hidden");
  memoryBoardEl.innerHTML = "";
  updateMemoryScore();

  const uniquePairs = buildRandomPairs();
  const deck = uniquePairs.flatMap((pair) => [pair, pair]);
  const slots = shuffle(deck.concat([null]));

  requestAnimationFrame(() => {
    renderMemoryBoard(slots);
    memoryLoadingEl.classList.add("hidden");
  });
}

function onMemoryClick(card) {
  if (memoryState.lock || card.classList.contains("flipped") || card.classList.contains("matched")) return;

  showMemoryCard(card);
  memoryState.flipped.push(card);
  if (memoryState.flipped.length < 2) return;

  memoryState.moves++;
  memoryState.lock = true;

  const [a, b] = memoryState.flipped;
  if (a.dataset.pairId === b.dataset.pairId) {
    a.classList.add("matched");
    b.classList.add("matched");
    memoryState.flipped = [];
    memoryState.lock = false;
    memoryState.matchedPairs++;
    updateMemoryScore();

    if (memoryState.matchedPairs === MEMORY_PAIR_COUNT) {
      setTimeout(() => memoryWinEl.classList.remove("hidden"), 400);
    }
    return;
  }

  updateMemoryScore(false);
  setTimeout(() => {
    hideMemoryCard(a);
    hideMemoryCard(b);
    memoryState.flipped = [];
    memoryState.lock = false;
  }, 700);
}

memoryBoardEl.addEventListener("click", (event) => {
  const card = event.target.closest(".card");
  if (card) onMemoryClick(card);
});

document.getElementById("memory-again").addEventListener("click", startMemory);

/* ─── Сосчитай ─── */
let countStars = 0;
let countAnswer = 0;

function startCountRound() {
  countAnswer = (Math.random() * 5 | 0) + 1;
  const emoji = COUNT_EMOJI[Math.random() * COUNT_EMOJI.length | 0];
  const itemsEl = document.getElementById("count-items");
  itemsEl.innerHTML = "";

  for (let i = 0; i < countAnswer; i++) {
    const span = document.createElement("span");
    span.className = "count-item";
    span.textContent = emoji;
    span.style.animationDelay = `${i * 0.08}s`;
    itemsEl.appendChild(span);
  }

  const options = new Set([countAnswer]);
  while (options.size < 6) options.add((Math.random() * 6 | 0) + 1);
  const answers = shuffle([...options]).slice(0, 6);

  const row = document.getElementById("count-answers");
  row.innerHTML = "";
  document.getElementById("count-feedback").classList.add("hidden");

  answers.forEach((n) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "answer-btn";
    btn.textContent = n;
    btn.addEventListener("click", () => onCountAnswer(btn, n));
    row.appendChild(btn);
  });
}

function onCountAnswer(btn, n) {
  const fb = document.getElementById("count-feedback");
  document.querySelectorAll(".answer-btn").forEach((b) => (b.disabled = true));

  if (n === countAnswer) {
    btn.classList.add("correct");
    countStars++;
    document.getElementById("count-score").textContent = `⭐ ${countStars}`;
    fb.textContent = "🎉 Верно! Молодец!";
    fb.className = "feedback ok";
    setTimeout(startCountRound, 1500);
  } else {
    btn.classList.add("wrong");
    fb.textContent = `Было ${countAnswer}. Попробуй ещё!`;
    fb.className = "feedback no";
    setTimeout(startCountRound, 2000);
  }
  fb.classList.remove("hidden");
}

document.getElementById("count-score").textContent = "⭐ 0";

/* ─── Что лишнее ─── */
let oddStars = 0;
let oddIndex = 0;

function startOddRound() {
  const round = ODD_ROUNDS[oddIndex % ODD_ROUNDS.length];
  oddIndex++;

  const row = document.getElementById("odd-row");
  row.innerHTML = "";
  document.getElementById("odd-feedback").classList.add("hidden");
  document.getElementById("odd-next").classList.add("hidden");

  round.items.forEach((emoji, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "odd-btn";
    btn.textContent = emoji;
    btn.addEventListener("click", () => onOddClick(btn, i, round.odd));
    row.appendChild(btn);
  });
}

function onOddClick(btn, index, oddIndex) {
  document.querySelectorAll(".odd-btn").forEach((b) => (b.disabled = true));
  const fb = document.getElementById("odd-feedback");

  if (index === oddIndex) {
    btn.classList.add("correct");
    oddStars++;
    document.getElementById("odd-score").textContent = `⭐ ${oddStars}`;
    fb.textContent = "🎉 Точно! Это лишнее!";
    fb.className = "feedback ok";
  } else {
    btn.classList.add("wrong");
    fb.textContent = "Почти! Попробуй ещё раз";
    fb.className = "feedback no";
  }
  fb.classList.remove("hidden");
  document.getElementById("odd-next").classList.remove("hidden");
}

document.getElementById("odd-next").addEventListener("click", startOddRound);
document.getElementById("odd-score").textContent = "⭐ 0";
