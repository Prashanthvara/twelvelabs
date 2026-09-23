# Video Search with TwelveLabs

[Live demo](https://twelvelabs.pjayav.workers.dev/)

Search inside a video with plain English. Pick a video from the library, ask for "the moment the car brakes hard", and get back ranked clips with start and end timestamps and the transcript at that point. Click a result and the player jumps there. Built on TwelveLabs Marengo 3.0 and deployed as a single Cloudflare Worker.

## What it does

- **Indexes video from a URL.** Submit a direct video link. The Worker finds or creates the index, starts a TwelveLabs ingestion task, and the UI polls the task until the video is ready to search.
- **Searches what is seen and what is heard.** Each query runs against the visual and audio modalities of Marengo 3.0, so "someone laughing" and "red truck" both work.
- **Returns clips, not whole videos.** Results carry start and end times, rank, and the transcript segment where speech was detected. The frontend seeks the player to the clip.
- **Keeps a video library.** Indexed videos are listed with thumbnails and durations; selecting one scopes the search to that video.

## How it is built

- **One Worker, no framework.** `src/index.js` serves the static frontend from `public/` and five JSON routes under `/api/`.
- **Direct REST, not the SDK.** The `twelvelabs-js` SDK depends on Node APIs that Workers do not provide, so the Worker calls the TwelveLabs v1.3 REST API itself, including the multipart form bodies the task and search endpoints require.
- **The API key never reaches the browser.** It lives in a Worker secret; the frontend only talks to `/api/*`.

| Route | Method | Does |
|---|---|---|
| `/api/index-video` | POST | Start indexing a video URL; returns a task id |
| `/api/task-status` | POST | Poll an indexing task |
| `/api/list-all-videos` | GET | List indexed videos with thumbnails |
| `/api/get-video-details` | GET | Stream URL and metadata for one video |
| `/api/search-video` | POST | Natural-language search, optionally scoped to one video |

## Tech stack

- Cloudflare Workers (API and static assets from one Worker)
- TwelveLabs Marengo 3.0 (visual and audio)
- Vanilla JS frontend, no build step
- Vitest with `@cloudflare/vitest-pool-workers`

## Local development

```bash
npm install
echo "TWELVELABS_API_KEY=your-key" > .dev.vars
npm run dev          # http://localhost:8787
npx vitest run       # tests
```

Deploy with `npx wrangler secret put TWELVELABS_API_KEY` then `npm run deploy`.
