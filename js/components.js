// Components Module - Bengali Learning App
// Reusable UI components and rendering functions

const Components = {
    // Text-to-speech functionality
    speechSynthesis: {
        isSupported: () => {
            try {
                return 'speechSynthesis' in window && speechSynthesis !== null;
            } catch (e) {
                return false;
            }
        },

        speak: (text, options = {}) => {
            if (!Components.speechSynthesis.isSupported()) {
                console.warn('Speech synthesis not supported in this browser');
                // Show a message to the user
                alert('Speech synthesis is not supported in your browser. Please try a modern browser like Chrome, Firefox, or Edge.');
                return;
            }

            // Cancel any ongoing speech
            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            // Set language to Bengali if available
            utterance.lang = options.lang || 'bn-BD'; // Bengali (Bangladesh)

            // Try to find a Bengali voice, fallback to default
            const voices = speechSynthesis.getVoices();
            const bengaliVoice = voices.find(voice => voice.lang.startsWith('bn'));
            if (bengaliVoice) {
                utterance.voice = bengaliVoice;
            } else {
                // Fallback to any available voice
                utterance.lang = 'en-US';
            }

            // Set voice if specified (overrides auto-selection)
            if (options.voice) {
                utterance.voice = options.voice;
            }

            // Set rate and pitch
            utterance.rate = options.rate || 0.8; // Slightly slower for clarity
            utterance.pitch = options.pitch || 1;

            // Handle speech events
            utterance.onstart = () => {
                console.log('Speech started');
            };

            utterance.onend = () => {
                console.log('Speech ended');
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
                // Show user feedback
                if (event.error !== 'interrupted') {
                    alert('Unable to play pronunciation. Please try a modern browser like Chrome, Firefox, or Edge.');
                }
                // Fallback to phonetic pronunciation if Bengali fails
                if (options.fallbackText && event.error !== 'interrupted') {
                    Components.speechSynthesis.speak(options.fallbackText, { ...options, lang: 'en-US' });
                }
            };

            speechSynthesis.speak(utterance);
        },

        stop: () => {
            if (Components.speechSynthesis.isSupported()) {
                speechSynthesis.cancel();
            }
        },

        getAvailableVoices: () => {
            if (!Components.speechSynthesis.isSupported()) return [];
            return speechSynthesis.getVoices();
        }
    },
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
        const elements = [
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
        ];

        // Add grammar tag if it's a grammar lesson
        if (lesson.type === 'grammar_learning') {
            elements.unshift(
                Utils.createElement('div', {
                    className: 'lesson-tag grammar-tag',
                    innerHTML: '📚 Grammar'
                })
            );
        }

        return Utils.createElement('div', {
            className: `lesson-card ${isCompleted ? 'completed' : ''}`,
            'data-lesson-id': lesson.id
        }, elements);
    },

    // Render teaching card content
    renderTeachingCard: (item) => {
        const cardElement = Utils.createElement('div', { className: 'teaching-content' });

        // Bengali text with sound button
        const bengaliContainer = Utils.createElement('div', { className: 'bengali-container' });

        bengaliContainer.appendChild(
            Utils.createElement('div', {
                className: 'teaching-bengali',
                innerHTML: item.bengali,
                title: 'Click to hear pronunciation'
            })
        );

        // Add sound button
        const soundButton = Utils.createElement('button', {
            className: 'sound-button',
            type: 'button',
            title: 'Play pronunciation',
            innerHTML: '🔊',
            'data-text': item.bengali,
            'data-phonetic': item.phonetic || '',
            'data-has-listener': 'true'
        });

        // Add click event directly to the button
        soundButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const text = soundButton.getAttribute('data-text');
            const phonetic = soundButton.getAttribute('data-phonetic');

            if (text) {
                Components.speechSynthesis.speak(text, {
                    fallbackText: phonetic,
                    lang: 'bn-BD'
                });
            }
        });

        bengaliContainer.appendChild(soundButton);
        cardElement.appendChild(bengaliContainer);
        console.log('Card element children:', cardElement.children.length);

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

    // Render grammar lesson card
    renderGrammarCard: (lessonData) => {
        const cardElement = Utils.createElement('div', { className: 'grammar-content' });

        // Lesson title
        cardElement.appendChild(
            Utils.createElement('h2', {
                className: 'grammar-title',
                innerHTML: lessonData.title
            })
        );

        // Grammar Rules Section
        if (lessonData.grammar_rules && lessonData.grammar_rules.length > 0) {
            cardElement.appendChild(
                Utils.createElement('h3', {
                    className: 'grammar-section-title',
                    innerHTML: '📚 Grammar Rules'
                })
            );

            lessonData.grammar_rules.forEach((rule, index) => {
                const ruleContainer = Utils.createElement('div', { className: 'grammar-rule' });

                // Rule title
                ruleContainer.appendChild(
                    Utils.createElement('h4', {
                        className: 'rule-title',
                        innerHTML: `${index + 1}. ${rule.rule_title}`
                    })
                );

                // Rule explanation
                ruleContainer.appendChild(
                    Utils.createElement('p', {
                        className: 'rule-explanation',
                        innerHTML: rule.rule_explanation
                    })
                );

                // Bengali example
                if (rule.bengali_example) {
                    ruleContainer.appendChild(
                        Utils.createElement('div', {
                            className: 'rule-example',
                            innerHTML: `<strong>Bengali:</strong> <span class="bengali-text">${rule.bengali_example}</span>`
                        })
                    );
                }

                // English translation
                if (rule.english_translation) {
                    ruleContainer.appendChild(
                        Utils.createElement('div', {
                            className: 'rule-translation',
                            innerHTML: `<strong>English:</strong> ${rule.english_translation}`
                        })
                    );
                }

                // Structure breakdown
                if (rule.structure_breakdown) {
                    ruleContainer.appendChild(
                        Utils.createElement('div', {
                            className: 'rule-breakdown',
                            innerHTML: `<strong>Structure:</strong> ${rule.structure_breakdown}`
                        })
                    );
                }

                // Key points
                if (rule.key_points && rule.key_points.length > 0) {
                    const keyPointsList = Utils.createElement('ul', { className: 'rule-key-points' });
                    rule.key_points.forEach(point => {
                        keyPointsList.appendChild(
                            Utils.createElement('li', { innerHTML: point })
                        );
                    });
                    ruleContainer.appendChild(
                        Utils.createElement('div', {
                            className: 'key-points-container',
                            innerHTML: '<strong>Key Points:</strong>'
                        })
                    );
                    ruleContainer.appendChild(keyPointsList);
                }

                cardElement.appendChild(ruleContainer);
            });
        }

        // Examples Section
        if (lessonData.examples && lessonData.examples.length > 0) {
            cardElement.appendChild(
                Utils.createElement('h3', {
                    className: 'grammar-section-title',
                    innerHTML: '💡 Examples'
                })
            );

            lessonData.examples.forEach((example, index) => {
                const exampleContainer = Utils.createElement('div', { className: 'grammar-example' });

                // Sentence
                exampleContainer.appendChild(
                    Utils.createElement('div', {
                        className: 'example-sentence',
                        innerHTML: `<strong>${index + 1}.</strong> <span class="bengali-text">${example.sentence}</span>`
                    })
                );

                // Translation
                exampleContainer.appendChild(
                    Utils.createElement('div', {
                        className: 'example-translation',
                        innerHTML: `<strong>Translation:</strong> ${example.translation}`
                    })
                );

                // Breakdown
                if (example.breakdown) {
                    exampleContainer.appendChild(
                        Utils.createElement('div', {
                            className: 'example-breakdown',
                            innerHTML: `<strong>Breakdown:</strong> ${example.breakdown}`
                        })
                    );
                }

                // Usage note
                if (example.usage_note) {
                    exampleContainer.appendChild(
                        Utils.createElement('div', {
                            className: 'example-note',
                            innerHTML: `<em>Note: ${example.usage_note}</em>`
                        })
                    );
                }

                cardElement.appendChild(exampleContainer);
            });
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
    },

    // Initialize sound button event listeners (for any additional buttons)
    initializeSoundButtons: () => {
        const soundButtons = document.querySelectorAll('.sound-button:not([data-has-listener])');
        soundButtons.forEach(button => {
            if (!button.hasAttribute('data-has-listener')) {
                button.setAttribute('data-has-listener', 'true');
                button.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const text = button.getAttribute('data-text');
                    const phonetic = button.getAttribute('data-phonetic');

                    if (text) {
                        // Show visual feedback
                        button.style.transform = 'translateY(-50%) scale(1.1)';
                        setTimeout(() => {
                            button.style.transform = 'translateY(-50%)';
                        }, 200);

                        Components.speechSynthesis.speak(text, {
                            fallbackText: phonetic,
                            lang: 'bn-BD'
                        });
                    }
                });
            }
        });
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Components;
}
