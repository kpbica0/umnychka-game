/* Умничка — игры для детей 4–7 лет */

const ANIMALS = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
const COUNT_EMOJI = ["🍎", "⭐", "🌸", "🎈", "🐟", "🍋", "🦋", "🍓"];

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

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
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
let memoryState = { flipped: [], moves: 0, lock: false };

function startMemory() {
  memoryState = { flipped: [], moves: 0, lock: false };
  document.getElementById("memory-win").classList.add("hidden");
  document.getElementById("memory-score").textContent = "Ходы: 0";

  const pairs = shuffle(ANIMALS.slice(0, 6)).flatMap((e) => [e, e]);
  const deck = shuffle(pairs);
  const board = document.getElementById("memory-board");
  board.innerHTML = "";

  deck.forEach((emoji, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card hidden-face";
    btn.dataset.emoji = emoji;
    btn.dataset.index = i;
    btn.setAttribute("aria-label", "Карточка");
    btn.addEventListener("click", () => onMemoryClick(btn));
    board.appendChild(btn);
  });
}

function onMemoryClick(card) {
  if (memoryState.lock || card.classList.contains("flipped") || card.classList.contains("matched")) return;

  card.classList.add("flipped");
  card.classList.remove("hidden-face");
  card.textContent = card.dataset.emoji;
  memoryState.flipped.push(card);

  if (memoryState.flipped.length < 2) return;

  memoryState.moves++;
  document.getElementById("memory-score").textContent = `Ходы: ${memoryState.moves}`;
  memoryState.lock = true;

  const [a, b] = memoryState.flipped;
  if (a.dataset.emoji === b.dataset.emoji) {
    a.classList.add("matched");
    b.classList.add("matched");
    memoryState.flipped = [];
    memoryState.lock = false;
    if (document.querySelectorAll(".card.matched").length === document.querySelectorAll(".card").length) {
      setTimeout(() => document.getElementById("memory-win").classList.remove("hidden"), 400);
    }
  } else {
    setTimeout(() => {
      [a, b].forEach((c) => {
        c.classList.remove("flipped", "matched");
        c.classList.add("hidden-face");
        c.textContent = "";
      });
      memoryState.flipped = [];
      memoryState.lock = false;
    }, 900);
  }
}

document.getElementById("memory-again").addEventListener("click", startMemory);

/* ─── Сосчитай ─── */
let countStars = 0;
let countAnswer = 0;

function startCountRound() {
  countAnswer = Math.floor(Math.random() * 5) + 1;
  const emoji = COUNT_EMOJI[Math.floor(Math.random() * COUNT_EMOJI.length)];
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
  while (options.size < 6) {
    const n = Math.floor(Math.random() * 6) + 1;
    options.add(n);
  }
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
