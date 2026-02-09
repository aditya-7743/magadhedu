// Courses Management System

async function renderCoursesPage() {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
        <div class="courses-page">
            <!-- Page Header -->
            <div class="page-header">
                <h1>Explore Courses</h1>
                <p>Choose from our wide range of courses</p>
            </div>

            <!-- Search and Filters -->
            <div class="search-filter-section">
                <div class="search-box">
                    <input type="text" id="courseSearch" placeholder="Search courses..." 
                           oninput="filterCourses()">
                    <button onclick="filterCourses()">🔍</button>
                </div>

                <div class="filters">
                    <select id="categoryFilter" onchange="filterCourses()">
                        <option value="">All Categories</option>
                        <option value="physics">Physics</option>
                        <option value="chemistry">Chemistry</option>
                        <option value="mathematics">Mathematics</option>
                        <option value="biology">Biology</option>
                        <option value="programming">Programming</option>
                        <option value="other">Other</option>
                    </select>

                    <select id="priceFilter" onchange="filterCourses()">
                        <option value="">All Prices</option>
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                    </select>

                    <select id="sortFilter" onchange="filterCourses()">
                        <option value="latest">Latest</option>
                        <option value="popular">Most Popular</option>
                        <option value="rating">Highest Rated</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                    </select>
                </div>
            </div>

            <!-- Loading State -->
            <div id="coursesLoading" class="loading" style="display: none;">
                Loading courses...
            </div>

            <!-- Courses Grid -->
            <div id="coursesGrid" class="courses-grid">
                <!-- Will be populated by loadAllCourses() -->
            </div>

            <!-- Empty State -->
            <div id="emptyState" class="empty-state" style="display: none;">
                <h3>No courses found</h3>
                <p>Try adjusting your filters</p>
            </div>
        </div>
    `;
    
    loadAllCourses();
}

let allCourses = [];

async function loadAllCourses() {
    const grid = document.getElementById('coursesGrid');
    const loading = document.getElementById('coursesLoading');
    const emptyState = document.getElementById('emptyState');
    
    loading.style.display = 'block';
    grid.innerHTML = '';
    
    try {
        allCourses = await FirebaseDB.getCollection('courses', {
            field: 'published',
            operator: '==',
            value: true
        });
        
        loading.style.display = 'none';
        
        if (allCourses.length === 0) {
            emptyState.style.display = 'block';
        } else {
            displayCourses(allCourses);
        }
    } catch (error) {
        loading.style.display = 'none';
        showNotification('Failed to load courses', 'error');
    }
}

function displayCourses(courses) {
    const grid = document.getElementById('coursesGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (courses.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    grid.innerHTML = courses.map(course => `
        <div class="course-card" onclick="viewCourseDetails('${course.id}')">
            <div class="course-thumbnail">
                <img src="${course.thumbnail || 'https://via.placeholder.com/300x180'}" 
                     alt="${course.title}" 
                     loading="lazy">
                ${course.price === 0 ? '<span class="free-badge">FREE</span>' : ''}
            </div>
            
            <div class="course-content">
                <div class="course-category">${course.category || 'General'}</div>
                <h3 class="course-title">${course.title}</h3>
                <p class="course-description">${truncateText(course.description, 80)}</p>
                
                <div class="course-teacher">
                    <span>👨‍🏫 ${course.teacherName}</span>
                </div>
                
                <div class="course-meta">
                    <span class="rating">⭐ ${course.rating || 'New'}</span>
                    <span class="students">👥 ${course.enrolledCount || 0}</span>
                    <span class="lessons">📚 ${course.lessonCount || 0} lessons</span>
                </div>
                
                <div class="course-footer">
                    <div class="course-price">
                        ${course.price > 0 ? `₹${course.price}` : 'FREE'}
                    </div>
                    <button class="btn-enroll" onclick="event.stopPropagation(); enrollCourse('${course.id}')">
                        ${isEnrolled(course.id) ? 'Go to Course' : 'Enroll Now'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterCourses() {
    const searchTerm = document.getElementById('courseSearch').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    const sortBy = document.getElementById('sortFilter').value;
    
    let filtered = [...allCourses];
    
    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(course => 
            course.title.toLowerCase().includes(searchTerm) ||
            course.description.toLowerCase().includes(searchTerm) ||
            course.teacherName.toLowerCase().includes(searchTerm)
        );
    }
    
    // Category filter
    if (category) {
        filtered = filtered.filter(course => course.category === category);
    }
    
    // Price filter
    if (priceFilter === 'free') {
        filtered = filtered.filter(course => course.price === 0);
    } else if (priceFilter === 'paid') {
        filtered = filtered.filter(course => course.price > 0);
    }
    
    // Sort
    filtered.sort((a, b) => {
        switch(sortBy) {
            case 'popular':
                return (b.enrolledCount || 0) - (a.enrolledCount || 0);
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'latest':
            default:
                return b.createdAt - a.createdAt;
        }
    });
    
    displayCourses(filtered);
}

function isEnrolled(courseId) {
    return AppState.enrolledCourses.some(c => c.id === courseId);
}

async function viewCourseDetails(courseId) {
    const content = document.getElementById('main-content');
    showLoading(true);
    
    const course = await FirebaseDB.getDoc('courses', courseId);
    const teacher = await FirebaseDB.getDoc('users', course.teacherId);
    const reviews = await FirebaseDB.getCollection('reviews', {
        field: 'courseId',
        operator: '==',
        value: courseId
    });
    
    showLoading(false);
    
    if (!course) {
        showNotification('Course not found', 'error');
        return;
    }
    
    const isEnrolledInCourse = isEnrolled(courseId);
    
    content.innerHTML = `
        <div class="course-detail-page">
            <!-- Back Button -->
            <button onclick="window.location.hash='courses'" class="btn-back">
                ← Back to Courses
            </button>

            <!-- Course Header -->
            <div class="course-header">
                <div class="course-header-content">
                    <div class="course-category-badge">${course.category}</div>
                    <h1>${course.title}</h1>
                    <p class="course-subtitle">${course.description}</p>
                    
                    <div class="course-stats">
                        <span>⭐ ${course.rating || 'New'} ${course.ratingCount ? `(${course.ratingCount} ratings)` : ''}</span>
                        <span>👥 ${course.enrolledCount || 0} students enrolled</span>
                        <span>📚 ${course.lessonCount || 0} lessons</span>
                        <span>⏱️ ${course.duration || 'Self-paced'}</span>
                    </div>

                    <div class="teacher-info">
                        <img src="${teacher?.photoURL || 'https://via.placeholder.com/50'}" alt="${course.teacherName}">
                        <div>
                            <p class="teacher-label">Instructor</p>
                            <h4>${course.teacherName}</h4>
                        </div>
                    </div>
                </div>

                <div class="course-sidebar">
                    <div class="course-thumbnail-large">
                        <img src="${course.thumbnail}" alt="${course.title}">
                    </div>
                    
                    <div class="price-section">
                        <div class="price">
                            ${course.price > 0 ? `₹${course.price}` : 'FREE'}
                        </div>
                        
                        ${isEnrolledInCourse ? `
                            <button onclick="window.location.hash='course/${courseId}'" class="btn-primary btn-large">
                                Go to Course
                            </button>
                        ` : `
                            <button onclick="enrollCourse('${courseId}')" class="btn-primary btn-large">
                                Enroll Now
                            </button>
                        `}
                    </div>

                    <div class="course-includes">
                        <h4>This course includes:</h4>
                        <ul>
                            <li>✅ ${course.lessonCount || 0} video lectures</li>
                            <li>✅ Downloadable resources</li>
                            <li>✅ Live doubt sessions</li>
                            <li>✅ Mock tests</li>
                            <li>✅ Certificate of completion</li>
                            <li>✅ Lifetime access</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Course Content -->
            <div class="course-body">
                <!-- What You'll Learn -->
                <section class="course-section">
                    <h2>What you'll learn</h2>
                    <div class="learning-outcomes">
                        ${(course.learningOutcomes || [
                            'Comprehensive understanding of core concepts',
                            'Practical skills through hands-on projects',
                            'Problem-solving techniques',
                            'Exam preparation strategies'
                        ]).map(outcome => `
                            <div class="outcome-item">
                                ✓ ${outcome}
                            </div>
                        `).join('')}
                    </div>
                </section>

                <!-- Course Curriculum -->
                <section class="course-section">
                    <h2>Course Curriculum</h2>
                    <div class="curriculum">
                        ${renderCurriculum(course.lessons || [])}
                    </div>
                </section>

                <!-- Requirements -->
                <section class="course-section">
                    <h2>Requirements</h2>
                    <ul class="requirements-list">
                        ${(course.requirements || [
                            'Basic understanding of the subject',
                            'Enthusiasm to learn',
                            'Computer with internet connection'
                        ]).map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </section>

                <!-- Description -->
                <section class="course-section">
                    <h2>Description</h2>
                    <div class="course-description-full">
                        ${course.fullDescription || course.description}
                    </div>
                </section>

                <!-- Reviews -->
                <section class="course-section">
                    <h2>Student Reviews (${reviews.length})</h2>
                    <div class="reviews-section">
                        ${reviews.length > 0 ? reviews.map(review => `
                            <div class="review-card">
                                <div class="review-header">
                                    <img src="${review.studentPhoto}" alt="${review.studentName}">
                                    <div>
                                        <h4>${review.studentName}</h4>
                                        <div class="rating">${'⭐'.repeat(review.rating)}</div>
                                        <p class="review-date">${formatDate(review.createdAt)}</p>
                                    </div>
                                </div>
                                <p class="review-text">${review.comment}</p>
                            </div>
                        `).join('') : '<p class="no-reviews">No reviews yet. Be the first to review!</p>'}
                    </div>
                </section>
            </div>
        </div>
    `;
}

function renderCurriculum(lessons) {
    if (!lessons || lessons.length === 0) {
        return '<p class="no-content">Curriculum will be added soon</p>';
    }
    
    return lessons.map((lesson, index) => `
        <div class="curriculum-item">
            <div class="lesson-number">${index + 1}</div>
            <div class="lesson-info">
                <h4>${lesson.title}</h4>
                <p>${lesson.description || ''}</p>
            </div>
            <div class="lesson-meta">
                <span>${lesson.duration || '10 min'}</span>
                ${lesson.free ? '<span class="preview-badge">Preview</span>' : ''}
            </div>
        </div>
    `).join('');
}

async function enrollCourse(courseId) {
    if (!AppState.currentUser) {
        showNotification('Please login to enroll', 'error');
        window.location.hash = 'login';
        return;
    }
    
    // Check if already enrolled
    if (isEnrolled(courseId)) {
        window.location.hash = `course/${courseId}`;
        return;
    }
    
    const course = await FirebaseDB.getDoc('courses', courseId);
    
    // If course is paid, process payment
    if (course.price > 0) {
        processPayment(course, async () => {
            await completeEnrollment(courseId);
        });
    } else {
        await completeEnrollment(courseId);
    }
}

async function completeEnrollment(courseId) {
    showLoading(true);
    
    try {
        // Create enrollment
        await FirebaseDB.addDoc('enrollments', {
            studentId: AppState.currentUser.uid,
            courseId: courseId,
            progress: 0,
            enrolledAt: new Date(),
            completedLessons: []
        });
        
        // Update course enrolled count
        const course = await FirebaseDB.getDoc('courses', courseId);
        await FirebaseDB.updateDoc('courses', courseId, {
            enrolledCount: (course.enrolledCount || 0) + 1
        });
        
        showLoading(false);
        showNotification('Enrolled successfully!', 'success');
        
        // Refresh enrolled courses
        await fetchEnrolledCourses();
        
        // Redirect to course page
        window.location.hash = `course/${courseId}`;
        
    } catch (error) {
        showLoading(false);
        showNotification('Enrollment failed: ' + error.message, 'error');
    }
}

function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
