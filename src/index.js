import { TwelveLabs } from 'twelvelabs-js';

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		
		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 200,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
			});
		}

		// Add CORS headers to all responses
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};

		try {
			switch (url.pathname) {
				case '/':
					// Serve the static HTML file
					return new Response('Video Analysis App', {
						headers: {
							'Content-Type': 'text/html',
							...corsHeaders,
						},
					});

				case '/api/index-video':
					return await handleVideoIndexing(request, env, corsHeaders);

				case '/api/task-status':
					return await handleTaskStatus(request, env, corsHeaders);

				case '/api/search-video':
					return await handleVideoSearch(request, env, corsHeaders);

				case '/api/search-all':
					return await handleSearchAll(request, env, corsHeaders);

				case '/api/video-status':
					return await handleVideoStatus(request, env, corsHeaders);

				case '/api/get-indexes':
					return await handleGetIndexes(request, env, corsHeaders);

				case '/api/get-videos':
					return await handleGetVideos(request, env, corsHeaders);

				case '/api/list-videos':
					return await handleListAllVideos(request, env, corsHeaders);

				case '/api/delete-all-videos':
					return await handleDeleteAllVideos(request, env, corsHeaders);

				case '/api/get-video-details':
					return await handleGetVideoDetails(request, env, corsHeaders);

				default:
					return new Response('Not Found', { 
						status: 404,
						headers: corsHeaders,
					});
			}
		} catch (error) {
			console.error('Worker error:', error);
			return new Response(JSON.stringify({ 
				error: 'Internal server error',
				details: error.message 
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}
	},
};

async function handleVideoIndexing(request, env, corsHeaders) {
	if (request.method !== 'POST') {
		return new Response('Method not allowed', { 
			status: 405,
			headers: corsHeaders,
		});
	}

	try {
		console.log('Starting video indexing process...');
		const { videoUrl } = await request.json();
		console.log('Received video URL:', videoUrl);
		
		if (!videoUrl) {
			console.log('Error: No video URL provided');
			return new Response(JSON.stringify({ error: 'Video URL is required' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		// Initialize TwelveLabs client
		const apiKey = env.TWELVELABS_API_KEY;
		console.log('API Key present:', !!apiKey);
		if (!apiKey) {
			console.log('Error: No API key configured');
			return new Response(JSON.stringify({ 
				error: 'TwelveLabs API key not configured. Please set TWELVELABS_API_KEY environment variable.' 
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		console.log('Initializing TwelveLabs client...');
		const client = new TwelveLabs({ apiKey });
		console.log('TwelveLabs client initialized successfully');

		// Create a new index with a unique name
		console.log('Creating new index...');
		const indexName = `VideoIndex_${Date.now()}`;
		console.log('Index name:', indexName);
		
		let index;
		try {
			index = await client.indexes.create({
				indexName: indexName,
				models: [
					{
						modelName: 'marengo2.7',
						modelOptions: ['visual', 'audio'],
					},
				],
			});
			console.log('Index created successfully:', index);
			console.log('Index ID:', index.id);
		} catch (indexError) {
			console.error('Failed to create index:', indexError);
			return new Response(JSON.stringify({ 
				error: 'Failed to create index',
				details: indexError.message,
				stack: indexError.stack
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		// Create the video upload task
		console.log('Starting video upload...');
		console.log('Using index ID:', index.id);
		console.log('Video URL:', videoUrl);
		
		let task;
		try {
			task = await client.tasks.create({
				indexId: index.id,
				videoUrl: videoUrl
			});
			console.log('Video upload task created successfully:', task);
		} catch (taskError) {
			console.error('Failed to create video upload task:', taskError);
			return new Response(JSON.stringify({ 
				error: 'Failed to create video upload task',
				details: taskError.message,
				stack: taskError.stack
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		console.log('Video indexing task started successfully');
		return new Response(JSON.stringify({
			taskId: task.id,
			videoId: task.videoId,
			indexId: index.id,
			status: task.status,
			message: 'Video indexing task started successfully',
		}), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});

	} catch (error) {
		console.error('Unexpected error in video indexing:', error);
		console.error('Error stack:', error.stack);
		return new Response(JSON.stringify({ 
			error: 'Failed to index video',
			details: error.message,
			stack: error.stack
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}
}

async function handleTaskStatus(request, env, corsHeaders) {
	if (request.method !== 'POST') {
		return new Response('Method not allowed', { 
			status: 405,
			headers: corsHeaders,
		});
	}

	try {
		const { taskId } = await request.json();
		
		if (!taskId) {
			return new Response(JSON.stringify({ error: 'Task ID is required' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const apiKey = env.TWELVELABS_API_KEY;
		if (!apiKey) {
			return new Response(JSON.stringify({ 
				error: 'TwelveLabs API key not configured' 
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const client = new TwelveLabs({ apiKey });

		// Use waitForDone with a callback to track progress
		console.log(`Checking task status for task ID: ${taskId}`);
		
		const task = await client.tasks.waitForDone(taskId, {
			sleepInterval: 5, // Check every 5 seconds
			callback: (currentTask) => {
				console.log(`Task ${taskId} status: ${currentTask.status}`);
			},
		});

		console.log(`Task ${taskId} final status: ${task.status}`);

		if (task.status !== 'ready') {
			return new Response(JSON.stringify({
				status: task.status,
				error: `Indexing failed with status ${task.status}`,
				taskId: task.id,
				videoId: task.videoId,
			}), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		// Get video details if task is ready
		let videoDetails = null;
		try {
			videoDetails = await client.tasks.retrieve(task.videoId);
		} catch (error) {
			console.error('Failed to retrieve video details:', error);
		}

		return new Response(JSON.stringify({
			status: task.status,
			taskId: task.id,
			videoId: task.videoId,
			duration: videoDetails?.systemMetadata?.duration || null,
			createdAt: videoDetails?.createdAt || null,
			message: 'Video indexing completed successfully',
		}), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});

	} catch (error) {
		console.error('Task status error:', error);
		return new Response(JSON.stringify({ 
			error: 'Failed to get task status',
			details: error.message 
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}
}

async function handleVideoSearch(request, env, corsHeaders) {
	if (request.method !== 'POST') {
		return new Response('Method not allowed', { 
			status: 405,
			headers: corsHeaders,
		});
	}

	try {
		const { 
			videoId, 
			query, 
			searchOptions = ["visual", "audio", "conversation"],
			operator = "or",
			groupBy = "video",
			pageLimit = 10,
			sortOption = "score",
			adjustConfidenceLevel = 0.5
		} = await request.json();
		
		if (!query) {
			return new Response(JSON.stringify({ 
				error: 'Search query is required' 
			}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const apiKey = env.TWELVELABS_API_KEY;
		if (!apiKey) {
			return new Response(JSON.stringify({ 
				error: 'TwelveLabs API key not configured' 
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const client = new TwelveLabs({ apiKey });

		// Get the index
		const indexes = await client.indexes.list();
		if (!indexes.data || indexes.data.length === 0) {
			return new Response(JSON.stringify({ 
				error: 'No index found' 
			}), {
				status: 404,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const index = indexes.data[0];

		// Build search parameters
		const searchParams = {
			indexId: index.id,
			searchOptions,
			queryText: query,
			groupBy,
			operator,
			pageLimit,
			sortOption,
			adjustConfidenceLevel
		};

		// Add videoId filter if specified
		if (videoId) {
			searchParams.videoIds = [videoId];
		}

		// Search using the advanced query API
		const response = await client.search.query(searchParams);

		// Process the streaming response
		const results = [];
		const groupedResults = [];

		for await (const item of response) {
			if (item.id && item.clips) {  // Grouped by video
				groupedResults.push({
					videoId: item.id,
					clips: item.clips.map(clip => ({
						score: clip.score,
						start: clip.start,
						end: clip.end,
						videoId: clip.videoId,
						confidence: clip.confidence,
						thumbnailUrl: clip.thumbnailUrl,
						transcription: clip.transcription || null
					}))
				});
			} else {  // Individual clips
				results.push({
					score: item.score,
					start: item.start,
					end: item.end,
					videoId: item.videoId,
					confidence: item.confidence,
					thumbnailUrl: item.thumbnailUrl,
					transcription: item.transcription || null
				});
			}
		}

		return new Response(JSON.stringify({
			results: groupBy === "video" ? groupedResults : results,
			total: groupBy === "video" ? groupedResults.length : results.length,
			groupBy,
			query
		}), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});

	} catch (error) {
		console.error('Video search error:', error);
		return new Response(JSON.stringify({ 
			error: 'Failed to search video',
			details: error.message 
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}
}

async function handleSearchAll(request, env, corsHeaders) {
	if (request.method !== 'POST') {
		return new Response('Method not allowed', { 
			status: 405,
			headers: corsHeaders,
		});
	}

	try {
		const { 
			query, 
			searchOptions = ["visual", "audio", "conversation"],
			operator = "or",
			groupBy = "video",
			pageLimit = 10,
			sortOption = "score",
			adjustConfidenceLevel = 0.5,
			filter = null
		} = await request.json();
		
		if (!query) {
			return new Response(JSON.stringify({ 
				error: 'Search query is required' 
			}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const apiKey = env.TWELVELABS_API_KEY;
		if (!apiKey) {
			return new Response(JSON.stringify({ 
				error: 'TwelveLabs API key not configured' 
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const client = new TwelveLabs({ apiKey });

		// Get the index
		const indexes = await client.indexes.list();
		if (!indexes.data || indexes.data.length === 0) {
			return new Response(JSON.stringify({ 
				error: 'No index found' 
			}), {
				status: 404,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const index = indexes.data[0];

		// Build search parameters
		const searchParams = {
			indexId: index.id,
			searchOptions,
			queryText: query,
			groupBy,
			operator,
			pageLimit,
			sortOption,
			adjustConfidenceLevel
		};

		// Add filter if specified
		if (filter) {
			searchParams.filter = filter;
		}

		// Search using the advanced query API
		const response = await client.search.query(searchParams);

		// Process the streaming response
		const results = [];
		const groupedResults = [];

		for await (const item of response) {
			if (item.id && item.clips) {  // Grouped by video
				groupedResults.push({
					videoId: item.id,
					clips: item.clips.map(clip => ({
						score: clip.score,
						start: clip.start,
						end: clip.end,
						videoId: clip.videoId,
						confidence: clip.confidence,
						thumbnailUrl: clip.thumbnailUrl,
						transcription: clip.transcription || null
					}))
				});
			} else {  // Individual clips
				results.push({
					score: item.score,
					start: item.start,
					end: item.end,
					videoId: item.videoId,
					confidence: item.confidence,
					thumbnailUrl: item.thumbnailUrl,
					transcription: item.transcription || null
				});
			}
		}

		return new Response(JSON.stringify({
			results: groupBy === "video" ? groupedResults : results,
			total: groupBy === "video" ? groupedResults.length : results.length,
			groupBy,
			query
		}), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});

	} catch (error) {
		console.error('Search all error:', error);
		return new Response(JSON.stringify({ 
			error: 'Failed to search videos',
			details: error.message 
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}
}

async function handleVideoStatus(request, env, corsHeaders) {
	if (request.method !== 'GET') {
		return new Response('Method not allowed', { 
			status: 405,
			headers: corsHeaders,
		});
	}

	try {
		const url = new URL(request.url);
		const videoId = url.searchParams.get('videoId');
		
		if (!videoId) {
			return new Response(JSON.stringify({ 
				error: 'Video ID is required' 
			}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const apiKey = env.TWELVELABS_API_KEY;
		if (!apiKey) {
			return new Response(JSON.stringify({ 
				error: 'TwelveLabs API key not configured' 
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const client = new TwelveLabs({ apiKey });

		// Get the index
		const indexes = await client.indexes.list();
		if (!indexes.data || indexes.data.length === 0) {
			return new Response(JSON.stringify({ 
				error: 'No index found' 
			}), {
				status: 404,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const index = indexes.data[0];

		// Get video status using the correct API structure
		const video = await client.videos.retrieve(videoId);

		return new Response(JSON.stringify({
			videoId: video.id,
			status: video.status,
			duration: video.duration,
			createdAt: video.created_at,
			updatedAt: video.updated_at,
		}), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});

	} catch (error) {
		console.error('Video status error:', error);
		return new Response(JSON.stringify({ 
			error: 'Failed to get video status',
			details: error.message 
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}
}

async function handleGetIndexes(request, env, corsHeaders) {
	if (request.method !== 'GET') {
		return new Response('Method not allowed', { 
			status: 405,
			headers: corsHeaders,
		});
	}

	try {
		const apiKey = env.TWELVELABS_API_KEY;
		if (!apiKey) {
			return new Response(JSON.stringify({ 
				error: 'TwelveLabs API key not configured' 
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const client = new TwelveLabs({ apiKey });

		// Get all indexes
		const indexesPager = await client.indexes.list({
			page: 1,
			pageLimit: 50,
			sortBy: "created_at",
			sortOption: "desc"
		});

		const indexes = [];
		for await (const index of indexesPager) {
			indexes.push({
				id: index.id,
				name: index.indexName,
				videoCount: index.videoCount,
				totalDuration: index.totalDuration,
				createdAt: index.createdAt,
				updatedAt: index.updatedAt,
				models: index.models ? index.models.map(model => ({
					name: model.modelName,
					options: model.modelOptions
				})) : []
			});
		}

		return new Response(JSON.stringify({
			indexes,
			total: indexes.length,
		}), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});

	} catch (error) {
		console.error('Failed to get indexes:', error);
		return new Response(JSON.stringify({ 
			error: 'Failed to get indexes',
			details: error.message 
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}
}

async function handleGetVideos(request, env, corsHeaders) {
	if (request.method !== 'GET') {
		return new Response('Method not allowed', { 
			status: 405,
			headers: corsHeaders,
		});
	}

	try {
		const url = new URL(request.url);
		const indexId = url.searchParams.get('indexId');

		if (!indexId) {
			return new Response(JSON.stringify({ 
				error: 'Index ID is required' 
			}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const apiKey = env.TWELVELABS_API_KEY;
		if (!apiKey) {
			return new Response(JSON.stringify({ 
				error: 'TwelveLabs API key not configured' 
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const client = new TwelveLabs({ apiKey });

		// Get all videos from the specified index
		const videosPager = await client.indexes.videos.list(indexId);
		
		const videos = [];
		for await (const video of videosPager.data) {
			videos.push({
				id: video.id,
				indexId: indexId,
				status: video.status,
				createdAt: video.createdAt,
				updatedAt: video.updatedAt,
				indexedAt: video.indexedAt,
				systemMetadata: video.systemMetadata ? {
					filename: video.systemMetadata.filename,
					duration: video.systemMetadata.duration,
					fps: video.systemMetadata.fps,
					width: video.systemMetadata.width,
					height: video.systemMetadata.height,
					size: video.systemMetadata.size
				} : null
			});
		}

		return new Response(JSON.stringify({
			videos,
			total: videos.length,
		}), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});

	} catch (error) {
		console.error('Failed to get videos:', error);
		return new Response(JSON.stringify({ 
			error: 'Failed to get videos',
			details: error.message 
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}
}

async function handleListAllVideos(request, env, corsHeaders) {
	if (request.method !== 'GET') {
		return new Response('Method not allowed', { 
			status: 405,
			headers: corsHeaders,
		});
	}

	try {
		const apiKey = env.TWELVELABS_API_KEY;
		if (!apiKey) {
			return new Response(JSON.stringify({ 
				error: 'TwelveLabs API key not configured' 
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const client = new TwelveLabs({ apiKey });

		// Get all videos across all indexes
		const indexes = await client.indexes.list();
		if (!indexes.data || indexes.data.length === 0) {
			return new Response(JSON.stringify({ 
				message: 'No indexes found or no videos in indexes' 
			}), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const allVideos = [];
		for (const index of indexes.data) {
			const videosPager = await client.indexes.videos.list(index.id);
			for await (const video of videosPager.data) {
				// Retrieve full video details to get HLS data with thumbnails
				const fullVideo = await client.indexes.videos.retrieve(index.id, video.id);
				
				allVideos.push({
					id: video.id,
					indexId: index.id, // Use the index ID from the loop since video.indexId might not exist
					status: video.status,
					createdAt: video.createdAt,
					updatedAt: video.updatedAt,
					indexedAt: video.indexedAt,
					thumbnailUrls: fullVideo.hls.thumbnailUrls || null,
					systemMetadata: video.systemMetadata ? {
						filename: video.systemMetadata.filename,
						duration: video.systemMetadata.duration,
						fps: video.systemMetadata.fps,
						width: video.systemMetadata.width,
						height: video.systemMetadata.height,
						size: video.systemMetadata.size
					} : null
				});
			}
		}

		return new Response(JSON.stringify({
			videos: allVideos,
			total: allVideos.length,
		}), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});

	} catch (error) {
		console.error('Failed to list all videos:', error);
		return new Response(JSON.stringify({ 
			error: 'Failed to list all videos',
			details: error.message 
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}
}

async function handleDeleteAllVideos(request, env, corsHeaders) {
	if (request.method !== 'POST') {
		return new Response('Method not allowed', { 
			status: 405,
			headers: corsHeaders,
		});
	}

	try {
		const { indexId } = await request.json();

		if (!indexId) {
			return new Response(JSON.stringify({ 
				error: 'Index ID is required to delete all videos' 
			}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const apiKey = env.TWELVELABS_API_KEY;
		if (!apiKey) {
			return new Response(JSON.stringify({ 
				error: 'TwelveLabs API key not configured' 
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const client = new TwelveLabs({ apiKey });

		// Get all videos from the specified index
		const videosPager = await client.indexes.videos.list(indexId);
		
		const videosToDelete = [];
		for await (const video of videosPager.data) {
			videosToDelete.push(video.id);
		}

		if (videosToDelete.length === 0) {
			return new Response(JSON.stringify({ 
				message: 'No videos found in the specified index to delete' 
			}), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		console.log(`Attempting to delete ${videosToDelete.length} videos from index ID: ${indexId}`);

		for (const videoId of videosToDelete) {
			try {
				await client.videos.delete(videoId);
				console.log(`Deleted video ID: ${videoId}`);
			} catch (deleteError) {
				console.error(`Failed to delete video ID ${videoId}:`, deleteError);
			}
		}

		return new Response(JSON.stringify({
			message: `Successfully deleted ${videosToDelete.length} videos from index ID: ${indexId}`,
			deletedVideoIds: videosToDelete,
		}), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});

	} catch (error) {
		console.error('Failed to delete all videos:', error);
		return new Response(JSON.stringify({ 
			error: 'Failed to delete all videos',
			details: error.message 
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}
}

async function handleGetVideoDetails(request, env, corsHeaders) {
	if (request.method !== 'GET') {
		return new Response('Method not allowed', { 
			status: 405,
			headers: corsHeaders,
		});
	}

	try {
		const url = new URL(request.url);
		const videoId = url.searchParams.get('videoId');

		if (!videoId) {
			return new Response(JSON.stringify({ 
				error: 'Video ID is required' 
			}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const apiKey = env.TWELVELABS_API_KEY;
		if (!apiKey) {
			return new Response(JSON.stringify({ 
				error: 'TwelveLabs API key not configured' 
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const client = new TwelveLabs({ apiKey });

		// Get the index
		const indexes = await client.indexes.list();
		if (!indexes.data || indexes.data.length === 0) {
			return new Response(JSON.stringify({ 
				error: 'No index found' 
			}), {
				status: 404,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const index = indexes.data[0];

		// Get video details including HLS stream data
		const video = await client.indexes.videos.retrieve(index.id, videoId);

		return new Response(JSON.stringify({
			videoId: video.id,
			indexId: index.id, // Use the index ID from the found index since video.indexId might not exist
			status: video.status,
			createdAt: video.createdAt,
			updatedAt: video.updatedAt,
			indexedAt: video.indexedAt,
			hls: video.hls ? {
				videoUrl: video.hls.videoUrl,
				thumbnailUrls: video.hls.thumbnailUrls,
				duration: video.hls.duration,
				fps: video.hls.fps,
				width: video.hls.width,
				height: video.hls.height,
				size: video.hls.size
			} : null,
			systemMetadata: video.systemMetadata ? {
				filename: video.systemMetadata.filename,
				duration: video.systemMetadata.duration,
				fps: video.systemMetadata.fps,
				width: video.systemMetadata.width,
				height: video.systemMetadata.height,
				size: video.systemMetadata.size
			} : null
		}), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});

	} catch (error) {
		console.error('Failed to get video details:', error);
		return new Response(JSON.stringify({ 
			error: 'Failed to get video details',
			details: error.message 
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}
}
