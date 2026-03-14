const scenes = [...document.querySelectorAll('.scene')];
const nextButtons = [...document.querySelectorAll('button[data-next]')];
const showReasonBtn = document.getElementById('show-reason');
const reasonBoard = document.getElementById('reason-board');
const musicToggle = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');
const clickSfx = document.getElementById('click-sfx');
const heartLayer = document.getElementById('heart-layer');

const MUSIC_PATH = 'audio/back-to-me.mp3';
const CLICK_SFX_PATH = 'audio/button-press.mp3';

let reasons = [];
let firstUserInteractionDone = false;
let musicAvailable;
let clickSfxAvailable;
let isTransitioning = false;

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

  setTimeout(() => {
    currentScene.classList.remove('leaving');
    nextScene.classList.remove('entering');
    nextScene.classList.add('active');
    isTransitioning = false;
  }, 240);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function hasClickSfxFile() {
  if (typeof clickSfxAvailable === 'boolean') {
    return clickSfxAvailable;
  }

  try {
    const response = await fetch(CLICK_SFX_PATH, { method: 'HEAD' });
    clickSfxAvailable = response.ok;
  } catch {
    clickSfxAvailable = false;
  }

  return clickSfxAvailable;
}

async function playClickSfx() {
  if (!(await hasClickSfxFile())) {
    return;
  }

  try {
    if (!clickSfx.src) {
      clickSfx.src = CLICK_SFX_PATH;
    }

    const clickClone = clickSfx.cloneNode();
    clickClone.volume = 0.5;
    await clickClone.play();
  } catch {
    // Ignore if playback is blocked by browser policy.
  }
}

async function hasMusicFile() {
  if (typeof musicAvailable === 'boolean') {
    return musicAvailable;
  }

  try {
    const response = await fetch(MUSIC_PATH, { method: 'HEAD' });
    musicAvailable = response.ok;
  } catch {
    musicAvailable = false;
  }

  return musicAvailable;
}

async function tryStartMusic() {
  if (!bgMusic.paused) {
    return;
  }

  if (!(await hasMusicFile())) {
    musicToggle.textContent = '🎵 add song file';
    return;
  }

  try {
    if (!bgMusic.src) {
      bgMusic.src = MUSIC_PATH;
    }
    bgMusic.volume = 0.2;
    await bgMusic.play();
    musicToggle.textContent = '🎵 music on';
  } catch {
    musicToggle.textContent = '🎵 tap for music';
  }
}

nextButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    void playClickSfx();
    showScene(button.dataset.next);

    if (!firstUserInteractionDone) {
      firstUserInteractionDone = true;
      await tryStartMusic();
    }
  });
});

musicToggle.addEventListener('click', async () => {
  void playClickSfx();

  if (bgMusic.paused) {
    await tryStartMusic();
  } else {
    bgMusic.pause();
    musicToggle.textContent = '🎵 music off';
  }
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

  const maxX = Math.max(0, boardRect.width - reasonRect.width - 8);
  const maxY = Math.max(0, boardRect.height - reasonRect.height - 8);

  reason.style.left = `${randomInt(4, Math.floor(maxX))}px`;
  reason.style.top = `${randomInt(4, Math.floor(maxY))}px`;
}

showReasonBtn.addEventListener('click', () => {
  void playClickSfx();

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

loadReasons();
setInterval(spawnHeart, 850);
