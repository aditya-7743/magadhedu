// Teacher Dashboard - Complete Features

async function renderTeacherDashboard() {
    const content = document.getElementById('main-content');
    
    // Fetch teacher data
    const myCourses = await fetchTeacherCourses();
    const upcomingClasses = await fetchTeacherClasses();
    const analytics = await fetchTeacherAnalytics();
    
    content.innerHTML = `
        <div class="teacher-dashboard">
            <!-- Welcome Section -->
            <div class="dashboard-header">
                <div class="welcome-section">
                    <h1>Welcome, ${AppState.currentUser.displayName}! 👨‍🏫</h1>
                    <p>Manage your courses and students</p>
                </div>
                <div class="quick-create">
                    <button onclick="showCreateCourseModal()" class="btn-primary">
                        ➕ Create New Course
                    </button>
                    <button onclick="showScheduleClassModal()" class="btn-secondary">
                        📅 Schedule Live Class
                    </button>
                </div>
            </div>

            <!-- Analytics Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-info">
                        <h3>${myCourses.length}</h3>
                        <p>Total Courses</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-info">
                        <h3>${analytics.totalStudents}</h3>
                        <p>Total Students</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-info">
                        <h3>₹${analytics.totalRevenue}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-info">
                        <h3>${analytics.averageRating}</h3>
                        <p>Average Rating</p>
                    </div>
                </div>
            </div>

            <!-- Upcoming Live Classes -->
            <div class="section">
                <div class="section-header">
                    <h2>🔴 Upcoming Live Classes</h2>
                    <a href="#" onclick="showScheduleClassModal()">Schedule New</a>
                </div>
                <div class="live-classes-list">
                    ${upcomingClasses.length > 0 ? upcomingClasses.map(cls => `
                        <div class="live-class-item">
                            <div class="class-info">
                                <h4>${cls.title}</h4>
                                <p>📅 ${formatDateTime(cls.startTime)}</p>
                                <p>👥 ${cls.enrolledStudents || 0} students enrolled</p>
                            </div>
                            <div class="class-actions">
                                ${isLiveNow(cls.startTime) ? `
                                    <button onclick="startLiveClass('${cls.id}')" class="btn-live">
                                        🔴 Start Class
                                    </button>
                                ` : `
                                    <button onclick="editClass('${cls.id}')" class="btn-edit">
                                        ✏️ Edit
                                    </button>
                                    <button onclick="deleteClass('${cls.id}')" class="btn-delete">
                                        🗑️ Delete
                                    </button>
                                `}
                            </div>
                        </div>
                    `).join('') : '<p class="no-data">No upcoming classes</p>'}
                </div>
            </div>

            <!-- My Courses -->
            <div class="section">
                <div class="section-header">
                    <h2>📚 My Courses</h2>
                    <button onclick="showCreateCourseModal()" class="btn-add">+ Add Course</button>
                </div>
                <div class="courses-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Students</th>
                                <th>Revenue</th>
                                <th>Rating</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${myCourses.map(course => `
                                <tr>
                                    <td>
                                        <div class="course-cell">
                                            <img src="${course.thumbnail}" alt="${course.title}">
                                            <span>${course.title}</span>
                                        </div>
                                    </td>
                                    <td>${course.enrolledCount || 0}</td>
                                    <td>₹${course.revenue || 0}</td>
                                    <td>⭐ ${course.rating || 'N/A'}</td>
                                    <td>
                                        <span class="status-badge ${course.published ? 'published' : 'draft'}">
                                            ${course.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td>
                                        <button onclick="editCourse('${course.id}')" class="btn-icon">✏️</button>
                                        <button onclick="viewCourseAnalytics('${course.id}')" class="btn-icon">📊</button>
                                        <button onclick="deleteCourse('${course.id}')" class="btn-icon">🗑️</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Revenue Chart -->
            <div class="section">
                <h2>💰 Revenue Overview</h2>
                <div class="chart-container">
                    <canvas id="revenueChart"></canvas>
                </div>
            </div>

            <!-- Recent Reviews -->
            <div class="section">
                <div class="section-header">
                    <h2>⭐ Recent Reviews</h2>
                </div>
                <div class="reviews-list" id="recent-reviews">
                    <!-- Will be populated by loadRecentReviews() -->
                </div>
            </div>
        </div>

        <!-- Create Course Modal -->
        <div id="createCourseModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeModal('createCourseModal')">&times;</span>
                <h2>Create New Course</h2>
                <form id="createCourseForm" onsubmit="handleCreateCourse(event)">
                    <input type="text" name="title" placeholder="Course Title" required>
                    <textarea name="description" placeholder="Course Description" rows="4" required></textarea>
                    
                    <select name="category" required>
                        <option value="">Select Category</option>
                        <option value="physics">Physics</option>
                        <option value="chemistry">Chemistry</option>
                        <option value="mathematics">Mathematics</option>
                        <option value="biology">Biology</option>
                        <option value="programming">Programming</option>
                        <option value="other">Other</option>
                    </select>

                    <input type="number" name="price" placeholder="Price (₹)" min="0" required>
                    
                    <label>Course Thumbnail</label>
                    <input type="file" name="thumbnail" accept="image/*" required>
                    
                    <div class="form-actions">
                        <button type="button" onclick="closeModal('createCourseModal')" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Create Course</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Schedule Class Modal -->
        <div id="scheduleClassModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeModal('scheduleClassModal')">&times;</span>
                <h2>Schedule Live Class</h2>
                <form id="scheduleClassForm" onsubmit="handleScheduleClass(event)">
                    <select name="courseId" required>
                        <option value="">Select Course</option>
                        ${myCourses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
                    </select>

                    <input type="text" name="title" placeholder="Class Title" required>
                    <textarea name="description" placeholder="Class Description" rows="3"></textarea>
                    
                    <input type="datetime-local" name="startTime" required>
                    <input type="number" name="duration" placeholder="Duration (minutes)" min="30" max="180" value="60" required>
                    
                    <div class="form-actions">
                        <button type="button" onclick="closeModal('scheduleClassModal')" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Schedule Class</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Load additional data
    loadRecentReviews();
    renderRevenueChart(analytics.revenueData);
}

async function fetchTeacherCourses() {
    if (!AppState.currentUser) return [];
    
    const courses = await FirebaseDB.getCollection('courses', {
        field: 'teacherId',
        operator: '==',
        value: AppState.currentUser.uid
    });
    
    return courses;
}

async function fetchTeacherClasses() {
    if (!AppState.currentUser) return [];
    
    const now = new Date();
    const classes = await FirebaseDB.getCollection('liveClasses', {
        field: 'teacherId',
        operator: '==',
        value: AppState.currentUser.uid
    });
    
    return classes.filter(cls => cls.startTime.toDate() > now)
        .sort((a, b) => a.startTime - b.startTime);
}

async function fetchTeacherAnalytics() {
    const courses = await fetchTeacherCourses();
    
    let totalStudents = 0;
    let totalRevenue = 0;
    let totalRatings = 0;
    let ratingCount = 0;
    
    for (let course of courses) {
        totalStudents += course.enrolledCount || 0;
        totalRevenue += course.revenue || 0;
        if (course.rating) {
            totalRatings += course.rating;
            ratingCount++;
        }
    }
    
    return {
        totalStudents,
        totalRevenue,
        averageRating: ratingCount > 0 ? (totalRatings / ratingCount).toFixed(1) : 'N/A',
        revenueData: generateRevenueData() // Mock data for chart
    };
}

function generateRevenueData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
        month,
        revenue: Math.floor(Math.random() * 50000) + 10000
    }));
}

function showCreateCourseModal() {
    document.getElementById('createCourseModal').style.display = 'block';
}

function showScheduleClassModal() {
    document.getElementById('scheduleClassModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function handleCreateCourse(event) {
    event.preventDefault();
    showLoading(true);
    
    const formData = new FormData(event.target);
    const thumbnailFile = formData.get('thumbnail');
    
    try {
        // Upload thumbnail
        const thumbnailURL = await FirebaseStorage.uploadFile(
            `courses/${Date.now()}_${thumbnailFile.name}`,
            thumbnailFile,
            (progress) => console.log('Upload progress:', progress)
        );
        
        // Create course
        const courseId = await FirebaseDB.addDoc('courses', {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            price: parseFloat(formData.get('price')),
            thumbnail: thumbnailURL,
            teacherId: AppState.currentUser.uid,
            teacherName: AppState.currentUser.displayName,
            published: false,
            enrolledCount: 0,
            lessons: [],
            createdAt: new Date()
        });
        
        showLoading(false);
        closeModal('createCourseModal');
        showNotification('Course created successfully!', 'success');
        
        // Redirect to edit course page
        window.location.hash = `edit-course/${courseId}`;
        
    } catch (error) {
        showLoading(false);
        showNotification('Failed to create course: ' + error.message, 'error');
    }
}

async function handleScheduleClass(event) {
    event.preventDefault();
    showLoading(true);
    
    const formData = new FormData(event.target);
    
    try {
        // Create Daily.co room
        const roomName = `class_${Date.now()}`;
        
        await FirebaseDB.addDoc('liveClasses', {
            courseId: formData.get('courseId'),
            title: formData.get('title'),
            description: formData.get('description'),
            startTime: firebase.firestore.Timestamp.fromDate(new Date(formData.get('startTime'))),
            duration: parseInt(formData.get('duration')),
            teacherId: AppState.currentUser.uid,
            teacherName: AppState.currentUser.displayName,
            roomName: roomName,
            status: 'scheduled'
        });
        
        showLoading(false);
        closeModal('scheduleClassModal');
        showNotification('Live class scheduled successfully!', 'success');
        renderTeacherDashboard();
        
    } catch (error) {
        showLoading(false);
        showNotification('Failed to schedule class: ' + error.message, 'error');
    }
}

async function editCourse(courseId) {
    window.location.hash = `edit-course/${courseId}`;
}

async function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    showLoading(true);
    const success = await FirebaseDB.deleteDoc('courses', courseId);
    showLoading(false);
    
    if (success) {
        showNotification('Course deleted successfully', 'success');
        renderTeacherDashboard();
    } else {
        showNotification('Failed to delete course', 'error');
    }
}

function viewCourseAnalytics(courseId) {
    window.location.hash = `course-analytics/${courseId}`;
}

async function startLiveClass(classId) {
    window.location.hash = `live-class/${classId}`;
}

async function editClass(classId) {
    // TODO: Implement edit class functionality
    showNotification('Edit class functionality coming soon', 'info');
}

async function deleteClass(classId) {
    if (!confirm('Are you sure you want to delete this class?')) return;
    
    showLoading(true);
    const success = await FirebaseDB.deleteDoc('liveClasses', classId);
    showLoading(false);
    
    if (success) {
        showNotification('Class deleted successfully', 'success');
        renderTeacherDashboard();
    } else {
        showNotification('Failed to delete class', 'error');
    }
}

async function loadRecentReviews() {
    const reviews = await FirebaseDB.getCollection('reviews', null, 5);
    const container = document.getElementById('recent-reviews');
    
    if (reviews.length === 0) {
        container.innerHTML = '<p class="no-data">No reviews yet</p>';
        return;
    }
    
    container.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="student-info">
                    <img src="${review.studentPhoto}" alt="${review.studentName}">
                    <div>
                        <h4>${review.studentName}</h4>
                        <p class="course-name">${review.courseName}</p>
                    </div>
                </div>
                <div class="rating">
                    ${'⭐'.repeat(review.rating)}
                </div>
            </div>
            <p class="review-text">${review.comment}</p>
            <p class="review-date">${formatDate(review.createdAt)}</p>
        </div>
    `).join('');
}

function renderRevenueChart(revenueData) {
    // Simple canvas-based chart (you can use Chart.js for better charts)
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    
    const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
    const barWidth = chartWidth / revenueData.length - 10;
    
    // Draw bars
    revenueData.forEach((data, index) => {
        const barHeight = (data.revenue / maxRevenue) * chartHeight;
        const x = padding + index * (barWidth + 10);
        const y = canvas.height - padding - barHeight;
        
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(data.month, x + barWidth / 2, canvas.height - 20);
        ctx.fillText('₹' + (data.revenue / 1000).toFixed(0) + 'K', x + barWidth / 2, y - 5);
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
