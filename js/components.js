// Components Module - Bengali Learning App
// Reusable UI components and rendering functions

const Components = {
    // Render category card
    renderCategoryCard: (category, progress = 0) => {
        const categoryInfo = LessonLoader.getCategoryInfo(category);
        if (!categoryInfo) return null;

        const isAvailable = categoryInfo.totalLessons > 0;
        const lessonCountText = isAvailable ? `${categoryInfo.totalLessons} Lessons` : 'Coming Soon';

        return Utils.createElement('div', {
            className: `category-card ${!isAvailable ? 'disabled' : ''}`,
            'data-category': category
        }, [
            Utils.createElement('div', { className: 'category-header' }, [
                Utils.createElement('div', { 
                    className: 'category-icon',
                    innerHTML: category === 'beginner' ? 'অ' : category === 'intermediate' ? 'শব্দ' : 'সাহিত্য'
                }),
                Utils.createElement('h2', {}, [categoryInfo.title])
            ]),
            Utils.createElement('p', {
                className: 'category-description',
                innerHTML: categoryInfo.description
            }),
            Utils.createElement('div', { className: 'category-meta' }, [
                Utils.createElement('span', {
                    className: 'lesson-count',
                    innerHTML: lessonCountText
                }),
                Utils.createElement('div', { className: 'progress-indicator' }, [
                    Utils.createElement('div', { className: 'progress-bar' }, [
                        Utils.createElement('div', {
                            className: 'progress-fill',
                            style: `width: ${progress}%`,
                            'data-category': category
                        })
                    ]),
                    Utils.createElement('span', {
                        className: 'progress-text',
                        'data-category': category,
                        innerHTML: `${progress}%`
                    })
                ])
            ])
        ]);
    },

    // Render lesson card
    renderLessonCard: (lesson, isCompleted = false) => {
        return Utils.createElement('div', {
            className: `lesson-card ${isCompleted ? 'completed' : ''}`,
            'data-lesson-id': lesson.id
        }, [
            Utils.createElement('h3', {
                className: 'lesson-title',
                innerHTML: lesson.title
            }),
            Utils.createElement('p', {
                className: 'lesson-description',
                innerHTML: lesson.description
            }),
            Utils.createElement('div', { className: 'lesson-meta' }, [
                Utils.createElement('span', {
                    className: 'lesson-items',
                    innerHTML: `${lesson.total_items} items`
                }),
                Utils.createElement('span', {
                    className: 'lesson-time',
                    innerHTML: lesson.estimated_time || '10 min'
                })
            ])
        ]);
    },

    // Render teaching card content
    renderTeachingCard: (item) => {
        const cardElement = Utils.createElement('div', { className: 'teaching-content' });

        // Bengali text (always present)
        cardElement.appendChild(
            Utils.createElement('div', {
                className: 'teaching-bengali',
                innerHTML: item.bengali,
                title: 'Click to hear pronunciation'
            })
        );

        // English translation
        if (item.english) {
            cardElement.appendChild(
                Utils.createElement('div', {
                    className: 'teaching-english',
                    innerHTML: item.english
                })
            );
        }

        // Phonetic pronunciation (always show with Bengali)
        if (item.phonetic) {
            cardElement.appendChild(
                Utils.createElement('div', {
                    className: 'teaching-phonetic',
                    innerHTML: `(${item.phonetic})`
                })
            );
        }

        // Pronunciation guide
        if (item.pronunciation_guide) {
            cardElement.appendChild(
                Utils.createElement('div', {
                    className: 'teaching-guide',
                    innerHTML: `Pronunciation: ${item.pronunciation_guide}`
                })
            );
        }

        // Audio tip
        if (item.audio_tip) {
            cardElement.appendChild(
                Utils.createElement('div', {
                    className: 'teaching-tip',
                    innerHTML: `💡 Tip: ${item.audio_tip}`
                })
            );
        }

        // For numbers, show the numeric value
        if (item.number !== undefined) {
            cardElement.appendChild(
                Utils.createElement('div', {
                    className: 'teaching-number',
                    innerHTML: `Number: ${item.number}`
                })
            );
        }

        return cardElement;
    },

    // Render quiz question
    renderQuizQuestion: (question, questionIndex, totalQuestions) => {
        const quizElement = Utils.createElement('div', { className: 'quiz-content' });

        // Question text with Bengali/phonetic highlighting
        let questionText = question.question;
        if (question.bengali_focus && question.phonetic_focus) {
            questionText = questionText.replace(
                question.bengali_focus,
                `<span class="quiz-bengali-focus">${question.bengali_focus}</span> <span class="quiz-phonetic-focus">(${question.phonetic_focus})</span>`
            );
        }

        quizElement.appendChild(
            Utils.createElement('div', {
                className: 'quiz-question',
                innerHTML: questionText
            })
        );

        // Options
        const optionsContainer = Utils.createElement('div', { className: 'quiz-options' });

        question.options.forEach((option, index) => {
            const optionElement = Utils.createElement('div', {
                className: 'quiz-option',
                'data-option-index': index,
                innerHTML: option
            });

            optionsContainer.appendChild(optionElement);
        });

        quizElement.appendChild(optionsContainer);

        return quizElement;
    },

    // Render quiz feedback
    renderQuizFeedback: (question, selectedAnswer, isCorrect) => {
        const feedbackElement = Utils.createElement('div', {
            className: `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`
        });

        const resultText = isCorrect ? '✅ Correct!' : '❌ Incorrect';
        feedbackElement.appendChild(
            Utils.createElement('div', {
                className: 'quiz-result',
                innerHTML: resultText
            })
        );

        if (question.explanation) {
            feedbackElement.appendChild(
                Utils.createElement('div', {
                    className: 'quiz-explanation',
                    innerHTML: question.explanation
                })
            );
        }

        return feedbackElement;
    },

    // Render quiz results
    renderQuizResults: (score, totalQuestions) => {
        const percentage = Math.round((score / totalQuestions) * 100);
        let message = '';

        if (percentage >= 90) {
            message = 'Excellent! You have mastered this lesson! 🎉';
        } else if (percentage >= 70) {
            message = 'Great job! You\'re doing well! 👏';
        } else if (percentage >= 50) {
            message = 'Good effort! Keep practicing to improve! 📚';
        } else {
            message = 'Keep trying! Review the lesson and try again! 💪';
        }

        return Utils.createElement('div', { className: 'quiz-results' }, [
            Utils.createElement('div', {
                className: 'quiz-score',
                innerHTML: `${score}/${totalQuestions}`
            }),
            Utils.createElement('div', {
                className: 'quiz-percentage',
                innerHTML: `${percentage}%`
            }),
            Utils.createElement('div', {
                className: 'quiz-message',
                innerHTML: message
            }),
            Utils.createElement('div', { className: 'quiz-actions' }, [
                Utils.createElement('button', {
                    className: 'nav-button primary',
                    id: 'retake-quiz-button',
                    innerHTML: 'Retake Quiz'
                }),
                Utils.createElement('button', {
                    className: 'nav-button',
                    id: 'back-to-lessons-button', 
                    innerHTML: 'Back to Lessons'
                })
            ])
        ]);
    },

    // Update progress bar
    updateProgressBar: (element, progress) => {
        if (element) {
            element.style.width = `${progress}%`;
        }
    },

    // Update progress text
    updateProgressText: (element, current, total) => {
        if (element) {
            element.textContent = `${current} / ${total}`;
        }
    },

    // Show loading state
    showLoading: (message = 'Loading...') => {
        const loadingScreen = Utils.querySelector('#loading-screen');
        const loadingText = Utils.querySelector('#loading-screen p');

        if (loadingText) {
            loadingText.textContent = message;
        }

        Navigation.showScreen('loading-screen');
    },

    // Hide loading state
    hideLoading: () => {
        // Loading will be hidden when next screen is shown
    },

    // Add click animation to element
    addClickAnimation: (element) => {
        if (!element) return;

        element.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    },

    // Create breadcrumb text
    createBreadcrumb: (parts) => {
        return parts.filter(part => part).join(' > ');
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Components;
}
