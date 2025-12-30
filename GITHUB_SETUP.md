# GitHub Setup & Push Instructions

This guide walks you through pushing your TwelveLabs demo to GitHub.

---

## Option 1: Push to Existing GitHub Repository

If you already have a GitHub repository:

### 1. Add Remote
```bash
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### 2. Set Branch
```bash
git branch -M main
```

### 3. Push to GitHub
```bash
git push -u origin main
```

That's it! Your code is now on GitHub.

---

## Option 2: Create New Repository & Push

If you don't have a GitHub repository yet:

### 1. Go to GitHub
Visit https://github.com/new

### 2. Create Repository
- **Repository name:** `twelvelabs` (or whatever you prefer)
- **Description:** "TwelveLabs Video Analysis Demo - AI-powered video search and analysis"
- **Visibility:** Public (so recruiters can see it)
- **Initialize:** Leave unchecked (we have commits already)

### 3. Copy Remote URL
Copy the HTTPS URL from your new repo:
```
https://github.com/YOUR_USERNAME/twelvelabs.git
```

### 4. Add Remote
```bash
git remote add origin https://github.com/YOUR_USERNAME/twelvelabs.git
```

### 5. Set Branch
```bash
git branch -M main
```

### 6. Push to GitHub
```bash
git push -u origin main
```

---

## Verify It Worked

Check that everything is on GitHub:
```bash
git remote -v
```

Should show:
```
origin  https://github.com/YOUR_USERNAME/twelvelabs.git (fetch)
origin  https://github.com/YOUR_USERNAME/twelvelabs.git (push)
```

---

## Share with Recruiters

Once pushed, share the link with TwelveLabs recruiters:

```
https://github.com/YOUR_USERNAME/twelvelabs
```

### Email Template
```
Subject: TwelveLabs Video Analysis Demo

I've built a demo showcasing the TwelveLabs platform capabilities:

GitHub: https://github.com/YOUR_USERNAME/twelvelabs

Features:
- Video indexing with real-time status tracking
- Text-based search using Marengo 2.7 model
- Multi-modal search (visual + audio)
- HLS video streaming
- Responsive web UI

The repo includes:
- Complete API integration with Cloudflare Workers
- Getting started guide
- Documentation for feature expansion
- UX feedback and recommendations

Looking forward to discussing this with you!

Best,
[Your Name]
```

---

## Common Issues

### "fatal: not a git repository"
Make sure you're in the right directory:
```bash
cd /Users/pjay/twelvelabs
```

### "origin already exists"
Remove the existing remote:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/twelvelabs.git
```

### "rejected (non-fast-forward)"
Pull changes first:
```bash
git pull origin main
git push -u origin main
```

### Can't authenticate
Update credentials:
```bash
# macOS - Update in Keychain
# Linux - Generate SSH key or use personal access token
# Windows - Use Git Credential Manager
```

---

## After Pushing

### Update README with Recruiter Note
Add this to the top of `README.md`:

```markdown
> **For Recruiters:** This demo showcases integration with TwelveLabs platform.
> See [Getting Started](GETTING_STARTED.md) to run locally.
> For feature expansion roadmap, see [Implementation Roadmap](IMPLEMENTATION_ROADMAP.md).
```

### Create GitHub-Specific Docs
Add a `docs/` folder for GitHub Pages (optional):

```bash
mkdir docs
# Add .github/README.md there if you want a GitHub-hosted docs site
```

### Set Repository Topics
On GitHub, add these topics to your repo:
- `twelvelabs`
- `video-analysis`
- `ai`
- `cloudflare-workers`
- `video-search`

---

## What Gets Pushed

The following are committed:
```
✅ src/index.js               (Cloudflare Worker backend)
✅ public/                    (Frontend: HTML, CSS, JS)
✅ package.json               (Dependencies)
✅ wrangler.jsonc             (Cloudflare config)
✅ All documentation files    (GETTING_STARTED.md, etc.)
```

The following are NOT pushed (per .gitignore):
```
❌ node_modules/              (will be reinstalled on clone)
❌ .env files                 (API keys stay secret!)
❌ .wrangler/                 (build artifacts)
```

---

## Next Steps

### For You
1. Push to GitHub
2. Test the link works
3. Share with recruiters
4. Be ready to discuss:
   - Why you chose Cloudflare Workers
   - How you structured the API endpoints
   - What features you'd add next

### For Recruiters
They'll:
1. Clone the repo
2. Read the documentation
3. Run locally to see the demo
4. Check code quality
5. Evaluate your technical depth

---

## Git Workflow After Push

### Make local changes
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

### Pull latest changes
```bash
git pull origin main
```

### Create a branch for new features
```bash
git checkout -b feature/gist-endpoint
# ... make changes ...
git push origin feature/gist-endpoint
# Then open a Pull Request on GitHub
```

---

## Tips for Recruiters

When they visit your repo, make sure:

- ✅ README is clear and inviting
- ✅ Getting started section works
- ✅ Documentation is comprehensive
- ✅ Code is well-commented
- ✅ No API keys in code
- ✅ Commit messages are descriptive

---

**Ready? Run these commands:**

```bash
cd /Users/pjay/twelvelabs
git remote add origin https://github.com/YOUR_USERNAME/twelvelabs.git
git branch -M main
git push -u origin main
```

Then share the link!
