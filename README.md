# TwelveLabs Video Analysis

AI-powered video search and analysis. Upload any video, search its content with natural language, and get precise timestamps for relevant moments.

Powered by [TwelveLabs Marengo 2.7](https://twelvelabs.io/), deployed on [Cloudflare Workers](https://workers.cloudflare.com/).

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v16+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [TwelveLabs API Key](https://twelvelabs.io/) (free tier available)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Set your TwelveLabs API key
wrangler secret put TWELVELABS_API_KEY

# 3. Run locally
npm run dev
```

Open `http://localhost:8787` and start indexing videos.

---

## Core Workflows

### 1. Video Indexing

**Input:** Video URL (MP4, MOV, WebM, YouTube, or cloud storage)

**Process:**
1. Submit video URL via the modal
2. System creates/retrieves the shared "Demo" index
3. TwelveLabs ingests the video and runs multi-modal analysis
4. Status updates every 5 seconds until processing completes

**Output:** 
- Task ID for tracking
- Video ID for searching
- Ready status when complete

**Time:** Depends on video length (typically 2-30 minutes)

---

### 2. Video Management

**View All Videos:**
- Gallery shows all indexed videos with thumbnails and duration
- Status badges indicate indexing state
- Click any video to load it in the player

**Video Details:**
- Displays filename, duration, and creation date
- HLS stream embedded in HTML5 player with playback controls
- Auto-loads most recent video on first visit

---

### 3. Video Search

**Input:** Natural language query (e.g., "person walking", "car accident", "speaking about AI")

**Process:**
1. Submit search query for selected video
2. Query routed to TwelveLabs search API (filtered by video ID)
3. Engine analyzes visual and audio content
4. Returns matching clips with timestamps and confidence scores

**Output:** 
- List of clips with start/end times
- Confidence/relevance scores
- "Go To" button jumps video to that moment

**Search Options:** Visual and audio analysis enabled by default

---

## API Reference

### POST `/api/index-video`
Index a new video for analysis.

**Request:**
```json
{
  "videoUrl": "https://example.com/video.mp4"
}
```

**Response:**
```json
{
  "taskId": "task_abc123",
  "message": "Video indexing started successfully"
}
```

---

### POST `/api/task-status`
Check indexing progress.

**Request:**
```json
{
  "taskId": "task_abc123"
}
```

**Response:**
```json
{
  "taskId": "task_abc123",
  "status": "ready|indexing|failed",
  "videoId": "video_xyz789"
}
```

---

### GET `/api/list-all-videos`
Fetch all indexed videos in the shared index.

**Response:**
```json
{
  "videos": [
    {
      "id": "video_xyz789",
      "status": "ready",
      "thumbnailUrl": "https://...",
      "systemMetadata": {
        "filename": "example.mp4",
        "duration": 120.5
      }
    }
  ]
}
```

---

### GET `/api/get-video-details?videoId=video_xyz789`
Fetch HLS stream and metadata for a specific video.

**Response:**
```json
{
  "id": "video_xyz789",
  "status": "ready",
  "hls": {
    "streamUrl": "https://...",
    "duration": 120.5
  },
  "systemMetadata": {
    "filename": "example.mp4",
    "duration": 120.5
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### POST `/api/search-video`
Search within a video using natural language.

**Request:**
```json
{
  "videoId": "video_xyz789",
  "query": "person walking"
}
```

**Response:**
```json
{
  "results": [
    {
      "videoId": "video_xyz789",
      "start": 10.5,
      "end": 15.2,
      "score": 0.95,
      "confidence": 0.92,
      "transcription": "A person is walking..."
    }
  ]
}
```

---

## Deployment

### To Cloudflare Workers

```bash
# 1. Authenticate with Cloudflare
wrangler login

# 2. Set production API key
wrangler secret put TWELVELABS_API_KEY

# 3. Deploy
npm run deploy
```

Worker will be live at your Cloudflare Workers domain.

### Environment Variables
- `TWELVELABS_API_KEY` (required): Your TwelveLabs API key

---

## Architecture

```
┌─────────────────────────────────────────────┐
│   Browser (HTML5 Player + Search UI)        │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│    Cloudflare Worker (src/index.js)         │
│  - Request routing                          │
│  - FormData/multipart handling              │
│  - CORS support                             │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  TwelveLabs REST API (v1.3)                 │
│  - Index management                         │
│  - Video ingestion & analysis               │
│  - Multi-modal search                       │
└─────────────────────────────────────────────┘
```

---

## Technical Stack

| Component | Technology |
|-----------|-----------|
| Backend | Cloudflare Workers + Node.js |
| Frontend | Vanilla JavaScript + HTML5 |
| Video Analysis | TwelveLabs Marengo 2.7 |
| Video Streaming | HLS |
| Styling | Custom CSS with responsive design |
| Deployment | Wrangler CLI |

---

## Project Structure

```
twelvelabs/
├── src/
│   └── index.js              # Worker request handler & API integration
├── public/
│   ├── index.html            # UI structure
│   ├── app.js                # Frontend logic & workflows
│   └── styles.css            # Responsive design
├── package.json              # Dependencies
├── wrangler.jsonc            # Worker configuration
└── README.md                 # This file
```

---

## Supported Formats

- **Video:** MP4, MOV, AVI, WebM, FLV, MKMP, 3GP
- **Sources:** Direct URLs, YouTube, AWS S3, Google Cloud Storage, Azure Blob, Cloudinary

---

## Notes

- **Shared Index:** All videos are indexed into a single "Demo" index. Videos are not isolated by user.
- **Analysis:** Marengo 2.7 with visual and audio analysis enabled
- **HLS Streaming:** Videos automatically converted to HLS for adaptive playback
- **Thumbnails:** Auto-generated from video content

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "API key not configured" | Run `wrangler secret put TWELVELABS_API_KEY` |
| "Failed to index video" | Verify video URL is publicly accessible |
| "No results found" | Refine search query; ensure video finished indexing |
| "HLS stream unavailable" | Some formats may not support streaming; try another video |

---

## Resources

- [TwelveLabs Docs](https://docs.twelvelabs.io/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

---

**Built with** [TwelveLabs](https://twelvelabs.io/) **and** [Cloudflare Workers](https://workers.cloudflare.com/)
