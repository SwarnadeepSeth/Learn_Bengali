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
    mazeAreaEl: null,

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
        this.addGameStyles();
    },

    // Add enhanced CSS styles for the game
    addGameStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            #game-maze-area {
                position: relative;
                width: min(500px, 90vw);
                height: min(400px, 60vh);
                margin: 0 auto 2rem;
                border: 4px solid #2c3e50;
                border-radius: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                grid-template-rows: repeat(4, 1fr);
                gap: 2px;
                padding: 10px;
            }

            .maze-cell {
                background: linear-gradient(45deg, #34495e, #2c3e50);
                border-radius: 8px;
                position: relative;
                transition: all 0.3s ease;
                border: 2px solid transparent;
            }

            .maze-cell:hover {
                border-color: #3498db;
                transform: scale(0.95);
            }

            .maze-cell.player-path {
                background: linear-gradient(45deg, #27ae60, #2ecc71);
                box-shadow: inset 0 2px 10px rgba(255,255,255,0.2);
                border-color: #27ae60;
            }

            .maze-cell.current-position {
                animation: currentCellPulse 1.5s infinite;
            }

            @keyframes currentCellPulse {
                0%, 100% { 
                    box-shadow: 0 0 10px #3498db, inset 0 2px 10px rgba(255,255,255,0.2);
                    border-color: #3498db;
                }
                50% { 
                    box-shadow: 0 0 25px #e74c3c, inset 0 2px 10px rgba(255,255,255,0.2);
                    border-color: #e74c3c;
                }
            }

            #maze-player {
                position: absolute;
                width: calc(20% - 8px);
                height: calc(25% - 8px);
                background: linear-gradient(45deg, #f39c12, #e67e22);
                border-radius: 50%;
                transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                z-index: 10;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                border: 3px solid #fff;
            }

            #maze-player::before {
                content: '🧭';
                font-size: 1.5rem;
                animation: playerBounce 2s infinite;
            }

            @keyframes playerBounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-8px); }
                60% { transform: translateY(-4px); }
            }

            #maze-exit {
                position: absolute;
                top: 75%;
                left: 80%;
                width: calc(20% - 8px);
                height: calc(25% - 8px);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                animation: exitGlow 2s infinite;
                z-index: 5;
                border-radius: 50%;
                background: linear-gradient(45deg, #e74c3c, #c0392b);
                border: 3px solid #fff;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            }

            @keyframes exitGlow {
                0%, 100% { 
                    transform: scale(1);
                    box-shadow: 0 0 20px #e74c3c;
                }
                50% { 
                    transform: scale(1.1);
                    box-shadow: 0 0 30px #e74c3c, 0 0 40px #e74c3c;
                }
            }

            #game-prompt-card {
                background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
                border-radius: 15px;
                padding: 2rem;
                margin-bottom: 1.5rem;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                border: 1px solid #e9ecef;
                position: relative;
                overflow: hidden;
            }

            #game-prompt-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #667eea, #764ba2);
            }

            #game-prompt {
                font-size: 1.3rem;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 1rem;
                line-height: 1.5;
            }

            #game-feedback {
                font-size: 1.1rem;
                font-weight: 600;
                padding: 0.8rem 1.2rem;
                border-radius: 10px;
                margin-top: 1rem;
                transition: all 0.3s ease;
                text-align: center;
            }

            #game-feedback.correct {
                background: linear-gradient(45deg, #27ae60, #2ecc71);
                color: white;
                animation: correctFeedback 0.6s ease;
            }

            #game-feedback.incorrect {
                background: linear-gradient(45deg, #e74c3c, #c0392b);
                color: white;
                animation: incorrectFeedback 0.6s ease;
            }

            @keyframes correctFeedback {
                0% { transform: scale(0.9) rotateX(90deg); opacity: 0; }
                50% { transform: scale(1.05) rotateX(0deg); }
                100% { transform: scale(1) rotateX(0deg); opacity: 1; }
            }

            @keyframes incorrectFeedback {
                0%, 20%, 40%, 60%, 80% { transform: translateX(-10px); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(10px); }
                100% { transform: translateX(0); }
            }

            #game-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-top: 1.5rem;
            }

            .game-option {
                background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
                border: 2px solid #dee2e6;
                border-radius: 12px;
                padding: 1.2rem;
                font-size: 1.1rem;
                font-weight: 500;
                color: #495057;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                text-align: center;
                position: relative;
                overflow: hidden;
            }

            .game-option::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                transition: left 0.6s;
            }

            .game-option:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                border-color: #667eea;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .game-option:hover::before {
                left: 100%;
            }

            .game-option:active {
                transform: translateY(-2px);
            }

            .game-option.disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none !important;
                background: #f8f9fa;
                color: #6c757d;
            }

            .game-option.correct {
                background: linear-gradient(135deg, #27ae60, #2ecc71);
                border-color: #27ae60;
                color: white;
                animation: correctAnswer 0.6s ease;
            }

            .game-option.incorrect {
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                border-color: #e74c3c;
                color: white;
                animation: incorrectAnswer 0.6s ease;
            }

            @keyframes correctAnswer {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            @keyframes incorrectAnswer {
                0%, 20%, 40%, 60%, 80% { transform: translateX(-5px); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(5px); }
                100% { transform: translateX(0); }
            }

            .quiz-results {
                text-align: center;
                padding: 3rem 2rem;
                background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
                border-radius: 20px;
                box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                animation: resultsAppear 0.8s ease;
            }

            @keyframes resultsAppear {
                0% { 
                    opacity: 0; 
                    transform: scale(0.8) translateY(30px); 
                }
                100% { 
                    opacity: 1; 
                    transform: scale(1) translateY(0); 
                }
            }

            .quiz-message {
                font-size: 1.8rem;
                font-weight: 700;
                color: #2c3e50;
                margin-bottom: 2rem;
                line-height: 1.4;
            }

            .quiz-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }

            .nav-button {
                padding: 0.8rem 2rem;
                border: none;
                border-radius: 25px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
                position: relative;
                overflow: hidden;
            }

            .nav-button.primary {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            }

            .nav-button.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            }

            .nav-button:not(.primary) {
                background: linear-gradient(135deg, #95a5a6, #7f8c8d);
                color: white;
                box-shadow: 0 4px 15px rgba(149, 165, 166, 0.4);
            }

            .nav-button:not(.primary):hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(149, 165, 166, 0.6);
            }

            /* Responsive design */
            @media (max-width: 768px) {
                #game-maze-area {
                    width: 95vw;
                    height: 50vh;
                }

                #game-prompt {
                    font-size: 1.1rem;
                }

                #game-options {
                    grid-template-columns: 1fr;
                }

                .game-option {
                    padding: 1rem;
                    font-size: 1rem;
                }
            }
        `;
        document.head.appendChild(styleEl);
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

        this.mazeAreaEl = this.containerEl.querySelector('#game-maze-area');
        
        // Create maze cells with enhanced styling
        for (let i = 0; i < this.dimensions.cols * this.dimensions.rows; i++) {
            const cell = Utils.createElement('div', { className: 'maze-cell' });
            this.mazeAreaEl.appendChild(cell);
        }

        this.promptEl = this.containerEl.querySelector('#game-prompt');
        this.feedbackEl = this.containerEl.querySelector('#game-feedback');
        this.optionsEl = this.containerEl.querySelector('#game-options');
        this.playerEl = this.containerEl.querySelector('#maze-player');
    },

    // Display the current question and options
    renderQuestion() {
        // Clear previous feedback and options
        this.feedbackEl.innerHTML = '';
        this.feedbackEl.className = '';
        this.optionsEl.innerHTML = '';
        
        const currentQuestion = this.gameData[this.questionIndex];
        this.promptEl.textContent = currentQuestion.prompt_english;

        // Create option buttons with enhanced styling
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
        this.updateMazeVisuals();
    },

    // Handle the user's answer
    handleAnswer(selectedIndex) {
        const options = this.optionsEl.querySelectorAll('.game-option');
        const currentQuestion = this.gameData[this.questionIndex];
        const isCorrect = selectedIndex === currentQuestion.correct_answer;

        // Disable all options
        options.forEach(opt => opt.classList.add('disabled'));

        // Highlight correct and incorrect answers
        options[currentQuestion.correct_answer].classList.add('correct');
        if (!isCorrect) {
            options[selectedIndex].classList.add('incorrect');
        }

        // Show feedback with animation
        if (isCorrect) {
            this.feedbackEl.textContent = '✨ Excellent! The path opens before you! ✨';
            this.feedbackEl.className = 'correct';
            this.moveForward();
        } else {
            this.feedbackEl.textContent = '🚫 Oops! You hit a wall and step back! 🚫';
            this.feedbackEl.className = 'incorrect';
            this.moveBackward();
        }
        
        this.questionIndex++;
        
        const totalSteps = this.dimensions.cols * this.dimensions.rows;
        const currentStep = (this.mazePosition.y * this.dimensions.cols) + this.mazePosition.x;
        
        // Check if game is complete
        if (currentStep >= totalSteps - 1 || this.questionIndex >= this.gameData.length) {
            setTimeout(() => {
                this.updatePlayerPosition();
                this.updateMazeVisuals();
                this.showResults(currentStep >= totalSteps - 1);
            }, 1500);
            return;
        }

        // Continue to next question
        setTimeout(() => this.renderQuestion(), 2000);
    },

    // Move player forward
    moveForward() {
        this.mazePosition.x++;
        if (this.mazePosition.x >= this.dimensions.cols) {
            this.mazePosition.x = 0;
            this.mazePosition.y++;
        }
    },

    // Move player backward
    moveBackward() {
        this.mazePosition.x--;
        if (this.mazePosition.x < 0) {
            if (this.mazePosition.y > 0) {
                this.mazePosition.x = this.dimensions.cols - 1;
                this.mazePosition.y--;
            } else {
                this.mazePosition.x = 0;
            }
        }
    },

    // Update the player's visual position with smooth animation
    updatePlayerPosition() {
        const cellSize = 100 / this.dimensions.cols;
        const rowSize = 100 / this.dimensions.rows;
        
        this.playerEl.style.left = `${this.mazePosition.x * cellSize + 4}%`;
        this.playerEl.style.top = `${this.mazePosition.y * rowSize + 4}%`;
    },

    // Update maze visual indicators
    updateMazeVisuals() {
        const cells = this.mazeAreaEl.querySelectorAll('.maze-cell');
        const currentIndex = (this.mazePosition.y * this.dimensions.cols) + this.mazePosition.x;
        
        // Clear previous styling
        cells.forEach(cell => {
            cell.classList.remove('player-path', 'current-position');
        });

        // Mark the path taken
        for (let i = 0; i <= currentIndex; i++) {
            if (cells[i]) {
                cells[i].classList.add('player-path');
            }
        }

        // Mark current position
        if (cells[currentIndex]) {
            cells[currentIndex].classList.add('current-position');
        }
    },

    // Display the final results with enhanced styling
    showResults(didWin) {
        const message = didWin 
            ? '🎉 Amazing! You conquered the maze! 🎉<br><small>You successfully navigated through all the challenges!</small>' 
            : '💪 Great effort! You ran out of questions, but you made good progress!<br><small>Try again to reach the finish line!</small>';

        const resultsEl = Utils.createElement('div', { className: 'quiz-results' }, [
            Utils.createElement('div', { className: 'quiz-message', innerHTML: message }),
            Utils.createElement('div', { className: 'quiz-actions' }, [
                Utils.createElement('button', { 
                    className: 'nav-button primary', 
                    id: 'retake-quiz-button', 
                    innerHTML: '🎮 Play Again' 
                }),
                Utils.createElement('button', { 
                    className: 'nav-button', 
                    id: 'back-to-lessons-button', 
                    innerHTML: '📚 Back to Lessons' 
                })
            ])
        ]);
        
        this.containerEl.innerHTML = '';
        this.containerEl.appendChild(resultsEl);
        
        if (this.onComplete) {
            this.onComplete(didWin);
        }
    }
};