// js/games/maze-game.js

const MazeGame = {
    // Game State
    gameData: [],
    questionIndex: 0,
    mazePosition: { x: 0, y: 0 },
    dimensions: { cols: 5, rows: 4 },
    
    // Elements
    containerEl: null,
    promptEl: null,
    feedbackEl: null,
    optionsEl: null,
    playerEl: null,

    // Callback
    onComplete: null,

    // Initialize and start the game
    init(config) {
        this.containerEl = config.container;
        this.gameData = Utils.shuffleArray(config.gameData);
        this.onComplete = config.onComplete;
        
        this.questionIndex = 0;
        this.mazePosition = { x: 0, y: 0 };

        this.setupHTML();
        this.renderQuestion();
    },

    // Build the initial HTML structure for the game
    setupHTML() {
        this.containerEl.innerHTML = `
            <div id="game-maze-area">
                <div id="maze-player"></div>
                <div id="maze-exit">🏁</div>
            </div>
            <div id="game-prompt-card">
                <div id="game-prompt"></div>
                <div id="game-feedback"></div>
            </div>
            <div id="game-options"></div>
        `;

        const mazeArea = this.containerEl.querySelector('#game-maze-area');
        for (let i = 0; i < this.dimensions.cols * this.dimensions.rows; i++) {
            mazeArea.appendChild(Utils.createElement('div', { className: 'maze-cell' }));
        }

        this.promptEl = this.containerEl.querySelector('#game-prompt');
        this.feedbackEl = this.containerEl.querySelector('#game-feedback');
        this.optionsEl = this.containerEl.querySelector('#game-options');
        this.playerEl = this.containerEl.querySelector('#maze-player');
    },

    // Display the current question and options
    renderQuestion() {
        this.feedbackEl.innerHTML = '';
        this.optionsEl.innerHTML = '';
        
        const currentQuestion = this.gameData[this.questionIndex];
        this.promptEl.textContent = currentQuestion.prompt_english;

        currentQuestion.options_bengali.forEach((option, index) => {
            const optionButton = Utils.createElement('div', {
                className: 'game-option',
                innerHTML: option,
                'data-option-index': index
            });
            Utils.addEvent(optionButton, 'click', () => this.handleAnswer(index));
            this.optionsEl.appendChild(optionButton);
        });

        this.updatePlayerPosition();
    },

    // Handle the user's answer
    handleAnswer(selectedIndex) {
        this.optionsEl.querySelectorAll('.game-option').forEach(opt => opt.classList.add('disabled'));

        const currentQuestion = this.gameData[this.questionIndex];
        const isCorrect = selectedIndex === currentQuestion.correct_answer;

        if (isCorrect) {
            this.feedbackEl.textContent = '✅ Correct! The door opens.';
            this.feedbackEl.style.color = '#28a745';
            this.mazePosition.x++;
            if (this.mazePosition.x >= this.dimensions.cols) {
                this.mazePosition.x = 0;
                this.mazePosition.y++;
            }
        } else {
            this.feedbackEl.textContent = '❌ Wrong way! You take a step back.';
            this.feedbackEl.style.color = '#dc3545';
            this.mazePosition.x--;
            if (this.mazePosition.x < 0) {
                if (this.mazePosition.y > 0) {
                    this.mazePosition.x = this.dimensions.cols - 1;
                    this.mazePosition.y--;
                } else {
                    this.mazePosition.x = 0;
                }
            }
        }
        
        this.questionIndex++;
        
        const totalSteps = this.dimensions.cols * this.dimensions.rows;
        const currentStep = (this.mazePosition.y * this.dimensions.cols) + this.mazePosition.x;
        
        if (currentStep >= totalSteps - 1 || this.questionIndex >= this.gameData.length) {
            setTimeout(() => {
                this.updatePlayerPosition();
                this.showResults(currentStep >= totalSteps - 1);
            }, 300);
            return;
        }

        setTimeout(() => this.renderQuestion(), 1500);
    },

    // Update the player's visual position
    updatePlayerPosition() {
        this.playerEl.style.left = `${this.mazePosition.x * (100 / this.dimensions.cols)}%`;
        this.playerEl.style.top = `${this.mazePosition.y * (100 / this.dimensions.rows)}%`;
    },

    // Display the final results
    showResults(didWin) {
        let message = didWin ? 'Congratulations! You escaped the maze! 🎉' : 'So close! You ran out of questions. Try again! 💪';

        const resultsEl = Utils.createElement('div', { className: 'quiz-results' }, [
            Utils.createElement('div', { className: 'quiz-message', style: 'font-size: 1.5rem;', innerHTML: message }),
            Utils.createElement('div', { className: 'quiz-actions' }, [
                 Utils.createElement('button', { className: 'nav-button primary', id: 'retake-quiz-button', innerHTML: 'Play Again' }),
                 Utils.createElement('button', { className: 'nav-button', id: 'back-to-lessons-button', innerHTML: 'Back to Lessons' })
            ])
        ]);
        
        this.containerEl.innerHTML = '';
        this.containerEl.appendChild(resultsEl);
        
        if (this.onComplete) {
            this.onComplete(didWin);
        }
    }
};