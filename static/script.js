// Curie - Client-side functionality

// Game state variables
let currentLesson = null;
let questions = [];
let currentQuestionIndex = 0;
let hearts = 3;
let xp = 0;
let streak = 0;
let maxStreak = 0;

// DOM element references
const questionContainer = document.getElementById('question-container');
const progressBar = document.getElementById('progress-bar');
const heartsDisplay = document.getElementById('hearts-display');
const xpDisplay = document.getElementById('xp-display');
const feedbackContainer = document.getElementById('feedback-container');
const feedbackCorrect = document.getElementById('feedback-correct');
const feedbackIncorrect = document.getElementById('feedback-incorrect');
const correctExplanation = document.getElementById('correct-explanation');
const incorrectExplanation = document.getElementById('incorrect-explanation');
const lessonComplete = document.getElementById('lesson-complete');
const lessonFailed = document.getElementById('lesson-failed');
const finalXp = document.getElementById('final-xp');
const streakCount = document.getElementById('streak-count');

// Initialize the lesson
function initLesson(lessonId) {
    currentLesson = lessonId;
    
    // Reset game state
    hearts = 3;
    xp = 0;
    streak = 0;
    maxStreak = 0;
    currentQuestionIndex = 0;
    
    // Update UI displays
    updateHearts();
    updateXp();
    
    // Load questions for this lesson
    fetchQuestions(lessonId);
    
    // Set up restart button
    document.getElementById('restart-lesson').addEventListener('click', () => {
        lessonFailed.style.display = 'none';
        initLesson(lessonId);
    });
    
    // Try to restore progress from session storage
    tryRestoreProgress(lessonId);
}

// Fetch questions from the API
function fetchQuestions(lessonId) {
    fetch(`/api/lesson/${lessonId}`)
        .then(response => response.json())
        .then(data => {
            questions = data.questions;
            displayQuestion(currentQuestionIndex);
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            questionContainer.innerHTML = '<div class="alert alert-danger">Error loading questions. Please try again.</div>';
        });
}

// Display the current question
function displayQuestion(index) {
    if (index >= questions.length) {
        showLessonComplete();
        return;
    }
    
    const question = questions[index];
    
    // Update progress bar
    const progressPercentage = (index / questions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.setAttribute('aria-valuenow', progressPercentage);
    progressBar.textContent = `${index}/${questions.length}`;
    
    let questionHTML = `<h3 class="question-title">${question.question_text}</h3>`;
    
    // Generate question UI based on type
    switch (question.type) {
        case 'mcq':
        case 'case_study':
            questionHTML += generateMultipleChoiceUI(question, index);
            break;
            
        case 'true_false':
            questionHTML += generateTrueFalseUI(question, index);
            break;
            
        case 'fill_in':
            questionHTML += generateFillInBlankUI(question, index);
            break;
            
        default:
            questionHTML += '<div class="alert alert-warning">Unknown question type</div>';
    }
    
    questionContainer.innerHTML = questionHTML;
    
    // Add event listeners based on question type
    if (question.type === 'mcq' || question.type === 'case_study' || question.type === 'true_false') {
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', handleOptionClick);
        });
    } else if (question.type === 'fill_in') {
        document.getElementById('submit-answer').addEventListener('click', handleFillInSubmit);
        document.getElementById('fill-blank-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleFillInSubmit();
            }
        });
    }
    
    // Save current progress to session storage
    saveProgress();
}

// Generate UI for multiple choice questions
function generateMultipleChoiceUI(question, index) {
    let html = '<div class="options-container">';
    
    question.options.forEach((option, optIndex) => {
        html += `
            <button class="option-btn" data-question-id="${index}" data-answer="${option}">
                ${option}
            </button>
        `;
    });
    
    if (question.type === 'case_study') {
        html += `
            <div class="hint-container mt-3">
                <button class="btn btn-sm btn-outline-secondary" onclick="showHint(${index})">
                    <i class="bi bi-lightbulb"></i> Show Hint
                </button>
                <div id="hint-text-${index}" class="mt-2 text-muted" style="display: none;"></div>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// Generate UI for true/false questions
function generateTrueFalseUI(question, index) {
    return `
        <div class="options-container">
            <button class="option-btn" data-question-id="${index}" data-answer="True">True</button>
            <button class="option-btn" data-question-id="${index}" data-answer="False">False</button>
        </div>
    `;
}

// Generate UI for fill-in-the-blank questions
function generateFillInBlankUI(question, index) {
    return `
        <div class="fill-blank-container">
            <div class="mb-3">
                <input type="text" id="fill-blank-input" class="fill-blank-input" placeholder="Type your answer...">
            </div>
            <button id="submit-answer" class="btn btn-primary" data-question-id="${index}">Submit Answer</button>
        </div>
    `;
}

// Handle option click for multiple choice questions
function handleOptionClick(event) {
    const selectedOption = event.currentTarget;
    const questionId = parseInt(selectedOption.getAttribute('data-question-id'));
    const answer = selectedOption.getAttribute('data-answer');
    
    // Highlight the selected option
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    selectedOption.classList.add('selected');
    
    // Submit the answer
    submitAnswer(questions[questionId].id, answer);
}

// Handle submit for fill-in-the-blank questions
function handleFillInSubmit() {
    const input = document.getElementById('fill-blank-input');
    const submitButton = document.getElementById('submit-answer');
    const questionId = parseInt(submitButton.getAttribute('data-question-id'));
    const answer = input.value.trim();
    
    if (answer === '') {
        input.classList.add('is-invalid');
        return;
    }
    
    submitAnswer(questions[questionId].id, answer);
}

// Submit answer to the API
function submitAnswer(questionId, answer) {
    fetch(`/api/lesson/${currentLesson}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question_id: questionId,
            answer: answer
        })
    })
    .then(response => response.json())
    .then(data => {
        showFeedback(data.is_correct, data.explanation);
        
        // Update game state based on answer correctness
        if (data.is_correct) {
            xp += 10;
            streak += 1;
            maxStreak = Math.max(maxStreak, streak);
            updateXp();
        } else {
            hearts -= 1;
            streak = 0;
            updateHearts();
            
            // Check if out of hearts
            if (hearts <= 0) {
                setTimeout(showLessonFailed, 2000);
                return;
            }
        }
        
        // Proceed to next question after delay
        setTimeout(() => {
            hideFeedback();
            currentQuestionIndex++;
            
            if (currentQuestionIndex < questions.length) {
                displayQuestion(currentQuestionIndex);
            } else {
                showLessonComplete();
            }
        }, 2500);
        
        // Save progress
        saveProgress();
    })
    .catch(error => {
        console.error('Error submitting answer:', error);
    });
}

// Show feedback based on answer correctness
function showFeedback(isCorrect, explanation) {
    feedbackContainer.style.display = 'block';
    
    if (isCorrect) {
        feedbackCorrect.style.display = 'block';
        feedbackIncorrect.style.display = 'none';
        correctExplanation.textContent = explanation;
    } else {
        feedbackCorrect.style.display = 'none';
        feedbackIncorrect.style.display = 'block';
        incorrectExplanation.textContent = explanation;
    }
    
    // Scroll to feedback
    feedbackContainer.scrollIntoView({ behavior: 'smooth' });
}

// Hide feedback
function hideFeedback() {
    feedbackContainer.style.display = 'none';
    feedbackCorrect.style.display = 'none';
    feedbackIncorrect.style.display = 'none';
}

// Show lesson complete screen
function showLessonComplete() {
    questionContainer.parentElement.parentElement.style.display = 'none';
    feedbackContainer.style.display = 'none';
    lessonComplete.style.display = 'block';
    
    finalXp.textContent = xp;
    streakCount.textContent = maxStreak;
    
    // Clear session storage
    sessionStorage.removeItem(`curie_lesson_${currentLesson}`);
}

// Show lesson failed screen
function showLessonFailed() {
    questionContainer.parentElement.parentElement.style.display = 'none';
    feedbackContainer.style.display = 'none';
    lessonFailed.style.display = 'block';
    
    // Clear session storage
    sessionStorage.removeItem(`curie_lesson_${currentLesson}`);
}

// Update hearts display
function updateHearts() {
    heartsDisplay.textContent = `♥ × ${hearts}`;
}

// Update XP display
function updateXp() {
    xpDisplay.textContent = `${xp} XP`;
}

// Show hint for case study questions
function showHint(index) {
    const hintText = document.getElementById(`hint-text-${index}`);
    
    if (hintText.style.display === 'none') {
        let hints = [
            "Consider the patient's risk factors and symptoms together.",
            "Think about what the most immediate concern would be.",
            "What test would give you the most relevant information quickly?",
            "Consider the clinical context and presentation carefully."
        ];
        
        hintText.textContent = hints[Math.floor(Math.random() * hints.length)];
        hintText.style.display = 'block';
    } else {
        hintText.style.display = 'none';
    }
}

// Save progress to session storage
function saveProgress() {
    const progressData = {
        currentQuestionIndex,
        hearts,
        xp,
        streak,
        maxStreak
    };
    
    sessionStorage.setItem(`curie_lesson_${currentLesson}`, JSON.stringify(progressData));
}

// Try to restore progress from session storage
function tryRestoreProgress(lessonId) {
    const savedProgress = sessionStorage.getItem(`curie_lesson_${lessonId}`);
    
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        
        if (progress.currentQuestionIndex < questions.length) {
            currentQuestionIndex = progress.currentQuestionIndex;
            hearts = progress.hearts;
            xp = progress.xp;
            streak = progress.streak;
            maxStreak = progress.maxStreak;
            
            updateHearts();
            updateXp();
        }
    }
} 