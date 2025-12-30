# Getting Started - TwelveLabs Video Analysis Demo

This is a production-ready demo of the TwelveLabs Video Understanding Platform, showcasing video search, indexing, and analysis capabilities.

---

## Prerequisites

- Node.js v16+
- Wrangler CLI (Cloudflare Workers)
- TwelveLabs API Key (free tier available)
- Git

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/pjaya/twelvelabs.git
cd twelvelabs
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up TwelveLabs API Key
```bash
wrangler secret put TWELVELABS_API_KEY
```
When prompted, paste your TwelveLabs API key from https://twelvelabs.io/

### 4. Run Locally
```bash
npm run dev
```

Open `http://localhost:8787` in your browser.

---

## Features

### Currently Implemented
- ✅ Video indexing (upload any video URL)
- ✅ Text-based search using Marengo 2.7 model
- ✅ Video gallery with thumbnails
- ✅ HLS streaming player
- ✅ Real-time indexing status tracking
- ✅ Multi-modal search (visual + audio)

### Planned Expansions
- 🔄 Gist analysis (auto-generate titles, topics, hashtags)
- 🔄 Summarize endpoint (create summaries, chapters)
- 🔄 Open-ended analysis (Q&A on video content)
- 🔄 Embeddings (vector search, similarity matching)

See `IMPLEMENTATION_ROADMAP.md` for details.

---

## Project Structure

```
twelvelabs/
├── src/
│   └── index.js                 # Cloudflare Worker backend
├── public/
│   ├── index.html              # UI structure
│   ├── app.js                  # Frontend logic
│   └── styles.css              # Responsive styling
├── wrangler.jsonc              # Cloudflare configuration
├── package.json                # Dependencies
└── README.md                   # Project overview
```

---

## API Endpoints

### Backend API

#### POST `/api/index-video`
Index a video for analysis.
```json
{
  "videoUrl": "https://example.com/video.mp4"
}
```

#### POST `/api/task-status`
Check indexing progress.
```json
{
  "taskId": "task_abc123"
}
```

#### GET `/api/list-all-videos`
Fetch all indexed videos.

#### GET `/api/get-video-details?videoId=video_xyz789`
Get video details and HLS stream URL.

#### POST `/api/search-video`
Search within a video.
```json
{
  "videoId": "video_xyz789",
  "query": "person walking"
}
```

---

## Usage

### 1. Index a Video
- Click the blue `+` button in the Video Library
- Enter a video URL (public URL, YouTube, or cloud storage)
- Click "Index Video"
- Wait for processing (typically 2-30 minutes depending on length)

### 2. Search a Video
- Select a video from the library
- Enter your search query (e.g., "person walking", "speaking about AI")
- Click "Search"
- Results show timestamps and confidence scores
- Click "Go To" to jump to that moment in the video

### 3. View Details
- Click any video thumbnail to load it
- Player shows duration, creation date, and status
- Use standard video controls to play/pause/seek

---

## Supported Video Formats

- MP4, MOV, AVI, WebM, FLV, MKV, 3GP
- YouTube videos
- AWS S3, Google Cloud Storage, Azure Blob, Cloudinary URLs

---

## Deployment

### Deploy to Cloudflare Workers

```bash
# Authenticate with Cloudflare
wrangler login

# Set production API key
wrangler secret put TWELVELABS_API_KEY

# Deploy
npm run deploy
```

Your worker will be live at your Cloudflare Workers domain.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "API key not configured" | Run `wrangler secret put TWELVELABS_API_KEY` |
| "Failed to index video" | Verify URL is publicly accessible |
| "No results found" | Refine search query; ensure video finished indexing |
| "HLS stream unavailable" | Try a different video format |
| "Port 8787 in use" | Kill existing process: `lsof -i :8787` then `kill -9 <PID>` |

---

## Next Steps

### For Learning
- Read `DOCS_INDEX.md` for navigation guide
- Review `TWELVELABS_API_MAP.md` for API reference
- Check `FEEDBACK.md` for UX analysis

### For Expanding Features
- Follow `IMPLEMENTATION_ROADMAP.md` for Phase 1-3 features
- Add Gist endpoint (1.5 hours) for auto-generated metadata
- Add Summarize endpoint (2 hours) for content summaries
- Add Analyze endpoint (2.5 hours) for Q&A capability

### For Recruiters / Interviews
- Read `RECRUITER_STRATEGY.md` for positioning
- Review `BEFORE_AFTER.md` for feature comparison
- See `TWELVELABS_API_MAP.md` for what's implemented vs. missing

---

## Architecture

```
Browser (HTML5 Player + Search UI)
        ↓
Cloudflare Worker (Node.js + REST API)
        ↓
TwelveLabs API (v1.3)
        ↓
Video Analysis (Marengo 2.7 + Pegasus 1.1)
```

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Backend | Cloudflare Workers |
| Runtime | Node.js 18+ |
| Frontend | Vanilla JavaScript + HTML5 |
| Video Analysis | TwelveLabs Marengo & Pegasus |
| Video Streaming | HLS |
| Styling | Custom CSS (responsive) |
| Deployment | Wrangler CLI |

---

## Environment Variables

Required:
- `TWELVELABS_API_KEY`: Your TwelveLabs API key

Set in `wrangler.toml` or via `wrangler secret put`.

---

## Testing

Run tests with:
```bash
npm run test
```

Manual testing:
1. Index a video from a public URL
2. Wait for completion
3. Search for a common object/action
4. Verify results appear with timestamps
5. Click "Go To" to verify player jump

---

## Performance Notes

- **Indexing**: Depends on video length (typically 2-30 min for free tier)
- **Search**: <5 seconds for typical queries
- **HLS Streaming**: Auto-adaptive quality based on connection

---

## Known Limitations

- Shared index (videos visible to all users with API key)
- Free tier rate limits (see TwelveLabs pricing)
- Single-user setup (no authentication)

---

## Resources

- [TwelveLabs Docs](https://docs.twelvelabs.io/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

---

## Contributing

This is a demo for recruiter evaluation. To add features:

1. Reference `IMPLEMENTATION_ROADMAP.md`
2. Add backend endpoints to `src/index.js`
3. Add frontend UI to `public/app.js` and `public/index.html`
4. Test locally with `npm run dev`
5. Deploy with `npm run deploy`

---

## License

MIT

---

## Author

Built for TwelveLabs interview/evaluation.

Contact: prashanthjayavaradhan@gmail.com

---

## Quick Links

- **What's in this repo?** → See `README.md`
- **How to use it?** → See this file (GETTING_STARTED.md)
- **How to expand it?** → See `IMPLEMENTATION_ROADMAP.md`
- **API reference?** → See `TWELVELABS_API_MAP.md`
- **Interview prep?** → See `RECRUITER_STRATEGY.md`
- **Navigation?** → See `DOCS_INDEX.md`

---

**Ready to start? Follow the Installation steps above, then explore!**
