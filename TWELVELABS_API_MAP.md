# TwelveLabs API v1.3 - Complete Endpoint Reference

**Your Demo Positioning:** How each endpoint helps you stand out to TwelveLabs recruiters.

---

## Core Models

| Model | Purpose | Your Demo |
|-------|---------|-----------|
| **Marengo 2.7** (Search/Embed) | Text-image-audio-video search; multimodal embeddings | ✅ Implemented (Search) |
| **Pegasus 1.1** (Analysis) | Video analysis, summaries, Q&A, custom text generation | ❌ Not yet (HIGH VALUE) |

---

## Video Management Endpoints

### 1. Create Index
**Endpoint:** `POST /indexes`  
**Status:** ✅ Implemented  
**Your Code:** `getOrCreateIndex()` in `src/index.js:45`  
**What You Did Right:** Automatic index creation, multi-model support

```javascript
{
    index_name: "Demo",
    models: [{
        model_name: "marengo2.7",
        model_options: ["visual", "audio"]
    }]
}
```

---

### 2. Index Video / Create Task
**Endpoint:** `POST /tasks`  
**Status:** ✅ Implemented  
**Your Code:** `handleIndexVideo()` in `src/index.js:74`  
**What You Did Right:** FormData handling, proper async task creation

**API Docs:** https://docs.twelvelabs.io/api-reference/tasks/create

---

### 3. Get Task Status
**Endpoint:** `GET /tasks/{task_id}`  
**Status:** ✅ Implemented  
**Your Code:** `handleTaskStatus()` in `src/index.js:115`  
**What You Did Right:** Proper polling mechanism (5s interval)

---

### 4. List Videos
**Endpoint:** `GET /indexes/{index_id}/videos`  
**Status:** ✅ Implemented  
**Your Code:** `handleListAllVideos()` in `src/index.js:136`  
**What You Did Right:** Thumbnail extraction, metadata mapping

**API Docs:** https://docs.twelvelabs.io/api-reference/videos/list

---

### 5. Get Video Details
**Endpoint:** `GET /indexes/{index_id}/videos/{video_id}`  
**Status:** ✅ Implemented  
**Your Code:** `handleGetVideoDetails()` in `src/index.js:160`  
**What You Did Right:** HLS stream extraction, proper metadata handling

**API Docs:** https://docs.twelvelabs.io/api-reference/videos/retrieve

---

## Search Endpoints

### 6. Search Videos (Text Query)
**Endpoint:** `POST /search`  
**Status:** ✅ Implemented  
**Your Code:** `handleSearchVideo()` in `src/index.js:193`  
**What You Did Right:** 
- FormData for multipart requests
- Multiple search options (visual + audio)
- Video filtering by ID
- Confidence score extraction

**API Docs:** https://docs.twelvelabs.io/docs/guides/search

```javascript
// Your implementation
{
    index_id: "...",
    query_text: "person walking",
    search_options: ["visual", "audio"],
    filter: { id: [videoId] }
}
```

**What's Missing (Next Level):**
- Time-proximity search (find events within time ranges)
- Combined queries (AND/OR logic)
- Any-to-video search (image/text hybrid)

---

## Analysis Endpoints (Pegasus Model) - 🎯 YOUR OPPORTUNITY

### 7. Gist Analysis
**Endpoint:** `POST /gist`  
**Status:** ❌ Not implemented  
**Effort:** 1.5 hours  
**Recruiter Signal:** HIGH

Generates auto-formatted metadata: titles, topics, hashtags

```javascript
// Request
{
    video_id: "...",
    types: ["title", "topic", "hashtag"]
}

// Response
{
    title: "Person Walking in Park",
    topics: ["outdoor activity", "walking", "nature"],
    hashtags: ["#walking", "#park", "#outdoors"]
}
```

**Use Case Example:** Auto-generate SEO metadata for video library  
**API Docs:** https://docs.twelvelabs.io/docs/guides/analyze-videos/generate-titles-topics-and-hashtags

---

### 8. Summarize / Chapters / Highlights
**Endpoint:** `POST /summarize`  
**Status:** ❌ Not implemented  
**Effort:** 2 hours  
**Recruiter Signal:** VERY HIGH

Generates structured content: summaries, chapter breaks, highlight clips

```javascript
// Request
{
    video_id: "...",
    type: "summary" // or "chapters", "highlights"
}

// Response (for summary)
{
    summary: "A person walks through a park, observing nature and wildlife..."
}

// Response (for chapters)
{
    chapters: [
        { start: 0, end: 5, title: "Park Entry" },
        { start: 5, end: 12, title: "Walking Trail" }
    ]
}
```

**Use Cases:**
- Content structuring (e-learning, streaming platforms)
- Highlight creation (short clips for social media)
- Time-based navigation

**API Docs:** https://docs.twelvelabs.io/docs/guides/analyze-videos/generate-summaries-chapters-and-highlights

---

### 9. Open-Ended Analysis
**Endpoint:** `POST /analyze`  
**Status:** ❌ Not implemented  
**Effort:** 2.5 hours  
**Recruiter Signal:** VERY HIGH

Custom text generation based on arbitrary prompts

```javascript
// Request
{
    video_id: "...",
    prompt: "What does the person do in the first 10 seconds?"
}

// Response
{
    result: "The person walks through the park gate and looks around..."
}
```

**Supports:**
- Instructive prompts: "List safety concerns"
- Descriptive prompts: "Describe the setting"
- Questions: "What happens when...?"

**Advanced Feature:** Streaming responses (Pegasus 1.1+)

**Use Cases:**
- Incident reporting (describe what happened)
- Accessibility (auto-generate captions/descriptions)
- Custom analysis (domain-specific questions)

**API Docs:** https://docs.twelvelabs.io/docs/guides/analyze-videos/open-ended-analysis

---

## Embedding Endpoints (Marengo Model) - 🚀 ADVANCED

### 10. Create Video Embeddings
**Endpoint:** `POST /embed/tasks`  
**Status:** ❌ Not implemented  
**Effort:** 2 hours (async) + 1 hour (UI)  
**Recruiter Signal:** VERY HIGH (if IC/Senior)

Creates dense vector embeddings for entire video

```javascript
// Request
{
    video_id: "...",
    model_name: "marengo2.7",
    options: { include_shots: true } // optional
}

// Response
{
    task_id: "embed_...",
    status: "pending"
}

// Later, retrieve with:
GET /indexes/{index_id}/videos/{video_id}?embed=true
```

**Use Cases:**
- Anomaly detection (find corrupt/unusual videos)
- Similarity search (find similar videos)
- RAG systems (semantic search over video library)
- Recommendation engines

**API Docs:** https://docs.twelvelabs.io/docs/guides/create-embeddings/video

---

### 11. Create Text Embeddings
**Endpoint:** `POST /embed/text`  
**Status:** ❌ Not implemented  
**Effort:** 1 hour  
**Recruiter Signal:** HIGH (shows cross-modal understanding)

Create embeddings for text queries to search video embeddings

```javascript
// Cross-modal search: text query → video embeddings
{
    query: "Person walking in nature",
    model_name: "marengo2.7"
}
```

---

### 12. Create Image Embeddings
**Endpoint:** `POST /embed/image`  
**Status:** ❌ Not implemented  
**Effort:** 1.5 hours  
**Recruiter Signal:** HIGH

Search videos using image queries: "Find this scene in videos"

---

### 13. Create Audio Embeddings
**Endpoint:** `POST /embed/audio`  
**Status:** ❌ Not implemented  
**Effort:** 1.5 hours  
**Recruiter Signal:** MEDIUM-HIGH

Audio-to-video search

---

## Advanced Search Endpoints

### 14. Any-to-Video Search
**Endpoint:** `POST /search` (with image/text/audio)  
**Status:** ⚠️ Partially supported  
**Effort:** 2 hours (multi-format upload)  
**Recruiter Signal:** HIGH

Unified search across modalities

---

## Organization & Access Management

### 15-18. Organization Endpoints
- `GET /organizations`
- `POST /organizations`
- `GET /organizations/{id}`
- `PATCH /organizations/{id}`

**Status:** Not needed for demo  
**Recruiter Signal:** Low (infrastructure, not feature-focused)

---

## Summary: Your Signal by Coverage

### What You Have (Competent)
- 5/5 core video management endpoints ✅
- 1/1 search endpoint ✅
- Proper error handling, async task management

### What Gets You Noticed (Differentiated)
- **2-3 analysis endpoints** = "Product engineer" signal
- **1 analysis + embeddings** = "Senior engineer" signal
- **All analysis + embeddings** = "Architect" signal

### Quick Win Recommendation
1. Add Gist endpoint (1.5h) → Get title/topics generation
2. Add Summarize endpoint (2h) → Get summaries/chapters
3. Add one analysis endpoint (2.5h) → Get Q&A

**Total: 6 hours. Return: Massive recruiter signal.**

---

## How to Structure Your Pitch

**To Product Manager at TwelveLabs:**
"I started with search (core feature) and added analysis endpoints to show how customers extract metadata. This positions TwelveLabs not just as a search tool, but as a comprehensive content intelligence platform."

**To Engineering Manager:**
"My demo covers video management, search, and the three analysis endpoints. The architecture uses async task patterns and proper error handling. Embeddings are next—they unlock semantic search and RAG use cases."

**To Solutions Engineer:**
"The workflow shows customer value: upload video → search for moments → auto-generate summaries → ask questions. Each endpoint solves a real customer need."

---

## Test Videos for Demo

Use these to show the platform's capabilities:

1. **Interview/Q&A:** Someone speaking about a topic
   - Great for: Gist (auto-topics), Summarize (key points), Analyze (answer questions)

2. **Dashcam/Security:** Action-heavy video
   - Great for: Search (find incidents), Analyze (describe what happened)

3. **Tutorial/Educational:** Structured video with clear segments
   - Great for: Summarize (chapter breaks), Highlights

4. **News/Documentary:** Rich visual + audio content
   - Great for: Gist (auto-title), Embeddings (find similar content)

---

## Red Flags to Avoid

❌ Hardcoded sample videos (shows you don't understand production)  
❌ Only implementing search (shows you learned the docs, nothing more)  
❌ Poor error handling (crashes on bad input)  
❌ No loading states (users think app is frozen)  
✅ Clean empty state (shows product thinking)  
✅ Multiple endpoints (shows platform depth)  
✅ Proper error messages (shows user empathy)  
✅ Well-organized code (shows engineering discipline)

---

**Your Next Move:** Pick Gist + Summarize and ship it this weekend. You'll stand out.
