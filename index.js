import dataset from "./data/database.json" with { type: "json" };

const cards = dataset.reduce((acc, item) => {
    const key = item.irLv || "regular";
    if (!acc[key]) {
        acc[key] = [];
    }
    acc[key].push(item);
    return acc;
}, {});

let currentIndex = 0;
let revisionType;
let isQuizMode = false;
let quizScore = 0; // Add score variable
let quizCards = []; // Add shuffled quiz cards array

let timerInterval;
let timeLeft = 60; // Change to 1 minute
const scoreHistory = JSON.parse(localStorage.getItem('quizScoreHistory')) || [];

const entriesBody = document.getElementById("entries-body");

/** Creates a table row for each card, allowing quick navigation. */
function initEntries() {
	// Build table rows
	dataset.forEach((card, i) => {
		const row = document.createElement("tr");
		row.addEventListener("click", () => {
			// currentIndex = i;
			// renderCard();
		});
		const cellId = document.createElement("td");
		cellId.textContent = card.id;
		const cellWord = document.createElement("td");
		cellWord.textContent = card.wPresent;
		// add other cells in the table row if needed

		row.appendChild(cellId);
		row.appendChild(cellWord);
		entriesBody.appendChild(row);
	});
}

const frontTitle = document.getElementById("front-title");
const frontWordPresent = document.getElementById("front-word-present");
const frontWordPast = document.getElementById("front-word-past");
const frontSentencePresent = document.getElementById("front-sentence-present");
const frontSentencePast = document.getElementById("front-sentence-past");
const frontPresntWord = document.getElementById("front-present-word");
const frontPastWord = document.getElementById("front-past-word");
const frontImage = document.getElementById("front-image");
const frontAudioPresent = document.getElementById("front-audio-present");
const frontAudioPast = document.getElementById("front-audio-past");
const frontAudioPresentSentence = document.getElementById("front-audio-present-sentence");
const frontAudioPastSentence = document.getElementById("front-audio-past-sentence");
const frontWordChi = document.getElementById("front-word-chinese-meaning");
const flipCardCheckbox = document.getElementById("flip-card-checkbox");
const cardInner = document.getElementById("card-inner");
const transitionHalfDuration = parseFloat(getComputedStyle(cardInner).transitionDuration) * 1000 / 2;

const DEFAULT_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF0WlUWHRYTUw6Y29tLmFkb2JlLnhtbAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyI+CiAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiPgogICAgICA8ZGM6Zm9ybWF0PmltYWdlL3BuZzwvZGM6Zm9ybWF0PgogICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0iciI/Pg0KZW5kc3RyZWFtCmVuZG9iagoxIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbIDIgMCBSIF0KL0NvdW50IDEKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZUKL1BhcmVudCAxIDAgUgovTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCi9Db250ZW50cyAzIDAgUgovUmVzb3VyY2VzIDw8Ci9Qcm9jU2V0IFsgL1BERiAvVGV4dCAvSW1hZ2VCIC9JbWFnZUMgL0ltYWdlSSBdCi9FeHRHU3RhdGUgPDwKL0czIDMgMCBSCj4+Cj4+Cj4+CmVuZG9iagp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMTcgMDAwMDAgbg0KMDAwMDAwMDA3MiAwMDAwMCBuDQowMDAwMDAwMTgxIDAwMDAwIG4NCnRyYWlsZXIKPDwKL1NpemUgNAovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMzkyCiUlRU9G';

function renderCard() {
    if (!revisionType) {
        return;
    }

    let currentCard;
    if (isQuizMode) {
        currentCard = quizCards[currentIndex];
        // Show timer only in quiz mode
        document.querySelector('.quiz-timer').style.display = 'flex';
        
        // Add this new condition for Level Max
        if (revisionType === "max") {
            // Randomly choose between Level 1 and Level 2 for each question
            const isLevel1 = Math.random() < 0.5;
            document.getElementById('quiz-level-1-layout').hidden = !isLevel1;
            document.getElementById('quiz-level-2-layout').hidden = isLevel1;
            
            const quizImage = document.getElementById('quiz-image');
            // Always start with blur for new question
            quizImage.classList.add('blur-image');
            quizImage.classList.remove('grayscale-image', 'colorful-image');
            
            if (isLevel1) {
                renderQuizLevel1(currentCard);
            } else {
                renderQuizLevel2(currentCard);
            }
        } else {
            // Existing logic for Level 1 and 2
            document.getElementById('quiz-level-1-layout').hidden = revisionType !== "1";
            document.getElementById('quiz-level-2-layout').hidden = revisionType !== "2";
            
            if (revisionType === "1") {
                renderQuizLevel1(currentCard);
            } else if (revisionType === "2") {
                renderQuizLevel2(currentCard);
            }
        }
    } else {
        if (!cards[revisionType]) return;
        currentCard = cards[revisionType][currentIndex];
        // Hide timer in revision mode
        document.querySelector('.quiz-timer').style.display = 'none';
    }
    
    // Toggle visibility of layouts
    document.getElementById('revision-mode').hidden = isQuizMode;
    document.getElementById('quiz-mode').hidden = !isQuizMode;
    
    if (isQuizMode) {
        renderQuizCard(currentCard);
    } else {
        renderRevisionCard(currentCard);
    }
    
    // Add loading state for images
    const imageSection = document.querySelector('.image-section');
    imageSection.classList.add('loading');
    
    const img = currentCard.img ? new Image() : null;
    if (img) {
        img.onload = () => {
            imageSection.classList.remove('loading');
            frontImage.src = img.src;
        };
        img.src = `./res/${currentCard.img}`;
    } else {
        imageSection.classList.remove('loading');
        frontImage.src = './res/default.png';
    }
    
    // Add entrance animation for content
    const elements = document.querySelectorAll('.verb-box, .sentence-item');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'all 0.4s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function highlightVerb(sentence, verb) {
    return sentence.replace(new RegExp(verb, 'gi'), `<span class="highlight">${verb}</span>`);
}

function renderQuizCard(card) {
    const quizImage = document.getElementById('quiz-image');
    const imagePath = card.img ? `./res/${card.img}` : null;
    if (imagePath) {
        quizImage.onerror = () => {
            console.log('Failed to load quiz image:', imagePath);
            quizImage.src = DEFAULT_IMAGE;
        };
        quizImage.src = imagePath;
    } else {
        quizImage.src = DEFAULT_IMAGE;
    }

    // Always start with blur, remove other filters
    quizImage.classList.add('blur-image');
    quizImage.classList.remove('grayscale-image', 'colorful-image');
    
    // Show/hide layouts based on quiz level
    const level1Layout = document.getElementById('quiz-level-1-layout');
    const level2Layout = document.getElementById('quiz-level-2-layout');
    
    if (revisionType === "1") {
        level1Layout.hidden = false;
        level2Layout.hidden = true;
        renderQuizLevel1(card);
    } else if (revisionType === "2") {
        level1Layout.hidden = true;
        level2Layout.hidden = false;
        renderQuizLevel2(card);
    }
}

function renderQuizLevel2(card) {
    const sentenceBlank = document.getElementById('quiz-sentence-blank');
    const answerInput = document.getElementById('answer-input');
    const submitButton = document.getElementById('btn-submit-answer');
    const feedback = document.querySelector('.quiz-feedback-level2');
    const showHintButton = document.getElementById('show-hint');
    const hintText = document.getElementById('hint-text');
    const hintFirstLetter = document.getElementById('hint-first-letter');
    const hintWordLength = document.getElementById('hint-word-length');
    const hintChinese = document.getElementById('hint-chinese');
    
    // Show hint and answer containers for new question
    document.querySelector('.hint-container').hidden = false;
    document.querySelector('.answer-input-container').hidden = false;
    
    // Reset states
    answerInput.value = '';
    answerInput.disabled = false;
    submitButton.disabled = false;
    feedback.hidden = true;
    hintText.hidden = true;
    showHintButton.textContent = 'Need a Hint? 🤔';
    
    // Choose between present and past tense
    const isPastTense = Math.random() < 0.5;
    const sentence = isPastTense ? card.sPast : card.sPresent;
    const correctVerb = isPastTense ? card.wPast : card.wPresent;
    
    // Create sentence with blank
    const sentenceWithBlank = sentence.replace(
        new RegExp(correctVerb, 'gi'), 
        '________'
    );
    
    sentenceBlank.textContent = sentenceWithBlank;
    
    // Prepare hints
    hintFirstLetter.textContent = `First letter: "${correctVerb[0].toUpperCase()}"`;
    hintWordLength.textContent = `Number of letters: ${correctVerb.length}`;
    hintChinese.textContent = `Chinese meaning: ${card.wChi}`;
    
    // Add hint button click handler
    showHintButton.onclick = () => {
        hintText.hidden = !hintText.hidden;
        showHintButton.textContent = hintText.hidden ? 'Need a Hint? 🤔' : 'Hide Hint 🙈';
    };
    
    // Remove any existing event listeners
    const newSubmitButton = submitButton.cloneNode(true);
    submitButton.parentNode.replaceChild(newSubmitButton, submitButton);
    
    // Add new event listener for submit button
    newSubmitButton.addEventListener('click', () => {
        handleQuizLevel2Answer(answerInput.value.trim(), correctVerb, sentence, card);
    });
    
    // Handle enter key
    answerInput.onkeypress = (e) => {
        if (e.key === 'Enter' && !answerInput.disabled) {
            handleQuizLevel2Answer(answerInput.value.trim(), correctVerb, sentence, card);
        }
    };
}

function handleQuizLevel2Answer(userAnswer, correctVerb, fullSentence, card) {
    if (timeLeft <= 0) return;
    const feedbackSound = new Audio();
    const quizResult = document.getElementById('quiz-result-level2');
    const quizCorrectSentence = document.getElementById('quiz-correct-sentence');
    const quizImage = document.getElementById('quiz-image');
    const feedback = document.querySelector('.quiz-feedback-level2');
    const answerInput = document.getElementById('answer-input');
    const submitButton = document.getElementById('btn-submit-answer');
    const hintContainer = document.querySelector('.hint-container');
    const answerContainer = document.querySelector('.answer-input-container');
    
    // Show feedback
    feedback.hidden = false;
    
    // Hide hint container and answer container
    hintContainer.hidden = true;
    answerContainer.hidden = true;
    
    // Remove blur effect
    quizImage.classList.remove('blur-image');
    
    // Check if it's past tense and apply grayscale
    const isPastTense = card.wPast === correctVerb;
    if (isPastTense && (revisionType === "2" || revisionType === "max")) {
        quizImage.classList.add('grayscale-image');
    }
    
    const isCorrect = userAnswer.toLowerCase() === correctVerb.toLowerCase();
    
    if (isCorrect) {
        quizResult.textContent = "You've got this! 🎉";
        quizResult.classList.remove('incorrect');
        feedbackSound.src = './res/correct.mp3';
        quizScore += 2;
    } else {
        quizResult.textContent = "Don't give up! 💪";
        quizResult.classList.add('incorrect');
        feedbackSound.src = './res/wrong.mp3';
        quizScore = Math.max(0, quizScore - 1);
    }
    
    document.getElementById('quiz-score').textContent = quizScore;
    document.getElementById('quiz-score-current').textContent = quizScore;
    
    quizCorrectSentence.textContent = `Correct answer: ${fullSentence}`;
    
    // Play sound sequence exactly like level 1
    try {
        feedbackSound.play().catch(err => console.log('Audio play failed:', err));
        
        // Play sentence audio after feedback sound finishes
        feedbackSound.onended = () => {
            const sentenceAudio = new Audio();
            if (isPastTense && card.asPast) {
                sentenceAudio.src = `./res/${card.asPast}`;
            } else if (!isPastTense && card.asPresent) {
                sentenceAudio.src = `./res/${card.asPresent}`;
            }
            
            if (sentenceAudio.src) {
                sentenceAudio.play().catch(err => {
                    console.log('Sentence audio play failed:', err);
                });
            }
        };
    } catch (error) {
        console.log('Audio playback error:', error);
    }
    
    // Disable input and submit button
    answerInput.disabled = true;
    submitButton.disabled = true;
    trackMissionProgress();
}

function renderQuizLevel1(card) {
    // Set up quiz image
    const quizImage = document.getElementById('quiz-image');
    const imagePath = card.img ? `./res/${card.img}` : null;
    if (imagePath) {
        quizImage.onerror = () => {
            console.log('Failed to load quiz image:', imagePath);
            quizImage.src = DEFAULT_IMAGE;
        };
        quizImage.src = imagePath;
    } else {
        quizImage.src = DEFAULT_IMAGE;
    }
    
    // Always start with blur, remove any existing grayscale
    quizImage.classList.add('blur-image');
    quizImage.classList.remove('grayscale-image');

    // Set up quiz options
    const option1 = document.getElementById('option1');
    const option2 = document.getElementById('option2');
    
    // First decide if it's past or present tense
    const isPastTense = Math.random() < 0.5;
    
    // Get the correct sentence based on tense
    const correctSentence = isPastTense ? card.sPast : card.sPresent;
    const wrongSentence = card.sWrong;
    
    // Randomly decide position of correct answer
    const isFirstOptionCorrect = Math.random() < 0.5;
    
    if (isFirstOptionCorrect) {
        option1.textContent = correctSentence;
        option2.textContent = wrongSentence;
    } else {
        option1.textContent = wrongSentence;
        option2.textContent = correctSentence;
    }

    // Reset option states
    [option1, option2].forEach(opt => {
        opt.classList.remove('correct', 'incorrect');
        opt.disabled = false;
    });

    // Hide feedback
    document.querySelector('.quiz-feedback').hidden = true;
    
    // Add click handlers with the isPastTense flag
    [option1, option2].forEach(opt => {
        opt.onclick = function() {
            handleQuizAnswer(opt, correctSentence, card, isPastTense);
        };
    });
}

function handleQuizAnswer(selectedOption, correctSentence, card, isPastTense) {
    if (timeLeft <= 0) return; // Don't process answers if time is up
    const feedbackSound = new Audio();
    const quizResult = document.getElementById('quiz-result');
    const quizCorrectAnswer = document.getElementById('quiz-correct-answer');
    const quizImage = document.getElementById('quiz-image');
    
    // Show feedback
    document.querySelector('.quiz-feedback').hidden = false;
    
    // Remove blur effect while maintaining size
    quizImage.classList.remove('blur-image');
    
    // Apply grayscale for past tense in level 1 or max mode
    if ((revisionType === "1" || (revisionType === "max" && document.getElementById('quiz-level-1-layout').hidden === false)) && isPastTense) {
        quizImage.classList.add('grayscale-image');
    }
    
    if (selectedOption.textContent === correctSentence) {
        quizResult.textContent = "You've got this! 🎉";
        quizResult.classList.remove('incorrect');
        selectedOption.classList.add('correct');
        feedbackSound.src = './res/correct.mp3';
        quizScore += 1; // Add 1 point for Level 1
        document.getElementById('quiz-score').textContent = quizScore;
        document.getElementById('quiz-score-current').textContent = quizScore;
    } else {
        quizResult.textContent = "Don't give up! 💪";
        quizResult.classList.add('incorrect');
        selectedOption.classList.add('incorrect');
        feedbackSound.src = './res/wrong.mp3';
        quizCorrectAnswer.textContent = `Correct answer: ${correctSentence}`;
    }
    
    // Play feedback sound with error handling
    try {
        feedbackSound.play().catch(err => {
            console.log('Audio play failed:', err);
        });
        
        // Play the sentence audio after the feedback sound
        const sentenceAudio = new Audio();
        if (isPastTense && card.asPast) {
            sentenceAudio.src = `./res/${card.asPast}`;
        } else if (!isPastTense && card.asPresent) {
            sentenceAudio.src = `./res/${card.asPresent}`;
        }
        
        // Play sentence audio after feedbackSound finishes
        feedbackSound.onended = () => {
            if (sentenceAudio.src) {
                sentenceAudio.play().catch(err => {
                    console.log('Sentence audio play failed:', err);
                });
            }
        };
    } catch (error) {
        console.log('Audio playback error:', error);
    }
    
    // Reveal image
    document.getElementById('quiz-image').classList.remove('blur-image');
    
    // Disable all options
    document.querySelectorAll('.quiz-sentence-option').forEach(opt => {
        opt.disabled = true;
    });
    trackMissionProgress();
}

function renderRevisionCard(card) {
    // Update card content with the passed card parameter
    frontPresntWord.textContent = card.wPresent || '';
    frontPastWord.textContent = card.wPast || '';
    frontWordChi.textContent = card.wChi || '';
    frontSentencePresent.innerHTML = card.sPresent ? highlightVerb(card.sPresent, card.wPresent) : '';
    frontSentencePast.innerHTML = card.sPast ? highlightVerb(card.sPast, card.wPast) : '';

    // Image handling
    const imagePath = card.img ? `./res/${card.img}` : null;
    if (imagePath) {
        frontImage.onerror = () => {
            console.log('Failed to load image:', imagePath);
            frontImage.src = DEFAULT_IMAGE;
        };
        frontImage.src = imagePath;
    } else {
        frontImage.src = DEFAULT_IMAGE;
    }

    // Audio setup
    frontAudioPresent.src = card.awPresent ? `./res/${card.awPresent}` : '';
    frontAudioPast.src = card.awPast ? `./res/${card.awPast}` : '';
    frontAudioPresentSentence.src = card.asPresent ? `./res/${card.asPresent}` : '';
    frontAudioPastSentence.src = card.asPast ? `./res/${card.asPast}` : '';
}

/** Navigates to the previous card. */
function previousCard() {
    if (isQuizMode) {
        currentIndex = (currentIndex - 1 + quizCards.length) % quizCards.length;
    } else {
        currentIndex = (currentIndex - 1 + cards[revisionType].length) % cards[revisionType].length;
    }
}

/** Navigates to the next card. */
function nextCard() {
    if (isQuizMode) {
        currentIndex = (currentIndex + 1) % quizCards.length;
    } else {
        currentIndex = (currentIndex + 1) % cards[revisionType].length;
    }
}

// Update the "Back" button event listener
// document.getElementById("btn-back").addEventListener("click", () => {
//     if (document.getElementById("verb-types").hidden === false) {
//         // If in verb types view, go back to start page
//         switchMode('verb-types', 'start-page');
//     } else if (document.getElementById("quiz-levels").hidden === false) {
//         // If in quiz levels view, go back to start page
//         switchMode('quiz-levels', 'start-page');
//     } else if (document.getElementById("flashcard").hidden === false) {
//         // If viewing flashcards, go back to previous section
//         document.getElementById("flashcard").hidden = true;
//         document.getElementById("actions").hidden = true;
//         if (isQuizMode) {
//             document.getElementById("quiz-levels").hidden = false;
//         } else {
//             document.getElementById("verb-types").hidden = false;
//         }
//     }
//     updateNavigationVisibility();
// });

document.getElementById("btn-next").addEventListener("click", () => {
    nextCard();
    if (isQuizMode) {
        const quizImage = document.getElementById('quiz-image');
        // Reset to blur state for next question
        quizImage.classList.add('blur-image');
        quizImage.classList.remove('grayscale-image', 'colorful-image');
    }
    renderCard();
    if (!isQuizMode) {
        trackMissionProgress();
    }
});

// Add smooth transitions between modes
function switchMode(fromMode, toMode) {
    const from = document.getElementById(fromMode);
    const to = document.getElementById(toMode);
    
    from.style.opacity = '0';
    from.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        from.hidden = true;
        to.hidden = false;
        to.style.opacity = '0';
        to.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            to.style.transition = 'all 0.4s ease';
            to.style.opacity = '1';
            to.style.transform = 'scale(1)';
            updateNavigationVisibility();
        }, 50);
    }, 400);
}

// Add this function to handle the timer
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 60; // Reset to 1 minute
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 10) { // Warning at last 10 seconds
            document.querySelector('.quiz-timer').classList.add('timer-warning');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showCongratulations();
        }
    }, 1000);
}

function showCongratulations() {
    // Hide quiz content
    document.getElementById("flashcard").hidden = true;
    document.getElementById("actions").hidden = true;
    
    // Show congratulations page
    const congratsPage = document.getElementById("congratulations-page");
    congratsPage.hidden = false;
    
    // Update final score display
    document.getElementById("final-score").textContent = quizScore;
    
    // Save score BEFORE any state resets
    const newScore = {
        date: new Date().toLocaleDateString(),
        score: quizScore,
        timestamp: Date.now()
    };
    
    // Add new score and keep only top 5 highest scores
    scoreHistory.push(newScore);
    scoreHistory.sort((a, b) => b.score - a.score);
    while (scoreHistory.length > 5) {
        scoreHistory.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('quizScoreHistory', JSON.stringify(scoreHistory));
    
    // Add confetti effect
    createConfetti();
    
    // Update return home button handler
    document.getElementById("btn-return-home").onclick = () => {
        // Hide all sections except start page
        document.getElementById("congratulations-page").hidden = true;
        document.getElementById("flashcard").hidden = true;
        document.getElementById("quiz-levels").hidden = true;
        document.getElementById("verb-types").hidden = true;
        document.getElementById("actions").hidden = true;
        document.getElementById("start-page").hidden = false;
        
        // Reset game state
        isQuizMode = false;
        revisionType = null;
        currentIndex = 0;
        clearInterval(timerInterval);
        
        // Reset score AFTER saving
        quizScore = 0;
        
        // Update displays
        updateScoreHistory();
        document.getElementById('quiz-score').textContent = '0';
        document.getElementById('quiz-score-current').textContent = '0';
    };
    document.getElementById("btn-back").style.visibility = "visible";
}

function createConfetti() {
    const confettiContainer = document.querySelector('.confetti');
    confettiContainer.innerHTML = '';
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.animation = 'confetti-fall linear forwards';
        confettiContainer.appendChild(confetti);
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function endQuiz() {
    // Save score to history
    const date = new Date().toLocaleDateString();
    scoreHistory.unshift({ date, score: quizScore });
    if (scoreHistory.length > 5) scoreHistory.pop(); // Keep only last 5 scores
    localStorage.setItem('quizScoreHistory', JSON.stringify(scoreHistory));
    
    // Update display
    updateScoreHistory();
    
    // Return to quiz levels
    document.getElementById("flashcard").hidden = true;
    document.getElementById("quiz-levels").hidden = false;
    document.getElementById("actions").hidden = true;
    
    // Show score alert
    alert(`Time's up! Your final score: ${quizScore}`);
}

function updateScoreHistory() {
    const scoreList = document.getElementById('score-list');
    if (!scoreList) return;
    
    // Sort by highest score first, then by most recent
    const sortedScores = [...scoreHistory].sort((a, b) => {
        if (b.score === a.score) {
            return b.timestamp - a.timestamp;
        }
        return b.score - a.score;
    });
    
    scoreList.innerHTML = sortedScores
        .map(item => `
            <div class="score-item">
                <span class="date">${item.date}</span>
                <span class="points">${item.score} points</span>
            </div>
        `)
        .join('');
}

// Add this function to handle navigation visibility
function updateNavigationVisibility() {
    const actions = document.getElementById("actions");
    const startPage = document.getElementById("start-page");
    const verbTypesPage = document.getElementById("verb-types");
    actions.hidden = !startPage.hidden || !verbTypesPage.hidden;
}

// Update button handlers to manage navigation visibility
document.getElementById("btn-revision").addEventListener("click", () => {
    isQuizMode = false;
    switchMode('start-page', 'verb-types');
    updateNavigationVisibility();
});

// Update quiz button handler
document.getElementById("btn-quiz").addEventListener("click", () => {
    isQuizMode = true;
    revisionType = 'quiz';
    quizScore = 0; // Reset score when starting quiz
    document.getElementById('quiz-score').textContent = quizScore;
    document.getElementById('quiz-score-current').textContent = quizScore;
    document.getElementById("start-page").hidden = true;
    document.getElementById("quiz-levels").hidden = false;
    document.getElementById("flashcard").hidden = true;
    document.getElementById("actions").hidden = true;
    updateNavigationVisibility();
    
    // Clear existing content
    // Combine all cards into one array for quiz
    quizCards = [];
    Object.values(cards).forEach(cardSet => {
        quizCards = quizCards.concat(cardSet);
    });
    // Shuffle all cards
    quizCards = shuffleArray(quizCards);
    updateScoreHistory(); // Add this line
});

// Add back button handler
document.getElementById("btn-back").addEventListener("click", () => {
    if (isQuizMode) {
        // If in quiz mode, go back to quiz levels
        document.getElementById("flashcard").hidden = true;
        document.getElementById("quiz-levels").hidden = false;
    } else {
        // If in revision mode, go back to verb types
        document.getElementById("flashcard").hidden = true;
        document.getElementById("verb-types").hidden = false;
    }
    document.getElementById("actions").hidden = true;
    
    // Reset card state
    currentIndex = 0;
    frontPresntWord.textContent = '';
    frontPastWord.textContent = '';
    frontWordChi.textContent = '';
    frontSentencePresent.innerHTML = '';
    frontSentencePast.innerHTML = '';
    clearInterval(timerInterval); // Add this line
});

// Update the initialization
window.addEventListener('load', () => {
    initEntries();
    renderCard();
    updateNavigationVisibility(); // Hide navigation on initial load
    quizScore = 0;
    document.getElementById('quiz-score').textContent = '0';
    document.getElementById('quiz-score-current').textContent = '0';
    updateScoreHistory(); // Add this line
});

// Update the verb type button handlers
for(const button of document.getElementsByClassName("button-revision-type")){
    if(button.id === "btn-verb-back" || button.id === "btn-revision" || button.id === "btn-quiz") continue;
    button.addEventListener("click", function() {
        revisionType = this.id.slice("btn-revision-".length);
        currentIndex = 0;
        document.getElementById("flashcard").hidden = false; // Show flashcard
        document.getElementById("actions").hidden = false;   // Show actions
        document.getElementById("verb-types").hidden = true;
        renderCard();
    });
}

document.getElementById("btn-quiz").addEventListener("click", () => {
    isQuizMode = true;
    revisionType = 'quiz';  // Set a specific type for quiz
    document.getElementById("start-page").hidden = true;
    document.getElementById("quiz-levels").hidden = false;
    document.getElementById("flashcard").hidden = true;
    document.getElementById("actions").hidden = true;
});

document.getElementById("btn-quiz-back").addEventListener("click", () => {
    document.getElementById("start-page").hidden = false;
    document.getElementById("quiz-levels").hidden = true;
    document.getElementById("flashcard").hidden = true;  // Keep flashcard hidden
    document.getElementById("actions").hidden = true;    // Keep actions hidden
});

function shuffleArray(array) {
    // Create a copy of the array to avoid modifying the original
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Update quiz level button handlers
for(const button of document.getElementsByClassName("quiz-level-btn")){
    if(button.id === "btn-quiz-back") continue;
    button.addEventListener("click", function() {
        const level = this.id.slice("btn-level-".length);
        currentIndex = 0;
        revisionType = level;
        
        // Shuffle all cards for all quiz levels
        quizCards = shuffleArray([...quizCards]);
        
        document.getElementById("flashcard").hidden = false;
        document.getElementById("actions").hidden = false;
        document.getElementById("quiz-levels").hidden = true;
        
        // Hide the back button in quiz mode
        document.getElementById("btn-back").style.visibility = "hidden";
        
        renderCard();
        startTimer();
    });
}

// Add handlers for back buttons
document.getElementById("btn-verb-back").addEventListener("click", () => {
    switchMode('verb-types', 'start-page');
});

document.getElementById("btn-quiz-back").addEventListener("click", () => {
    switchMode('quiz-levels', 'start-page');
});

// Add these event listeners after other button handlers
document.getElementById("btn-show-map").addEventListener("click", () => {
    // Hide all sections except map-view
    document.querySelectorAll('section').forEach(section => {
        section.hidden = true;
    });
    document.getElementById("map-view").hidden = false;
    document.getElementById("actions").hidden = true;
    document.querySelector('.score-history').hidden = true;
});

document.getElementById("btn-map-back").addEventListener("click", () => {
    // Hide all sections first
    document.querySelectorAll('section').forEach(section => {
        if (section.id === 'start-page') {
            section.hidden = false;
        } else {
            section.hidden = true;
        }
    });
    
    // Show score history
    document.querySelector('.score-history').hidden = false;
    
    // Hide actions bar
    document.getElementById("actions").hidden = true;
    
    // Reset all states
    currentIndex = 0;
    revisionType = null;
    isQuizMode = false;
    quizScore = 0;
    
    // Clear intervals if any
    clearInterval(timerInterval);
    
    // Clear any content
    ['quiz-score', 'quiz-score-current'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '0';
    });
    
    // Update score history display
    updateScoreHistory();
});

const missions = {
    completedMissions: JSON.parse(localStorage.getItem('completedMissions') || '{}'),
    missionData: {
        // Quiz Level 1 Missions (15 missions)
        ...[...Array(15)].reduce((acc, _, i) => ({
            ...acc,
            [`quiz-1-${i}`]: {
                title: `Level 1 Master ${i + 1}`,
                type: 'quiz',
                level: "1",
                target: 5 + i * 2,
                description: `Score ${5 + i * 2} points in Level 1`
            }
        }), {}),

        // Quiz Level 2 Missions (15 missions)
        ...[...Array(15)].reduce((acc, _, i) => ({
            ...acc,
            [`quiz-2-${i}`]: {
                title: `Level 2 Expert ${i + 1}`,
                type: 'quiz',
                level: "2",
                target: 8 + i * 3,
                description: `Score ${8 + i * 3} points in Level 2`
            }
        }), {}),

        // Quiz Level Max Missions (10 missions)
        ...[...Array(10)].reduce((acc, _, i) => ({
            ...acc,
            [`quiz-max-${i}`]: {
                title: `Level MAX Champion ${i + 1}`,
                type: 'quiz',
                level: "max",
                target: 15 + i * 5,
                description: `Score ${15 + i * 5} points in Level MAX`
            }
        }), {})
    }
};

// Update grid initialization to match new 8x5 grid (40 cells total)
function initializeMapGrid() {
    const mapGrid = document.querySelector('.map-grid');
    const missionPositions = Object.keys(missions.missionData);
    
    mapGrid.innerHTML = '';
    
    // Create 40 grid cells (8x5 grid)
    for (let i = 0; i < 40; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        
        if (i < missionPositions.length) {
            const position = missionPositions[i];
            cell.dataset.position = position;
            
            // Add mission preview on hover
            const mission = missions.missionData[position];
            cell.title = `${mission.title}\n${mission.description}`;
            
            if (missions.completedMissions[position]) {
                cell.classList.add('completed');
            }
            
            // Add mission status indicator
            const statusIndicator = document.createElement('div');
            statusIndicator.className = 'mission-status';
            cell.appendChild(statusIndicator);
            
            cell.addEventListener('click', () => showMission(position));
        }
        
        mapGrid.appendChild(cell);
    }
}

function showMission(position) {
    const mission = missions.missionData[position];
    if (!mission) return;

    const overlay = document.createElement('div');
    overlay.className = 'mission-overlay';

    const popup = document.createElement('div');
    popup.className = 'mission-popup';
    popup.innerHTML = `
        <div class="mission-header">
            <h3>${mission.title}</h3>
            ${missions.completedMissions[position] ? 
                '<span class="mission-completed-badge">✓ Completed</span>' : 
                '<span class="mission-status-badge">In Progress</span>'
            }
        </div>
        <p>${mission.description}</p>
        <div class="mission-target">Target: ${mission.target} ${mission.type === 'quiz' ? 'points' : 'cards'}</div>
        <div class="mission-buttons">
            ${!missions.completedMissions[position] ? 
                `<button class="button-revision-type" id="start-mission-btn">Start Mission</button>` : 
                '<p class="mission-completed-text">Well done! Try another mission!</p>'
            }
            <button class="button-revision-type" id="close-mission-btn">Close</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    // Add event listeners after the elements are in the DOM
    const startBtn = popup.querySelector('#start-mission-btn');
    const closeBtn = popup.querySelector('#close-mission-btn');
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startMission(position);
            closeMissionPopup();
        });
    }

    closeBtn.addEventListener('click', closeMissionPopup);
    overlay.addEventListener('click', closeMissionPopup);
}

function closeMissionPopup() {
    const overlay = document.querySelector('.mission-overlay');
    const popup = document.querySelector('.mission-popup');
    
    if (overlay) overlay.remove();
    if (popup) popup.remove();
}

function startMission(position) {
    const mission = missions.missionData[position];
    if (!mission) return;
    
    localStorage.setItem('currentMission', position);

    if (mission.type === 'quiz') {
        // Setup quiz mission
        isQuizMode = true;
        revisionType = mission.level || "1";
        quizScore = 0;
        
        // Prepare quiz cards
        quizCards = [];
        Object.values(cards).forEach(cardSet => {
            quizCards = quizCards.concat(cardSet);
        });
        quizCards = shuffleArray(quizCards);
        
        // Show quiz level selection
        document.getElementById('map-view').hidden = true;
        document.getElementById('quiz-levels').hidden = false;
        document.getElementById('quiz-score').textContent = '0';
        document.getElementById('quiz-score-current').textContent = '0';
    } else {
        // Setup revision mission
        isQuizMode = false;
        revisionType = mission.verbType;
        currentIndex = 0;

        // Show flashcard for revision
        document.getElementById('map-view').hidden = true;
        document.getElementById('flashcard').hidden = false;
        document.getElementById('actions').hidden = false;
        
        renderCard();
    }
}

// Update filterQuizCards function to handle mission-specific cards
function filterQuizCards(mission) {
    quizCards = [];
    if (mission.verbType) {
        // For specific verb type missions
        quizCards = cards[mission.verbType] || [];
    } else {
        // For general quiz missions, use all cards
        Object.values(cards).forEach(cardSet => {
            quizCards = quizCards.concat(cardSet);
        });
    }
    quizCards = shuffleArray(quizCards);
}

function trackMissionProgress() {
    const currentMission = localStorage.getItem('currentMission');
    if (!currentMission) return;
    
    const mission = missions.missionData[currentMission];
    if (!mission) return;
    
    const isComplete = mission.type === 'quiz' ? 
        quizScore >= mission.target :
        currentIndex >= mission.target;
    
    if (isComplete) {
        completeMission(currentMission);
        showMissionComplete(mission);
    }
}

// ...existing code...

function completeMission(position) {
    missions.completedMissions[position] = true;
    localStorage.setItem('completedMissions', JSON.stringify(missions.completedMissions));
    
    const cell = document.querySelector(`.grid-cell[data-position="${position}"]`);
    if (cell) {
        // Add fade out animation
        cell.style.transition = 'all 0.5s ease';
        cell.classList.add('completed');
        
        // Remove cell after animation and update progress
        cell.addEventListener('transitionend', () => {
            cell.style.display = 'none';
            updateMissionProgress();
        }, { once: true });
    }
}

function updateMissionProgress() {
    const totalCells = 40; // Total number of grid cells
    const completedCount = Object.keys(missions.completedMissions).length;
    
    document.getElementById('missions-completed').textContent = completedCount;
    document.getElementById('total-missions').textContent = totalCells;
    
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = (completedCount / totalCells) * 100;
    progressFill.style.width = `${progressPercentage}%`;

    // Update only completed cells
    document.querySelectorAll('.grid-cell').forEach(cell => {
        const position = cell.dataset.position;
        if (missions.completedMissions[position]) {
            cell.classList.add('completed');
            setTimeout(() => {
                cell.style.display = 'none';
            }, 500);
        }
    });
}

// ...existing code...

function showMissionComplete(mission) {
    const overlay = document.createElement('div');
    overlay.className = 'mission-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'mission-popup mission-complete-popup';
    popup.innerHTML = `
        <h2>🎉 Mission Complete! 🎉</h2>
        <h3>${mission.title}</h3>
        <p>You've successfully completed this mission!</p>
        <div class="mission-rewards">
            <p>Area Unlocked!</p>
            <p>New challenges await...</p>
        </div>
        <button id="return-map-btn" class="button-revision-type">Return to Map</button>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    // Add click handler directly to the button
    document.getElementById('return-map-btn').addEventListener('click', returnToMap);

    // Update progress
    updateMissionProgress();
}

// ...existing code...

function returnToMap() {
    // Remove popup and overlay
    const popup = document.querySelector('.mission-popup');
    const overlay = document.querySelector('.mission-overlay');
    if (popup) popup.remove();
    if (overlay) overlay.remove();

    // Show map view, hide other sections
    document.querySelectorAll('section').forEach(section => {
        section.hidden = section.id !== 'map-view';
    });

    // Update mission progress
    updateMissionProgress();
}

// Add to initialization
window.addEventListener('load', () => {
    // ...existing code...
    initializeMapGrid();
    updateMissionProgress();
});
