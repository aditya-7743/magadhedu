// Core Application Logic
const AppState = {
    currentUser: null,
    userRole: null, // 'student', 'teacher', 'admin'
    enrolledCourses: [],
    currentView: 'home'
};

// ==========================================
// MOCK DATA
// ==========================================
const HERO_SLIDES = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
        title: "India's Most Trusted <br><span style='color: var(--secondary);'>Learning Platform</span>",
        subtitle: "Start your journey to success with the best educators for SSC, Banking, and UPSC.",
        ctaText: "Get Started",
        ctaLink: "#courses"
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
        title: "Ace Your Exams with <br><span style='color: var(--secondary);'>Video Courses</span>",
        subtitle: "Unlimited access to premium video lectures, mock tests, and study material.",
        ctaText: "Explore Courses",
        ctaLink: "#courses"
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
        title: "Daily <span style='color: var(--secondary);'>Live Classes</span> <br>& Doubt Sessions",
        subtitle: "Interact with top teachers in real-time and clear your doubts instantly.",
        ctaText: "Join Live",
        ctaLink: "#live-classes"
    }
];

const CATEGORIES = [
    { id: 'all', name: 'Popular', icon: 'fas fa-star' },
    { id: 'ssc', name: 'SSC CGL', icon: 'fas fa-graduation-cap' },
    { id: 'banking', name: 'Banking PO', icon: 'fas fa-briefcase' },
    { id: 'upsc', name: 'UPSC CSE', icon: 'fas fa-landmark' },
    { id: 'railways', name: 'Railways', icon: 'fas fa-train' },
    { id: 'teaching', name: 'Teaching', icon: 'fas fa-chalkboard-teacher' },
    { id: 'defence', name: 'Defence', icon: 'fas fa-shield-alt' },
    { id: 'state', name: 'State Exams', icon: 'fas fa-map-marker-alt' }
];

const COURSES_DATA = [
    {
        id: 101,
        title: "SSC CGL 2026 Foundation Batch (Pre + Mains)",
        category: "ssc",
        image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        price: 999,
        originalPrice: 2999,
        badge: "LIVE",
        badgeColor: "badge-live",
        metaIcon: "fas fa-book-reader",
        metaText: "Math Special",
        subMetaIcon: "fas fa-clock",
        subMetaText: "10:00 AM"
    },
    {
        id: 102,
        title: "IBPS PO Target Batch 2026",
        category: "banking",
        image: "https://images.unsplash.com/photo-1550592704-6c76defa9985?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        price: 1299,
        originalPrice: 3999,
        badge: "LIVE",
        badgeColor: "badge-live",
        metaIcon: "fas fa-chart-line",
        metaText: "Reasoning",
        subMetaIcon: "fas fa-clock",
        subMetaText: "11:30 AM"
    },
    {
        id: 103,
        title: "UPSC CSE GS Foundation 2027",
        category: "upsc",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        price: 4999,
        originalPrice: 19999,
        badge: "New",
        badgeColor: "success", // Will be mapped to style
        metaIcon: "fas fa-globe",
        metaText: "General Studies",
        subMetaIcon: "fas fa-calendar",
        subMetaText: "Starts 15 Feb"
    },
    {
        id: 104,
        title: "English Special by Neetu Mam Style",
        category: "ssc",
        image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        price: 799,
        originalPrice: 1999,
        badge: "Bestseller",
        badgeColor: "secondary",
        metaIcon: "fas fa-language",
        metaText: "English",
        subMetaIcon: "fas fa-video",
        subMetaText: "VOD"
    },
    {
        id: 105,
        title: "RRB NTPC & Group D Crash Course",
        category: "railways",
        image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        price: 499,
        originalPrice: 1499,
        badge: "Trending",
        badgeColor: "warning",
        metaIcon: "fas fa-train",
        metaText: "Complete Batch",
        subMetaIcon: "fas fa-bolt",
        subMetaText: "Fast Track"
    }
];

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

    // 1. Generate Hero Carousel HTML
    const heroSlidesHTML = HERO_SLIDES.map((slide, index) => `
        <div class="carousel-slide ${index === 0 ? 'active' : ''}" style="background-image: url('${slide.image}');">
            <div class="carousel-content">
                <h2>${slide.title}</h2>
                <p>${slide.subtitle}</p>
                <div class="flex" style="margin-top: 2rem;">
                    <button onclick="window.location.hash='${slide.ctaLink.replace('#', '')}'" class="btn btn-primary">
                        ${slide.ctaText} <i class="fas fa-arrow-right"></i>
                    </button>
                    ${index === 0 && !isLoggedIn ? `
                    <button onclick="window.location.hash='login'" class="btn btn-secondary" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4);">
                        Login / Sign Up
                    </button>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    // 2. Generate Category Tabs HTML
    const categoriesHTML = CATEGORIES.map((cat, index) => `
        <div class="tab-pill ${index === 0 ? 'active' : ''}" onclick="filterCourses('${cat.id}', this)" data-category="${cat.id}">
            <i class="${cat.icon}" style="margin-right:0.5rem"></i> ${cat.name}
        </div>
    `).join('');

    // 3. Generate Live Batches HTML (All initially or filtered)
    // We'll show all courses initially or "Popular" ones
    const initialCourses = COURSES_DATA; // Show all for horizontal scroll
    const liveBatchesHTML = initialCourses.map(course => `
        <div class="card course-card-wrapper" onclick="window.location.hash='course/${course.id}'">
            <div class="course-thumbnail">
                <span class="badge-${course.badgeColor}">${course.badge}</span>
                <img src="${course.image}" alt="${course.title}">
            </div>
            <div class="course-content">
                <div class="course-meta">
                    <span><i class="${course.metaIcon}"></i> ${course.metaText}</span>
                    <span><i class="${course.subMetaIcon}"></i> ${course.subMetaText}</span>
                </div>
                <h3 class="course-title">${course.title}</h3>
                <div class="flex-between" style="margin-top: auto; padding-top: 1rem;">
                    <div class="price-block">
                        <span class="price-new">₹${course.price}</span>
                        <span class="price-old">₹${course.originalPrice}</span>
                    </div>
                    <button class="btn btn-primary" style="padding: 0.5rem 1rem;">Join Now</button>
                </div>
            </div>
        </div>
    `).join('');

    content.innerHTML = `
        <!-- Hero Carousel Section -->
        <div class="hero-carousel animate-up" id="heroCarousel">
            ${heroSlidesHTML}
            <div class="carousel-nav-container">
                <button class="carousel-nav prev" onclick="moveCarousel(-1)">&#10094;</button>
                <button class="carousel-nav next" onclick="moveCarousel(1)">&#10095;</button>
            </div>
        </div>

        <!-- Category Tabs -->
        <div class="category-tabs animate-up delay-100" id="categoryTabs">
            ${categoriesHTML}
        </div>

        <!-- Live Batches (Horizontal Scroll) -->
        <section class="section">
            <div class="section-header animate-up delay-200">
                <div class="section-title">
                    <div class="flex-center" style="justify-content: flex-start;">
                        <span class="live-indicator" style="background: var(--error); width: 10px; height: 10px; border-radius: 50%; display: inline-block; animation: pulse 1.5s infinite; margin-right: 8px;"></span>
                        <h2 style="margin: 0;">Live Batches</h2>
                    </div>
                    <p>Join ongoing classes and interact with teachers</p>
                </div>
                <a href="#courses" class="btn btn-secondary" style="border-radius: 50px;">View All</a>
            </div>

            <div class="horizontal-scroll animate-up delay-300" id="coursesScrollContainer">
                ${liveBatchesHTML}
            </div>
        </section>

        <!-- Provide Teachers / Faculty Section -->
        <section class="section">
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

    // Start Interactions
    startHeroCarousel();
}

function renderLoginPage() {
    return `
        <div class="auth-container" style="display: flex; justify-content: center; align-items: center; min-height: 60vh;">
            <div class="auth-box" style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 100%; max-width: 400px;">
                <h2 style="text-align: center; margin-bottom: 1rem;">Welcome Back!</h2>
                
                <div id="login-form-container">
                    <form id="login-form" onsubmit="handleLogin(event)">
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
                     <form id="signup-form" onsubmit="handleSignup(event)">
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

// ==========================================
// APP INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("Vidyarthi App Initializing...");

    // 1. Initialize Core Logic
    try {
        if (typeof initApp === 'function') {
            initApp();
        } else {
            console.error("initApp function is missing!");
        }
    } catch (e) {
        console.error("Error during app initialization:", e);
    }

    // 2. Hide Loading Screen
    const loader = document.getElementById('loading-screen');
    if (loader) {
        // Minimum loading time for branding effect
        setTimeout(() => {
            loader.style.transition = 'opacity 0.6s ease';
            loader.style.opacity = '0';

            // Remove from DOM/Layout after fade
            setTimeout(() => {
                loader.style.display = 'none';
            }, 600);
        }, 1000);
    }
});

// ==========================================
// INTERACTIVE FEATURES
// ==========================================
let currentSlide = 0;
let carouselInterval;

function startHeroCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;

    // Clear existing interval if any
    if (carouselInterval) clearInterval(carouselInterval);

    carouselInterval = setInterval(() => {
        moveCarousel(1);
    }, 4000); // 4 seconds per slide
}

function moveCarousel(direction) {
    const slides = document.querySelectorAll('.carousel-slide');
    if (!slides.length) return;

    // Remove active class from current
    slides[currentSlide].classList.remove('active');

    // Calculate next
    currentSlide = (currentSlide + direction + slides.length) % slides.length;

    // Add active class to next
    slides[currentSlide].classList.add('active');
}

function filterCourses(categoryId, element) {
    // 1. Update Active Tab
    const tabs = document.querySelectorAll('.tab-pill');
    tabs.forEach(tab => tab.classList.remove('active'));
    if (element) element.classList.add('active');

    // 2. Filter Data
    const container = document.getElementById('coursesScrollContainer');
    if (!container) return;

    // Fade Out
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.3s ease';

    setTimeout(() => {
        let filteredData = COURSES_DATA;
        if (categoryId !== 'all') {
            filteredData = COURSES_DATA.filter(c => c.category === categoryId);
        }

        // 3. Render New List
        if (filteredData.length === 0) {
            container.innerHTML = `<div style="text-align:center; width:100%; padding:2rem; color:var(--text-muted);">No courses found in this category.</div>`;
        } else {
            container.innerHTML = filteredData.map(course => `
                <div class="card course-card-wrapper" onclick="window.location.hash='course/${course.id}'">
                    <div class="course-thumbnail">
                        <span class="badge-${course.badgeColor || 'primary'}">${course.badge}</span>
                        <img src="${course.image}" alt="${course.title}">
                    </div>
                    <div class="course-content">
                        <div class="course-meta">
                            <span><i class="${course.metaIcon}"></i> ${course.metaText}</span>
                            <span><i class="${course.subMetaIcon}"></i> ${course.subMetaText}</span>
                        </div>
                        <h3 class="course-title">${course.title}</h3>
                        <div class="flex-between" style="margin-top: auto; padding-top: 1rem;">
                            <div class="price-block">
                                <span class="price-new">₹${course.price}</span>
                                <span class="price-old">₹${course.originalPrice}</span>
                            </div>
                            <button class="btn btn-primary" style="padding: 0.5rem 1rem;">Join Now</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Fade In
        container.style.opacity = '1';
    }, 300);
}

// ==========================================
// PHASE 7: COURSE DETAILS
// ==========================================
function viewCourseDetails(courseId) {
    const content = document.getElementById('main-content');
    const course = COURSES_DATA.find(c => c.id == courseId);

    if (!course) {
        content.innerHTML = `<div class="text-center py-5"><h2>Course Not Found</h2><a href="#courses" class="btn btn-primary">Browse Courses</a></div>`;
        return;
    }

    content.innerHTML = `
        <div class="course-detail-container animate-up">
            <!-- Hero Section -->
            <div class="course-hero" style="background: linear-gradient(135deg, var(--deep-blue), var(--primary)); color: white; padding: 4rem 2rem; border-radius: var(--radius-lg); margin-bottom: 2rem; position: relative; overflow: hidden;">
                <div class="hero-content" style="position: relative; z-index: 2; max-width: 800px;">
                    <span class="badge badge-${course.badgeColor}" style="margin-bottom: 1rem; display: inline-block;">${course.badge}</span>
                    <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">${course.title}</h1>
                    <p style="font-size: 1.2rem; opacity: 0.9; margin-bottom: 2rem;">Master ${course.category.toUpperCase()} with top educators. Live classes, PDF notes, and test series included.</p>
                    
                    <div class="course-meta-large" style="display: flex; gap: 2rem; margin-bottom: 2rem;">
                        <span><i class="${course.metaIcon}"></i> ${course.metaText}</span>
                        <span><i class="${course.subMetaIcon}"></i> ${course.subMetaText}</span>
                        <span><i class="fas fa-language"></i> Hinglish</span>
                    </div>

                    <div class="price-section" style="display: flex; align-items: center; gap: 1.5rem;">
                        <span style="font-size: 2.5rem; font-weight: 700;">₹${course.price}</span>
                        <span style="font-size: 1.5rem; text-decoration: line-through; opacity: 0.7;">₹${course.originalPrice}</span>
                        <span style="background: var(--success); color: white; padding: 0.2rem 0.8rem; border-radius: 4px; font-weight: 600;">${Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF</span>
                    </div>

                    <button onclick="initiatePayment('${course.id}')" class="btn btn-secondary" style="margin-top: 2rem; padding: 1rem 3rem; font-size: 1.2rem; border: none;">
                        Join Batch Now
                    </button>
                    ${!AppState.currentUser ? `<p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">*Login required to purchase</p>` : ''}
                </div>
            </div>

            <!-- Content Grid -->
            <div class="course-content-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                <!-- Left Column -->
                <div class="course-main">
                    <div class="card mb-4" style="background: white; padding: 2rem; border-radius: 12px; box-shadow: var(--shadow-sm);">
                        <h3>What you'll learn</h3>
                        <ul class="feature-list" style="list-style: none; padding: 0; margin-top: 1rem;">
                            <li style="margin-bottom: 0.8rem;"><i class="fas fa-check-circle" style="color: var(--success); margin-right: 0.5rem;"></i> Complete Syllabus Coverage</li>
                            <li style="margin-bottom: 0.8rem;"><i class="fas fa-check-circle" style="color: var(--success); margin-right: 0.5rem;"></i> Live & Recorded Classes</li>
                            <li style="margin-bottom: 0.8rem;"><i class="fas fa-check-circle" style="color: var(--success); margin-right: 0.5rem;"></i> Printable PDF Notes</li>
                            <li style="margin-bottom: 0.8rem;"><i class="fas fa-check-circle" style="color: var(--success); margin-right: 0.5rem;"></i> Specialized Doubt Sessions</li>
                        </ul>
                    </div>

                    <div class="card" style="background: white; padding: 2rem; border-radius: 12px; box-shadow: var(--shadow-sm);">
                        <h3>Course Syllabus</h3>
                        <div class="accordion" style="margin-top: 1rem;">
                            <div class="accordion-item" style="border-bottom: 1px solid #eee; padding: 1rem 0;">
                                <div style="display: flex; justify-content: space-between; font-weight: 600; cursor: pointer;">
                                    <span>Module 1: Introduction & Basics</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                            </div>
                            <div class="accordion-item" style="border-bottom: 1px solid #eee; padding: 1rem 0;">
                                <div style="display: flex; justify-content: space-between; font-weight: 600; cursor: pointer;">
                                    <span>Module 2: Core Concepts</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                            </div>
                            <div class="accordion-item" style="border-bottom: 1px solid #eee; padding: 1rem 0;">
                                <div style="display: flex; justify-content: space-between; font-weight: 600; cursor: pointer;">
                                    <span>Module 3: Advanced Problem Solving</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column -->
                <div class="course-sidebar">
                   <div class="card" style="position: sticky; top: 2rem; background: white; padding: 2rem; border-radius: 12px; box-shadow: var(--shadow-sm);">
                        <h3 style="margin-bottom: 1.5rem; text-align:center;">Instructor</h3>
                        <div style="text-align: center;">
                            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Instructor" style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 1rem; border: 3px solid var(--primary);">
                            <h4>Aditya Sir</h4>
                            <p class="text-muted">Maths Wizard • 10+ Years Exp</p>
                            <p style="margin-top: 1rem; font-size: 0.9rem;">Mentored AIR 1 in SSC CGL 2024. Expert in short tricks and conceptual clarity.</p>
                        </div>
                   </div>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// PHASE 8: AUTHENTICATION
// ==========================================
function handleLogin(e) { // Mock Login
    // Prevent form submission if passed (though we use onclick mostly)
    if (e) e.preventDefault();

    const email = document.getElementById('login-email') ? document.getElementById('login-email').value : 'user@example.com';

    // Simulate API Call
    setTimeout(() => {
        const user = {
            id: 'u1',
            name: 'Aditya Kumar',
            email: email,
            role: 'student'
        };

        localStorage.setItem('currentUser', JSON.stringify(user));
        AppState.currentUser = user;

        // Update UI
        initAuth();
        window.location.hash = 'student-dashboard';
    }, 1000);
}

function handleSignup(e) { // Mock Signup
    if (e) e.preventDefault();
    setTimeout(() => {
        handleLogin(e); // Auto login after signup
    }, 1000);
}

function logout() {
    localStorage.removeItem('currentUser');
    AppState.currentUser = null;
    initAuth();
    window.location.hash = 'home';
}

function initAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        AppState.currentUser = JSON.parse(savedUser);
    }

    const navAuth = document.getElementById('nav-auth');
    if (navAuth) {
        if (AppState.currentUser) {
            navAuth.innerHTML = `
                <button onclick="window.location.hash='student-dashboard'" class="btn btn-secondary">
                    <i class="fas fa-user-circle"></i> Dashboard
                </button>
                <button onclick="logout()" class="btn btn-outline" style="margin-left: 0.5rem; color: white; border: 1px solid rgba(255,255,255,0.3);">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            `;
        } else {
            navAuth.innerHTML = `
                <a href="#login" class="nav-link">Login</a>
                <a href="#signup" class="btn btn-secondary">Sign Up</a>
            `;
        }
    }
}

// ==========================================
// PHASE 9: STUDENT DASHBOARD
// ==========================================
function renderStudentDashboard() {
    const content = document.getElementById('main-content');
    const user = AppState.currentUser;
    if (!user) { window.location.hash = 'login'; return; }

    const enrolledCourses = AppState.enrolledCourses.length > 0 ? AppState.enrolledCourses : [];

    // Mock enrolled courses if empty for demo
    const displayCourses = enrolledCourses.length > 0 ? enrolledCourses : [COURSES_DATA[0]];

    content.innerHTML = `
        <div class="dashboard-container animate-up">
            <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h1>Welcome back, ${user.name.split(' ')[0]}! 👋</h1>
                    <p class="text-muted">You have 2 upcoming classes today.</p>
                </div>
                <div class="stats-card" style="background: white; padding: 1rem 2rem; border-radius: 12px; box-shadow: var(--shadow-sm); display: flex; gap: 2rem;">
                    <div style="text-align: center;">
                        <h3 style="color: var(--primary); margin: 0;">85%</h3>
                        <span style="font-size: 0.9rem;">Attendance</span>
                    </div>
                    <div style="text-align: center;">
                        <h3 style="color: var(--secondary); margin: 0;">12</h3>
                        <span style="font-size: 0.9rem;">Tests Taken</span>
                    </div>
                </div>
            </div>

            <h2 style="margin-bottom: 1.5rem;">My Courses</h2>
            <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                ${displayCourses.map(course => `
                    <div class="card course-card-wrapper">
                        <div class="course-thumbnail">
                            <span class="badge-live">LIVE NOW</span>
                            <img src="${course.image}" alt="${course.title}">
                        </div>
                        <div class="course-content">
                            <h3 class="course-title">${course.title}</h3>
                            <div class="progress-bar" style="background: #eee; height: 8px; border-radius: 4px; margin: 1rem 0; overflow: hidden;">
                                <div style="background: var(--success); width: 45%; height: 100%;"></div>
                            </div>
                            <div class="flex-between" style="margin-top: auto;">
                                <span style="font-size: 0.9rem; color: var(--text-muted);">45% Completed</span>
                                <button class="btn btn-primary" style="padding: 0.5rem 1rem;">Resume</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ==========================================
// PHASE 10: PAYMENTS (MOCK)
// ==========================================
function initiatePayment(courseId) {
    if (!AppState.currentUser) {
        alert("Please login to purchase courses.");
        window.location.hash = 'login';
        return;
    }

    const course = COURSES_DATA.find(c => c.id == courseId);

    // Show Mock Payment Modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 1000;
    `;
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 12px; width: 400px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <h2 style="margin-bottom: 1rem;">Payment Gateway</h2>
            <p>Processing payment for <strong>${course.title}</strong></p>
            <div style="margin: 2rem 0; font-size: 2rem; color: var(--primary);">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <p style="color: var(--text-muted);">Please do not refresh the page...</p>
        </div>
    `;
    document.body.appendChild(modal);

    // Simulate Success
    setTimeout(() => {
        modal.innerHTML = `
             <div style="background: white; padding: 2rem; border-radius: 12px; width: 400px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                <div style="font-size: 4rem; color: var(--success); margin-bottom: 1rem;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2 style="margin-bottom: 1rem;">Payment Successful!</h2>
                <p>You have successfully enrolled in the course.</p>
                <p style="margin-top: 1rem; color: var(--text-muted);">Redirecting to dashboard...</p>
            </div>
        `;

        // Add to enrolled courses
        AppState.enrolledCourses.push(course);

        // Redirect
        setTimeout(() => {
            document.body.removeChild(modal);
            window.location.hash = 'student-dashboard';
        }, 2000);
    }, 2000);
}
