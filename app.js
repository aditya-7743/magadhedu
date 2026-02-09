// Core Application Logic
const AppState = {
    currentUser: null,
    userRole: null, // 'student', 'teacher', 'admin'
    enrolledCourses: [],
    currentView: 'home'
};

// Initialize Application
function initApp() {
    // Check Authentication State
    initAuth();

    // Handle Navigation
    window.addEventListener('hashchange', handleRoute);

    // Initial Route
    handleRoute();
}

// Router
function handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    const content = document.getElementById('main-content');

    // Update AppState
    AppState.currentView = hash;

    // Hide all sections first (if any manual toggling is needed, though we primarily replace innerHTML)

    // Route handler
    if (hash === 'home') {
        renderHomePage();
    } else if (hash === 'login') {
        content.innerHTML = renderLoginPage();
    } else if (hash === 'student-dashboard') {
        // Auth check before rendering
        if (AppState.currentUser) {
            renderStudentDashboard();
        } else {
            window.location.hash = 'login';
        }
    } else if (hash === 'teacher-dashboard') {
        if (AppState.currentUser) {  // Ideally check for teacher role too
            renderTeacherDashboard();
        } else {
            window.location.hash = 'login';
        }
    } else if (hash === 'courses') {
        renderCoursesPage();
    } else if (hash.startsWith('course/')) {
        const courseId = hash.split('/')[1];
        viewCourseDetails(courseId);
    } else if (hash === 'live-classes') {
        if (AppState.currentUser) {
            // Check if function exists before calling
            if (typeof renderLiveClassesPage === 'function') {
                renderLiveClassesPage();
            } else {
                content.innerHTML = '<h2>Live Classes Module Loading...</h2>';
            }
        } else {
            window.location.hash = 'login';
        }
    } else if (hash.startsWith('live-class/')) {
        const classId = hash.split('/')[1];
        if (AppState.currentUser) {
            if (typeof joinLiveClassSession === 'function') {
                joinLiveClassSession(classId);
            } else {
                content.innerHTML = '<h2>Live Class Session Loading...</h2>';
            }
        } else {
            window.location.hash = 'login';
        }
    } else if (hash === 'mock-tests') {
        if (AppState.currentUser) {
            if (typeof renderMockTestsPage === 'function') {
                renderMockTestsPage();
            } else {
                content.innerHTML = '<h2>Mock Tests Module Loading...</h2>';
            }
        } else {
            window.location.hash = 'login';
        }
    } else if (hash.startsWith('take-test/')) {
        const testId = hash.split('/')[1];
        if (AppState.currentUser) {
            if (typeof startMockTest === 'function') {
                startMockTest(testId);
            } else {
                content.innerHTML = '<h2>Mock Test Loading...</h2>';
            }
        } else {
            window.location.hash = 'login';
        }
    } else if (hash === 'certificates') {
        if (AppState.currentUser) {
            if (typeof renderCertificatesPage === 'function') {
                renderCertificatesPage();
            } else {
                content.innerHTML = '<h2>Certificates Module Loading...</h2>';
            }
        } else {
            window.location.hash = 'login';
        }
    } else {
        // Default to home if route not found
        renderHomePage();
    }

    // Update Navbar active state
    updateNavbarActiveState(hash);
    renderNavbar(); // Re-render navbar to update active states etc.
}

// Navigation Bar
function renderNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let links = '';

    if (!AppState.currentUser) {
        // Guest Links
        links = `
            <li><a href="#home">Home</a></li>
            <li><a href="#courses">Courses</a></li>
            <li><a href="#login" class="btn-login">Login / Sign Up</a></li>
        `;
    } else if (AppState.userRole === 'student') {
        // Student Links
        links = `
            <li><a href="#student-dashboard">Dashboard</a></li>
            <li><a href="#courses">Courses</a></li>
            <li><a href="#live-classes">Live Classes</a></li>
            <li><a href="#mock-tests">Mock Tests</a></li>
        `;
    } else if (AppState.userRole === 'teacher') {
        // Teacher Links
        links = `
            <li><a href="#teacher-dashboard">Dashboard</a></li>
            <li><a href="#courses">My Courses</a></li> 
            <li><a href="#live-classes">Schedule</a></li>
        `;
    }

    // User Profile Section
    const userSection = AppState.currentUser ? `
        <div class="user-info">
            <span>${AppState.currentUser.displayName || 'User'}</span>
            <img src="${AppState.currentUser.photoURL || 'https://via.placeholder.com/40'}" 
                 alt="Profile" class="nav-profile-pic" onclick="toggleUserMenu()" style="border-radius: 50%; width: 40px; height: 40px; cursor: pointer;">
            <button onclick="handleLogout()" class="btn-logout" style="margin-left: 10px; padding: 5px 10px; background: #d50000; color: white; border: none; border-radius: 4px; cursor: pointer;">Logout</button>
        </div>
    ` : '';

    navbar.innerHTML = `
        <div class="navbar-content">
            <div class="logo">
                <span class="logo-icon">📚</span>
                <a href="#home" style="color: white; text-decoration: none;">VIDYARTHI</a>
            </div>
            
            <ul class="nav-links">
                ${links}
            </ul>
            
            ${userSection}
        </div>
    `;

    // Update active state after rendering
    const hash = window.location.hash.slice(1) || 'home';
    updateNavbarActiveState(hash);
}

function updateNavbarActiveState(hash) {
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === '#' + hash) {
            link.style.color = 'var(--accent, #ffd600)';
            link.style.fontWeight = 'bold';
        } else {
            link.style.color = 'var(--white, #ffffff)';
            link.style.fontWeight = 'normal';
        }
    });
}

function renderHomePage() {
    const content = document.getElementById('main-content');
    if (!content) return;

    // Check if user is logged in
    const isLoggedIn = AppState.currentUser !== null;

    content.innerHTML = `
        <!-- Hero Carousel Section -->
        <div class="hero-carousel animate-up">
            <div class="carousel-slide active" style="background-image: url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80');">
            </div>
            <div class="carousel-content">
                <h2>India's Most Trusted<br><span style="color: var(--secondary);">Learning Platform</span></h2>
                <p>Start your journey to success with the best educators for SSC, Banking, and UPSC.</p>
                <div class="flex" style="margin-top: 2rem;">
                    <button onclick="window.location.hash='courses'" class="btn btn-primary" style="padding: 1rem 2.5rem; font-size: 1.1rem;">
                        Get Started <i class="fas fa-arrow-right"></i>
                    </button>
                    ${!isLoggedIn ? `
                    <button onclick="window.location.hash='login'" class="btn btn-secondary" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4);">
                        Login / Sign Up
                    </button>` : ''}
                </div>
            </div>
        </div>

        <!-- Category Tabs -->
        <div class="category-tabs animate-up delay-100">
            <div class="tab-pill active"><i class="fas fa-star" style="margin-right:0.5rem"></i> Popular</div>
            <div class="tab-pill">SSC CGL</div>
            <div class="tab-pill">Banking PO</div>
            <div class="tab-pill">UPSC CSE</div>
            <div class="tab-pill">Railways</div>
            <div class="tab-pill">Teaching</div>
            <div class="tab-pill">Defence</div>
            <div class="tab-pill">State Exams</div>
        </div>

        <!-- Live Batches (Horizontal Scroll) -->
        <section class="section">
            <div class="section-header animate-up delay-200" style="margin-bottom: 1.5rem;">
                <div class="section-title">
                    <div class="flex-center" style="justify-content: flex-start;">
                        <span class="live-indicator"></span>
                        <h2 style="font-size: 1.8rem; margin: 0;">Live Batches</h2>
                    </div>
                    <p>Join ongoing classes and interact with teachers</p>
                </div>
                <a href="#live-classes" class="btn btn-secondary" style="border-radius: 50px;">View All</a>
            </div>

            <div class="horizontal-scroll animate-up delay-300">
                <!-- Card 1 -->
                <div class="card" style="width: 320px;">
                    <div class="course-thumbnail">
                        <span class="badge badge-live course-badge">LIVE</span>
                        <img src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="SSC CGL">
                    </div>
                    <div class="course-content">
                        <div class="course-meta">
                            <span><i class="fas fa-book-reader"></i> Math Special</span>
                            <span><i class="fas fa-clock"></i> 10:00 AM</span>
                        </div>
                        <h3 class="course-title">SSC CGL 2026 Foundation Batch (Pre + Mains)</h3>
                        <div class="flex-between" style="margin-top: auto; padding-top: 1rem;">
                            <div class="price-block">
                                <span class="price-new">₹999</span>
                                <span class="price-old">₹2999</span>
                            </div>
                            <button class="btn btn-primary" style="padding: 0.5rem 1rem;">Join Now</button>
                        </div>
                    </div>
                </div>

                <!-- Card 2 -->
                <div class="card" style="width: 320px;">
                    <div class="course-thumbnail">
                        <span class="badge badge-live course-badge">LIVE</span>
                        <img src="https://images.unsplash.com/photo-1550592704-6c76defa9985?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Banking">
                    </div>
                    <div class="course-content">
                        <div class="course-meta">
                            <span><i class="fas fa-chart-line"></i> Reasoning</span>
                            <span><i class="fas fa-clock"></i> 11:30 AM</span>
                        </div>
                        <h3 class="course-title">IBPS PO Target Batch 2026</h3>
                        <div class="flex-between" style="margin-top: auto; padding-top: 1rem;">
                            <div class="price-block">
                                <span class="price-new">₹1299</span>
                                <span class="price-old">₹3999</span>
                            </div>
                            <button class="btn btn-primary" style="padding: 0.5rem 1rem;">Join Now</button>
                        </div>
                    </div>
                </div>

                <!-- Card 3 -->
                <div class="card" style="width: 320px;">
                    <div class="course-thumbnail">
                        <span class="badge badge-new course-badge">New</span>
                        <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="UPSC">
                    </div>
                    <div class="course-content">
                        <div class="course-meta">
                            <span><i class="fas fa-globe"></i> General Studies</span>
                            <span><i class="fas fa-calendar"></i> Starts 15 Feb</span>
                        </div>
                        <h3 class="course-title">UPSC CSE GS Foundation 2027</h3>
                        <div class="flex-between" style="margin-top: auto; padding-top: 1rem;">
                            <div class="price-block">
                                <span class="price-new">₹4999</span>
                                <span class="price-old">₹19999</span>
                            </div>
                            <button class="btn btn-secondary" style="padding: 0.5rem 1rem;">Enroll</button>
                        </div>
                    </div>
                </div>
                 <!-- Card 4 -->
                <div class="card" style="width: 320px;">
                    <div class="course-thumbnail">
                        <span class="badge badge-premium course-badge">Bestseller</span>
                        <img src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="English">
                    </div>
                    <div class="course-content">
                        <div class="course-meta">
                            <span><i class="fas fa-language"></i> English</span>
                            <span><i class="fas fa-video"></i> VOD</span>
                        </div>
                        <h3 class="course-title">English Special by Neetu Mam Style</h3>
                        <div class="flex-between" style="margin-top: auto; padding-top: 1rem;">
                            <div class="price-block">
                                <span class="price-new">₹799</span>
                                <span class="price-old">₹1999</span>
                            </div>
                            <button class="btn btn-secondary" style="padding: 0.5rem 1rem;">Buy Now</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Provide Teachers / Faculty Section -->
        <section class="section" style="background: #f8f9fa;">
            <div class="section-header text-center" style="display: block; text-align: center; max-width: 700px; margin: 0 auto 3rem;">
                <h2 style="font-size: 2.2rem; margin-bottom: 0.5rem;">Study with India's Best Educators</h2>
                <p style="color: var(--text-muted);">Learn from the masters of their subjects who have mentored millions of students.</p>
            </div>

            <div class="faculty-grid">
                <div class="faculty-card">
                    <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Teacher" class="faculty-img">
                    <h4 class="faculty-name">Aditya Sir</h4>
                    <p class="faculty-subject">Maths Wizard</p>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">10+ Years Exp.</p>
                </div>
                <div class="faculty-card">
                    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Teacher" class="faculty-img">
                    <h4 class="faculty-name">Priya Ma'am</h4>
                    <p class="faculty-subject">English Dept.</p>
                     <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">Ex-Bank PO</p>
                </div>
                <div class="faculty-card">
                    <img src="https://randomuser.me/api/portraits/men/86.jpg" alt="Teacher" class="faculty-img">
                    <h4 class="faculty-name">Dr. Sharma</h4>
                    <p class="faculty-subject">General Science</p>
                     <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">Ph.D Physics</p>
                </div>
                <div class="faculty-card">
                    <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Teacher" class="faculty-img">
                    <h4 class="faculty-name">Neha Gupta</h4>
                    <p class="faculty-subject">Current Affairs</p>
                     <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">UPSC Interview</p>
                </div>
            </div>
        </section>

        <!-- App Download CTA -->
        <section class="section">
            <div class="app-download-section">
                <div class="app-content">
                    <h2>Start Learning Anywhere, Anytime</h2>
                    <p>Download the Vidyarthi App for a seamless learning experience. Watch videos offline, attempt tests, and get instant notifications.</p>
                    
                    <div class="store-badges">
                        <div style="background: black; color: white; border-radius: 8px; padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <i class="fab fa-google-play" style="font-size: 1.5rem;"></i>
                            <div style="text-align: left; line-height: 1.2;">
                                <span style="font-size: 0.7rem; display: block;">GET IT ON</span>
                                <span style="font-weight: 600; font-size: 1rem;">Google Play</span>
                            </div>
                        </div>
                        <div style="background: black; color: white; border-radius: 8px; padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <i class="fab fa-apple" style="font-size: 1.5rem;"></i>
                            <div style="text-align: left; line-height: 1.2;">
                                <span style="font-size: 0.7rem; display: block;">Download on the</span>
                                <span style="font-weight: 600; font-size: 1rem;">App Store</span>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Mockup Image here would go via CSS or an img tag -->
            </div>
        </section>
    `;
}

function renderLoginPage() {
    return `
        <div class="auth-container" style="display: flex; justify-content: center; align-items: center; min-height: 60vh;">
            <div class="auth-box" style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 100%; max-width: 400px;">
                <h2 style="text-align: center; margin-bottom: 1rem;">Welcome Back!</h2>
                
                <div id="login-form-container">
                    <form id="login-form" onsubmit="handleEmailLogin(event)">
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem;">Email</label>
                            <input type="email" id="login-email" required style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem;">Password</label>
                            <input type="password" id="login-password" required style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%; padding: 0.8rem; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer;">Login</button>
                    </form>
                     <p style="text-align: center; margin-top: 1rem;">
                        Don't have an account? <a href="#" onclick="showSignupFormWrapper(event)">Sign Up</a>
                    </p>
                </div>

                <div id="signup-form-container" style="display: none;">
                     <form id="signup-form" onsubmit="handleEmailSignup(event)">
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem;">Full Name</label>
                            <input type="text" id="signup-name" required style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem;">Email</label>
                            <input type="email" id="signup-email" required style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem;">Password</label>
                            <input type="password" id="signup-password" required minlength="6" style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                         <div class="form-group" style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem;">Role</label>
                            <select id="signup-role" required style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                            </select>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%; padding: 0.8rem; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer;">Sign Up</button>
                    </form>
                     <p style="text-align: center; margin-top: 1rem;">
                        Already have an account? <a href="#" onclick="showLoginFormWrapper(event)">Login</a>
                    </p>
                </div>
            </div>
        </div>
    `;
}

function showSignupFormWrapper(e) {
    e.preventDefault();
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('signup-form-container').style.display = 'block';
}

function showLoginFormWrapper(e) {
    e.preventDefault();
    document.getElementById('login-form-container').style.display = 'block';
    document.getElementById('signup-form-container').style.display = 'none';
}

function toggleUserMenu() {
    // Simple toggle for logout button visibility if needed, or redirect to profile
    // For now, logout button is always visible in navbar
}
