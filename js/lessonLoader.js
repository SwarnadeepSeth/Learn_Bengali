// Lesson Loader Module - Bengali Learning App
// Handles loading of lesson data from external JSON files

const LessonLoader = {
    // Cache for loaded lessons
    cache: new Map(),

    // Load lesson by category and lesson ID by fetching the JSON file
    async loadLesson(category, lessonId) {
        const cacheKey = `${category}-${lessonId}`;
        const lessonPath = `data/${category}/${lessonId}.json`;

        // Check cache first
        if (this.cache.has(cacheKey)) {
            console.log(`Loading lesson from cache: ${cacheKey}`);
            return this.cache.get(cacheKey);
        }

        try {
            console.log(`Fetching lesson from: ${lessonPath}`);
            
            // Fetch the JSON data from the file
            const response = await fetch(lessonPath);

            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const lessonData = await response.json();

            // Validate lesson data
            if (!Utils.validateLessonData(lessonData)) {
                throw new Error('Invalid lesson data format');
            }

            // Cache the lesson
            this.cache.set(cacheKey, lessonData);

            console.log(`Successfully loaded lesson: ${lessonData.title}`);
            return lessonData;

        } catch (error) {
            console.error(`Error loading lesson ${lessonPath}:`, error);
            // Return fallback data for development/demo
            return this.getFallbackLessonData(category, lessonId);
        }
    },

    // Load multiple lessons for a category
    async loadCategoryLessons(category) {
        const lessonIds = this.getCategoryLessonIds(category);
        
        // Use Promise.all to fetch all lessons in parallel for better performance
        const lessonPromises = lessonIds.map(lessonId => this.loadLesson(category, lessonId));
        
        try {
            const lessons = await Promise.all(lessonPromises);
            // Filter out any lessons that failed to load (returned fallback)
            return lessons.filter(lesson => lesson && lesson.type !== 'fallback');
        } catch (error) {
            console.error(`Failed to load all lessons for category ${category}:`, error);
            return [];
        }
    },

    // Get lesson IDs for a category (this remains the same for now)
    getCategoryLessonIds(category) {
        const lessonMaps = {
            'beginner': [
                'lesson1-vowels',
                'lesson2-consonants',
                'lesson3-greetings',
                'lesson4-numbers',
                'lesson5-vowel-diacritics',
                'lesson6-common-nouns',
                'lesson7-simple-verbs',
                'lesson8-simple-sentences',
                'lesson9-basic-adjectives',
                'lesson10-colors-days',
                'lesson11-asking-questions',
                'lesson12-family-relationships',
                'lesson13-daily-routine-time',
                'lesson14-more-food-drink',
                'lesson15-simple-conjunctions',
                'lesson16-commands-requests'
            ],
            'intermediate': [],
            'advanced': []
        };
        return lessonMaps[category] || [];
    },

    // Get category metadata (remains the same)
    getCategoryInfo(category) {
        const categoryInfo = {
            'beginner': {
                id: 'beginner',
                title: 'Beginner',
                description: 'Start your Bengali journey with basic script and essential phrases',
                totalLessons: 16
            },
            'intermediate': {
                id: 'intermediate',
                title: 'Intermediate',
                description: 'Build fluency with complex grammar and vocabulary',
                totalLessons: 0
            },
            'advanced': {
                id: 'advanced',
                title: 'Advanced',
                description: 'Master advanced Bengali conversation and literature',
                totalLessons: 0
            }
        };
        return categoryInfo[category] || null;
    },

    // Preload lessons for better performance
    async preloadCategoryLessons(category) {
        console.log(`Preloading lessons for category: ${category}`);
        return await this.loadCategoryLessons(category);
    },

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('Lesson cache cleared');
    },

    // This function is no longer needed as we are fetching data
    isDataAvailable() {
        return true; // Or simply remove this function and its call in app.js
    },

    // Fallback data remains the same
    getFallbackLessonData(category, lessonId) {
        console.warn(`Using fallback data for ${category}/${lessonId}`);
        return {
            id: lessonId,
            title: `${Utils.capitalize(category)} Lesson`,
            category: category,
            description: 'Fallback lesson data - there was an error loading from the JSON file.',
            type: 'fallback',
            total_items: 1,
            estimated_time: '5 minutes',
            teaching_content: [{ bengali: 'ত্রুটি', english: 'Error', phonetic: 'Truti' }],
            quiz_questions: [{ question: 'Could not load the quiz. Please check the JSON file and the browser console.', options: ['OK'], correct_answer: 0 }]
        };
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LessonLoader;
}