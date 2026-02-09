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
        <!-- Hero Section -->
        <div class="hero-section">
            <div class="hero-grid">
                <div class="hero-text animate-up">
                    <span class="badge badge-premium mb-1">🚀 India's #1 Learning Platform</span>
                    <h1>Crack Your Dream Exam with <span style="color: var(--secondary);">Vidyarthi</span></h1>
                    <p class="animate-up delay-100">Live Classes, Test Series, and Personalized Guidance from Top Educators for UPSC, SSC, Banking, and more.</p>
                    
                    <div class="flex animate-up delay-200">
                        <button onclick="window.location.hash='courses'" class="btn btn-primary">
                            Explore Courses <i class="fas fa-arrow-right"></i>
                        </button>
                        ${!isLoggedIn ? `
                        <button onclick="window.location.hash='login'" class="btn btn-secondary">
                            Start for Free
                        </button>` : ''}
                    </div>

                    <div class="hero-stats animate-up delay-300">
                        <div class="hero-stat">
                            <h3>10M+</h3>
                            <span>Happy Students</span>
                        </div>
                        <div class="hero-stat">
                            <h3>500+</h3>
                            <span>Top Educators</span>
                        </div>
                        <div class="hero-stat">
                            <h3>5000+</h3>
                            <span>Selections</span>
                        </div>
                    </div>
                </div>
                <div class="hero-image float">
                    <!-- Placeholder for professional hero image -->
                    <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Student Learning">
                    
                    <!-- Floating Cards Animation -->
                    <div class="floating-card" style="position: absolute; top: 10%; left: -20px; animation: float 5s infinite reverse;">
                        <span class="badge badge-live">● LIVE</span>
                        <span style="font-weight: 600; font-size: 0.9rem; margin-left: 0.5rem; color: white;">SSC CGL Batch</span>
                    </div>
                    
                    <div class="floating-card" style="position: absolute; bottom: 10%; right: -20px; animation: float 7s infinite;">
                        <span class="badge badge-new">New</span>
                        <span style="font-weight: 600; font-size: 0.9rem; margin-left: 0.5rem; color: white;">UPSC Prelims 2026</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Exam Categories -->
        <section class="section">
            <div class="section-header animate-up">
                <div class="section-title">
                    <h2>Explore Categories</h2>
                    <p>Select your goal and start preparing</p>
                </div>
                <a href="#courses" class="btn btn-secondary">View All <i class="fas fa-chevron-right"></i></a>
            </div>

            <div class="category-grid">
                <div class="category-card animate-up delay-100" onclick="location.hash='courses'">
                    <i class="fas fa-landmark category-icon"></i>
                    <h3 style="color: white;">UPSC</h3>
                    <p style="color: var(--text-muted);">Result Oriented</p>
                </div>
                <div class="category-card animate-up delay-100" onclick="location.hash='courses'">
                    <i class="fas fa-briefcase category-icon"></i>
                    <h3 style="color: white;">Banking</h3>
                    <p style="color: var(--text-muted);">PO & Clerk</p>
                </div>
                <div class="category-card animate-up delay-200" onclick="location.hash='courses'">
                    <i class="fas fa-train category-icon"></i>
                    <h3 style="color: white;">Railways</h3>
                    <p style="color: var(--text-muted);">NTPC & Group D</p>
                </div>
                <div class="category-card animate-up delay-200" onclick="location.hash='courses'">
                    <i class="fas fa-graduation-cap category-icon"></i>
                    <h3 style="color: white;">SSC</h3>
                    <p style="color: var(--text-muted);">CGL & CHSL</p>
                </div>
                <div class="category-card animate-up delay-300" onclick="location.hash='courses'">
                    <i class="fas fa-code category-icon"></i>
                    <h3 style="color: white;">IT / Tech</h3>
                    <p style="color: var(--text-muted);">Coding & Dev</p>
                </div>
            </div>
        </section>

        <!-- Live Batches Feature -->
        <section class="section" style="background: #e8eaf6; border-radius: var(--radius-lg); padding: 3rem;">
            <div class="grid" style="grid-template-columns: 1fr 1fr; align-items: center; gap: 4rem;">
                <div class="animate-up">
                     <span class="badge badge-live mb-1">Live Now</span>
                    <h2>Interactive Live Classes</h2>
                    <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 2rem;">
                        Chat with teachers, ask doubts in real-time, and compete in live polls. Experience the classroom feel from home.
                    </p>
                    <ul class="grid" style="gap: 1rem; margin-bottom: 2rem;">
                        <li class="flex-center" style="justify-content: flex-start;">
                            <i class="fas fa-check-circle" style="color: var(--success);"></i> <span>Daily Live Classes</span>
                        </li>
                        <li class="flex-center" style="justify-content: flex-start;">
                            <i class="fas fa-check-circle" style="color: var(--success);"></i> <span>Live Doubt Solving</span>
                        </li>
                        <li class="flex-center" style="justify-content: flex-start;">
                            <i class="fas fa-check-circle" style="color: var(--success);"></i> <span>Class Notes PDF</span>
                        </li>
                    </ul>
                    <button onclick="window.location.hash='live-classes'" class="btn btn-primary">
                        Join Live Classes
                    </button>
                </div>
                <!-- Removed 'float' class to be more subtle, kept inline style for image only -->
                <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Live Class" style="border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);">
            </div>
        </section>
        
        <!-- Why Choose Us -->
        <section class="section">
            <div class="section-title text-center animate-up" style="margin-bottom: 3rem;">
                <h2>Why Choose Vidyarthi?</h2>
                <p>We provide the best resources for your success</p>
            </div>
            
            <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                <div class="card animate-up delay-100" style="padding: 2rem;">
                    <i class="fas fa-video" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 1rem;"></i>
                    <h3>Best Video Quality</h3>
                    <p style="color: var(--text-muted);">High Definition lectures with multiple quality options to save data.</p>
                </div>
                <div class="card animate-up delay-200" style="padding: 2rem;">
                    <i class="fas fa-file-alt" style="font-size: 2.5rem; color: var(--secondary); margin-bottom: 1rem;"></i>
                    <h3>Detailed Test Analysis</h3>
                    <p style="color: var(--text-muted);">Get in-depth analysis of your performance after every mock test.</p>
                </div>
                <div class="card animate-up delay-300" style="padding: 2rem;">
                    <i class="fas fa-download" style="font-size: 2.5rem; color: var(--accent); margin-bottom: 1rem;"></i>
                    <h3>Offline Downloads</h3>
                    <p style="color: var(--text-muted);">Download videos and notes to study anytime, anywhere without internet.</p>
                </div>
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
