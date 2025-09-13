// Main App Module - Bengali Learning App
// Application controller and state management

const BengaliApp = {
    // Application state
    currentLessonData: null,
    currentLessonIndex: 0,
    currentQuizIndex: 0,
    quizScore: 0,
    quizAnswers: [],

    // Progress tracking
    progress: {
        beginner: { completed: 0, total: 15 },
        intermediate: { completed: 0, total: 0 },
        advanced: { completed: 0, total: 0 }
    },

    // Initialize application
    async init() {
        console.log('Initializing Bengali Learning App...');

        try {
            console.log('✅ Lesson data loaded successfully');

            // Load progress from storage
            this.loadProgress();

            // Initialize navigation
            Navigation.init();

            // Setup home screen
            this.setupHomeScreen();

            // Setup event listeners
            this.setupEventListeners();

            console.log('App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    },

    // Setup home screen with categories
    setupHomeScreen() {
        const categoriesContainer = Utils.querySelector('.categories-container');
        if (!categoriesContainer) return;

        // Clear existing content
        categoriesContainer.innerHTML = '';

        // Create category cards
        const categories = ['beginner', 'intermediate', 'advanced'];
        categories.forEach(category => {
            const progress = Utils.calculateProgress(
                this.progress[category].completed,
                this.progress[category].total
            );

            const categoryCard = Components.renderCategoryCard(category, progress);
            if (categoryCard) {
                // Add click event
                Utils.addEvent(categoryCard, 'click', () => {
                    const categoryInfo = LessonLoader.getCategoryInfo(category);
                    if (categoryInfo && categoryInfo.totalLessons > 0) {
                        Navigation.goToCategory(category);
                    } else {
                        alert('This category is coming soon! Please try the Beginner category.');
                    }
                });

                categoriesContainer.appendChild(categoryCard);
            }
        });
    },

    // Setup global event listeners
    setupEventListeners() {
        // Teaching screen navigation
        Utils.addEvent(Utils.querySelector('#prev-button'), 'click', () => {
            this.previousLessonItem();
        });

        Utils.addEvent(Utils.querySelector('#next-button'), 'click', () => {
            this.nextLessonItem();
        });

        Utils.addEvent(Utils.querySelector('#quiz-button'), 'click', () => {
            Navigation.goToQuiz(Navigation.currentCategory, Navigation.currentLesson);
        });

        // Quiz results buttons (using event delegation)
        document.addEventListener('click', (event) => {
            if (event.target.id === 'retake-quiz-button') {
                this.restartQuiz();
            } else if (event.target.id === 'back-to-lessons-button') {
                Navigation.goToCategory(Navigation.currentCategory);
            }
        });
    },

    // Load lessons for a category
    async loadCategoryLessons(category) {
        Components.showLoading(`Loading ${category} lessons...`);

        try {
            const lessons = await LessonLoader.loadCategoryLessons(category);
            this.renderCategoryLessons(category, lessons);
        } catch (error) {
            console.error('Error loading category lessons:', error);
            alert('Error loading lessons. Please try again.');
            Navigation.goToHome();
        }
    },

    // Render lessons for a category
    renderCategoryLessons(category, lessons) {
        const lessonsGrid = Utils.querySelector('#lessons-grid');
        if (!lessonsGrid) return;

        // Clear existing content
        lessonsGrid.innerHTML = '';

        if (lessons.length === 0) {
            lessonsGrid.innerHTML = '<p class="text-center text-muted">No lessons available for this category yet.</p>';
            return;
        }

        // Create lesson cards
        lessons.forEach(lesson => {
            const isCompleted = this.isLessonCompleted(lesson.id);
            const lessonCard = Components.renderLessonCard(lesson, isCompleted);

            // Add click event
            Utils.addEvent(lessonCard, 'click', () => {
                Navigation.goToLesson(category, lesson.id);
            });

            lessonsGrid.appendChild(lessonCard);
        });

        // Show the category screen
        Navigation.showScreen('category-screen');
    },

    // Load a specific lesson
    async loadLesson(category, lessonId) {
        Components.showLoading('Loading lesson...');

        try {
            this.currentLessonData = await LessonLoader.loadLesson(category, lessonId);
            this.currentLessonIndex = 0;
            this.renderTeachingContent();
        } catch (error) {
            console.error('Error loading lesson:', error);
            alert('Error loading lesson. Please try again.');
            Navigation.goToCategory(category);
        }
    },

    // Render teaching content
    renderTeachingContent() {
        if (!this.currentLessonData || !this.currentLessonData.teaching_content) return;

        const teachingCard = Utils.querySelector('#teaching-card');
        const progressFill = Utils.querySelector('#lesson-progress-fill');
        const progressText = Utils.querySelector('#lesson-progress-text');
        const prevButton = Utils.querySelector('#prev-button');
        const nextButton = Utils.querySelector('#next-button');
        const quizButton = Utils.querySelector('#quiz-button');

        // Get current item
        const currentItem = this.currentLessonData.teaching_content[this.currentLessonIndex];

        // Render teaching card content
        if (teachingCard) {
            teachingCard.innerHTML = '';
            teachingCard.appendChild(Components.renderTeachingCard(currentItem));
        }

        // Update progress
        const progress = ((this.currentLessonIndex + 1) / this.currentLessonData.teaching_content.length) * 100;
        Components.updateProgressBar(progressFill, progress);
        Components.updateProgressText(progressText, this.currentLessonIndex + 1, this.currentLessonData.teaching_content.length);

        // Update navigation buttons
        if (prevButton) prevButton.disabled = this.currentLessonIndex === 0;
        if (nextButton) nextButton.disabled = this.currentLessonIndex >= this.currentLessonData.teaching_content.length - 1;

        // Show/hide quiz button
        const isLastItem = this.currentLessonIndex >= this.currentLessonData.teaching_content.length - 1;
        if (nextButton) nextButton.style.display = isLastItem ? 'none' : 'inline-block';
        if (quizButton) quizButton.style.display = isLastItem ? 'inline-block' : 'none';

        // Show teaching screen
        Navigation.showScreen('teaching-screen');
    },

    // Navigate to previous lesson item
    previousLessonItem() {
        if (this.currentLessonIndex > 0) {
            this.currentLessonIndex--;
            this.renderTeachingContent();
        }
    },

    // Navigate to next lesson item
    nextLessonItem() {
        if (this.currentLessonData && this.currentLessonIndex < this.currentLessonData.teaching_content.length - 1) {
            this.currentLessonIndex++;
            this.renderTeachingContent();
        }
    },

    // Start quiz for current lesson
    startQuiz(category, lessonId) {
        if (!this.currentLessonData || !this.currentLessonData.quiz_questions) {
            alert('No quiz available for this lesson.');
            return;
        }

        // Reset quiz state
        this.currentQuizIndex = 0;
        this.quizScore = 0;
        this.quizAnswers = [];

        this.renderQuizQuestion();
    },

    // Render current quiz question
    renderQuizQuestion() {
        const quizCard = Utils.querySelector('#quiz-card');
        const progressFill = Utils.querySelector('#quiz-progress-fill');
        const progressText = Utils.querySelector('#quiz-progress-text');

        if (!this.currentLessonData || !this.currentLessonData.quiz_questions) return;

        const questions = this.currentLessonData.quiz_questions;
        const currentQuestion = questions[this.currentQuizIndex];

        // Clear previous content
        if (quizCard) {
            quizCard.innerHTML = '';

            // Render question
            const questionContent = Components.renderQuizQuestion(
                currentQuestion,
                this.currentQuizIndex,
                questions.length
            );
            quizCard.appendChild(questionContent);

            // Add option click events
            const options = Utils.querySelectorAll('.quiz-option');
            options.forEach((option, index) => {
                Utils.addEvent(option, 'click', () => {
                    this.selectQuizAnswer(index);
                });
            });
        }

        // Update progress
        const progress = ((this.currentQuizIndex + 1) / questions.length) * 100;
        Components.updateProgressBar(progressFill, progress);
        Components.updateProgressText(progressText, this.currentQuizIndex + 1, questions.length);

        // Show quiz screen
        Navigation.showScreen('quiz-screen');
    },

    // Handle quiz answer selection
    selectQuizAnswer(selectedIndex) {
        const currentQuestion = this.currentLessonData.quiz_questions[this.currentQuizIndex];
        const isCorrect = selectedIndex === currentQuestion.correct_answer;

        // Record answer
        this.quizAnswers.push({
            questionIndex: this.currentQuizIndex,
            selectedAnswer: selectedIndex,
            correct: isCorrect
        });

        if (isCorrect) {
            this.quizScore++;
        }

        // Show feedback
        this.showQuizFeedback(currentQuestion, selectedIndex, isCorrect);
    },

    // Show quiz feedback
    showQuizFeedback(question, selectedAnswer, isCorrect) {
        const quizCard = Utils.querySelector('#quiz-card');

        // Disable options
        const options = Utils.querySelectorAll('.quiz-option');
        options.forEach((option, index) => {
            option.classList.add('disabled');
            if (index === question.correct_answer) {
                option.classList.add('correct');
            } else if (index === selectedAnswer && !isCorrect) {
                option.classList.add('incorrect');
            }
        });

        // Add feedback
        const feedback = Components.renderQuizFeedback(question, selectedAnswer, isCorrect);
        quizCard.appendChild(feedback);

        // Add continue button
        const continueButton = Utils.createElement('button', {
            className: 'nav-button primary',
            innerHTML: this.currentQuizIndex < this.currentLessonData.quiz_questions.length - 1 ? 'Next Question' : 'Show Results',
            style: 'margin-top: 1rem;'
        });

        Utils.addEvent(continueButton, 'click', () => {
            if (this.currentQuizIndex < this.currentLessonData.quiz_questions.length - 1) {
                this.currentQuizIndex++;
                this.renderQuizQuestion();
            } else {
                this.showQuizResults();
            }
        });

        quizCard.appendChild(continueButton);
    },

    // Show quiz results
    showQuizResults() {
        const quizCard = Utils.querySelector('#quiz-card');
        const totalQuestions = this.currentLessonData.quiz_questions.length;

        // Mark lesson as completed if score is good enough
        if (this.quizScore >= Math.ceil(totalQuestions * 0.7)) {
            this.markLessonCompleted(this.currentLessonData.id);
        }

        // Render results
        const results = Components.renderQuizResults(this.quizScore, totalQuestions);

        if (quizCard) {
            quizCard.innerHTML = '';
            quizCard.appendChild(results);
        }
    },

    // Restart current quiz
    restartQuiz() {
        this.startQuiz(Navigation.currentCategory, Navigation.currentLesson);
    },

    // Mark lesson as completed
    markLessonCompleted(lessonId) {
        const completedLessons = this.getCompletedLessons();
        if (!completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);
            Utils.saveToStorage('completed_lessons', completedLessons);

            // Update category progress
            this.updateCategoryProgress();
        }
    },

    // Check if lesson is completed
    isLessonCompleted(lessonId) {
        const completedLessons = this.getCompletedLessons();
        return completedLessons.includes(lessonId);
    },

    // Get completed lessons
    getCompletedLessons() {
        return Utils.loadFromStorage('completed_lessons') || [];
    },

    // Update category progress
    updateCategoryProgress() {
        const completedLessons = this.getCompletedLessons();

        // Count completed lessons per category
        Object.keys(this.progress).forEach(category => {
            const categoryLessonIds = LessonLoader.getCategoryLessonIds(category);
            const completedInCategory = completedLessons.filter(lessonId => 
                categoryLessonIds.includes(lessonId)
            ).length;

            this.progress[category].completed = completedInCategory;
        });

        // Save progress
        Utils.saveToStorage('progress', this.progress);

        // Update UI if on home screen
        if (Navigation.currentScreen === 'home-screen') {
            this.updateHomeScreenProgress();
        }
    },

    // Update progress on home screen
    updateHomeScreenProgress() {
        Object.keys(this.progress).forEach(category => {
            const progressFill = Utils.querySelector(`.progress-fill[data-category="${category}"]`);
            const progressText = Utils.querySelector(`.progress-text[data-category="${category}"]`);

            const percentage = Utils.calculateProgress(
                this.progress[category].completed,
                this.progress[category].total
            );

            Components.updateProgressBar(progressFill, percentage);
            if (progressText) {
                progressText.textContent = `${percentage}%`;
            }
        });
    },

    // Load progress from storage
    loadProgress() {
        const savedProgress = Utils.loadFromStorage('progress');
        if (savedProgress) {
            this.progress = { ...this.progress, ...savedProgress };
        }
        this.updateCategoryProgress();
    },

    // Get current lesson data
    getCurrentLessonData() {
        return this.currentLessonData;
    },

    // Reset app data
    resetApp() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            Utils.saveToStorage('completed_lessons', []);
            Utils.saveToStorage('progress', {});
            location.reload();
        }
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    BengaliApp.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BengaliApp;
}
