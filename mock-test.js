// Mock Test System

async function renderMockTestsPage() {
    const content = document.getElementById('main-content');
    
    const availableTests = await fetchAvailableTests();
    const completedTests = await fetchCompletedTests();
    
    content.innerHTML = `
        <div class="mock-tests-page">
            <div class="page-header">
                <h1>Mock Tests</h1>
                <p>Practice and improve your skills</p>
            </div>

            <!-- Test Categories -->
            <div class="test-categories">
                <button class="category-btn active" onclick="filterTests('all')">All Tests</button>
                <button class="category-btn" onclick="filterTests('physics')">Physics</button>
                <button class="category-btn" onclick="filterTests('chemistry')">Chemistry</button>
                <button class="category-btn" onclick="filterTests('mathematics')">Mathematics</button>
                <button class="category-btn" onclick="filterTests('biology')">Biology</button>
            </div>

            <!-- Available Tests -->
            <div class="section">
                <h2>📝 Available Tests</h2>
                <div class="tests-grid">
                    ${availableTests.length > 0 ? availableTests.map(test => `
                        <div class="test-card">
                            <div class="test-badge">${test.category}</div>
                            <h3>${test.title}</h3>
                            <p class="test-description">${test.description || ''}</p>
                            
                            <div class="test-details">
                                <div class="detail-item">
                                    <span class="icon">❓</span>
                                    <span>${test.questionCount} Questions</span>
                                </div>
                                <div class="detail-item">
                                    <span class="icon">⏱️</span>
                                    <span>${test.duration} Minutes</span>
                                </div>
                                <div class="detail-item">
                                    <span class="icon">🎯</span>
                                    <span>${test.totalMarks} Marks</span>
                                </div>
                                <div class="detail-item">
                                    <span class="icon">📊</span>
                                    <span>${test.difficulty}</span>
                                </div>
                            </div>

                            <button onclick="startTest('${test.id}')" class="btn-start-test">
                                Start Test
                            </button>
                        </div>
                    `).join('') : '<p class="no-data">No tests available</p>'}
                </div>
            </div>

            <!-- Completed Tests -->
            <div class="section">
                <h2>📊 Your Results</h2>
                <div class="results-table">
                    ${completedTests.length > 0 ? `
                        <table>
                            <thead>
                                <tr>
                                    <th>Test Name</th>
                                    <th>Score</th>
                                    <th>Percentage</th>
                                    <th>Rank</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${completedTests.map(result => `
                                    <tr>
                                        <td>${result.testName}</td>
                                        <td>${result.score}/${result.totalMarks}</td>
                                        <td>
                                            <span class="percentage-badge ${getPercentageClass(result.percentage)}">
                                                ${result.percentage}%
                                            </span>
                                        </td>
                                        <td>${result.rank || 'N/A'}</td>
                                        <td>${formatDate(result.submittedAt)}</td>
                                        <td>
                                            <button onclick="viewTestAnalysis('${result.id}')" class="btn-view">
                                                View Analysis
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p class="no-data">No completed tests</p>'}
                </div>
            </div>
        </div>
    `;
}

async function fetchAvailableTests() {
    return await FirebaseDB.getCollection('tests');
}

async function fetchCompletedTests() {
    if (!AppState.currentUser) return [];
    
    const results = await FirebaseDB.getCollection('testResults', {
        field: 'studentId',
        operator: '==',
        value: AppState.currentUser.uid
    });
    
    return results.map(r => ({
        ...r,
        percentage: Math.round((r.score / r.totalMarks) * 100)
    })).sort((a, b) => b.submittedAt - a.submittedAt);
}

function getPercentageClass(percentage) {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 75) return 'very-good';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'average';
    return 'poor';
}

async function startTest(testId) {
    if (!AppState.currentUser) {
        showNotification('Please login to take test', 'error');
        window.location.hash = 'login';
        return;
    }
    
    const test = await FirebaseDB.getDoc('tests', testId);
    if (!test) {
        showNotification('Test not found', 'error');
        return;
    }
    
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
        <div class="test-taking-page">
            <!-- Test Header -->
            <div class="test-header">
                <div class="test-info">
                    <h2>${test.title}</h2>
                    <p>${test.questionCount} Questions • ${test.totalMarks} Marks</p>
                </div>
                <div class="test-timer">
                    <div class="timer-display" id="timerDisplay">
                        ${test.duration}:00
                    </div>
                    <p>Time Remaining</p>
                </div>
            </div>

            <!-- Question Navigator -->
            <div class="question-navigator" id="questionNavigator">
                <!-- Will be populated -->
            </div>

            <!-- Question Container -->
            <div class="question-container" id="questionContainer">
                <!-- Will be populated -->
            </div>

            <!-- Navigation Buttons -->
            <div class="test-navigation">
                <button onclick="previousQuestion()" id="prevBtn" class="btn-secondary" disabled>
                    ← Previous
                </button>
                <button onclick="saveAndNext()" id="nextBtn" class="btn-primary">
                    Save & Next →
                </button>
                <button onclick="submitTest('${testId}')" id="submitBtn" class="btn-submit">
                    Submit Test
                </button>
            </div>
        </div>
    `;
    
    // Initialize test
    initializeTest(test, testId);
}

let currentTest = null;
let currentQuestionIndex = 0;
let userAnswers = {};
let testTimer = null;
let timeRemaining = 0;

function initializeTest(test, testId) {
    currentTest = test;
    currentQuestionIndex = 0;
    userAnswers = {};
    timeRemaining = test.duration * 60; // Convert to seconds
    
    // Render questions navigator
    renderQuestionNavigator();
    
    // Render first question
    renderQuestion(0);
    
    // Start timer
    startTestTimer(testId);
}

function renderQuestionNavigator() {
    const navigator = document.getElementById('questionNavigator');
    const questions = currentTest.questions;
    
    navigator.innerHTML = questions.map((q, index) => `
        <div class="nav-button ${index === currentQuestionIndex ? 'active' : ''} 
                    ${userAnswers[index] !== undefined ? 'answered' : ''}"
             onclick="goToQuestion(${index})">
            ${index + 1}
        </div>
    `).join('');
}

function renderQuestion(index) {
    currentQuestionIndex = index;
    const question = currentTest.questions[index];
    const container = document.getElementById('questionContainer');
    
    container.innerHTML = `
        <div class="question-card">
            <div class="question-header">
                <h3>Question ${index + 1} of ${currentTest.questions.length}</h3>
                <span class="marks-badge">Marks: ${question.marks}</span>
            </div>
            
            <div class="question-text">
                ${question.question}
            </div>

            ${question.image ? `
                <div class="question-image">
                    <img src="${question.image}" alt="Question image">
                </div>
            ` : ''}

            <div class="options-container">
                ${renderOptions(question, index)}
            </div>

            ${question.type === 'subjective' ? `
                <div class="subjective-answer">
                    <textarea id="subjectiveAnswer" 
                              placeholder="Write your answer here..."
                              rows="10"
                              onchange="saveAnswer(${index}, this.value)">${userAnswers[index] || ''}</textarea>
                </div>
            ` : ''}
        </div>
    `;
    
    // Update navigation buttons
    document.getElementById('prevBtn').disabled = index === 0;
    document.getElementById('nextBtn').textContent = 
        index === currentTest.questions.length - 1 ? 'Review' : 'Save & Next →';
    
    renderQuestionNavigator();
}

function renderOptions(question, questionIndex) {
    const savedAnswer = userAnswers[questionIndex];
    
    switch (question.type) {
        case 'mcq':
        case 'single':
            return question.options.map((option, i) => `
                <div class="option">
                    <input type="radio" 
                           name="question_${questionIndex}" 
                           id="option_${i}" 
                           value="${option}"
                           ${savedAnswer === option ? 'checked' : ''}
                           onchange="saveAnswer(${questionIndex}, this.value)">
                    <label for="option_${i}">${option}</label>
                </div>
            `).join('');
        
        case 'multiple':
            return question.options.map((option, i) => `
                <div class="option">
                    <input type="checkbox" 
                           name="question_${questionIndex}" 
                           id="option_${i}" 
                           value="${option}"
                           ${savedAnswer && savedAnswer.includes(option) ? 'checked' : ''}
                           onchange="saveMultipleAnswer(${questionIndex})">
                    <label for="option_${i}">${option}</label>
                </div>
            `).join('');
        
        case 'true-false':
            return `
                <div class="option">
                    <input type="radio" 
                           name="question_${questionIndex}" 
                           id="option_true" 
                           value="True"
                           ${savedAnswer === 'True' ? 'checked' : ''}
                           onchange="saveAnswer(${questionIndex}, this.value)">
                    <label for="option_true">True</label>
                </div>
                <div class="option">
                    <input type="radio" 
                           name="question_${questionIndex}" 
                           id="option_false" 
                           value="False"
                           ${savedAnswer === 'False' ? 'checked' : ''}
                           onchange="saveAnswer(${questionIndex}, this.value)">
                    <label for="option_false">False</label>
                </div>
            `;
        
        default:
            return '';
    }
}

function saveAnswer(questionIndex, answer) {
    userAnswers[questionIndex] = answer;
    renderQuestionNavigator();
}

function saveMultipleAnswer(questionIndex) {
    const checkboxes = document.querySelectorAll(`input[name="question_${questionIndex}"]:checked`);
    const selectedOptions = Array.from(checkboxes).map(cb => cb.value);
    userAnswers[questionIndex] = selectedOptions;
    renderQuestionNavigator();
}

function goToQuestion(index) {
    renderQuestion(index);
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        renderQuestion(currentQuestionIndex - 1);
    }
}

function saveAndNext() {
    if (currentQuestionIndex < currentTest.questions.length - 1) {
        renderQuestion(currentQuestionIndex + 1);
    } else {
        // Show review screen
        showReviewScreen();
    }
}

function showReviewScreen() {
    const container = document.getElementById('questionContainer');
    const answeredCount = Object.keys(userAnswers).length;
    const unansweredCount = currentTest.questions.length - answeredCount;
    
    container.innerHTML = `
        <div class="review-screen">
            <h2>Review Your Answers</h2>
            
            <div class="review-summary">
                <div class="summary-card">
                    <div class="summary-number">${currentTest.questions.length}</div>
                    <div class="summary-label">Total Questions</div>
                </div>
                <div class="summary-card answered">
                    <div class="summary-number">${answeredCount}</div>
                    <div class="summary-label">Answered</div>
                </div>
                <div class="summary-card unanswered">
                    <div class="summary-number">${unansweredCount}</div>
                    <div class="summary-label">Not Answered</div>
                </div>
            </div>

            <p class="review-message">
                ${unansweredCount > 0 ? 
                    '⚠️ You have unanswered questions. Click on any question number above to review.' :
                    '✅ All questions answered. You can submit now or review your answers.'}
            </p>

            <div class="review-actions">
                <button onclick="renderQuestion(0)" class="btn-secondary">
                    Review Answers
                </button>
                <button onclick="submitTest('${currentTest.id}')" class="btn-primary">
                    Submit Test
                </button>
            </div>
        </div>
    `;
}

function startTestTimer(testId) {
    const timerDisplay = document.getElementById('timerDisplay');
    
    testTimer = setInterval(() => {
        timeRemaining--;
        
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Warning at 5 minutes
        if (timeRemaining === 300) {
            showNotification('⏰ Only 5 minutes remaining!', 'warning');
        }
        
        // Warning at 1 minute
        if (timeRemaining === 60) {
            showNotification('⏰ Only 1 minute remaining!', 'warning');
            timerDisplay.style.color = 'red';
        }
        
        // Auto-submit when time is up
        if (timeRemaining <= 0) {
            clearInterval(testTimer);
            showNotification('Time\'s up! Submitting test...', 'info');
            submitTest(testId, true);
        }
    }, 1000);
}

async function submitTest(testId, autoSubmit = false) {
    const answeredCount = Object.keys(userAnswers).length;
    
    if (!autoSubmit && answeredCount < currentTest.questions.length) {
        if (!confirm('You have unanswered questions. Do you still want to submit?')) {
            return;
        }
    }
    
    clearInterval(testTimer);
    showLoading(true);
    
    // Calculate score
    const result = calculateScore();
    
    try {
        // Save result to Firestore
        const resultId = await FirebaseDB.addDoc('testResults', {
            testId: testId,
            testName: currentTest.title,
            studentId: AppState.currentUser.uid,
            studentName: AppState.currentUser.displayName,
            answers: userAnswers,
            score: result.score,
            totalMarks: currentTest.totalMarks,
            percentage: result.percentage,
            correctAnswers: result.correctCount,
            wrongAnswers: result.wrongCount,
            unanswered: result.unansweredCount,
            timeTaken: (currentTest.duration * 60) - timeRemaining,
            submittedAt: new Date()
        });
        
        showLoading(false);
        
        // Show result
        showTestResult(resultId, result);
        
    } catch (error) {
        showLoading(false);
        showNotification('Failed to submit test: ' + error.message, 'error');
    }
}

function calculateScore() {
    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    
    currentTest.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        
        if (userAnswer === undefined || userAnswer === '') {
            unansweredCount++;
            return;
        }
        
        const isCorrect = checkAnswer(question, userAnswer);
        
        if (isCorrect) {
            score += question.marks;
            correctCount++;
        } else {
            wrongCount++;
            // Negative marking (if applicable)
            if (currentTest.negativeMarking) {
                score -= question.marks * 0.25;
            }
        }
    });
    
    const percentage = Math.round((score / currentTest.totalMarks) * 100);
    
    return {
        score: Math.max(0, score),
        correctCount,
        wrongCount,
        unansweredCount,
        percentage
    };
}

function checkAnswer(question, userAnswer) {
    if (question.type === 'multiple') {
        const correct = question.correctAnswer;
        return JSON.stringify(userAnswer.sort()) === JSON.stringify(correct.sort());
    }
    return userAnswer === question.correctAnswer;
}

async function showTestResult(resultId, result) {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
        <div class="test-result-page">
            <div class="result-header">
                <div class="result-icon ${result.percentage >= 60 ? 'pass' : 'fail'}">
                    ${result.percentage >= 60 ? '🎉' : '📚'}
                </div>
                <h1>${result.percentage >= 60 ? 'Congratulations!' : 'Keep Practicing!'}</h1>
                <p class="result-message">
                    ${result.percentage >= 60 ? 
                        'You did great! Keep up the good work.' :
                        'Don\'t worry, practice makes perfect!'}
                </p>
            </div>

            <div class="result-cards">
                <div class="result-card">
                    <div class="card-label">Your Score</div>
                    <div class="card-value">${result.score}/${currentTest.totalMarks}</div>
                </div>
                <div class="result-card">
                    <div class="card-label">Percentage</div>
                    <div class="card-value percentage-${getPercentageClass(result.percentage)}">
                        ${result.percentage}%
                    </div>
                </div>
                <div class="result-card">
                    <div class="card-label">Correct</div>
                    <div class="card-value correct">${result.correctCount}</div>
                </div>
                <div class="result-card">
                    <div class="card-label">Wrong</div>
                    <div class="card-value wrong">${result.wrongCount}</div>
                </div>
            </div>

            <div class="result-actions">
                <button onclick="viewDetailedAnalysis('${resultId}')" class="btn-primary btn-large">
                    View Detailed Analysis
                </button>
                <button onclick="window.location.hash='mock-tests'" class="btn-secondary">
                    Back to Tests
                </button>
            </div>
        </div>
    `;
}

async function viewTestAnalysis(resultId) {
    showLoading(true);
    const result = await FirebaseDB.getDoc('testResults', resultId);
    const test = await FirebaseDB.getDoc('tests', result.testId);
    showLoading(false);
    
    viewDetailedAnalysis(resultId, result, test);
}

async function viewDetailedAnalysis(resultId, resultData = null, testData = null) {
    showLoading(true);
    
    if (!resultData) {
        resultData = await FirebaseDB.getDoc('testResults', resultId);
        testData = await FirebaseDB.getDoc('tests', resultData.testId);
    }
    
    showLoading(false);
    
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
        <div class="analysis-page">
            <button onclick="window.location.hash='mock-tests'" class="btn-back">
                ← Back
            </button>

            <h1>Detailed Analysis</h1>
            
            <div class="analysis-summary">
                <h3>${testData.title}</h3>
                <p>Score: ${resultData.score}/${resultData.totalMarks} (${resultData.percentage}%)</p>
            </div>

            <div class="analysis-questions">
                ${testData.questions.map((question, index) => {
                    const userAnswer = resultData.answers[index];
                    const isCorrect = checkAnswer(question, userAnswer);
                    
                    return `
                        <div class="analysis-question ${isCorrect ? 'correct' : userAnswer ? 'wrong' : 'unanswered'}">
                            <div class="question-status">
                                ${isCorrect ? '✅' : userAnswer ? '❌' : '⚠️'}
                            </div>
                            <div class="question-content">
                                <h4>Question ${index + 1}</h4>
                                <p>${question.question}</p>
                                
                                <div class="answer-section">
                                    <p><strong>Your Answer:</strong> ${userAnswer || 'Not answered'}</p>
                                    <p><strong>Correct Answer:</strong> ${question.correctAnswer}</p>
                                    ${question.explanation ? `
                                        <div class="explanation">
                                            <strong>Explanation:</strong>
                                            <p>${question.explanation}</p>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function filterTests(category) {
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter logic would go here
    // For now, just reload the page
    renderMockTestsPage();
}
