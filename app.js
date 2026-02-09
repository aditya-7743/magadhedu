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
    if(!content) return;
    
    content.innerHTML = `
         <div class="hero-section" style="text-align: center; padding: 4rem 1rem;">
            <div class="hero-content">
                <h1 style="font-size: 3rem; margin-bottom: 1rem; color: var(--primary);">Unlock Your Potential with <span style="color: var(--secondary);">Vidyarthi</span></h1>
                <p style="font-size: 1.2rem; color: #666; mb-2rem">Access world-class education from the comfort of your home. Live classes, mock tests, and expert-led courses.</p>
                <div class="hero-buttons" style="margin-top: 2rem;">
                    <button onclick="window.location.hash='courses'" class="btn-primary" style="padding: 10px 20px; font-size: 1.1rem; background: var(--primary); color: white; border: none; border-radius: 5px; cursor: pointer;">Explore Courses</button>
                    ${!AppState.currentUser ? `<button onclick="window.location.hash='login'" class="btn-secondary" style="padding: 10px 20px; font-size: 1.1rem; background: transparent; color: var(--primary); border: 2px solid var(--primary); border-radius: 5px; cursor: pointer; margin-left: 10px;">Join for Free</button>` : ''}
                </div>
            </div>
        </div>
        
        <div class="features-section" style="display: flex; justify-content: center; gap: 2rem; padding: 4rem 1rem; flex-wrap: wrap;">
            <div class="feature-card" style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 300px; text-align: center;">
                <div class="feature-icon" style="font-size: 3rem; margin-bottom: 1rem;">📹</div>
                <h3>Live Interactive Classes</h3>
                <p>Learn in real-time with expert teachers and instant doubt clearing.</p>
            </div>
            <div class="feature-card" style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 300px; text-align: center;">
                <div class="feature-icon" style="font-size: 3rem; margin-bottom: 1rem;">📝</div>
                <h3>Mock Tests & Quizzes</h3>
                <p>Practice with exam-like questions and get detailed performance analysis.</p>
            </div>
            <div class="feature-card" style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 300px; text-align: center;">
                <div class="feature-icon" style="font-size: 3rem; margin-bottom: 1rem;">🏆</div>
                <h3>Earn Certificates</h3>
                <p>Get certified upon course completion and showcase your skills.</p>
            </div>
        </div>
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
