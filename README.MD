# Spotify API App

This is a **Node.js + Express backend** (with optional React frontend) for working with the **Spotify Web API**.  
It handles:
- OAuth 2.0 Authorization Code Flow  
- Retrieving access + refresh tokens  
- Making authenticated API calls to Spotify  

---

## 🚀 Features
- Login with Spotify account  
- Exchange authorization code for access + refresh tokens  
- Ready for expansion with endpoints like search, playlists, playback  

---

## 🛠 Requirements
- Node.js (>=18)  
- npm or yarn  
- Spotify Developer App (get `CLIENT_ID` + `CLIENT_SECRET` from [Spotify Dashboard](https://developer.spotify.com/dashboard/))  

---

## ⚙️ Setup (Local Development)

1. Clone repo or create project folder.  
2. Install dependencies:
   ```bash
   npm init -y
   npm install express axios querystring dotenv
