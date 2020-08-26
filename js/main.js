class AudioController {
	constructor() {
		this.bgMusic = new Audio('../audio/creepy.mp3');
		this.flipSound = new Audio('../audio/flip.wav');
		this.matchSound = new Audio('../audio/match.wav');
		this.victorySound = new Audio('../audio/victory.wav');
		this.gameOverSound = new Audio('../audio/gameover.wav');
		this.bgMusic.volume = 0.5;
		this.bgMusic.loop = true;
	}
	startMusic() {
		this.bgMusic.play();
	}
	stopMusic() {
		this.bgMusic.currentTime = 0;
		this.bgMusic.pause();
	}
	flip() {
		this.flipSound.play();
	}
	match() {
		this.matchSound.play();
	}
	victory() {
		this.stopMusic();
		this.victorySound.play();
	}
	gameOver() {
		this.stopMusic();
		this.gameOverSound.play();
	}
}

class Game {
	constructor() {
		this.cardsArray = [
			'Bat',
			'Bones',
			'Cauldron',
			'Dracula',
			'Eye',
			'Ghost',
			'Pumpkin',
			'Skull',
		];
		this.timerAmount = 100;
		this.flipsCount = 0;
		this.pairCardsArr = [];
		this.turnedCardsArr = [];
		this.numberOfCards = this.cardsArray.length * 2;
		this.highestScore = () => {
			if (isNaN(parseInt(localStorage.getItem('highestScore')))) return 0;
			return localStorage.getItem('highestScore');
		};
		this.currentScore = () => {
			if (isNaN(parseInt(localStorage.getItem('currentScore')))) return 0;
			return localStorage.getItem('currentScore');
		};
	}

	calcScore(time, flips) {
		return parseInt(time) * (200 - parseInt(flips));
	}
}

class UI {
	constructor() {
		this.audio = new AudioController();
		this.game = new Game();
		this.overlayStart = document.querySelector('#startGameText');
		this.overlayVictory = document.querySelector('#victoryText');
		this.overlayGameOver = document.querySelector('#gameOverText');
		this.cardsGrid = document.querySelector('#cardsGrid');
		this.timerValueElement = document.querySelector('#timeRemaining');
		this.flipsCountElement = document.querySelector('#flips');
		this.highestScoreValues = document.querySelectorAll(
			'.highest-score-value'
		);
		this.currentScoreValues = document.querySelectorAll(
			'.current-score-value'
		);
		this.stopTimer = false;
	}

	startGame() {
		this.timerHandler(this.game.timerAmount);
		this.audio.startMusic();
	}

	timerHandler(seconds) {
		const that = this;
		const timerValueElement = this.timerValueElement;
		let timerAmount = seconds;
		timerValueElement.textContent = timerAmount;

		let initTimer = setInterval(startTimer, 1000);
		function startTimer() {
			if (that.stopTimer) {
				stopTimer();
			}
			timerAmount--;
			timerValueElement.textContent = timerAmount;
			if (timerAmount === 0) {
				stopTimer();
				that.executeGameOver();
			}
		}
		function stopTimer() {
			clearInterval(initTimer);
		}
	}

	populateCardsGrid(arr) {
		const cardsArray = arr;
		const doubleCardsArray = cardsArray.concat(arr);
		const randomizedCardArray = this.randomizeCards(doubleCardsArray);

		randomizedCardArray.forEach((card) => {
			const prepCardMarkup = `
            <li class="card" data-name="${card}">
                <div class="card-back card-face">
                    <img
                        class="cob-web cob-web-top-left"
                        src="img/Cobweb.png"
                    />
                    <img
                        class="cob-web cob-web-top-right"
                        src="img/Cobweb.png"
                    />
                    <img
                        class="cob-web cob-web-bottom-left"
                        src="img/Cobweb.png"
                    />
                    <img
                        class="cob-web cob-web-bottom-right"
                        src="img/Cobweb.png"
                    />
                    <img class="spider" src="img/Spider.png" />
                    <div class="click-space"></div>
                </div>
                <div class="card-front card-face">
                    <img
                        class="cob-web cob-web-top-left"
                        src="img/CobwebGrey.png"
                    />
                    <img
                        class="cob-web cob-web-top-right"
                        src="img/CobwebGrey.png"
                    />
                    <img
                        class="cob-web cob-web-bottom-left"
                        src="img/CobwebGrey.png"
                    />
                    <img
                        class="cob-web cob-web-bottom-right"
                        src="img/CobwebGrey.png"
                    />
                    <img class="card-value" src="img/${card}.png" />
                </div>
            </li>
            `;
			this.cardsGrid.insertAdjacentHTML('beforeend', prepCardMarkup);
		});
	}

	randomizeCards(arr) {
		let randomArr = arr;
		for (var i = randomArr.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = randomArr[i];
			randomArr[i] = randomArr[j];
			randomArr[j] = temp;
		} // Durstenfeld shuffle algorithm
		return randomArr;
	}

	flipCard(card) {
		const clickedCard = card.target;
		if (
			clickedCard.classList.contains('click-space') &&
			!card.path[2].classList.contains('matched')
		) {
			this.game.pairCardsArr.push(card.path[2]);
			this.audio.flip();
			this.game.flipsCount++;
			this.flipsCountElement.textContent = this.game.flipsCount;
			clickedCard.parentElement.parentElement.classList.toggle('visible');
			if (this.game.pairCardsArr.length === 2) {
				this.pairCardsHandler();
			}
		}
	}

	pairCardsHandler() {
		const allClickSpaces = document.querySelectorAll('.click-space');
		let cardOne = this.game.pairCardsArr[0];
		let cardTwo = this.game.pairCardsArr[1];
		allClickSpaces.forEach((clickSpace) => {
			clickSpace.style.display = 'none';
		});
		if (cardOne.dataset.name === cardTwo.dataset.name) {
			this.game.turnedCardsArr.push(cardOne.dataset.name);
			this.game.turnedCardsArr.push(cardTwo.dataset.name);
			cardOne.classList.add('matched');
			cardTwo.classList.add('matched');
			allClickSpaces.forEach((clickSpace) => {
				clickSpace.removeAttribute('style');
			});
			this.game.pairCardsArr = [];
			if (this.game.turnedCardsArr.length === this.game.numberOfCards) {
				this.executeVictory();
			}
		} else {
			setTimeout(() => {
				cardOne.classList.remove('visible');
				cardTwo.classList.remove('visible');
				allClickSpaces.forEach((clickSpace) => {
					clickSpace.removeAttribute('style');
				});
				this.game.pairCardsArr = [];
			}, 500);
		}
	}

	executeVictory() {
		const timeLeft = this.timerValueElement.textContent;
		const flipsMade = this.flipsCountElement.textContent;
		const currentScore = this.game.calcScore(timeLeft, flipsMade);
		const highestScore = this.game.highestScore();
		this.stopTimer = true;
		this.audio.victory();
		localStorage.setItem('currentScore', currentScore.toString());
		if (currentScore > highestScore) {
			localStorage.setItem('highestScore', currentScore.toString());
		}
		this.currentScoreValues.forEach((value) => {
			value.textContent = currentScore;
		});
		this.highestScoreValues.forEach((value) => {
			value.textContent = localStorage.getItem('highestScore');
		});

		this.overlayVictory.classList.add('visible');
		this.overlayVictory.addEventListener('click', () => {
			location.reload();
		});
	}

	executeGameOver() {
		this.audio.gameOver();
		this.overlayGameOver.classList.add('visible');
		this.overlayGameOver.addEventListener('click', () => {
			location.reload();
		});
	}

	overlayAnimation(el) {
		el.target.classList.add('hide');
		setTimeout(() => {
			el.target.classList.remove('visible');
			el.target.classList.remove('hide');
		}, 500);
	}
}

function ready() {
	const game = new Game();
	const ui = new UI();

	ui.highestScoreValues.forEach((value) => {
		value.textContent = game.highestScore();
	});
	ui.populateCardsGrid(game.cardsArray);
	ui.overlayStart.addEventListener('click', (e) => {
		ui.overlayAnimation(e);
		ui.startGame();
	});
	ui.cardsGrid.addEventListener('click', (e) => {
		ui.flipCard(e);
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', ready());
} else {
	ready();
}
