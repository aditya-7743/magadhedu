// Student Dashboard - Complete Features

async function renderStudentDashboard() {
    const content = document.getElementById('main-content');
    
    // Fetch student data
    const enrolledCourses = await fetchEnrolledCourses();
    const testResults = await fetchTestResults();
    const upcomingClasses = await fetchUpcomingClasses();
    
    content.innerHTML = `
        <div class="student-dashboard">
            <!-- Welcome Section -->
            <div class="dashboard-header">
                <div class="welcome-section">
                    <h1>Welcome back, ${AppState.currentUser.displayName}! 👋</h1>
                    <p>Continue your learning journey</p>
                </div>
                <div class="profile-pic">
                    <img src="${AppState.currentUser.photoURL || 'https://via.placeholder.com/80'}" alt="Profile">
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-info">
                        <h3>${enrolledCourses.length}</h3>
                        <p>Enrolled Courses</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-info">
                        <h3>${testResults.length}</h3>
                        <p>Tests Completed</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-info">
                        <h3>${calculateAverageScore(testResults)}%</h3>
                        <p>Average Score</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-info">
                        <h3>${calculateStreak()}</h3>
                        <p>Day Streak</p>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
                <h2>Quick Actions</h2>
                <div class="action-buttons">
                    <button onclick="window.location.hash='courses'" class="action-btn">
                        📖 Browse Courses
                    </button>
                    <button onclick="window.location.hash='live-classes'" class="action-btn">
                        📹 Join Live Class
                    </button>
                    <button onclick="window.location.hash='mock-tests'" class="action-btn">
                        📝 Take Mock Test
                    </button>
                    <button onclick="viewCertificates()" class="action-btn">
                        🏆 My Certificates
                    </button>
                </div>
            </div>

            <!-- Upcoming Live Classes -->
            <div class="section">
                <div class="section-header">
                    <h2>🔴 Upcoming Live Classes</h2>
                    <a href="#live-classes">View All</a>
                </div>
                <div class="live-classes-grid">
                    ${upcomingClasses.length > 0 ? upcomingClasses.map(cls => `
                        <div class="live-class-card">
                            <div class="class-badge ${isLiveNow(cls.startTime) ? 'live' : 'upcoming'}">
                                ${isLiveNow(cls.startTime) ? '🔴 LIVE NOW' : '⏰ Upcoming'}
                            </div>
                            <h3>${cls.title}</h3>
                            <p class="teacher">👨‍🏫 ${cls.teacherName}</p>
                            <p class="time">📅 ${formatDateTime(cls.startTime)}</p>
                            <button onclick="joinLiveClass('${cls.id}')" class="btn-join">
                                ${isLiveNow(cls.startTime) ? 'Join Now' : 'Set Reminder'}
                            </button>
                        </div>
                    `).join('') : '<p class="no-data">No upcoming classes</p>'}
                </div>
            </div>

            <!-- Continue Learning -->
            <div class="section">
                <div class="section-header">
                    <h2>📚 Continue Learning</h2>
                    <a href="#courses">My Courses</a>
                </div>
                <div class="courses-grid">
                    ${enrolledCourses.length > 0 ? enrolledCourses.slice(0, 4).map(course => `
                        <div class="course-card">
                            <img src="${course.thumbnail || 'https://via.placeholder.com/300x180'}" alt="${course.title}">
                            <div class="course-info">
                                <h3>${course.title}</h3>
                                <p class="teacher">${course.teacherName}</p>
                                <div class="progress-section">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${course.progress || 0}%"></div>
                                    </div>
                                    <span class="progress-text">${course.progress || 0}% Complete</span>
                                </div>
                                <button onclick="continueCourse('${course.id}')" class="btn-continue">
                                    Continue
                                </button>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="empty-state">
                            <p>You haven't enrolled in any courses yet</p>
                            <button onclick="window.location.hash='courses'" class="btn-primary">
                                Browse Courses
                            </button>
                        </div>
                    `}
                </div>
            </div>

            <!-- Recent Test Results -->
            <div class="section">
                <div class="section-header">
                    <h2>📊 Recent Test Results</h2>
                    <a href="#mock-tests">View All</a>
                </div>
                <div class="test-results-list">
                    ${testResults.length > 0 ? testResults.slice(0, 5).map(test => `
                        <div class="test-result-item">
                            <div class="test-info">
                                <h4>${test.testName}</h4>
                                <p class="test-date">${formatDate(test.submittedAt)}</p>
                            </div>
                            <div class="test-score ${getScoreClass(test.percentage)}">
                                <span class="score">${test.score}/${test.totalMarks}</span>
                                <span class="percentage">${test.percentage}%</span>
                            </div>
                            <button onclick="viewTestAnalysis('${test.id}')" class="btn-view">
                                View Analysis
                            </button>
                        </div>
                    `).join('') : '<p class="no-data">No test results yet</p>'}
                </div>
            </div>

            <!-- Study Streak -->
            <div class="section">
                <h2>🔥 Your Study Streak</h2>
                <div class="streak-calendar">
                    ${renderStreakCalendar()}
                </div>
            </div>

            <!-- Recommended Courses -->
            <div class="section">
                <div class="section-header">
                    <h2>💡 Recommended for You</h2>
                </div>
                <div class="courses-grid" id="recommended-courses">
                    <!-- Will be populated by loadRecommendedCourses() -->
                </div>
            </div>
        </div>
    `;
    
    // Load recommended courses
    loadRecommendedCourses();
}

async function fetchEnrolledCourses() {
    if (!AppState.currentUser) return [];
    
    const enrollments = await FirebaseDB.getCollection('enrollments', {
        field: 'studentId',
        operator: '==',
        value: AppState.currentUser.uid
    });
    
    const courses = [];
    for (let enrollment of enrollments) {
        const course = await FirebaseDB.getDoc('courses', enrollment.courseId);
        if (course) {
            courses.push({
                ...course,
                progress: enrollment.progress || 0,
                enrolledAt: enrollment.createdAt
            });
        }
    }
    
    AppState.enrolledCourses = courses;
    return courses;
}

async function fetchTestResults() {
    if (!AppState.currentUser) return [];
    
    const results = await FirebaseDB.getCollection('testResults', {
        field: 'studentId',
        operator: '==',
        value: AppState.currentUser.uid
    });
    
    return results.map(result => ({
        ...result,
        percentage: Math.round((result.score / result.totalMarks) * 100)
    })).sort((a, b) => b.submittedAt - a.submittedAt);
}

async function fetchUpcomingClasses() {
    const now = new Date();
    const classes = await FirebaseDB.getCollection('liveClasses');
    
    return classes.filter(cls => {
        const classTime = cls.startTime.toDate();
        return classTime > now;
    }).sort((a, b) => a.startTime - b.startTime).slice(0, 3);
}

function calculateAverageScore(testResults) {
    if (testResults.length === 0) return 0;
    const sum = testResults.reduce((acc, test) => acc + test.percentage, 0);
    return Math.round(sum / testResults.length);
}

function calculateStreak() {
    // Get from localStorage or Firestore
    return parseInt(localStorage.getItem('studyStreak')) || 0;
}

function isLiveNow(startTime) {
    const now = new Date();
    const classTime = startTime.toDate();
    const diffMinutes = (classTime - now) / (1000 * 60);
    return diffMinutes <= 0 && diffMinutes > -120; // Live if started within last 2 hours
}

function formatDateTime(timestamp) {
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDate(timestamp) {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function getScoreClass(percentage) {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'average';
    return 'poor';
}

function renderStreakCalendar() {
    const today = new Date();
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
        const hasActivity = checkActivityForDate(date);
        
        days.push(`
            <div class="streak-day ${hasActivity ? 'active' : ''}">
                <span class="day-name">${dayName}</span>
                <div class="day-indicator">${hasActivity ? '🔥' : '⚪'}</div>
            </div>
        `);
    }
    
    return days.join('');
}

function checkActivityForDate(date) {
    // Check localStorage or Firestore for activity on this date
    const activityDates = JSON.parse(localStorage.getItem('activityDates') || '[]');
    const dateStr = date.toISOString().split('T')[0];
    return activityDates.includes(dateStr);
}

async function loadRecommendedCourses() {
    const allCourses = await FirebaseDB.getCollection('courses', null, 4);
    const enrolledIds = AppState.enrolledCourses.map(c => c.id);
    const recommended = allCourses.filter(c => !enrolledIds.includes(c.id));
    
    const container = document.getElementById('recommended-courses');
    container.innerHTML = recommended.map(course => `
        <div class="course-card">
            <img src="${course.thumbnail || 'https://via.placeholder.com/300x180'}" alt="${course.title}">
            <div class="course-info">
                <h3>${course.title}</h3>
                <p class="teacher">${course.teacherName}</p>
                <div class="course-meta">
                    <span>⭐ ${course.rating || 4.5}</span>
                    <span>👥 ${course.enrolledCount || 0} students</span>
                </div>
                <div class="course-price">
                    ${course.price > 0 ? `₹${course.price}` : 'FREE'}
                </div>
                <button onclick="viewCourseDetails('${course.id}')" class="btn-enroll">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

function continueCourse(courseId) {
    window.location.hash = `course/${courseId}`;
}

function viewCourseDetails(courseId) {
    window.location.hash = `course/${courseId}`;
}

function viewTestAnalysis(testId) {
    window.location.hash = `test-analysis/${testId}`;
}

function joinLiveClass(classId) {
    window.location.hash = `live-class/${classId}`;
}

function viewCertificates() {
    window.location.hash = 'certificates';
}
