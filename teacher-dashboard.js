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
                    <button onclick="showCreateTestModal()" class="btn-secondary">
                        📝 Create Test
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
    showLoading(true);
    const classData = await FirebaseDB.getDoc('liveClasses', classId);
    showLoading(false);

    if (!classData) {
        showNotification('Class not found', 'error');
        return;
    }

    // Convert Firestore timestamp to datetime-local format
    const startDate = classData.startTime && classData.startTime.toDate
        ? classData.startTime.toDate()
        : new Date(classData.startTime);
    const startTimeStr = startDate.toISOString().slice(0, 16);

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.id = 'editClassModal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="document.getElementById('editClassModal').remove()">&times;</span>
            <h2>Edit Live Class</h2>
            <form onsubmit="handleEditClass(event, '${classId}')">
                <input type="text" name="title" value="${classData.title}" placeholder="Class Title" required>
                <textarea name="description" placeholder="Class Description" rows="3">${classData.description || ''}</textarea>
                <input type="datetime-local" name="startTime" value="${startTimeStr}" required>
                <input type="number" name="duration" value="${classData.duration || 60}" placeholder="Duration (minutes)" min="30" max="180" required>
                <div class="form-actions">
                    <button type="button" onclick="document.getElementById('editClassModal').remove()" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

async function handleEditClass(event, classId) {
    event.preventDefault();
    showLoading(true);

    const formData = new FormData(event.target);

    try {
        await FirebaseDB.updateDoc('liveClasses', classId, {
            title: formData.get('title'),
            description: formData.get('description'),
            startTime: firebase.firestore.Timestamp.fromDate(new Date(formData.get('startTime'))),
            duration: parseInt(formData.get('duration'))
        });

        showLoading(false);
        const editModal = document.getElementById('editClassModal');
        if (editModal) editModal.remove();
        showNotification('Class updated successfully!', 'success');
        renderTeacherDashboard();
    } catch (error) {
        showLoading(false);
        showNotification('Failed to update class: ' + error.message, 'error');
    }
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

// ---- Edit Course Page with Lesson Management ----

async function renderEditCoursePage(courseId) {
    const content = document.getElementById('main-content');
    showLoading(true);

    const course = await FirebaseDB.getDoc('courses', courseId);
    showLoading(false);

    if (!course) {
        showNotification('Course not found', 'error');
        window.location.hash = 'teacher-dashboard';
        return;
    }

    const lessons = course.lessons || [];

    content.innerHTML = `
        <div class="edit-course-page animate-up">
            <button onclick="window.location.hash='teacher-dashboard'" style="background: none; border: none; color: var(--primary); cursor: pointer; font-size: 1rem; margin-bottom: 1rem;">
                ← Back to Dashboard
            </button>

            <div class="page-header">
                <h1>Edit Course: ${course.title}</h1>
                <p>Manage course details and lessons</p>
            </div>

            <!-- Course Details -->
            <div class="card" style="padding: 2rem; margin-bottom: 1.5rem;">
                <h3 style="margin-bottom: 1rem;">Course Details</h3>
                <form onsubmit="handleUpdateCourse(event, '${courseId}')">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.4rem; font-weight: 500;">Title</label>
                            <input type="text" name="title" value="${course.title}" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.4rem; font-weight: 500;">Price (₹)</label>
                            <input type="number" name="price" value="${course.price}" min="0" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 8px;">
                        </div>
                    </div>
                    <div style="margin-top: 1rem;">
                        <label style="display: block; margin-bottom: 0.4rem; font-weight: 500;">Description</label>
                        <textarea name="description" rows="4" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 8px; resize: vertical;">${course.description || ''}</textarea>
                    </div>
                    <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.4rem; font-weight: 500;">Category</label>
                            <select name="category" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 8px;">
                                ${['physics','chemistry','mathematics','biology','programming','ssc','banking','upsc','railways','other'].map(cat =>
                                    `<option value="${cat}" ${course.category === cat ? 'selected' : ''}>${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.4rem; font-weight: 500;">Status</label>
                            <select name="published" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 8px;">
                                <option value="false" ${!course.published ? 'selected' : ''}>Draft</option>
                                <option value="true" ${course.published ? 'selected' : ''}>Published</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary" style="margin-top: 1.5rem; padding: 0.7rem 2rem;">Save Changes</button>
                </form>
            </div>

            <!-- Lessons / Videos Section -->
            <div class="card" style="padding: 2rem; margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>Lessons & Videos</h3>
                    <button onclick="showAddLessonModal('${courseId}')" class="btn btn-primary" style="padding: 0.5rem 1.5rem;">+ Add Lesson</button>
                </div>

                ${lessons.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        ${lessons.map((lesson, index) => `
                            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-body); border-radius: 8px;">
                                <span style="background: var(--primary); color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0;">${index + 1}</span>
                                <div style="flex: 1;">
                                    <strong>${lesson.title}</strong>
                                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">${lesson.duration || '10 min'} ${lesson.free ? '• Free Preview' : ''}</p>
                                </div>
                                <button onclick="removeLesson('${courseId}', ${index})" style="background: none; border: none; color: var(--error); cursor: pointer; font-size: 1.2rem;" title="Remove">🗑️</button>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No lessons yet. Add your first lesson!</p>'}
            </div>
        </div>
    `;
}

async function handleUpdateCourse(event, courseId) {
    event.preventDefault();
    showLoading(true);

    const formData = new FormData(event.target);

    try {
        await FirebaseDB.updateDoc('courses', courseId, {
            title: formData.get('title'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            category: formData.get('category'),
            published: formData.get('published') === 'true'
        });

        showLoading(false);
        showNotification('Course updated successfully!', 'success');
    } catch (error) {
        showLoading(false);
        showNotification('Failed to update course: ' + error.message, 'error');
    }
}

function showAddLessonModal(courseId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.id = 'addLessonModal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="document.getElementById('addLessonModal').remove()">&times;</span>
            <h2>Add Lesson</h2>
            <form onsubmit="handleAddLesson(event, '${courseId}')">
                <input type="text" name="title" placeholder="Lesson Title" required>
                <textarea name="description" placeholder="Lesson Description (optional)" rows="3"></textarea>
                <input type="text" name="duration" placeholder="Duration (e.g., 15 min)" required>

                <label style="display: block; margin-top: 1rem; margin-bottom: 0.4rem; font-weight: 500;">Upload Video</label>
                <input type="file" name="video" accept="video/*">
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.3rem;">Or provide an external video URL:</p>
                <input type="url" name="videoUrl" placeholder="https://youtube.com/watch?v=...">

                <div style="margin-top: 1rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="checkbox" name="free" value="true">
                        <span>Free Preview (accessible without enrollment)</span>
                    </label>
                </div>

                <div class="form-actions">
                    <button type="button" onclick="document.getElementById('addLessonModal').remove()" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary">Add Lesson</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

async function handleAddLesson(event, courseId) {
    event.preventDefault();
    showLoading(true);

    const formData = new FormData(event.target);
    const videoFile = formData.get('video');
    const videoUrl = formData.get('videoUrl');

    try {
        let videoSrc = videoUrl || '';

        // Upload video file if provided
        if (videoFile && videoFile.size > 0) {
            videoSrc = await FirebaseStorage.uploadFile(
                `courses/${courseId}/videos/${Date.now()}_${videoFile.name}`,
                videoFile,
                (progress) => console.log('Video upload:', progress + '%')
            );
        }

        const course = await FirebaseDB.getDoc('courses', courseId);
        const lessons = course.lessons || [];

        lessons.push({
            title: formData.get('title'),
            description: formData.get('description'),
            duration: formData.get('duration'),
            videoUrl: videoSrc,
            free: formData.get('free') === 'true',
            order: lessons.length
        });

        await FirebaseDB.updateDoc('courses', courseId, {
            lessons: lessons,
            lessonCount: lessons.length
        });

        showLoading(false);
        const addModal = document.getElementById('addLessonModal');
        if (addModal) addModal.remove();
        showNotification('Lesson added successfully!', 'success');
        renderEditCoursePage(courseId);
    } catch (error) {
        showLoading(false);
        showNotification('Failed to add lesson: ' + error.message, 'error');
    }
}

async function removeLesson(courseId, lessonIndex) {
    if (!confirm('Remove this lesson?')) return;

    showLoading(true);
    try {
        const course = await FirebaseDB.getDoc('courses', courseId);
        const lessons = course.lessons || [];
        lessons.splice(lessonIndex, 1);

        await FirebaseDB.updateDoc('courses', courseId, {
            lessons: lessons,
            lessonCount: lessons.length
        });

        showLoading(false);
        showNotification('Lesson removed', 'success');
        renderEditCoursePage(courseId);
    } catch (error) {
        showLoading(false);
        showNotification('Failed to remove lesson: ' + error.message, 'error');
    }
}

// ---- Test Creation for Teachers ----

function showCreateTestModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.id = 'createTestModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close" onclick="document.getElementById('createTestModal').remove()">&times;</span>
            <h2>Create Mock Test</h2>
            <form onsubmit="handleCreateTest(event)">
                <input type="text" name="title" placeholder="Test Title (e.g., SSC CGL Mock Test 1)" required>
                <textarea name="description" placeholder="Test Description" rows="2"></textarea>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.4rem; font-weight: 500;">Category</label>
                        <select name="category" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 8px;">
                            <option value="">Select Category</option>
                            <option value="physics">Physics</option>
                            <option value="chemistry">Chemistry</option>
                            <option value="mathematics">Mathematics</option>
                            <option value="biology">Biology</option>
                            <option value="ssc">SSC</option>
                            <option value="banking">Banking</option>
                            <option value="upsc">UPSC</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.4rem; font-weight: 500;">Difficulty</label>
                        <select name="difficulty" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 8px;">
                            <option value="Easy">Easy</option>
                            <option value="Medium" selected>Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.4rem; font-weight: 500;">Duration (minutes)</label>
                        <input type="number" name="duration" value="60" min="10" max="180" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 8px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.4rem; font-weight: 500;">Marks per question</label>
                        <input type="number" name="marksPerQuestion" value="1" min="1" max="10" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 8px;">
                    </div>
                </div>

                <div style="margin-top: 1rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="checkbox" name="negativeMarking" value="true">
                        <span>Enable negative marking (25% deduction for wrong answers)</span>
                    </label>
                </div>

                <h3 style="margin-top: 1.5rem; margin-bottom: 0.5rem;">Questions</h3>
                <div id="questionsContainer">
                    <!-- Questions will be added here -->
                </div>
                <button type="button" onclick="addQuestionField()" style="margin-top: 0.5rem; background: none; border: 2px dashed var(--border); color: var(--primary); padding: 0.7rem; width: 100%; border-radius: 8px; cursor: pointer; font-weight: 500;">
                    + Add Question
                </button>

                <div class="form-actions" style="margin-top: 1.5rem;">
                    <button type="button" onclick="document.getElementById('createTestModal').remove()" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary">Create Test</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Add first question automatically
    addQuestionField();
}

let questionCount = 0;

function addQuestionField() {
    const container = document.getElementById('questionsContainer');
    const idx = questionCount++;

    const div = document.createElement('div');
    div.style.cssText = 'background: var(--bg-body); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; position: relative;';
    div.id = `question_block_${idx}`;
    div.innerHTML = `
        <button type="button" onclick="document.getElementById('question_block_${idx}').remove()" style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: none; color: var(--error); cursor: pointer; font-size: 1.1rem;">&times;</button>
        <strong style="display: block; margin-bottom: 0.5rem;">Question ${idx + 1}</strong>
        <input type="text" name="q_${idx}_text" placeholder="Question text" required style="width: 100%; padding: 0.5rem; border: 1px solid var(--border); border-radius: 4px; margin-bottom: 0.5rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <input type="text" name="q_${idx}_opt_0" placeholder="Option A" required style="padding: 0.5rem; border: 1px solid var(--border); border-radius: 4px;">
            <input type="text" name="q_${idx}_opt_1" placeholder="Option B" required style="padding: 0.5rem; border: 1px solid var(--border); border-radius: 4px;">
            <input type="text" name="q_${idx}_opt_2" placeholder="Option C" required style="padding: 0.5rem; border: 1px solid var(--border); border-radius: 4px;">
            <input type="text" name="q_${idx}_opt_3" placeholder="Option D" required style="padding: 0.5rem; border: 1px solid var(--border); border-radius: 4px;">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
            <select name="q_${idx}_answer" required style="padding: 0.5rem; border: 1px solid var(--border); border-radius: 4px;">
                <option value="">Correct Answer</option>
                <option value="0">Option A</option>
                <option value="1">Option B</option>
                <option value="2">Option C</option>
                <option value="3">Option D</option>
            </select>
            <input type="text" name="q_${idx}_explanation" placeholder="Explanation (optional)" style="padding: 0.5rem; border: 1px solid var(--border); border-radius: 4px;">
        </div>
    `;
    container.appendChild(div);
}

async function handleCreateTest(event) {
    event.preventDefault();
    showLoading(true);

    const formData = new FormData(event.target);
    const marksPerQ = parseInt(formData.get('marksPerQuestion'));

    // Parse questions from form
    const questions = [];
    for (let i = 0; i < questionCount; i++) {
        const qText = formData.get(`q_${i}_text`);
        if (!qText) continue; // skip removed questions

        const options = [
            formData.get(`q_${i}_opt_0`),
            formData.get(`q_${i}_opt_1`),
            formData.get(`q_${i}_opt_2`),
            formData.get(`q_${i}_opt_3`)
        ];
        const answerIdx = parseInt(formData.get(`q_${i}_answer`));

        questions.push({
            question: qText,
            type: 'mcq',
            options: options,
            correctAnswer: options[answerIdx],
            explanation: formData.get(`q_${i}_explanation`) || '',
            marks: marksPerQ
        });
    }

    if (questions.length === 0) {
        showLoading(false);
        showNotification('Please add at least one question', 'error');
        return;
    }

    try {
        await FirebaseDB.addDoc('tests', {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            difficulty: formData.get('difficulty'),
            duration: parseInt(formData.get('duration')),
            marksPerQuestion: marksPerQ,
            negativeMarking: formData.get('negativeMarking') === 'true',
            questionCount: questions.length,
            totalMarks: questions.length * marksPerQ,
            questions: questions,
            teacherId: AppState.currentUser.uid,
            teacherName: AppState.currentUser.displayName
        });

        showLoading(false);
        const testModal = document.getElementById('createTestModal');
        if (testModal) testModal.remove();
        questionCount = 0;
        showNotification('Test created successfully!', 'success');
        renderTeacherDashboard();
    } catch (error) {
        showLoading(false);
        showNotification('Failed to create test: ' + error.message, 'error');
    }
}
