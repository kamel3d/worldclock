# 🌍 World Clock

A client-side web application for viewing times across 12,396 cities worldwide.

## 🚀 How to Use

### ⚠️ IMPORTANT: HTTP Server Required

Due to browser security (CORS), you **cannot** simply double-click `index.html` to open it. The `fetch()` API requires an HTTP server.

### Local HTTP Server (Required for Development)

You need a simple HTTP server - choose any option:

**Option 1: Python (Easiest - No Installation Needed)**

```bash
python3 -m http.server 8000
# Then open: http://localhost:8000
```

**Option 2: Node.js**

```bash
npx http-server -p 8000
# Then open: http://localhost:8000
```

**Option 3: VS Code Live Server**

If you use VS Code, install the "Live Server" extension and click "Go Live" in the bottom right.

---

## 🌐 Deploy to Free Hosting

### GitHub Pages

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "World Clock app"
git remote add origin https://github.com/yourusername/world-clock.git
git push -u origin main
```

2. **Enable GitHub Pages:**
   - Go to repo Settings → Pages
   - Select "main" branch
   - Click "Save"
   - Your app will be at: `https://yourusername.github.io/world-clock/`

### Netlify

1. **Drag & Drop:**
   - Go to [netlify.com](https://netlify.com)
   - Drag the entire `code` folder
   - Done! Get instant URL

2. **Or use CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Vercel

```bash
npm install -g vercel
vercel
```

---

## 📊 Technical Details

### Client-Side Database
- **File:** `cities.json` (3.8 MB)
- **Cities:** 12,396 worldwide
- **Countries:** 188
- **Loading:** ~100ms parse time
- **Caching:** Automatic via browser

### How It Works

1. **First Load:**
   - Browser fetches `cities.json` (3.8 MB)
   - Parses JSON (~50-100ms)
   - Builds search indexes in memory
   - Total: ~3-5 seconds on slow connection, <1 second on fast

2. **Subsequent Loads:**
   - Service Worker caches everything
   - Instant load from cache
   - Works completely offline

3. **Search Performance:**
   - No network calls
   - Instant results (<10ms)
   - Smart filtering (districts excluded)
   - Country partial matching (type "alg" → Algeria)

### File Size Optimization

**Without Gzip:** 3.8 MB
**With Gzip:** ~500 KB (6x compression!)

Most web servers automatically gzip JSON files.

---

## 🗂️ Files Needed for Deployment

```
index.html          (Main app)
cities.json         (Database - 3.8 MB)
manifest.json       (PWA manifest)
sw.js              (Service Worker)
sun.svg            (Sun icon)
moon.svg           (Moon icon)
monofonto rg.otf   (Font)
```

---

## ✅ Features

### Fully Functional
- ✅ Real-time autocomplete search
- ✅ Country partial matching ("alg" → Algeria)
- ✅ 12,396 cities from 188 countries
- ✅ Automatic timezone detection
- ✅ Daylight Saving Time support
- ✅ Works offline
- ✅ Responsive design
- ✅ Dark mode support
- ✅ PWA installable

### Performance
- ⚡ Instant searches (<10ms)
- ⚡ No server latency
- ⚡ Cached after first load
- ⚡ Works offline

---

## 🔧 Maintenance

### Update Cities Database

If you want to refresh the cities data:

1. Download latest GeoNames data:
```bash
cd assets/
wget http://download.geonames.org/export/dump/cities15000.zip
wget http://download.geonames.org/export/dump/countryInfo.txt
wget http://download.geonames.org/export/dump/admin1CodesASCII.txt
unzip cities15000.zip
```

2. Rebuild database:
```bash
node build-cities-db.js
```

3. Redeploy the new `cities.json`

---


**Database:** GeoNames (12,396 cities)
