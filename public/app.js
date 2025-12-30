document.addEventListener('DOMContentLoaded', () => {
    window.appLogs = [];
    function log(msg) { window.appLogs.push(Date.now() + ': ' + msg); console.log(msg); }
    // Helper function to format seconds into minutes and seconds
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    }

    // Helper function to format ISO date strings
    function formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    const api = {
        indexVideo: '/api/index-video',
        taskStatus: '/api/task-status',
        searchVideo: '/api/search-video',
        listAllVideos: '/api/list-all-videos',
        getVideoDetails: '/api/get-video-details',
    };

    // DOM Elements
    const videoList = document.getElementById('video-list');
    const indexVideoBtn = document.getElementById('index-video-btn');
    const modal = document.getElementById('indexing-modal');
    const closeBtn = document.querySelector('.close-btn');
    const submitIndexingBtn = document.getElementById('submit-indexing-btn');
    const videoUrlInput = document.getElementById('video-url-input');
    const indexingStatus = document.getElementById('indexing-status');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const videoPlayerContainer = document.getElementById('video-player-container');
    const videoDetailsContainer = document.getElementById('video-details-container');
    const searchResultsContainer = document.getElementById('search-results-container');

    // Sidebar toggle elements (for mobile)
    const sidebar = document.getElementById('video-library-pane');

    let selectedVideoId = null;

    // --- Event Listeners ---
    indexVideoBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Desktop: Back button prevention/handling if needed, currently handled by CSS display:none

    // Keyboard Navigation for Video List
    videoList.addEventListener('keydown', (e) => {
        const items = Array.from(document.querySelectorAll('.video-item'));
        const focusedIndex = items.findIndex(item => item === document.activeElement);

        if (focusedIndex === -1) return;

        switch(e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                e.preventDefault();
                if (focusedIndex < items.length - 1) {
                    items[focusedIndex + 1].focus();
                }
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                if (focusedIndex > 0) {
                    items[focusedIndex - 1].focus();
                }
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                // Trigger click on focused item
                items[focusedIndex].click();
                break;
        }
    });

    submitIndexingBtn.addEventListener('click', handleIndexVideo);
    searchBtn.addEventListener('click', handleSearchVideo);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSearchVideo();
        }
    });
    videoList.addEventListener('click', handleVideoSelection);

    // --- Core Functions ---
    async function handleIndexVideo() {
        const videoUrl = videoUrlInput.value.trim();
        if (!videoUrl) {
            indexingStatus.textContent = 'Please enter a video URL.';
            return;
        }

        indexingStatus.textContent = 'Starting video indexing...';
        try {
            const response = await fetch(api.indexVideo, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl }),
            });

            const data = await response.json();
            if (response.ok) {
                indexingStatus.textContent = `Indexing task started with ID: ${data.taskId}`;
                pollTaskStatus(data.taskId);
            } else {
                indexingStatus.textContent = `Error: ${data.error}`;
            }
        } catch (error) {
            indexingStatus.textContent = 'Failed to start indexing.';
            console.error('Indexing Error:', error);
        }
    }

    async function pollTaskStatus(taskId) {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(api.taskStatus, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ taskId }),
                });

                const data = await response.json();
                if (response.ok) {
                    indexingStatus.textContent = `Task ${taskId}: ${data.status}`;
                    if (data.status === 'ready') {
                        clearInterval(interval);
                        indexingStatus.textContent = 'Video indexed successfully!';
                        videoUrlInput.value = '';
                        setTimeout(() => {
                            modal.style.display = 'none';
                            indexingStatus.textContent = '';
                        }, 2000);
                        loadVideos();
                    } else if (['failed', 'error'].includes(data.status)) {
                        clearInterval(interval);
                        indexingStatus.textContent = `Indexing failed: ${data.status}`;
                    }
                } else {
                    clearInterval(interval);
                    indexingStatus.textContent = `Error checking status: ${data.error}`;
                }
            } catch (error) {
                clearInterval(interval);
                indexingStatus.textContent = 'Failed to get task status.';
                console.error('Polling Error:', error);
            }
        }, 5000);
    }

    async function handleSearchVideo() {
        log('handleSearchVideo called');
        const query = searchInput.value.trim();
        if (!query) {
            alert('Please enter a search query.');
            return;
        }
        if (!selectedVideoId) {
            alert('Please select a video to search in.');
            return;
        }

        searchResultsContainer.innerHTML = '<div class="spinner"></div><p style="text-align:center; color:#666;">Searching video content...</p>';
        try {
            const response = await fetch(api.searchVideo, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId: selectedVideoId, query }),
            });

            const data = await response.json();
            if (response.ok) {
                displaySearchResults(data.results);
            } else {
                searchResultsContainer.innerHTML = `<p>Error: ${data.error}</p>`;
            }
        } catch (error) {
            searchResultsContainer.innerHTML = '<p>Failed to perform search.</p>';
            console.error('Search Error:', error);
        }
    }

    async function loadVideos() {
        try {
            const response = await fetch(api.listAllVideos);
            const data = await response.json();
            if (response.ok) {
                displayVideos(data.videos);
            } else {
                videoList.innerHTML = `<p>Error: ${data.error}</p>`;
            }
        } catch (error) {
            videoList.innerHTML = '<p>Failed to load videos.</p>';
            console.error('Load Videos Error:', error);
        }
    }

    async function handleVideoSelection(event) {
        const videoItem = event.target.closest('.video-item');
        if (videoItem) {
            selectedVideoId = videoItem.dataset.videoId;

            // Update UI for selection
            document.querySelectorAll('.video-item').forEach(item => item.classList.remove('selected'));
            videoItem.classList.add('selected');

            // Clear search query when switching videos
            searchInput.value = '';

            // Scroll to player to ensure visibility (only on mobile/tablet or explicit user click)
            // On desktop initial load, we might not want to scroll.
            // Check if this validation was triggered by a user click (event exists)
            if (event && event.isTrusted) {
                if (window.innerWidth < 1025) {
                    setTimeout(() => {
                        videoPlayerContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                }

                // Accessibility: Move focus to the player container so next tab hits player controls
                videoPlayerContainer.setAttribute('tabindex', '-1');
                videoPlayerContainer.focus();
            }

            // Load video details
            loadVideoDetails(selectedVideoId);
        }
    }

    async function loadVideoDetails(videoId) {
        log('loadVideoDetails called for ' + videoId);
        // Show loading state in player
        videoPlayerContainer.innerHTML = `
            <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:white;">
                <div class="spinner"></div>
                <p style="margin-top:10px;">Loading video...</p>
            </div>
        `;
        log('videoPlayerContainer cleared');
        videoDetailsContainer.innerHTML = 'Loading video details...';
        searchResultsContainer.innerHTML = '';

        try {
            const response = await fetch(`${api.getVideoDetails}?videoId=${videoId}`);
            const data = await response.json();

            if (response.ok && data.hls) {
                videoPlayerContainer.innerHTML = `<video controls src="${data.hls.streamUrl}"></video>`;
                videoDetailsContainer.innerHTML = `
                    <h4>${data.systemMetadata.filename || 'Video Details'}</h4>
                    <p><strong>Duration:</strong> ${formatTime(data.hls.duration)}</p>
                    <p><strong>Created At:</strong> ${formatDate(data.created_at)}</p>
                `;
            } else {
                videoDetailsContainer.innerHTML = `<p>Error: ${data.error || 'HLS stream not available.'}</p>`;
            }
        } catch (error) {
            videoDetailsContainer.innerHTML = '<p>Failed to load video details.</p>';
            console.error('Load Video Details Error:', error);
        }
    }

    // --- UI Display Functions ---
    function displayVideos(videos) {
        videoList.innerHTML = '';
        if (videos.length === 0) {
            videoList.innerHTML = '<p>No videos found. Index one to get started.</p>';
            return;
        }

        videos.forEach((video, index) => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            videoItem.dataset.videoId = video.id;
            videoItem.setAttribute('tabindex', '0'); // Make focusable
            videoItem.setAttribute('role', 'option');
            videoItem.innerHTML = `
                <div class="video-thumbnail-container">
                    ${video.thumbnailUrl
                    ? `<img src="${video.thumbnailUrl}" class="video-thumbnail" alt="${video.systemMetadata?.filename}" loading="lazy" />`
                    : '<div class="video-thumbnail-placeholder"><i class="fas fa-video"></i></div>'
                }
                    <span class="video-duration">${formatTime(video.systemMetadata?.duration || 0)}</span>
                </div>
                <div class="video-info">
                    <h5>${video.systemMetadata?.filename || video.id}</h5>
                    ${video.status ? `<span class="status-badge">${video.status}</span>` : ''}
                </div>
            `;
            videoList.appendChild(videoItem);

            // Auto-select the latest video (first one)
            if (index === 0) {
                // Determine if we should auto-click based on a flag or state if needed
                // For now, we simulate selection to set initial state
                videoItem.classList.add('selected');
                selectedVideoId = video.id;

                // Load details but DON'T scroll to it automatically on page load
                // to prevent jarring jumps, unless it's a specific user action
                loadVideoDetails(video.id);
            }
        });
    }

    function displaySearchResults(results) {
        log('displaySearchResults called');
        searchResultsContainer.innerHTML = '';
        if (results.length === 0) {
            searchResultsContainer.innerHTML = '<p>No results found.</p>';
            return;
        }

        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <p><strong>Clip:</strong> ${formatTime(result.start)} - ${formatTime(result.end)} <button class="play-clip-btn"><i class="fas fa-play"></i> Go To</button></p>
                <p><strong>Score:</strong> ${result.score.toFixed(2)}</p>
            `;
            // Add click handler to the Play button
            const playBtn = resultItem.querySelector('.play-clip-btn');
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const video = videoPlayerContainer.querySelector('video');
                if (video) {
                    // Scroll all the way up
                    const mainContent = document.getElementById('main-content-pane');
                    if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    // Wait for scroll animation to complete before playing
                    setTimeout(() => {
                        video.currentTime = result.start;
                        video.play();
                    }, 300);
                }
            });
            searchResultsContainer.appendChild(resultItem);
        });
    }

    // Initial Load
    loadVideos();
});
