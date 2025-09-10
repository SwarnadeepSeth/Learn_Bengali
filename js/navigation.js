// Navigation Module - Bengali Learning App
// Handles screen routing and navigation state

const Navigation = {
    // Current navigation state
    currentScreen: 'home-screen',
    navigationHistory: [],
    currentCategory: null,
    currentLesson: null,

    // Initialize navigation
    init() {
        this.setupEventListeners();
        this.showScreen('home-screen');
    },

    // Setup navigation event listeners
    setupEventListeners() {
        // Back buttons
        Utils.addEvent(Utils.querySelector('#back-to-home'), 'click', () => {
            this.goToHome();
        });

        Utils.addEvent(Utils.querySelector('#back-to-category'), 'click', () => {
            this.goToCategory(this.currentCategory);
        });

        Utils.addEvent(Utils.querySelector('#back-to-lesson'), 'click', () => {
            this.goToLesson(this.currentCategory, this.currentLesson);
        });

        // Handle browser back button
        window.addEventListener('popstate', (event) => {
            if (event.state) {
                this.showScreen(event.state.screen);
                this.currentCategory = event.state.category;
                this.currentLesson = event.state.lesson;
            }
        });
    },

    // Show specific screen
    showScreen(screenId) {
        console.log(`Navigating to screen: ${screenId}`);

        // Hide all screens
        const screens = Utils.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = Utils.querySelector(`#${screenId}`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;

            // Update browser history
            const state = {
                screen: screenId,
                category: this.currentCategory,
                lesson: this.currentLesson
            };

            if (screenId !== 'loading-screen') {
                history.pushState(state, '', `#${screenId}`);
            }
        } else {
            console.error(`Screen not found: ${screenId}`);
        }
    },

    // Navigate to home
    goToHome() {
        this.currentCategory = null;
        this.currentLesson = null;
        this.showScreen('home-screen');
        this.updateBreadcrumbs();
    },

    // Navigate to category
    goToCategory(category) {
        this.currentCategory = category;
        this.currentLesson = null;
        this.showScreen('category-screen');
        this.updateBreadcrumbs();

        // Load lessons for this category
        BengaliApp.loadCategoryLessons(category);
    },

    // Navigate to lesson
    goToLesson(category, lessonId) {
        this.currentCategory = category;
        this.currentLesson = lessonId;
        this.showScreen('teaching-screen');
        this.updateBreadcrumbs();

        // Load lesson content
        BengaliApp.loadLesson(category, lessonId);
    },

    // Navigate to quiz
    goToQuiz(category, lessonId) {
        this.currentCategory = category;
        this.currentLesson = lessonId;
        this.showScreen('quiz-screen');
        this.updateBreadcrumbs();

        // Start quiz
        BengaliApp.startQuiz(category, lessonId);
    },

    // Update breadcrumbs across screens
    updateBreadcrumbs() {
        const categoryElements = Utils.querySelectorAll('.category-name');
        const lessonElements = Utils.querySelectorAll('.lesson-name');

        // Update category name in breadcrumbs
        if (this.currentCategory) {
            const categoryInfo = LessonLoader.getCategoryInfo(this.currentCategory);
            categoryElements.forEach(element => {
                element.textContent = categoryInfo ? categoryInfo.title : Utils.capitalize(this.currentCategory);
            });
        }

        // Update lesson name in breadcrumbs
        if (this.currentLesson) {
            // Get lesson title from current lesson data
            const currentLessonData = BengaliApp.getCurrentLessonData();
            lessonElements.forEach(element => {
                element.textContent = currentLessonData ? currentLessonData.title : this.currentLesson;
            });
        }
    },

    // Add navigation state to history
    addToHistory(screenId, category = null, lesson = null) {
        this.navigationHistory.push({
            screen: screenId,
            category: category,
            lesson: lesson,
            timestamp: Date.now()
        });

        // Keep history reasonable size
        if (this.navigationHistory.length > 10) {
            this.navigationHistory.shift();
        }
    },

    // Go back in navigation history
    goBack() {
        if (this.navigationHistory.length > 1) {
            // Remove current state
            this.navigationHistory.pop();

            // Get previous state
            const previousState = this.navigationHistory[this.navigationHistory.length - 1];

            this.currentCategory = previousState.category;
            this.currentLesson = previousState.lesson;
            this.showScreen(previousState.screen);
            this.updateBreadcrumbs();
        } else {
            // Fallback to home
            this.goToHome();
        }
    },

    // Get current navigation state
    getCurrentState() {
        return {
            screen: this.currentScreen,
            category: this.currentCategory,
            lesson: this.currentLesson
        };
    },

    // Set navigation state
    setState(state) {
        this.currentScreen = state.screen || 'home-screen';
        this.currentCategory = state.category || null;
        this.currentLesson = state.lesson || null;
        this.updateBreadcrumbs();
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}
