// Analytics Dashboard

async function renderAnalytics() {
    const content = document.getElementById('main-content');

    if (!AppState.currentUser) {
        window.location.hash = 'login';
        return;
    }

    showLoading(true);

    const isTeacher = AppState.userRole === 'teacher';
    let data;

    if (isTeacher) {
        data = await fetchTeacherAnalyticsData();
    } else {
        data = await fetchStudentAnalyticsData();
    }

    showLoading(false);

    content.innerHTML = isTeacher
        ? renderTeacherAnalyticsDashboard(data)
        : renderStudentAnalyticsDashboard(data);

    // Render charts after DOM is ready
    setTimeout(() => {
        if (isTeacher) {
            drawRevenueChart(data.monthlyRevenue);
            drawEnrollmentChart(data.monthlyEnrollments);
        } else {
            drawScoreChart(data.testScores);
            drawActivityChart(data.weeklyActivity);
        }
    }, 100);
}

// ---- Student Analytics ----

async function fetchStudentAnalyticsData() {
    const uid = AppState.currentUser.uid;

    const [enrollments, testResults] = await Promise.all([
        FirebaseDB.getCollection('enrollments', { field: 'studentId', operator: '==', value: uid }),
        FirebaseDB.getCollection('testResults', { field: 'studentId', operator: '==', value: uid })
    ]);

    const totalStudyTime = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
    const avgScore = testResults.length > 0
        ? Math.round(testResults.reduce((sum, t) => sum + ((t.score / t.totalMarks) * 100), 0) / testResults.length)
        : 0;

    const testScores = testResults
        .sort((a, b) => (a.submittedAt || 0) - (b.submittedAt || 0))
        .slice(-10)
        .map(t => ({
            name: t.testName || 'Test',
            score: Math.round((t.score / t.totalMarks) * 100)
        }));

    const weeklyActivity = buildWeeklyActivity();

    return {
        enrolledCount: enrollments.length,
        testsCompleted: testResults.length,
        avgScore,
        totalStudyTime,
        testScores,
        weeklyActivity,
        recentTests: testResults.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0)).slice(0, 5)
    };
}

function buildWeeklyActivity() {
    const activityDates = JSON.parse(localStorage.getItem('activityDates') || '[]');
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        days.push({
            day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
            active: activityDates.includes(dateStr)
        });
    }
    return days;
}

function renderStudentAnalyticsDashboard(data) {
    return `
        <div class="analytics-page animate-up">
            <div class="page-header">
                <h1>My Analytics</h1>
                <p>Track your learning progress</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-info">
                        <h3>${data.enrolledCount}</h3>
                        <p>Courses Enrolled</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📝</div>
                    <div class="stat-info">
                        <h3>${data.testsCompleted}</h3>
                        <p>Tests Completed</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-info">
                        <h3>${data.avgScore}%</h3>
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

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
                <div class="card" style="padding: 2rem;">
                    <h3 style="margin-bottom: 1rem;">Test Score Trend</h3>
                    <canvas id="scoreChart" height="250"></canvas>
                    ${data.testScores.length === 0 ? '<p style="color: var(--text-muted); text-align: center; margin-top: 1rem;">No test data yet</p>' : ''}
                </div>
                <div class="card" style="padding: 2rem;">
                    <h3 style="margin-bottom: 1rem;">Weekly Activity</h3>
                    <canvas id="activityChart" height="250"></canvas>
                </div>
            </div>

            <div class="card" style="padding: 2rem; margin-top: 2rem;">
                <h3 style="margin-bottom: 1rem;">Recent Test Results</h3>
                ${data.recentTests.length > 0 ? `
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--border);">
                                <th style="text-align: left; padding: 0.75rem;">Test</th>
                                <th style="text-align: center; padding: 0.75rem;">Score</th>
                                <th style="text-align: center; padding: 0.75rem;">Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.recentTests.map(t => `
                                <tr style="border-bottom: 1px solid var(--border);">
                                    <td style="padding: 0.75rem;">${t.testName || 'Test'}</td>
                                    <td style="text-align: center; padding: 0.75rem;">${t.score}/${t.totalMarks}</td>
                                    <td style="text-align: center; padding: 0.75rem;">
                                        <span style="background: ${Math.round((t.score / t.totalMarks) * 100) >= 60 ? 'var(--success)' : 'var(--error)'}; color: white; padding: 0.2rem 0.6rem; border-radius: 4px;">
                                            ${Math.round((t.score / t.totalMarks) * 100)}%
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : '<p style="color: var(--text-muted); text-align: center;">No tests completed yet. <a href="#mock-tests">Take a test</a></p>'}
            </div>
        </div>
    `;
}

// ---- Teacher Analytics ----

async function fetchTeacherAnalyticsData() {
    const uid = AppState.currentUser.uid;

    const courses = await FirebaseDB.getCollection('courses', { field: 'teacherId', operator: '==', value: uid });

    let totalStudents = 0;
    let totalRevenue = 0;
    let totalRating = 0;
    let ratingCount = 0;

    for (const c of courses) {
        totalStudents += c.enrolledCount || 0;
        totalRevenue += c.revenue || 0;
        if (c.rating) { totalRating += c.rating; ratingCount++; }
    }

    const transactions = await FirebaseDB.getCollection('transactions', { field: 'studentId', operator: '==', value: uid });

    const monthlyRevenue = buildMonthlyData(transactions, 'amount');
    const monthlyEnrollments = buildMonthlyEnrollments(courses);

    return {
        totalCourses: courses.length,
        totalStudents,
        totalRevenue,
        avgRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 'N/A',
        monthlyRevenue,
        monthlyEnrollments,
        courses
    };
}

function buildMonthlyData(transactions, field) {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            label: d.toLocaleDateString('en-IN', { month: 'short' }),
            value: 0,
            year: d.getFullYear(),
            month: d.getMonth()
        });
    }

    for (const t of transactions) {
        const ts = t.timestamp ? (t.timestamp.toDate ? t.timestamp.toDate() : new Date(t.timestamp)) : null;
        if (!ts) continue;
        const entry = months.find(m => m.year === ts.getFullYear() && m.month === ts.getMonth());
        if (entry) entry.value += t[field] || 0;
    }

    return months;
}

function buildMonthlyEnrollments(courses) {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            label: d.toLocaleDateString('en-IN', { month: 'short' }),
            value: 0
        });
    }
    // Distribute enrolled counts evenly as approximation
    const totalPerMonth = Math.ceil(courses.reduce((s, c) => s + (c.enrolledCount || 0), 0) / 6);
    months.forEach(m => { m.value = totalPerMonth; });
    return months;
}

function renderTeacherAnalyticsDashboard(data) {
    return `
        <div class="analytics-page animate-up">
            <div class="page-header">
                <h1>Teacher Analytics</h1>
                <p>Overview of your courses and performance</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-info">
                        <h3>${data.totalCourses}</h3>
                        <p>Total Courses</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-info">
                        <h3>${data.totalStudents}</h3>
                        <p>Total Students</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-info">
                        <h3>₹${data.totalRevenue}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-info">
                        <h3>${data.avgRating}</h3>
                        <p>Average Rating</p>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
                <div class="card" style="padding: 2rem;">
                    <h3 style="margin-bottom: 1rem;">Monthly Revenue</h3>
                    <canvas id="revenueAnalyticsChart" height="250"></canvas>
                </div>
                <div class="card" style="padding: 2rem;">
                    <h3 style="margin-bottom: 1rem;">Monthly Enrollments</h3>
                    <canvas id="enrollmentChart" height="250"></canvas>
                </div>
            </div>

            <div class="card" style="padding: 2rem; margin-top: 2rem;">
                <h3 style="margin-bottom: 1rem;">Course Performance</h3>
                ${data.courses.length > 0 ? `
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--border);">
                                <th style="text-align: left; padding: 0.75rem;">Course</th>
                                <th style="text-align: center; padding: 0.75rem;">Students</th>
                                <th style="text-align: center; padding: 0.75rem;">Revenue</th>
                                <th style="text-align: center; padding: 0.75rem;">Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.courses.map(c => `
                                <tr style="border-bottom: 1px solid var(--border);">
                                    <td style="padding: 0.75rem;">${c.title}</td>
                                    <td style="text-align: center; padding: 0.75rem;">${c.enrolledCount || 0}</td>
                                    <td style="text-align: center; padding: 0.75rem;">₹${c.revenue || 0}</td>
                                    <td style="text-align: center; padding: 0.75rem;">⭐ ${c.rating || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : '<p style="color: var(--text-muted); text-align: center;">No courses created yet</p>'}
            </div>
        </div>
    `;
}

// ---- Chart Drawing (Canvas) ----

function drawBarChart(canvasId, labels, values, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 250;

    const padding = 40;
    const chartW = canvas.width - padding * 2;
    const chartH = canvas.height - padding * 2;
    const maxVal = Math.max(...values, 1);
    const barW = chartW / labels.length - 10;

    // Axis
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    values.forEach((val, i) => {
        const barH = (val / maxVal) * chartH;
        const x = padding + i * (barW + 10) + 5;
        const y = canvas.height - padding - barH;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barW, barH);

        ctx.fillStyle = '#333';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], x + barW / 2, canvas.height - padding + 15);
        if (val > 0) ctx.fillText(val, x + barW / 2, y - 5);
    });
}

function drawScoreChart(testScores) {
    const labels = testScores.map((t, i) => t.name.length > 8 ? t.name.slice(0, 8) + '..' : t.name);
    const values = testScores.map(t => t.score);
    drawBarChart('scoreChart', labels, values, '#2962FF');
}

function drawActivityChart(weeklyActivity) {
    const labels = weeklyActivity.map(d => d.day);
    const values = weeklyActivity.map(d => d.active ? 1 : 0);
    drawBarChart('activityChart', labels, values, '#00C853');
}

function drawRevenueChart(monthlyRevenue) {
    const labels = monthlyRevenue.map(m => m.label);
    const values = monthlyRevenue.map(m => m.value);
    drawBarChart('revenueAnalyticsChart', labels, values, '#4CAF50');
}

function drawEnrollmentChart(monthlyEnrollments) {
    const labels = monthlyEnrollments.map(m => m.label);
    const values = monthlyEnrollments.map(m => m.value);
    drawBarChart('enrollmentChart', labels, values, '#2962FF');
}

// ---- Per-Course Analytics ----

async function renderCourseAnalytics(courseId) {
    const content = document.getElementById('main-content');
    showLoading(true);

    const [course, enrollments, reviews] = await Promise.all([
        FirebaseDB.getDoc('courses', courseId),
        FirebaseDB.getCollection('enrollments', { field: 'courseId', operator: '==', value: courseId }),
        FirebaseDB.getCollection('reviews', { field: 'courseId', operator: '==', value: courseId })
    ]);

    showLoading(false);

    if (!course) {
        showNotification('Course not found', 'error');
        window.location.hash = 'teacher-dashboard';
        return;
    }

    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : 'N/A';

    const avgProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length)
        : 0;

    content.innerHTML = `
        <div class="analytics-page animate-up">
            <button onclick="window.location.hash='teacher-dashboard'" class="btn-back" style="margin-bottom: 1rem; background: none; border: none; color: var(--primary); cursor: pointer; font-size: 1rem;">
                ← Back to Dashboard
            </button>

            <div class="page-header">
                <h1>${course.title}</h1>
                <p>Course Analytics</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-info">
                        <h3>${enrollments.length}</h3>
                        <p>Enrolled Students</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-info">
                        <h3>₹${course.revenue || 0}</h3>
                        <p>Revenue</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-info">
                        <h3>${avgRating}</h3>
                        <p>Avg Rating (${reviews.length} reviews)</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-info">
                        <h3>${avgProgress}%</h3>
                        <p>Avg Completion</p>
                    </div>
                </div>
            </div>

            <div class="card" style="padding: 2rem; margin-top: 2rem;">
                <h3 style="margin-bottom: 1rem;">Student Reviews</h3>
                ${reviews.length > 0 ? reviews.map(r => `
                    <div style="border-bottom: 1px solid var(--border); padding: 1rem 0;">
                        <div style="display: flex; justify-content: space-between;">
                            <strong>${r.studentName || 'Student'}</strong>
                            <span>${'⭐'.repeat(r.rating)}</span>
                        </div>
                        <p style="color: var(--text-muted); margin-top: 0.5rem;">${r.comment || ''}</p>
                    </div>
                `).join('') : '<p style="color: var(--text-muted);">No reviews yet</p>'}
            </div>
        </div>
    `;
}
