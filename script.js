const board = document.querySelector("#gameBoard");
const matchCount = document.querySelector("#matchCount");
const moveCount = document.querySelector("#moveCount");
const roundMessage = document.querySelector("#roundMessage");
const resetButton = document.querySelector("#resetButton");

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
let foundPairs = 0;
let moves = 0;

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
  foundPairs = 0;
  moves = 0;
  matchCount.textContent = "0";
  moveCount.textContent = "0";
  setRoundMessage("같은 색 예수님 카드를 찾아보세요!");

  makeDeck().forEach((cardData) => {
    board.append(makeCard(cardData));
  });
}

function flipCard(card) {
  if (lockBoard || card === firstCard || card.classList.contains("is-found")) {
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

resetButton.addEventListener("click", startGame);
startGame();
