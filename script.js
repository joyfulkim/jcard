const board = document.querySelector("#gameBoard");
const matchCount = document.querySelector("#matchCount");
const moveCount = document.querySelector("#moveCount");
const roundMessage = document.querySelector("#roundMessage");
const resetButton = document.querySelector("#resetButton");
const bonusButton = document.querySelector("#bonusButton");
const resultOverlay = document.querySelector("#resultOverlay");
const finalMatchCount = document.querySelector("#finalMatchCount");
const resultConfirmButton = document.querySelector("#resultConfirmButton");
const rouletteOverlay = document.querySelector("#rouletteOverlay");
const rouletteClose = document.querySelector("#rouletteClose");
const rouletteWheel = document.querySelector("#rouletteWheel");
const rouletteResult = document.querySelector("#rouletteResult");
const spinButton = document.querySelector("#spinButton");

const colorInfo = {
  red: { label: "빨강", message: "빨강 카드 짝을 찾았어요!", image: "assets/card-red.png" },
  yellow: { label: "노랑", message: "노랑 카드 짝을 찾았어요!", image: "assets/card-yellow.png" },
  green: { label: "초록", message: "초록 카드 짝을 찾았어요!", image: "assets/card-green.png" },
  blue: { label: "파랑", message: "파랑 카드 짝을 찾았어요!", image: "assets/card-blue.png" },
};

const cardColors = [
  "red",
  "yellow",
  "green",
  "blue",
  "red",
  "yellow",
  "green",
  "blue",
  "red",
  "yellow",
  "green",
  "blue",
  "red",
  "yellow",
  "green",
  "blue",
];

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let gameStopped = false;
let foundPairs = 0;
let moves = 0;
let rouletteRotation = 0;
let isRouletteSpinning = false;

const maxMoves = 10;
const roulettePrizes = [
  "예수님 카드 1장",
  "예수님 카드 2장",
  "예수님 카드 3장",
  "예수님 카드 1장",
  "한번 더",
  "예수님 카드 2장",
  "예수님 카드 1장",
  "예수님 카드 3장",
  "예수님 카드 2장",
  "노란색 카드 1장",
  "예수님 카드 1장",
  "예수님 카드 3장",
  "예수님 카드 2장",
  "한번 더",
];

function setRoundMessage(message) {
  if (roundMessage) {
    roundMessage.textContent = message;
  }
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeDeck() {
  return shuffle(
    cardColors.map((color, index) => ({
      color,
      pairId: color,
      id: `${color}-${index}`,
      label: colorInfo[color].label,
    })),
  );
}

function makeCard(cardData) {
  const card = document.createElement("button");
  card.className = "card";
  card.type = "button";
  card.dataset.color = cardData.color;
  card.dataset.pairId = cardData.pairId;
  card.setAttribute("aria-label", `${cardData.label} 예수님 카드`);

  const inner = document.createElement("span");
  inner.className = "card-inner";

  const back = document.createElement("span");
  back.className = "card-face card-back";
  back.setAttribute("aria-hidden", "true");

  const coverImage = document.createElement("img");
  coverImage.className = "cover-card-image";
  coverImage.src = "assets/card-cover.png";
  coverImage.alt = "";
  coverImage.loading = "eager";

  const front = document.createElement("span");
  front.className = "card-face card-front";
  front.setAttribute("aria-hidden", "true");

  const frontImage = document.createElement("img");
  frontImage.className = "front-card-image";
  frontImage.src = colorInfo[cardData.color].image;
  frontImage.alt = "";
  frontImage.loading = "eager";

  back.append(coverImage);
  front.append(frontImage);
  inner.append(back, front);
  card.append(inner);
  card.addEventListener("click", () => flipCard(card));
  return card;
}

function startGame() {
  board.replaceChildren();
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  gameStopped = false;
  foundPairs = 0;
  moves = 0;
  matchCount.textContent = "0";
  moveCount.textContent = "0";
  hideResultPopup();
  setRoundMessage("같은 색 예수님 카드를 찾아보세요!");

  makeDeck().forEach((cardData) => {
    board.append(makeCard(cardData));
  });
}

function flipCard(card) {
  if (gameStopped || lockBoard || card === firstCard || card.classList.contains("is-found")) {
    return;
  }

  card.classList.add("is-open");

  if (!firstCard) {
    firstCard = card;
    setRoundMessage("한 장 더 뒤집어 보세요.");
    return;
  }

  secondCard = card;
  moves += 1;
  moveCount.textContent = String(moves);
  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.pairId === secondCard.dataset.pairId;

  if (isMatch) {
    firstCard.classList.add("is-found");
    secondCard.classList.add("is-found");
    firstCard.disabled = true;
    secondCard.disabled = true;
    foundPairs += 1;
    matchCount.textContent = String(foundPairs);
    setRoundMessage(colorInfo[firstCard.dataset.color].message);
    clearTurn();
    checkMoveLimit();
    checkWin();
    return;
  }

  lockBoard = true;
  setRoundMessage("괜찮아요. 다시 기억해 볼까요?");
  firstCard.classList.add("is-wrong");
  secondCard.classList.add("is-wrong");

  window.setTimeout(() => {
    firstCard.classList.remove("is-open", "is-wrong");
    secondCard.classList.remove("is-open", "is-wrong");
    clearTurn();
    lockBoard = false;
    checkMoveLimit();
  }, 820);
}

function clearTurn() {
  firstCard = null;
  secondCard = null;
}

function checkWin() {
  if (foundPairs === cardColors.length / 2) {
    setRoundMessage(`색깔 짝을 다 찾았어요! ${moves}번 만에 성공!`);
  }
}

function checkMoveLimit() {
  if (moves >= maxMoves && !gameStopped) {
    stopGame();
  }
}

function stopGame() {
  gameStopped = true;
  lockBoard = true;
  clearTurn();
  board.querySelectorAll(".card").forEach((card) => {
    card.disabled = true;
  });
  showResultPopup();
}

function showResultPopup() {
  finalMatchCount.textContent = String(foundPairs);
  resultOverlay.classList.remove("is-hidden");
  resultOverlay.setAttribute("aria-hidden", "false");
  resultConfirmButton.focus();
}

function hideResultPopup() {
  resultOverlay.classList.add("is-hidden");
  resultOverlay.setAttribute("aria-hidden", "true");
}

function confirmResultPopup() {
  hideResultPopup();
  resetButton.focus();
}

function openRoulette() {
  rouletteOverlay.classList.remove("is-hidden");
  rouletteOverlay.setAttribute("aria-hidden", "false");
  rouletteResult.textContent = "버튼을 눌러 선물을 뽑아보세요.";
  spinButton.focus();
}

function closeRoulette() {
  if (isRouletteSpinning) {
    return;
  }

  rouletteOverlay.classList.add("is-hidden");
  rouletteOverlay.setAttribute("aria-hidden", "true");
  bonusButton.focus();
}

function spinRoulette() {
  if (isRouletteSpinning) {
    return;
  }

  const prizeIndex = Math.floor(Math.random() * roulettePrizes.length);
  const sliceAngle = 360 / roulettePrizes.length;
  const targetCenter = prizeIndex * sliceAngle;
  const extraTurns = 5 + Math.floor(Math.random() * 3);

  isRouletteSpinning = true;
  spinButton.disabled = true;
  rouletteResult.textContent = "룰렛이 돌고 있어요.";
  rouletteRotation += extraTurns * 360 + (360 - targetCenter);
  rouletteWheel.style.transform = `rotate(${rouletteRotation}deg)`;

  window.setTimeout(() => {
    isRouletteSpinning = false;
    spinButton.disabled = false;
    rouletteResult.textContent = `${roulettePrizes[prizeIndex]} 당첨!`;
  }, 3400);
}

resetButton.addEventListener("click", startGame);
resultConfirmButton.addEventListener("click", confirmResultPopup);
bonusButton.addEventListener("click", openRoulette);
rouletteClose.addEventListener("click", closeRoulette);
spinButton.addEventListener("click", spinRoulette);
rouletteOverlay.addEventListener("click", (event) => {
  if (event.target === rouletteOverlay) {
    closeRoulette();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !rouletteOverlay.classList.contains("is-hidden")) {
    closeRoulette();
  }
});
startGame();
