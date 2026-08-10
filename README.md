# Video Search with TwelveLabs

[Live demo](https://twelvelabs.pjayav.workers.dev/)

Search inside a video with plain English. Paste a video URL, wait for indexing, then ask for "the part where someone explains pricing" and get back the exact clips with timestamps. Built on the TwelveLabs Marengo 2.7 engine and deployed on Cloudflare Workers.

## What it does

- **Indexes video from a URL.** Submit any direct video link or cloud storage URL. The app creates a TwelveLabs index, kicks off the ingestion task, and polls for status until the video is ready to query.
- **Searches three tracks at once.** Every query runs against the visual, audio, and conversation modalities. You control whether the results are combined with `or` or narrowed with `and`.
- **Searches one video or the whole library.** `/api/search-video` scopes to a single video, `/api/search-all` runs the same query across every video in the index.
- **Returns ranked clips, not whole videos.** Each result carries a relevance score, start and end timestamps, a confidence label, a thumbnail, and the transcript segment where available.
- **Exposes the retrieval knobs.** Confidence threshold, sort order, page size, and grouping by video or by clip are all adjustable per request, so you can see how ranking behavior changes.

## Who it's for

Anyone evaluating video understanding APIs who wants to see retrieval quality directly instead of reading a benchmark table. The confidence and grouping controls exist so you can probe where the model is strong and where it degrades.

## Tech stack

- Cloudflare Workers (single Worker serving both API and static frontend)
- TwelveLabs Marengo 2.7 for indexing and search
- Vanilla JS frontend, no build step
- Vitest for tests

## Local development

```bash
npm install
npm run dev
```

Set your API key as a Worker secret:

```bash
npx wrangler secret put TWELVELABS_API_KEY
```

For local runs, put the same key in `.dev.vars`:

```
TWELVELABS_API_KEY=<your-twelvelabs-key>
```

Get a key at [twelvelabs.io](https://twelvelabs.io/).

## Deployment

```bash
npm run deploy
```

## Supported inputs

Direct video file URLs (MP4, MOV, AVI, WebM) and cloud storage URLs from S3, GCS, and equivalent providers.

## License

MIT
