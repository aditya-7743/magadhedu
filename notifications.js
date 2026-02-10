// In-App Notification System

const NotificationStore = {
    _notifications: [],
    _listeners: [],
    _unsubscribe: null,

    get all() { return this._notifications; },
    get unreadCount() { return this._notifications.filter(n => !n.read).length; },

    subscribe(callback) {
        this._listeners.push(callback);
        return () => { this._listeners = this._listeners.filter(l => l !== callback); };
    },

    _notify() {
        this._listeners.forEach(cb => cb(this._notifications));
        updateNotificationBadge();
    }
};

function initNotifications() {
    if (!AppState.currentUser) return;

    // Listen for real-time notifications from Firestore
    if (NotificationStore._unsubscribe) {
        NotificationStore._unsubscribe();
    }

    NotificationStore._unsubscribe = FirebaseDB.onSnapshot('notifications', (data) => {
        NotificationStore._notifications = data
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        NotificationStore._notify();
    }, {
        field: 'userId',
        operator: '==',
        value: AppState.currentUser.uid
    });
}

function updateNotificationBadge() {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;

    const count = NotificationStore.unreadCount;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

async function markNotificationRead(notifId) {
    await FirebaseDB.updateDoc('notifications', notifId, { read: true });

    const notif = NotificationStore._notifications.find(n => n.id === notifId);
    if (notif) notif.read = true;
    NotificationStore._notify();
}

async function markAllNotificationsRead() {
    const unread = NotificationStore._notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => FirebaseDB.updateDoc('notifications', n.id, { read: true })));

    NotificationStore._notifications.forEach(n => { n.read = true; });
    NotificationStore._notify();
}

async function deleteNotification(notifId) {
    await FirebaseDB.deleteDoc('notifications', notifId);
    NotificationStore._notifications = NotificationStore._notifications.filter(n => n.id !== notifId);
    NotificationStore._notify();
    renderNotificationsPage();
}

async function clearAllNotifications() {
    if (!confirm('Delete all notifications?')) return;

    await Promise.all(NotificationStore._notifications.map(n => FirebaseDB.deleteDoc('notifications', n.id)));
    NotificationStore._notifications = [];
    NotificationStore._notify();
    renderNotificationsPage();
}

// Send a notification to a user (used by other modules)
async function sendNotification(userId, title, message, type = 'info', link = '') {
    await FirebaseDB.addDoc('notifications', {
        userId,
        title,
        message,
        type, // 'info', 'success', 'warning', 'course', 'test', 'payment'
        link,
        read: false,
        createdAt: new Date()
    });
}

function getNotificationIcon(type) {
    switch (type) {
        case 'course': return '📚';
        case 'test': return '📝';
        case 'payment': return '💰';
        case 'success': return '✅';
        case 'warning': return '⚠️';
        case 'live': return '🔴';
        default: return '🔔';
    }
}

function getTimeSince(timestamp) {
    const date = timestamp && timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function renderNotificationsPage() {
    const content = document.getElementById('main-content');

    if (!AppState.currentUser) {
        window.location.hash = 'login';
        return;
    }

    const notifications = NotificationStore.all;

    content.innerHTML = `
        <div class="notifications-page animate-up">
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h1>Notifications</h1>
                    <p>${notifications.length} notification${notifications.length !== 1 ? 's' : ''} (${NotificationStore.unreadCount} unread)</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    ${NotificationStore.unreadCount > 0 ? `
                        <button onclick="markAllNotificationsRead()" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                            Mark All Read
                        </button>
                    ` : ''}
                    ${notifications.length > 0 ? `
                        <button onclick="clearAllNotifications()" class="btn" style="padding: 0.5rem 1rem; font-size: 0.9rem; background: var(--error); color: white; border: none; border-radius: 50px; cursor: pointer;">
                            Clear All
                        </button>
                    ` : ''}
                </div>
            </div>

            <div class="notifications-list" style="margin-top: 1.5rem;">
                ${notifications.length > 0 ? notifications.map(n => `
                    <div class="card" style="padding: 1.25rem; margin-bottom: 0.75rem; display: flex; align-items: flex-start; gap: 1rem; ${!n.read ? 'border-left: 4px solid var(--primary);' : 'opacity: 0.75;'} cursor: pointer;"
                         onclick="${n.link ? `window.location.hash='${n.link}';` : ''} markNotificationRead('${n.id}')">
                        <div style="font-size: 1.5rem; flex-shrink: 0;">${getNotificationIcon(n.type)}</div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 style="margin: 0; font-size: 1rem;">${n.title}</h4>
                                <span style="font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; margin-left: 1rem;">${getTimeSince(n.createdAt)}</span>
                            </div>
                            <p style="margin: 0.3rem 0 0; color: var(--text-muted); font-size: 0.9rem;">${n.message}</p>
                        </div>
                        <button onclick="event.stopPropagation(); deleteNotification('${n.id}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem; padding: 0.2rem;" title="Delete">
                            &times;
                        </button>
                    </div>
                `).join('') : `
                    <div style="text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🔔</div>
                        <h3>No notifications</h3>
                        <p>You're all caught up!</p>
                    </div>
                `}
            </div>
        </div>
    `;

    // Mark visible as read
    markAllNotificationsRead();
}
