# Video Analysis with TwelveLabs

A modern web application that allows users to upload video URLs for AI-powered analysis and search using TwelveLabs API. Built with Cloudflare Workers for serverless deployment.

## Features

- 🎥 **Video URL Upload**: Submit any video URL for AI analysis
- 🔍 **AI-Powered Search**: Search through video content using natural language
- ⚡ **Real-time Processing**: Monitor video indexing status
- 🎨 **Modern UI**: Beautiful, responsive interface
- ☁️ **Serverless**: Built on Cloudflare Workers for global performance

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (Cloudflare Workers CLI)
- [TwelveLabs API Key](https://twelvelabs.io/) (Sign up for free)


## Usage

### 1. Video Analysis
1. Enter a video URL in the input field
2. Click "Process Video"
3. Wait for the indexing process to complete
4. View video information and status

### 2. Video Search
1. After a video is indexed, the search section will appear
2. Enter your search query (e.g., "person walking", "car driving", "speech about technology")
3. Click "Search" to find relevant moments in the video
4. View results with timestamps and confidence scores

### Environment Variables

- `TWELVELABS_API_KEY`: Your TwelveLabs API key (required)

## Supported Video Formats

The application supports various video formats and sources:
- MP4, MOV, AVI, WebM
- Direct video file URLs
- Cloud storage URLs (AWS S3, Google Cloud Storage, etc.)

## TwelveLabs Features Used

- **Marengo 2.5 Engine**: Advanced video understanding
- **Multi-modal Analysis**: Visual, audio, and text analysis
- **Natural Language Search**: Search videos using everyday language
- **Real-time Indexing**: Fast video processing and analysis

## Development

### Project Structure
```
twelvelabs/
├── public/
│   └── index.html          # Frontend application
├── src/
│   └── index.js           # Cloudflare Worker backend
├── package.json           # Dependencies and scripts
├── wrangler.jsonc         # Cloudflare Workers configuration
└── README.md             # This file
```

### Available Scripts
- `npm run dev`: Start development server
- `npm run deploy`: Deploy to Cloudflare Workers
- `npm test`: Run tests


### Getting Help

- [TwelveLabs Documentation](https://docs.twelvelabs.io/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

## License

MIT License - feel free to use this project for your own applications.
