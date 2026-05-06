const board = document.getElementById('game-board');
const movesEl = document.getElementById('moves');
const matchesEl = document.getElementById('matches');
const levelBtns = document.querySelectorAll('.level-btn');
const restartBtn = document.getElementById('restart-btn');
const victoryModal = document.getElementById('victory-modal');
const finalMovesEl = document.getElementById('final-moves');
const playAgainBtn = document.getElementById('play-again-btn');

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let isLocked = false;
let currentLevel = 'easy';
let totalPairs = 0;

const levels = {
    easy: { pairs: 6, cols: 4 }, // 12 cards
    normal: { pairs: 8, cols: 4 }, // 16 cards
    hard: { pairs: 10, cols: 5 } // 20 cards
};

// Available images (30 total)
const availableImages = Array.from({length: 30}, (_, i) => `images/${String(i + 3).padStart(3, '0')}.jpg`);

function initGame() {
    board.innerHTML = '';
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    isLocked = false;
    
    updateStats();
    victoryModal.classList.add('hidden');

    totalPairs = levels[currentLevel].pairs;
    board.className = `board ${currentLevel}`;
    
    // Select random images for pairs
    let shuffledImages = [...availableImages].sort(() => 0.5 - Math.random());
    let selectedImages = shuffledImages.slice(0, totalPairs);
    
    // Create card pairs
    let cardImages = [...selectedImages, ...selectedImages];
    cardImages.sort(() => 0.5 - Math.random());

    cardImages.forEach((imgSrc) => {
        const card = createCard(imgSrc);
        board.appendChild(card);
        cards.push(card);
    });
}

function createCard(imgSrc) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.image = imgSrc;

    const cardInner = `
        <div class="card-face card-front">
            <img src="${imgSrc}" alt="card front">
        </div>
        <div class="card-face card-back">
            <img src="images/cover.jpg" alt="card back">
        </div>
    `;
    
    card.innerHTML = cardInner;
    card.addEventListener('click', flipCard);
    
    return card;
}

function flipCard() {
    if (isLocked) return;
    if (this === flippedCards[0]) return;
    if (this.classList.contains('matched')) return;

    this.classList.add('flipped');
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        moves++;
        updateStats();
        checkForMatch();
    }
}

function checkForMatch() {
    isLocked = true;
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.image === card2.dataset.image;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    matchedPairs++;
    updateStats();
    
    setTimeout(() => {
        flippedCards[0].classList.add('matched');
        flippedCards[1].classList.add('matched');
        
        flippedCards = [];
        isLocked = false;

        if (matchedPairs === totalPairs) {
            setTimeout(showVictory, 500);
        }
    }, 600); // Wait for the flip animation (0.6s) to finish before processing the match
}

function unflipCards() {
    setTimeout(() => {
        flippedCards[0].classList.remove('flipped');
        flippedCards[1].classList.remove('flipped');
        flippedCards = [];
        isLocked = false;
    }, 1000);
}

function updateStats() {
    movesEl.textContent = moves;
    matchesEl.textContent = `${matchedPairs} / ${totalPairs}`;
}

function showVictory() {
    finalMovesEl.textContent = moves;
    victoryModal.classList.remove('hidden');
    
    if (typeof confetti === 'function') {
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#ff9a9e', '#fecfef', '#a18cd1', '#fbc2eb', '#8fd3f4']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#ff9a9e', '#fecfef', '#a18cd1', '#fbc2eb', '#8fd3f4']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }
}

levelBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        levelBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentLevel = e.target.dataset.level;
        initGame();
    });
});

restartBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);

// Start game initially
initGame();
