const scenes = [...document.querySelectorAll('.scene')];
const nextButtons = [...document.querySelectorAll('button[data-next]')];
const showReasonBtn = document.getElementById('show-reason');
const reasonBoard = document.getElementById('reason-board');
const musicToggle = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');
const heartLayer = document.getElementById('heart-layer');
const typewriterTargets = [...document.querySelectorAll('.typewriter')];

const MUSIC_PATH = 'audio/back-to-me.mp3';

let reasons = [];
let firstUserInteractionDone = false;
let isTransitioning = false;
let currentTypewriterController = null;
let musicEnabled = false;

function showScene(nextId) {
  if (isTransitioning) {
    return;
  }

  const currentScene = document.querySelector('.scene.active');
  const nextScene = document.getElementById(nextId);

  if (!nextScene || currentScene === nextScene) {
    return;
  }

  isTransitioning = true;

  currentScene.classList.remove('active');
  currentScene.classList.add('leaving');
  nextScene.classList.add('entering');

  if (currentTypewriterController) {
    currentTypewriterController.cancelled = true;
  }

  setTimeout(() => {
    currentScene.classList.remove('leaving');
    nextScene.classList.remove('entering');
    nextScene.classList.add('active');
    runSceneTypewriter(nextScene);
    isTransitioning = false;
  }, 240);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typeText(element, text, controller) {
  element.textContent = '';
  element.classList.add('typing');

  for (const char of text) {
    if (controller.cancelled) {
      element.classList.remove('typing');
      return;
    }

    element.textContent += char;
    const speed = char === ' ' ? 12 : randomInt(24, 42);
    await wait(speed);
  }

  element.classList.remove('typing');
}

function runSceneTypewriter(scene) {
  const elements = [...scene.querySelectorAll('.typewriter')];
  if (!elements.length) {
    return;
  }

  const controller = { cancelled: false };
  currentTypewriterController = controller;

  const run = async () => {
    for (const element of elements) {
      const text = element.dataset.text || '';
      await typeText(element, text, controller);
      await wait(80);
      if (controller.cancelled) {
        return;
      }
    }
  };

  void run();
}

function setupMusic() {
  bgMusic.src = MUSIC_PATH;
  bgMusic.volume = 0.25;

  bgMusic.addEventListener('playing', () => {
    musicEnabled = true;
    musicToggle.textContent = '🎵 music on';
  });

  bgMusic.addEventListener('pause', () => {
    if (!bgMusic.ended) {
      musicEnabled = false;
      musicToggle.textContent = '🎵 music off';
    }
  });

  bgMusic.addEventListener('error', () => {
    musicEnabled = false;
    musicToggle.textContent = '🎵 add song file';
  });

  bgMusic.load();
}


async function startMusicFromGesture() {
  try {
    await bgMusic.play();
    musicEnabled = true;
    musicToggle.textContent = '🎵 music on';
  } catch {
    musicEnabled = false;
    musicToggle.textContent = '🎵 tap for music';
  }
}

nextButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    showScene(button.dataset.next);

    if (!firstUserInteractionDone) {
      firstUserInteractionDone = true;
      await startMusicFromGesture();
    }
  });
});

musicToggle.addEventListener('click', async () => {
  if (musicEnabled && !bgMusic.paused) {
    bgMusic.pause();
    return;
  }

  await startMusicFromGesture();
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

function addReasonToBoard(reasonText) {
  const reason = document.createElement('p');
  reason.className = 'reason';
  reason.textContent = reasonText;
  reasonBoard.appendChild(reason);

  const boardRect = reasonBoard.getBoundingClientRect();
  const reasonRect = reason.getBoundingClientRect();

  const maxX = Math.max(4, Math.floor(boardRect.width - reasonRect.width - 8));
  const maxY = Math.max(4, Math.floor(boardRect.height - reasonRect.height - 8));

  reason.style.left = `${randomInt(4, maxX)}px`;
  reason.style.top = `${randomInt(4, maxY)}px`;
}

showReasonBtn.addEventListener('click', () => {
  if (!reasons.length) {
    addReasonToBoard('Add reasons in reasons.txt 💖');
    return;
  }

  const pick = reasons[randomInt(0, reasons.length - 1)];
  addReasonToBoard(pick);
});

function spawnHeart() {
  const heart = document.createElement('span');
  heart.className = 'heart';
  heart.textContent = '💖';
  heart.style.left = `${randomInt(2, 96)}%`;
  heart.style.fontSize = `${randomInt(10, 24)}px`;
  heart.style.animationDuration = `${randomInt(7, 12)}s`;
  heart.style.setProperty('--drift', `${randomInt(-30, 30)}px`);
  heartLayer.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 13000);
}

for (const element of typewriterTargets) {
  if (!element.dataset.text) {
    element.dataset.text = element.textContent || '';
  }
  element.textContent = '';
}

setupMusic();
runSceneTypewriter(document.querySelector('.scene.active'));
void loadReasons();
setInterval(spawnHeart, 850);
