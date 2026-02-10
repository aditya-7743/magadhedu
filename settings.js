// Settings Page - Profile Editing & Preferences

async function renderSettingsPage() {
    const content = document.getElementById('main-content');

    if (!AppState.currentUser) {
        window.location.hash = 'login';
        return;
    }

    showLoading(true);
    const userDoc = await FirebaseDB.getDoc('users', AppState.currentUser.uid);
    showLoading(false);

    const user = AppState.currentUser;
    const prefs = userDoc || {};

    content.innerHTML = `
        <div class="settings-page animate-up">
            <div class="page-header">
                <h1>Settings</h1>
                <p>Manage your profile and preferences</p>
            </div>

            <!-- Profile Section -->
            <div class="card" style="padding: 2rem; margin-bottom: 1.5rem;">
                <h3 style="margin-bottom: 1.5rem;">Profile Information</h3>
                <form id="profileForm" onsubmit="handleUpdateProfile(event)">
                    <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div style="position: relative;">
                            <img src="${user.photoURL || 'https://via.placeholder.com/80'}"
                                 alt="Profile" id="profilePreview"
                                 style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary);">
                            <label for="profilePhoto" style="position: absolute; bottom: 0; right: 0; background: var(--primary); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.8rem;">
                                <i class="fas fa-camera"></i>
                            </label>
                            <input type="file" id="profilePhoto" accept="image/*" style="display: none;" onchange="previewProfilePhoto(this)">
                        </div>
                        <div>
                            <h4 style="margin: 0;">${user.displayName || 'User'}</h4>
                            <p style="margin: 0; color: var(--text-muted);">${user.email}</p>
                            <span style="background: var(--primary); color: white; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase;">${AppState.userRole || 'student'}</span>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.4rem; font-weight: 500;">Full Name</label>
                            <input type="text" id="settingsName" value="${user.displayName || ''}" required
                                   style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.4rem; font-weight: 500;">Phone</label>
                            <input type="tel" id="settingsPhone" value="${prefs.phone || ''}" placeholder="+91 XXXXXXXXXX"
                                   style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 8px;">
                        </div>
                    </div>

                    <div style="margin-top: 1rem;">
                        <label style="display: block; margin-bottom: 0.4rem; font-weight: 500;">Bio</label>
                        <textarea id="settingsBio" rows="3" placeholder="Tell us about yourself..."
                                  style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 8px; resize: vertical;">${prefs.bio || ''}</textarea>
                    </div>

                    <button type="submit" class="btn btn-primary" style="margin-top: 1.5rem; padding: 0.7rem 2rem;">
                        Save Profile
                    </button>
                </form>
            </div>

            <!-- Password Change -->
            <div class="card" style="padding: 2rem; margin-bottom: 1.5rem;">
                <h3 style="margin-bottom: 1.5rem;">Change Password</h3>
                <form id="passwordForm" onsubmit="handleChangePassword(event)">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.4rem; font-weight: 500;">New Password</label>
                            <input type="password" id="newPassword" minlength="6" required placeholder="Min 6 characters"
                                   style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.4rem; font-weight: 500;">Confirm Password</label>
                            <input type="password" id="confirmPassword" minlength="6" required placeholder="Repeat password"
                                   style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 8px;">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-secondary" style="margin-top: 1rem; padding: 0.7rem 2rem;">
                        Update Password
                    </button>
                </form>
            </div>

            <!-- Notification Preferences -->
            <div class="card" style="padding: 2rem; margin-bottom: 1.5rem;">
                <h3 style="margin-bottom: 1.5rem;">Notification Preferences</h3>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${renderToggle('emailNotifs', 'Email Notifications', 'Receive course updates and reminders via email', prefs.emailNotifs !== false)}
                    ${renderToggle('classReminders', 'Live Class Reminders', 'Get notified before live classes start', prefs.classReminders !== false)}
                    ${renderToggle('testReminders', 'Test Reminders', 'Get notified about upcoming mock tests', prefs.testReminders !== false)}
                    ${renderToggle('promotionalEmails', 'Promotional Emails', 'Receive offers and new course announcements', prefs.promotionalEmails !== false)}
                </div>
                <button onclick="saveNotificationPrefs()" class="btn btn-secondary" style="margin-top: 1.5rem; padding: 0.7rem 2rem;">
                    Save Preferences
                </button>
            </div>

            <!-- Danger Zone -->
            <div class="card" style="padding: 2rem; border: 1px solid var(--error);">
                <h3 style="color: var(--error); margin-bottom: 1rem;">Danger Zone</h3>
                <p style="color: var(--text-muted); margin-bottom: 1rem;">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button onclick="handleDeleteAccount()" style="background: var(--error); color: white; border: none; padding: 0.7rem 2rem; border-radius: 50px; cursor: pointer; font-weight: 600;">
                    Delete Account
                </button>
            </div>
        </div>
    `;
}

function renderToggle(id, label, description, checked) {
    return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0;">
            <div>
                <strong>${label}</strong>
                <p style="margin: 0; color: var(--text-muted); font-size: 0.85rem;">${description}</p>
            </div>
            <label style="position: relative; display: inline-block; width: 48px; height: 26px; cursor: pointer;">
                <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}
                       style="opacity: 0; width: 0; height: 0;">
                <span style="position: absolute; inset: 0; background: ${checked ? 'var(--primary)' : '#ccc'}; border-radius: 26px; transition: 0.3s;"
                      onclick="this.previousElementSibling.checked = !this.previousElementSibling.checked; this.style.background = this.previousElementSibling.checked ? 'var(--primary)' : '#ccc'; this.querySelector('span').style.transform = this.previousElementSibling.checked ? 'translateX(22px)' : 'translateX(0)';">
                    <span style="position: absolute; content: ''; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; ${checked ? 'transform: translateX(22px);' : ''}"></span>
                </span>
            </label>
        </div>
    `;
}

function previewProfilePhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('profilePreview').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function handleUpdateProfile(event) {
    event.preventDefault();
    showLoading(true);

    const name = document.getElementById('settingsName').value.trim();
    const phone = document.getElementById('settingsPhone').value.trim();
    const bio = document.getElementById('settingsBio').value.trim();
    const photoInput = document.getElementById('profilePhoto');

    try {
        let photoURL = AppState.currentUser.photoURL;

        // Upload new photo if selected
        if (photoInput.files && photoInput.files[0]) {
            const file = photoInput.files[0];
            photoURL = await FirebaseStorage.uploadFile(
                `profiles/${AppState.currentUser.uid}/${file.name}`,
                file
            );
        }

        // Update Firebase Auth profile
        await auth.currentUser.updateProfile({
            displayName: name,
            photoURL: photoURL || ''
        });

        // Update Firestore user doc
        await FirebaseDB.updateDoc('users', AppState.currentUser.uid, {
            displayName: name,
            phone,
            bio,
            photoURL: photoURL || ''
        });

        // Update local state
        AppState.currentUser = auth.currentUser;

        showLoading(false);
        showNotification('Profile updated successfully!', 'success');
        renderNavbar();
    } catch (error) {
        showLoading(false);
        showNotification('Failed to update profile: ' + error.message, 'error');
    }
}

async function handleChangePassword(event) {
    event.preventDefault();

    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;

    if (newPass !== confirmPass) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    if (newPass.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }

    showLoading(true);
    try {
        await auth.currentUser.updatePassword(newPass);
        showLoading(false);
        showNotification('Password updated successfully!', 'success');
        document.getElementById('passwordForm').reset();
    } catch (error) {
        showLoading(false);
        if (error.code === 'auth/requires-recent-login') {
            showNotification('Please log out and log back in before changing your password', 'warning');
        } else {
            showNotification('Failed to update password: ' + error.message, 'error');
        }
    }
}

async function saveNotificationPrefs() {
    showLoading(true);
    try {
        await FirebaseDB.updateDoc('users', AppState.currentUser.uid, {
            emailNotifs: document.getElementById('emailNotifs').checked,
            classReminders: document.getElementById('classReminders').checked,
            testReminders: document.getElementById('testReminders').checked,
            promotionalEmails: document.getElementById('promotionalEmails').checked
        });
        showLoading(false);
        showNotification('Preferences saved!', 'success');
    } catch (error) {
        showLoading(false);
        showNotification('Failed to save preferences: ' + error.message, 'error');
    }
}

async function handleDeleteAccount() {
    if (!confirm('Are you sure? This will permanently delete your account and all data.')) return;
    if (!confirm('This cannot be undone. Type your email to confirm.')) return;

    showLoading(true);
    try {
        // Delete user document
        await FirebaseDB.deleteDoc('users', AppState.currentUser.uid);
        // Delete auth account
        await auth.currentUser.delete();
        showLoading(false);
        showNotification('Account deleted', 'info');
        window.location.hash = 'home';
    } catch (error) {
        showLoading(false);
        if (error.code === 'auth/requires-recent-login') {
            showNotification('Please log out and log back in before deleting your account', 'warning');
        } else {
            showNotification('Failed to delete account: ' + error.message, 'error');
        }
    }
}
