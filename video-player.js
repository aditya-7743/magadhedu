// Video Player Component with YouTube Integration

function playVideo(videoUrl, title) {
    const content = document.getElementById('main-content');
    
    // Extract YouTube video ID if it's a YouTube URL
    const youtubeId = extractYouTubeId(videoUrl);
    
    content.innerHTML = `
        <div class="video-player-page">
            <button onclick="history.back()" class="btn-back">← Back</button>
            
            <h2>${title}</h2>
            
            <div class="video-container-large">
                ${youtubeId ? `
                    <iframe
                        width="100%"
                        height="600"
                        src="https://www.youtube.com/embed/${youtubeId}?autoplay=1"
                        frameborder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                ` : `
                    <video controls autoplay width="100%">
                        <source src="${videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `}
            </div>

            <div class="video-controls-extra">
                <button onclick="toggleSpeed()" class="btn-control">Speed: 1x</button>
                <button onclick="toggleQuality()" class="btn-control">Quality</button>
                <button onclick="downloadVideo('${videoUrl}')" class="btn-control">Download</button>
            </div>
        </div>
    `;
}

function extractYouTubeId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function toggleSpeed() {
    // Toggle video playback speed
    const video = document.querySelector('video');
    if (video) {
        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const currentSpeed = video.playbackRate;
        const currentIndex = speeds.indexOf(currentSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        video.playbackRate = speeds[nextIndex];
        event.target.textContent = `Speed: ${speeds[nextIndex]}x`;
    }
}

function toggleQuality() {
    showNotification('Quality settings coming soon', 'info');
}

function downloadVideo(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video.mp4';
    a.click();
}
