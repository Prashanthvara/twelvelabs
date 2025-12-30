// TwelveLabs API - Direct REST API implementation for Cloudflare Workers
// The twelvelabs-js SDK has Node.js dependencies that don't work in Workers

const TWELVELABS_API_BASE = 'https://api.twelvelabs.io/v1.3';
const INDEX_NAME = 'Demo';
const MODEL_NAME = 'marengo2.7';
const MODEL_OPTIONS = ['visual', 'audio'];

// Helper: Make API request to TwelveLabs
async function twelvelabsRequest(apiKey, endpoint, options = {}) {
    const url = `${TWELVELABS_API_BASE}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || data.error || `API error: ${response.status}`);
    }
    return data;
}

// Helper: JSON response
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
}

// Helper: Error response
function errorResponse(message, status = 400) {
    return jsonResponse({ error: message }, status);
}

// Get or create the index
async function getOrCreateIndex(apiKey) {
    // List existing indexes to find ours
    const indexList = await twelvelabsRequest(apiKey, `/indexes?index_name=${encodeURIComponent(INDEX_NAME)}`);

    if (indexList.data && indexList.data.length > 0) {
        for (const index of indexList.data) {
            if (index.index_name === INDEX_NAME) {
                return { id: index._id, name: index.index_name };
            }
        }
    }

    // Create new index if not found
    const newIndex = await twelvelabsRequest(apiKey, '/indexes', {
        method: 'POST',
        body: JSON.stringify({
            index_name: INDEX_NAME,
            models: [{
                model_name: MODEL_NAME,
                model_options: MODEL_OPTIONS,
            }],
        }),
    });

    return { id: newIndex._id, name: INDEX_NAME };
}

// POST /api/index-video
// POST /api/index-video
async function handleIndexVideo(request, apiKey) {
    try {
        const { videoUrl } = await request.json();
        if (!videoUrl) {
            return errorResponse('videoUrl is required');
        }

        const index = await getOrCreateIndex(apiKey);

        // Build FormData for multipart/form-data request (required by TwelveLabs API)
        const formData = new FormData();
        formData.append('index_id', index.id);
        formData.append('video_url', videoUrl);

        // Make request with FormData (browser/worker sets Content-Type with boundary)
        const url = `${TWELVELABS_API_BASE}/tasks`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
            },
            body: formData,
        });

        const task = await response.json();

        if (!response.ok) {
            throw new Error(task.message || task.error || `API error: ${response.status}`);
        }

        return jsonResponse({
            taskId: task._id,
            message: 'Video indexing started successfully',
        });
    } catch (error) {
        console.error('Index video error:', error);
        return errorResponse(error.message || 'Failed to index video', 500);
    }
}

// POST /api/task-status
async function handleTaskStatus(request, apiKey) {
    try {
        const { taskId } = await request.json();
        if (!taskId) {
            return errorResponse('taskId is required');
        }

        const task = await twelvelabsRequest(apiKey, `/tasks/${taskId}`);

        return jsonResponse({
            taskId: task._id,
            status: task.status,
            videoId: task.video_id,
        });
    } catch (error) {
        console.error('Task status error:', error);
        return errorResponse(error.message || 'Failed to get task status', 500);
    }
}

// GET /api/list-all-videos
async function handleListAllVideos(apiKey) {
    try {
        const index = await getOrCreateIndex(apiKey);
        const videos = await twelvelabsRequest(apiKey, `/indexes/${index.id}/videos`);

        // Transform to match frontend expectations
        const videoList = (videos.data || []).map(v => ({
            id: v._id,
            status: v.status,
            thumbnailUrl: v.hls?.thumbnail_urls?.[0],
            systemMetadata: {
                filename: v.system_metadata?.filename || v.metadata?.filename || v._id,
                duration: v.system_metadata?.duration,
            },
        }));

        return jsonResponse({ videos: videoList });
    } catch (error) {
        console.error('List videos error:', error);
        return errorResponse(error.message || 'Failed to list videos', 500);
    }
}

// GET /api/get-video-details
async function handleGetVideoDetails(request, apiKey) {
    try {
        const url = new URL(request.url);
        const videoId = url.searchParams.get('videoId');
        if (!videoId) {
            return errorResponse('videoId is required');
        }

        const index = await getOrCreateIndex(apiKey);
        const video = await twelvelabsRequest(apiKey, `/indexes/${index.id}/videos/${videoId}`);

        // Transform to match frontend expectations
        return jsonResponse({
            id: video._id,
            created_at: video.created_at,
            status: video.hls?.status || 'unknown',
            hls: video.hls ? {
                streamUrl: video.hls.video_url,
                thumbnailUrls: video.hls.thumbnail_urls,
                duration: video.system_metadata?.duration || 0,
            } : null,
            systemMetadata: {
                filename: video.system_metadata?.filename || video.metadata?.filename || video._id,
                duration: video.system_metadata?.duration,
            },
        });
    } catch (error) {
        console.error('Get video details error:', error);
        return errorResponse(error.message || 'Failed to get video details', 500);
    }
}

// POST /api/search-video
async function handleSearchVideo(request, apiKey) {
    try {
        const { videoId, query } = await request.json();
        if (!query) {
            return errorResponse('query is required');
        }

        const index = await getOrCreateIndex(apiKey);

        // Build FormData for multipart/form-data request (required by TwelveLabs search API)
        const formData = new FormData();
        formData.append('index_id', index.id);
        formData.append('query_text', query);
        // Append each search option individually (API doesn't accept comma-separated)
        MODEL_OPTIONS.forEach(option => formData.append('search_options', option));

        // If videoId is provided, filter to that specific video
        if (videoId) {
            formData.append('filter', JSON.stringify({ id: [videoId] }));
        }

        // Make request with FormData (no Content-Type header - browser sets it with boundary)
        const url = `${TWELVELABS_API_BASE}/search`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
            },
            body: formData,
        });

        const searchResults = await response.json();
        if (!response.ok) {
            throw new Error(searchResults.message || searchResults.error || `API error: ${response.status}`);
        }

        // Transform results for frontend
        const results = (searchResults.data || []).map(clip => ({
            videoId: clip.video_id,
            start: clip.start,
            end: clip.end,
            score: clip.score || clip.rank || 0,
            confidence: clip.confidence || 0,
            transcription: clip.transcription || null,
        }));

        return jsonResponse({ results });
    } catch (error) {
        console.error('Search video error:', error);
        return errorResponse(error.message || 'Failed to search video', 500);
    }
}

// Main request handler
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        // Check for API key
        const apiKey = env.TWELVELABS_API_KEY;
        if (!apiKey && path.startsWith('/api/')) {
            return errorResponse('TwelveLabs API key not configured', 500);
        }

        // Route requests
        if (path === '/api/index-video' && request.method === 'POST') {
            return handleIndexVideo(request, apiKey);
        }

        if (path === '/api/task-status' && request.method === 'POST') {
            return handleTaskStatus(request, apiKey);
        }

        if (path === '/api/list-all-videos' && request.method === 'GET') {
            return handleListAllVideos(apiKey);
        }

        if (path === '/api/get-video-details' && request.method === 'GET') {
            return handleGetVideoDetails(request, apiKey);
        }

        if (path === '/api/search-video' && request.method === 'POST') {
            return handleSearchVideo(request, apiKey);
        }

        // Let Cloudflare serve static assets for non-API routes
        return env.ASSETS.fetch(request);
    },
};
