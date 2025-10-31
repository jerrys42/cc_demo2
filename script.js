// Schnappsen Game Logic - LeitnerLeitner Edition
// Mit Humor und österreichischem Flair 🎴

class Card {
    constructor(suit, rank, value) {
        this.suit = suit;
        this.rank = rank;
        this.value = value;
    }

    toString() {
        return `${this.rank}${this.suit}`;
    }
}

class SchnapsenGame {
    constructor() {
        this.suits = {
            'hearts': '♥️',
            'diamonds': '♦️',
            'clubs': '♣️',
            'spades': '♠️'
        };

        this.ranks = {
            'A': { value: 11, name: 'Ass' },
            '10': { value: 10, name: 'Zehn' },
            'K': { value: 4, name: 'König' },
            'Q': { value: 3, name: 'Dame' },
            'J': { value: 2, name: 'Bube' }
        };

        this.funnyMessages = [
            "Bumm! 💥 Voi nice!",
            "Oida! Des war guad! 🎉",
            "Hawara, leiwand gspielt! 👏",
            "Fix leiwand! 🎊",
            "Na servas! A Stich! 🃏",
            "Gschmeidig! 😎",
            "Wos für a Partie! 🔥",
            "Wie in der Kanzlei! Professionell! 💼",
            "LeitnerLeitner wäre stolz! 🏆",
            "Des is a Audit-sichere Partie! 📊"
        ];

        this.initGame();
    }

    initGame() {
        this.deck = [];
        this.playerHand = [];
        this.computerHand = [];
        this.talon = [];
        this.trumpCard = null;
        this.trumpSuit = null;
        this.playerScore = 0;
        this.computerScore = 0;
        this.playerGamePoints = 0;
        this.computerGamePoints = 0;
        this.talonClosed = false;
        this.currentTrick = [];
        this.currentPlayer = 'player'; // player oder computer
        this.lastTrickWinner = null;
        this.roundOver = false;
        this.possibleMarriage = null;
    }

    createDeck() {
        this.deck = [];
        for (let suit in this.suits) {
            for (let rank in this.ranks) {
                this.deck.push(new Card(suit, rank, this.ranks[rank].value));
            }
        }
        return this.deck;
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCards() {
        this.createDeck();
        this.shuffleDeck();

        // Jeder Spieler bekommt 5 Karten
        for (let i = 0; i < 5; i++) {
            this.playerHand.push(this.deck.pop());
            this.computerHand.push(this.deck.pop());
        }

        // Trumpfkarte aufdecken
        this.trumpCard = this.deck.pop();
        this.trumpSuit = this.trumpCard.suit;

        // Rest ist Talon
        this.talon = this.deck;

        // Trumpfkarte unter den Talon legen
        this.talon.unshift(this.trumpCard);
    }

    drawCards() {
        if (this.talon.length > 0 && !this.talonClosed) {
            const winnerHand = this.lastTrickWinner === 'player' ? this.playerHand : this.computerHand;
            const loserHand = this.lastTrickWinner === 'player' ? this.computerHand : this.playerHand;

            if (this.talon.length > 0) {
                winnerHand.push(this.talon.pop());
            }
            if (this.talon.length > 0) {
                loserHand.push(this.talon.pop());
            }
        }
    }

    canPlayCard(card, firstCard) {
        // Wenn Talon offen ist, kann man jede Karte spielen
        if (!this.talonClosed && this.talon.length > 0) {
            return true;
        }

        // Wenn Talon zu ist oder leer, muss man Farbe bedienen
        if (!firstCard) {
            return true; // Erste Karte kann immer gespielt werden
        }

        const hand = this.currentPlayer === 'player' ? this.playerHand : this.computerHand;
        const hasSameSuit = hand.some(c => c.suit === firstCard.suit);

        if (hasSameSuit) {
            // Muss Farbe bedienen
            if (card.suit !== firstCard.suit) {
                // Kann nur Trumpf stechen
                return card.suit === this.trumpSuit;
            }
        }

        return true;
    }

    whoWinsTrick(card1, card2) {
        // card1 ist die zuerst gespielte Karte
        const isTrump1 = card1.suit === this.trumpSuit;
        const isTrump2 = card2.suit === this.trumpSuit;

        // Beide Trumpf - höhere gewinnt
        if (isTrump1 && isTrump2) {
            return this.getCardStrength(card1) > this.getCardStrength(card2) ? 0 : 1;
        }

        // Nur zweite ist Trumpf
        if (isTrump2) return 1;

        // Nur erste ist Trumpf
        if (isTrump1) return 0;

        // Gleiche Farbe - höhere gewinnt
        if (card1.suit === card2.suit) {
            return this.getCardStrength(card1) > this.getCardStrength(card2) ? 0 : 1;
        }

        // Verschiedene Farben, keine Trumpf - erste gewinnt
        return 0;
    }

    getCardStrength(card) {
        const order = { 'A': 5, '10': 4, 'K': 3, 'Q': 2, 'J': 1 };
        return order[card.rank] || 0;
    }

    checkForMarriage(card, hand) {
        // Prüfe ob König oder Dame gespielt wird
        if (card.rank !== 'K' && card.rank !== 'Q') {
            return null;
        }

        const partnerRank = card.rank === 'K' ? 'Q' : 'K';
        const partnerCard = hand.find(c => c.suit === card.suit && c.rank === partnerRank);

        if (partnerCard) {
            const points = card.suit === this.trumpSuit ? 40 : 20;
            return { points, suit: card.suit };
        }

        return null;
    }

    closeTalon() {
        if (this.talon.length > 0 && this.currentPlayer === 'player') {
            this.talonClosed = true;
            return true;
        }
        return false;
    }

    calculateRoundWinner() {
        let winner = null;
        let gamePoints = 0;

        if (this.playerScore >= 66) {
            winner = 'player';
            if (this.computerScore === 0) {
                gamePoints = 3; // Schneider
            } else if (this.computerScore < 33) {
                gamePoints = 2;
            } else {
                gamePoints = 1;
            }
        } else if (this.computerScore >= 66) {
            winner = 'computer';
            if (this.playerScore === 0) {
                gamePoints = 3; // Schneider
            } else if (this.playerScore < 33) {
                gamePoints = 2;
            } else {
                gamePoints = 1;
            }
        } else if (this.playerHand.length === 0 && this.computerHand.length === 0) {
            // Alle Karten gespielt - wer den letzten Stich hat, gewinnt
            winner = this.lastTrickWinner;
            gamePoints = 1;
        }

        return { winner, gamePoints };
    }

    getRandomFunnyMessage() {
        return this.funnyMessages[Math.floor(Math.random() * this.funnyMessages.length)];
    }

    // Computer AI
    computerPlayCard(firstCard = null) {
        let selectedCard = null;

        if (!firstCard) {
            // Computer spielt als erstes
            // Einfache Strategie: Spiele höchste Karte oder Trumpf
            selectedCard = this.computerHand.reduce((best, card) => {
                if (!best) return card;
                if (card.suit === this.trumpSuit && best.suit !== this.trumpSuit) return card;
                if (card.value > best.value) return card;
                return best;
            });
        } else {
            // Computer spielt als zweites
            const validCards = this.computerHand.filter(card => this.canPlayCard(card, firstCard));

            if (validCards.length === 0) {
                selectedCard = this.computerHand[0];
            } else {
                // Versuche den Stich zu gewinnen oder spiele niedrige Karte
                const winningCards = validCards.filter(card => this.whoWinsTrick(firstCard, card) === 1);

                if (winningCards.length > 0) {
                    // Spiele niedrigste gewinnende Karte
                    selectedCard = winningCards.reduce((best, card) =>
                        card.value < best.value ? card : best
                    );
                } else {
                    // Spiele niedrigste Karte
                    selectedCard = validCards.reduce((best, card) =>
                        card.value < best.value ? card : best
                    );
                }
            }
        }

        return selectedCard;
    }
}

// UI Controller
class GameUI {
    constructor() {
        this.game = new SchnapsenGame();
        this.selectedCard = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('new-game-btn').addEventListener('click', () => this.startNewGame());
        document.getElementById('rules-btn').addEventListener('click', () => this.showRules());
        document.getElementById('zudrehen-btn').addEventListener('click', () => this.closeTalon());

        const modal = document.getElementById('rules-modal');
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    startNewGame() {
        this.game.initGame();
        this.game.dealCards();
        this.game.currentPlayer = Math.random() < 0.5 ? 'player' : 'computer';
        this.selectedCard = null;

        this.updateUI();
        this.showMessage(`Neues Spiel! ${this.game.currentPlayer === 'player' ? 'Du fängst an!' : 'Computer fängt an!'}`);

        document.getElementById('zudrehen-btn').disabled = false;

        if (this.game.currentPlayer === 'computer') {
            setTimeout(() => this.computerTurn(), 1000);
        }
    }

    updateUI() {
        // Update scores
        document.getElementById('player-score').textContent = this.game.playerScore;
        document.getElementById('computer-score').textContent = this.game.computerScore;
        document.getElementById('player-game-points').textContent = this.game.playerGamePoints;
        document.getElementById('computer-game-points').textContent = this.game.computerGamePoints;

        // Update talon
        const talonCount = this.game.talon.length;
        document.getElementById('talon-count').textContent = talonCount;

        // Update trump card
        const trumpDisplay = document.getElementById('trump-card-display');
        if (this.game.trumpCard) {
            trumpDisplay.innerHTML = this.createCardHTML(this.game.trumpCard);
        }

        // Update hands
        this.renderPlayerHand();
        this.renderComputerHand();

        // Update zudrehen button
        const zudrehenBtn = document.getElementById('zudrehen-btn');
        if (this.game.talonClosed || talonCount === 0 || this.game.currentPlayer !== 'player') {
            zudrehenBtn.disabled = true;
        } else {
            zudrehenBtn.disabled = false;
        }

        if (this.game.talonClosed) {
            zudrehenBtn.textContent = '🔒 Zugedreht';
        }

        // Check for marriage possibility
        this.checkMarriagePossibility();
    }

    createCardHTML(card) {
        const suitSymbol = this.game.suits[card.suit];
        const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
        const colorClass = isRed ? 'red' : 'black';

        return `
            <div class="card-suit">${suitSymbol}</div>
            <div class="card-rank" style="color: ${isRed ? '#DC143C' : '#000000'}">${card.rank}</div>
        `;
    }

    renderPlayerHand() {
        const container = document.getElementById('player-hand');
        container.innerHTML = '';

        this.game.playerHand.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
            cardEl.classList.add(isRed ? 'red' : 'black');
            cardEl.innerHTML = this.createCardHTML(card);

            cardEl.addEventListener('click', () => this.onPlayerCardClick(card, index));

            container.appendChild(cardEl);
        });
    }

    renderComputerHand() {
        const container = document.getElementById('computer-hand');
        container.innerHTML = '';

        this.game.computerHand.forEach(() => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card card-back';
            cardEl.innerHTML = '🎴';
            container.appendChild(cardEl);
        });
    }

    onPlayerCardClick(card, index) {
        if (this.game.currentPlayer !== 'player') {
            this.showMessage('Warte auf den Computer! ⏳');
            return;
        }

        if (this.game.currentTrick.length === 0) {
            // Spieler spielt erste Karte
            this.playCard('player', card, index);
        } else {
            // Spieler spielt zweite Karte
            if (this.game.canPlayCard(card, this.game.currentTrick[0].card)) {
                this.playCard('player', card, index);
            } else {
                this.showMessage('Diese Karte kannst du nicht spielen! Du musst Farbe bedienen. 🚫');
            }
        }
    }

    playCard(player, card, index) {
        const hand = player === 'player' ? this.game.playerHand : this.game.computerHand;

        // Prüfe auf Hochzeit
        let marriagePoints = 0;
        if (this.game.currentTrick.length === 0) { // Nur beim ersten Ausspielen
            const marriage = this.game.checkForMarriage(card, hand);
            if (marriage) {
                marriagePoints = marriage.points;
                if (player === 'player') {
                    this.game.playerScore += marriagePoints;
                    this.showMessage(`💍 Hochzeit! +${marriagePoints} Punkte! ${this.game.getRandomFunnyMessage()}`);
                } else {
                    this.game.computerScore += marriagePoints;
                    this.showMessage(`💍 Computer meldet Hochzeit! +${marriagePoints} Punkte!`);
                }
            }
        }

        // Karte vom Hand entfernen
        hand.splice(index, 1);

        // Karte zum Trick hinzufügen
        this.game.currentTrick.push({ player, card });

        // Karte auf dem Tisch anzeigen
        this.displayCardOnTable(card, this.game.currentTrick.length - 1);

        if (this.game.currentTrick.length === 2) {
            // Trick komplett, bestimme Gewinner
            setTimeout(() => this.resolveTrick(), 1500);
        } else {
            // Nächster Spieler
            this.game.currentPlayer = player === 'player' ? 'computer' : 'player';
            this.updateUI();

            if (this.game.currentPlayer === 'computer') {
                setTimeout(() => this.computerTurn(), 1000);
            }
        }
    }

    displayCardOnTable(card, position) {
        const slotId = position === 0 ? 'first-card-slot' : 'second-card-slot';
        const slot = document.getElementById(slotId);

        slot.innerHTML = '';
        const cardEl = document.createElement('div');
        cardEl.className = 'card played';
        const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
        cardEl.classList.add(isRed ? 'red' : 'black');
        cardEl.innerHTML = this.createCardHTML(card);

        slot.appendChild(cardEl);
        slot.classList.add('active');
    }

    computerTurn() {
        if (this.game.currentPlayer !== 'computer') return;

        const firstCard = this.game.currentTrick.length > 0 ? this.game.currentTrick[0].card : null;
        const card = this.game.computerPlayCard(firstCard);
        const index = this.game.computerHand.indexOf(card);

        if (card) {
            this.playCard('computer', card, index);
        }
    }

    resolveTrick() {
        const [first, second] = this.game.currentTrick;
        const winnerIndex = this.game.whoWinsTrick(first.card, second.card);
        const winner = winnerIndex === 0 ? first.player : second.player;

        this.game.lastTrickWinner = winner;

        // Punkte zählen
        const points = first.card.value + second.card.value;
        if (winner === 'player') {
            this.game.playerScore += points;
        } else {
            this.game.computerScore += points;
        }

        // Animation
        const cards = document.querySelectorAll('.played-card-slot .card');
        cards.forEach(card => card.classList.add('stich-won'));

        setTimeout(() => {
            // Tisch leeren
            document.getElementById('first-card-slot').innerHTML = '';
            document.getElementById('second-card-slot').innerHTML = '';
            document.querySelectorAll('.played-card-slot').forEach(slot => slot.classList.remove('active'));

            this.game.currentTrick = [];

            // Karten nachziehen
            this.game.drawCards();

            // Prüfe Rundensieg
            const result = this.game.calculateRoundWinner();
            if (result.winner) {
                this.endRound(result);
            } else {
                // Nächster Spieler ist der Gewinner des Tricks
                this.game.currentPlayer = winner;
                this.updateUI();

                const winnerName = winner === 'player' ? 'Du hast' : 'Computer hat';
                this.showMessage(`${winnerName} den Stich gewonnen! +${points} Punkte`);

                if (this.game.currentPlayer === 'computer') {
                    setTimeout(() => this.computerTurn(), 1500);
                }
            }
        }, 1000);
    }

    endRound(result) {
        const { winner, gamePoints } = result;

        if (winner === 'player') {
            this.game.playerGamePoints += gamePoints;
            this.showMessage(`🎊 Du hast gewonnen! +${gamePoints} Spielpunkt(e)! ${this.game.getRandomFunnyMessage()}`);
        } else {
            this.game.computerGamePoints += gamePoints;
            this.showMessage(`😢 Computer hat gewonnen! +${gamePoints} Spielpunkt(e) für den Computer.`);
        }

        this.updateUI();

        // Prüfe Gesamtsieg
        if (this.game.playerGamePoints >= 7) {
            setTimeout(() => {
                this.showMessage('🏆🏆🏆 CHAMPION! Du hast das Spiel gewonnen! LeitnerLeitner ist stolz auf dich! 🏆🏆🏆');
                this.celebrateWin();
            }, 2000);
        } else if (this.game.computerGamePoints >= 7) {
            setTimeout(() => {
                this.showMessage('💻 Computer hat das Spiel gewonnen! Nächstes Mal klappt\'s! 💪');
            }, 2000);
        } else {
            setTimeout(() => {
                this.startNewGame();
            }, 3000);
        }
    }

    celebrateWin() {
        const container = document.querySelector('.game-container');
        container.classList.add('win-animation');
        setTimeout(() => container.classList.remove('win-animation'), 1000);
    }

    closeTalon() {
        if (this.game.closeTalon()) {
            this.showMessage('🔒 Talon zugedreht! Jetzt muss Farbe bedient werden!');
            this.updateUI();
        }
    }

    checkMarriagePossibility() {
        if (this.game.currentPlayer !== 'player' || this.game.currentTrick.length > 0) {
            return;
        }

        // Prüfe ob Spieler eine Hochzeit hat
        const marriages = [];
        this.game.playerHand.forEach(card => {
            const marriage = this.game.checkForMarriage(card, this.game.playerHand);
            if (marriage && !marriages.some(m => m.suit === card.suit)) {
                marriages.push(marriage);
            }
        });

        // Zeige Hochzeit-Button wenn möglich
        // (In dieser Version wird die Hochzeit automatisch beim Ausspielen gemeldet)
    }

    showMessage(message) {
        const messageArea = document.getElementById('message-area');
        messageArea.textContent = message;
        messageArea.style.animation = 'none';
        setTimeout(() => {
            messageArea.style.animation = 'messageSlide 0.5s ease';
        }, 10);
    }

    showRules() {
        document.getElementById('rules-modal').style.display = 'block';
    }
}

// Start the game when page loads
let gameUI;
window.addEventListener('DOMContentLoaded', () => {
    gameUI = new GameUI();
});
