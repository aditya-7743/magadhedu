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
