// Authentication System

function initAuth() {
    // Check if user is already logged in
    auth.onAuthStateChanged(user => {
        if (user) {
            handleUserLogin(user);
        } else {
            handleUserLogout();
        }
    });
}

function checkAuthState() {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
        });
    });
}

async function handleUserLogin(user) {
    AppState.currentUser = user;
    
    // Get user role from Firestore
    const userDoc = await FirebaseDB.getDoc('users', user.uid);
    if (userDoc) {
        AppState.userRole = userDoc.role || 'student';
    } else {
        // Create new user document
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'User',
            photoURL: user.photoURL || '',
            role: 'student',
            createdAt: new Date()
        });
        AppState.userRole = 'student';
    }
    
    renderNavbar();
    
    // Redirect to dashboard
    if (window.location.hash === '#login' || window.location.hash === '') {
        window.location.hash = `${AppState.userRole}-dashboard`;
    }
}

function handleUserLogout() {
    AppState.currentUser = null;
    AppState.userRole = null;
    AppState.enrolledCourses = [];
    renderNavbar();
}

function renderLoginPage() {
    return `
        <div class="auth-container">
            <div class="auth-box">
                <h2>Welcome Back!</h2>
                <p>Login to continue learning</p>

                <!-- Google Sign In -->
                <button onclick="signInWithGoogle()" class="btn-google">
                    <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google">
                    Continue with Google
                </button>

                <div class="divider">OR</div>

                <!-- Email/Password Login -->
                <form id="login-form" onsubmit="handleEmailLogin(event)">
                    <input type="email" id="login-email" placeholder="Email" required>
                    <input type="password" id="login-password" placeholder="Password" required>
                    <button type="submit" class="btn-primary">Login</button>
                </form>

                <p class="switch-auth">
                    Don't have an account? 
                    <a href="#" onclick="showSignupForm()">Sign Up</a>
                </p>
            </div>

            <!-- Signup Form (Hidden initially) -->
            <div class="auth-box" id="signup-box" style="display: none;">
                <h2>Create Account</h2>
                <p>Start your learning journey</p>

                <form id="signup-form" onsubmit="handleEmailSignup(event)">
                    <input type="text" id="signup-name" placeholder="Full Name" required>
                    <input type="email" id="signup-email" placeholder="Email" required>
                    <input type="password" id="signup-password" placeholder="Password (min 6 characters)" required minlength="6">
                    
                    <select id="signup-role" required>
                        <option value="">Select Role</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                    </select>

                    <button type="submit" class="btn-primary">Sign Up</button>
                </form>

                <p class="switch-auth">
                    Already have an account? 
                    <a href="#" onclick="showLoginForm()">Login</a>
                </p>
            </div>
        </div>
    `;
}

function setupAuthHandlers() {
    // This function is called after login page renders
}

function showSignupForm() {
    document.querySelector('.auth-box:first-child').style.display = 'none';
    document.getElementById('signup-box').style.display = 'block';
}

function showLoginForm() {
    document.querySelector('.auth-box:first-child').style.display = 'block';
    document.getElementById('signup-box').style.display = 'none';
}

// Google Sign In
async function signInWithGoogle() {
    try {
        showLoading(true);
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        showLoading(false);
    } catch (error) {
        showLoading(false);
        showNotification('Login failed: ' + error.message, 'error');
    }
}

// Email/Password Login
async function handleEmailLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        showLoading(true);
        await auth.signInWithEmailAndPassword(email, password);
        showLoading(false);
    } catch (error) {
        showLoading(false);
        showNotification('Login failed: ' + error.message, 'error');
    }
}

// Email/Password Signup
async function handleEmailSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
    
    try {
        showLoading(true);
        
        // Create user
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update profile
        await user.updateProfile({ displayName: name });
        
        // Create user document in Firestore
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            email: email,
            displayName: name,
            role: role,
            photoURL: '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showLoading(false);
        showNotification('Account created successfully!', 'success');
    } catch (error) {
        showLoading(false);
        showNotification('Signup failed: ' + error.message, 'error');
    }
}

// Logout
async function handleLogout() {
    try {
        await auth.signOut();
        window.location.hash = 'home';
        showNotification('Logged out successfully', 'success');
    } catch (error) {
        showNotification('Logout failed: ' + error.message, 'error');
    }
}

// Utility Functions
function showLoading(show) {
    document.getElementById('loading-screen').style.display = show ? 'flex' : 'none';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
