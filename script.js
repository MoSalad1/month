const scenes = [...document.querySelectorAll('.scene')];
const nextButtons = [...document.querySelectorAll('button[data-next]')];
const showReasonBtn = document.getElementById('show-reason');
const reasonBoard = document.getElementById('reason-board');

let reasons = [];

function showScene(nextId) {
  scenes.forEach((scene) => {
    scene.classList.toggle('active', scene.id === nextId);
  });
}

nextButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showScene(button.dataset.next);
  });
});

async function loadReasons() {
  try {
    const response = await fetch('reasons.txt', { cache: 'no-store' });
    const text = await response.text();
    reasons = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    reasons = ['I love you.'];
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addReasonToBoard(reasonText) {
  const reason = document.createElement('p');
  reason.className = 'reason';
  reason.textContent = reasonText;
  reasonBoard.appendChild(reason);

  const boardRect = reasonBoard.getBoundingClientRect();
  const reasonRect = reason.getBoundingClientRect();

  const maxX = Math.max(0, boardRect.width - reasonRect.width - 8);
  const maxY = Math.max(0, boardRect.height - reasonRect.height - 8);

  reason.style.left = `${randomInt(4, Math.floor(maxX))}px`;
  reason.style.top = `${randomInt(4, Math.floor(maxY))}px`;
}

showReasonBtn.addEventListener('click', () => {
  if (!reasons.length) {
    addReasonToBoard('Add reasons in reasons.txt 💖');
    return;
  }

  const pick = reasons[randomInt(0, reasons.length - 1)];
  addReasonToBoard(pick);
});

loadReasons();
