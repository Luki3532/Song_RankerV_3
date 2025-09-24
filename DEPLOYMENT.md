# 🚀 Deployment Guide

## Overview
Your Spotify API app is configured for deployment on both **Railway** and **Render**. Choose the platform that works best for you.

---

## 🚂 Railway Deployment

### Step 1: Prepare Your Repository
1. Push your code to GitHub (make sure `.env` is in `.gitignore`)
2. Your Railway configuration is already set up in `railway.toml`

### Step 2: Deploy to Railway
1. Go to [Railway.app](https://railway.app/)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically detect and deploy your Node.js app

### Step 3: Configure Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```env
SPOTIFY_CLIENT_ID=ad73a8688935473aa42405f374f9c504
SPOTIFY_CLIENT_SECRET=0d45297e14a04a83af84c17b976ad36e
REDIRECT_URI=https://spotify-api-app-production.up.railway.app/callback
NODE_ENV=production
```

**Your actual Railway URL:** `https://spotify-api-app-production.up.railway.app`

### Step 4: Update Spotify App Settings
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Edit your app settings
3. Add your Railway URL to redirect URIs: `https://spotify-api-app-production.up.railway.app/callback`

---

## 🎨 Render Deployment

### Step 1: Prepare Your Repository  
1. Push your code to GitHub
2. Your Render configuration is in `render.yaml`

### Step 2: Deploy to Render
1. Go to [Render.com](https://render.com/)
2. Sign up/login with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Render will use your `render.yaml` configuration

### Step 3: Configure Environment Variables
In Render dashboard, go to Environment tab and add:

```env
SPOTIFY_CLIENT_ID=ad73a8688935473aa42405f374f9c504
SPOTIFY_CLIENT_SECRET=0d45297e14a04a83af84c17b976ad36e
REDIRECT_URI=https://your-app-name.onrender.com/callback
NODE_ENV=production
```

### Step 4: Update Spotify App Settings
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Edit your app settings  
3. Add your Render URL to redirect URIs: `https://your-app-name.onrender.com/callback`

---

## 🔧 Platform Comparison

| Feature | Railway | Render |
|---------|---------|--------|
| **Free Tier** | $5 credit/month | 750 hours/month |
| **Sleep Policy** | No sleeping | Sleeps after 15min inactivity |
| **Custom Domains** | ✅ Easy setup | ✅ Available |
| **Build Time** | Fast | Moderate |
| **GitHub Integration** | Excellent | Excellent |

---

## ✅ Deployment Checklist

### Before Deploying:
- [ ] Code pushed to GitHub
- [ ] `.env` file NOT committed (check `.gitignore`)
- [ ] Spotify credentials ready
- [ ] Repository is public or connected to deployment platform

### After Deploying:
- [ ] Environment variables configured
- [ ] Spotify redirect URI updated
- [ ] App accessible via public URL
- [ ] Health check working: `/health` endpoint
- [ ] OAuth flow tested end-to-end

---

## 🐛 Troubleshooting

### Common Issues:

**1. "Missing Spotify credentials" error:**
- **Most Common Issue:** Environment variables not set in Railway/Render dashboard
- Go to your project → Variables tab → Add the environment variables manually
- Variables must be set in the platform dashboard, NOT just in your code
- Check spelling of variable names (case-sensitive)
- After adding variables, Railway will automatically redeploy

**2. "Redirect URI mismatch" error:**
- Ensure Spotify app redirect URI exactly matches your deployed URL
- Include `/callback` at the end
- Use `https://` for production URLs

**3. App not loading:**
- Check deployment logs in platform dashboard  
- Verify `PORT` environment variable (usually set automatically)
- Test health endpoint: `https://your-app.com/health`
- **npm warnings:** The `npm warn config production` warning is harmless and doesn't affect functionality

**4. npm deprecation warning:**
- Warning: `npm warn config production Use --omit=dev instead` is cosmetic only
- App functionality is not affected
- Future deployments will use updated npm syntax

**4. OAuth callback fails:**
- Double-check `REDIRECT_URI` environment variable
- Verify Spotify app settings match deployment URL

---

## 🔍 Testing Your Deployment

1. **Health Check:** Visit `https://your-app.com/health`
2. **Home Page:** Visit `https://your-app.com/`
3. **OAuth Flow:** Click "Login with Spotify" and complete authorization
4. **API Test:** Use the built-in profile tester on the home page

---

## 📊 Monitoring

Both platforms provide:
- **Deployment logs** for debugging
- **Metrics** for performance monitoring  
- **Automatic restarts** on crashes
- **SSL certificates** (HTTPS) automatically

---

## 🚀 Your Deployment URLs

Your app is deployed at:
- **Railway:** `https://spotify-api-app-production.up.railway.app`  
- **Render:** `https://your-app-name.onrender.com` (if you choose Render)

### 🔧 Current Status (Railway):
- ✅ **App Deployed:** Server running on port 8080
- ⚠️ **Environment Variables:** Need to be set in Railway dashboard  
- ⚠️ **Spotify Redirect URI:** Needs to be updated with Railway URL

**Next Steps:** Add environment variables in Railway dashboard, then your app will be fully functional! 🎵