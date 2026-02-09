// Live Class System with Daily.co Integration

async function renderLiveClassesPage() {
    const content = document.getElementById('main-content');
    
    const upcomingClasses = await fetchUpcomingLiveClasses();
    const pastClasses = await fetchPastLiveClasses();
    
    content.innerHTML = `
        <div class="live-classes-page">
            <div class="page-header">
                <h1>Live Classes</h1>
                <p>Join interactive sessions with expert teachers</p>
            </div>

            <!-- Live Now Section -->
            <div class="live-now-section">
                <h2>🔴 Live Now</h2>
                <div id="liveNowClasses" class="live-now-grid">
                    <!-- Will be populated -->
                </div>
            </div>

            <!-- Upcoming Classes -->
            <div class="section">
                <h2>📅 Upcoming Classes</h2>
                <div class="upcoming-classes-grid">
                    ${upcomingClasses.length > 0 ? upcomingClasses.map(cls => `
                        <div class="class-card">
                            <div class="class-time-badge">
                                ${getTimeUntilClass(cls.startTime)}
                            </div>
                            <h3>${cls.title}</h3>
                            <p class="class-description">${cls.description || ''}</p>
                            
                            <div class="class-details">
                                <div class="detail-item">
                                    <span class="label">Teacher:</span>
                                    <span>${cls.teacherName}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">Time:</span>
                                    <span>${formatDateTime(cls.startTime)}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">Duration:</span>
                                    <span>${cls.duration} minutes</span>
                                </div>
                            </div>

                            <div class="class-actions">
                                <button onclick="setReminder('${cls.id}')" class="btn-secondary">
                                    🔔 Set Reminder
                                </button>
                                ${isAboutToStart(cls.startTime) ? `
                                    <button onclick="joinLiveClassNow('${cls.id}')" class="btn-join-live">
                                        Join Now
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('') : '<p class="no-data">No upcoming classes</p>'}
                </div>
            </div>

            <!-- Past Recordings -->
            <div class="section">
                <h2>📼 Past Recordings</h2>
                <div class="recordings-grid">
                    ${pastClasses.length > 0 ? pastClasses.map(cls => `
                        <div class="recording-card">
                            <div class="recording-thumbnail">
                                <img src="${cls.thumbnail || 'https://via.placeholder.com/300x180'}" alt="${cls.title}">
                                <div class="play-overlay">▶</div>
                            </div>
                            <div class="recording-info">
                                <h4>${cls.title}</h4>
                                <p>👨‍🏫 ${cls.teacherName}</p>
                                <p>📅 ${formatDate(cls.startTime)}</p>
                                <button onclick="watchRecording('${cls.id}')" class="btn-watch">
                                    Watch Recording
                                </button>
                            </div>
                        </div>
                    `).join('') : '<p class="no-data">No past recordings available</p>'}
                </div>
            </div>
        </div>
    `;
    
    checkForLiveClasses();
    // Auto-refresh every minute to check for live classes
    setInterval(checkForLiveClasses, 60000);
}

async function fetchUpcomingLiveClasses() {
    const now = new Date();
    const classes = await FirebaseDB.getCollection('liveClasses');
    
    return classes.filter(cls => {
        const classTime = cls.startTime.toDate();
        return classTime > now;
    }).sort((a, b) => a.startTime - b.startTime);
}

async function fetchPastLiveClasses() {
    const now = new Date();
    const classes = await FirebaseDB.getCollection('liveClasses');
    
    return classes.filter(cls => {
        const classTime = cls.startTime.toDate();
        const endTime = new Date(classTime.getTime() + cls.duration * 60000);
        return endTime < now && cls.recordingUrl;
    }).sort((a, b) => b.startTime - a.startTime);
}

async function checkForLiveClasses() {
    const now = new Date();
    const classes = await FirebaseDB.getCollection('liveClasses');
    
    const liveClasses = classes.filter(cls => {
        const startTime = cls.startTime.toDate();
        const endTime = new Date(startTime.getTime() + cls.duration * 60000);
        return startTime <= now && endTime > now;
    });
    
    const container = document.getElementById('liveNowClasses');
    if (!container) return;
    
    if (liveClasses.length > 0) {
        container.innerHTML = liveClasses.map(cls => `
            <div class="live-now-card">
                <div class="live-badge">🔴 LIVE</div>
                <h3>${cls.title}</h3>
                <p>👨‍🏫 ${cls.teacherName}</p>
                <p>👥 ${cls.participantCount || 0} watching</p>
                <button onclick="joinLiveClassNow('${cls.id}')" class="btn-join-live btn-large">
                    Join Now
                </button>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<p class="no-live">No classes live right now</p>';
    }
}

function getTimeUntilClass(startTime) {
    const now = new Date();
    const classTime = startTime.toDate();
    const diffMs = classTime - now;
    
    if (diffMs < 0) return 'Started';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    if (diffMins > 0) return `In ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    return 'Starting soon';
}

function isAboutToStart(startTime) {
    const now = new Date();
    const classTime = startTime.toDate();
    const diffMins = (classTime - now) / 60000;
    return diffMins <= 10 && diffMins > -5; // Can join 10 mins before and 5 mins after
}

async function joinLiveClassNow(classId) {
    if (!AppState.currentUser) {
        showNotification('Please login to join class', 'error');
        window.location.hash = 'login';
        return;
    }
    
    const content = document.getElementById('main-content');
    const classData = await FirebaseDB.getDoc('liveClasses', classId);
    
    if (!classData) {
        showNotification('Class not found', 'error');
        return;
    }
    
    // Daily.co room URL
    const roomUrl = `https://edtech.daily.co/${classData.roomName}`;
    
    content.innerHTML = `
        <div class="live-class-container">
            <!-- Class Info Bar -->
            <div class="class-info-bar">
                <div class="class-details-compact">
                    <h3>${classData.title}</h3>
                    <span>👨‍🏫 ${classData.teacherName}</span>
                </div>
                <div class="class-actions-compact">
                    <button onclick="toggleChat()" class="btn-icon" title="Toggle Chat">💬</button>
                    <button onclick="toggleParticipants()" class="btn-icon" title="Participants">👥</button>
                    <button onclick="leaveClass()" class="btn-leave">Leave Class</button>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="class-main-content">
                <!-- Video Container -->
                <div class="video-container" id="dailyVideoContainer">
                    <!-- Daily.co iframe will be injected here -->
                </div>

                <!-- Chat Sidebar -->
                <div class="chat-sidebar" id="chatSidebar">
                    <div class="chat-header">
                        <h4>Chat</h4>
                        <button onclick="toggleChat()" class="btn-close">×</button>
                    </div>
                    <div class="chat-messages" id="chatMessages">
                        <!-- Messages will appear here -->
                    </div>
                    <div class="chat-input">
                        <input type="text" id="chatMessageInput" placeholder="Type a message..." 
                               onkeypress="if(event.key==='Enter') sendChatMessage('${classId}')">
                        <button onclick="sendChatMessage('${classId}')">Send</button>
                    </div>
                </div>

                <!-- Participants Sidebar -->
                <div class="participants-sidebar" id="participantsSidebar" style="display: none;">
                    <div class="participants-header">
                        <h4>Participants</h4>
                        <button onclick="toggleParticipants()" class="btn-close">×</button>
                    </div>
                    <div class="participants-list" id="participantsList">
                        <!-- Participants will appear here -->
                    </div>
                </div>
            </div>

            <!-- Controls Bar -->
            <div class="class-controls-bar">
                <button onclick="raiseHand('${classId}')" class="btn-control" id="raiseHandBtn">
                    ✋ Raise Hand
                </button>
                <button onclick="toggleReactions()" class="btn-control">
                    😊 Reactions
                </button>
            </div>

            <!-- Reactions Popup -->
            <div class="reactions-popup" id="reactionsPopup" style="display: none;">
                ${['👍', '👏', '❤️', '🎉', '🤔', '😮'].map(emoji => `
                    <button onclick="sendReaction('${classId}', '${emoji}')" class="reaction-btn">
                        ${emoji}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    // Initialize Daily.co
    initializeDailyCall(roomUrl, classId);
    
    // Listen for chat messages
    listenToChatMessages(classId);
}

function initializeDailyCall(roomUrl, classId) {
    const container = document.getElementById('dailyVideoContainer');
    
    // Create Daily.co call frame
    const callFrame = window.DailyIframe.createFrame(container, {
        iframeStyle: {
            width: '100%',
            height: '100%',
            border: 'none'
        },
        showLeaveButton: false,
        showFullscreenButton: true
    });
    
    // Join the call
    callFrame.join({
        url: roomUrl,
        userName: AppState.currentUser.displayName
    });
    
    // Handle events
    callFrame
        .on('joined-meeting', () => {
            console.log('Joined meeting');
            updateParticipantCount(classId, 1);
        })
        .on('left-meeting', () => {
            console.log('Left meeting');
            updateParticipantCount(classId, -1);
            window.location.hash = 'live-classes';
        })
        .on('participant-joined', (event) => {
            console.log('Participant joined:', event.participant);
            updateParticipantsList(callFrame);
        })
        .on('participant-left', (event) => {
            console.log('Participant left:', event.participant);
            updateParticipantsList(callFrame);
        });
    
    // Store for later use
    window.currentCallFrame = callFrame;
    
    // Update participants list
    updateParticipantsList(callFrame);
}

function updateParticipantsList(callFrame) {
    const participants = callFrame.participants();
    const list = document.getElementById('participantsList');
    
    if (!list) return;
    
    const participantArray = Object.values(participants);
    list.innerHTML = participantArray.map(p => `
        <div class="participant-item">
            <div class="participant-avatar">
                ${p.user_name ? p.user_name[0].toUpperCase() : '?'}
            </div>
            <span class="participant-name">${p.user_name || 'Anonymous'}</span>
            ${p.audio ? '🎤' : '🔇'}
            ${p.video ? '📹' : '📷'}
        </div>
    `).join('');
}

async function updateParticipantCount(classId, change) {
    const classData = await FirebaseDB.getDoc('liveClasses', classId);
    const newCount = (classData.participantCount || 0) + change;
    await FirebaseDB.updateDoc('liveClasses', classId, {
        participantCount: Math.max(0, newCount)
    });
}

function listenToChatMessages(classId) {
    const unsubscribe = FirebaseDB.onSnapshot('chatMessages', (messages) => {
        const classMessages = messages.filter(m => m.classId === classId);
        displayChatMessages(classMessages);
    }, {
        field: 'classId',
        operator: '==',
        value: classId
    });
    
    window.chatUnsubscribe = unsubscribe;
}

function displayChatMessages(messages) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    container.innerHTML = messages
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(msg => `
            <div class="chat-message ${msg.senderId === AppState.currentUser.uid ? 'own-message' : ''}">
                <div class="message-sender">${msg.senderName}</div>
                <div class="message-content">${msg.message}</div>
                <div class="message-time">${formatTime(msg.timestamp)}</div>
            </div>
        `).join('');
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

async function sendChatMessage(classId) {
    const input = document.getElementById('chatMessageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    await FirebaseDB.addDoc('chatMessages', {
        classId: classId,
        senderId: AppState.currentUser.uid,
        senderName: AppState.currentUser.displayName,
        message: message,
        timestamp: new Date()
    });
    
    input.value = '';
}

async function raiseHand(classId) {
    const btn = document.getElementById('raiseHandBtn');
    
    if (btn.classList.contains('hand-raised')) {
        // Lower hand
        btn.classList.remove('hand-raised');
        btn.textContent = '✋ Raise Hand';
    } else {
        // Raise hand
        btn.classList.add('hand-raised');
        btn.textContent = '✋ Hand Raised';
        
        // Notify teacher
        await FirebaseDB.addDoc('handRaises', {
            classId: classId,
            studentId: AppState.currentUser.uid,
            studentName: AppState.currentUser.displayName,
            timestamp: new Date()
        });
        
        showNotification('Hand raised! Teacher will respond soon.', 'success');
    }
}

async function sendReaction(classId, emoji) {
    // Show reaction animation
    showReactionAnimation(emoji);
    
    // Save to database (optional)
    await FirebaseDB.addDoc('reactions', {
        classId: classId,
        userId: AppState.currentUser.uid,
        emoji: emoji,
        timestamp: new Date()
    });
    
    toggleReactions();
}

function showReactionAnimation(emoji) {
    const animation = document.createElement('div');
    animation.className = 'reaction-animation';
    animation.textContent = emoji;
    animation.style.left = Math.random() * 80 + 10 + '%';
    document.querySelector('.live-class-container').appendChild(animation);
    
    setTimeout(() => animation.remove(), 3000);
}

function toggleChat() {
    const sidebar = document.getElementById('chatSidebar');
    sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
}

function toggleParticipants() {
    const sidebar = document.getElementById('participantsSidebar');
    sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
}

function toggleReactions() {
    const popup = document.getElementById('reactionsPopup');
    popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
}

function leaveClass() {
    if (window.currentCallFrame) {
        window.currentCallFrame.leave();
    }
    if (window.chatUnsubscribe) {
        window.chatUnsubscribe();
    }
    window.location.hash = 'live-classes';
}

async function setReminder(classId) {
    const classData = await FirebaseDB.getDoc('liveClasses', classId);
    
    if ('Notification' in window && Notification.permission === 'granted') {
        showNotification('Reminder set! We\'ll notify you before the class starts.', 'success');
        
        // Schedule notification (this is simplified, in production use a service worker)
        const timeUntilClass = classData.startTime.toDate() - new Date();
        if (timeUntilClass > 0 && timeUntilClass < 24 * 60 * 60 * 1000) {
            setTimeout(() => {
                new Notification('Class Starting Soon!', {
                    body: `${classData.title} starts in 10 minutes`,
                    icon: classData.thumbnail
                });
            }, timeUntilClass - 10 * 60 * 1000);
        }
    } else if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                setReminder(classId);
            }
        });
    }
}

async function watchRecording(classId) {
    const classData = await FirebaseDB.getDoc('liveClasses', classId);
    
    if (!classData.recordingUrl) {
        showNotification('Recording not available', 'error');
        return;
    }
    
    // Play recording using video player
    playVideo(classData.recordingUrl, classData.title);
}

function formatTime(timestamp) {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}
