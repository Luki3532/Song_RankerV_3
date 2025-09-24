# Setup Instructions

## Next Steps

1. **Get Spotify API Credentials:**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
   - Create a new app
   - Copy your Client ID and Client Secret

2. **Configure Environment:**
   - Copy `.env.example` to `.env`
   - Replace the placeholder values with your actual Spotify credentials:
     ```
     SPOTIFY_CLIENT_ID=your_actual_client_id
     SPOTIFY_CLIENT_SECRET=your_actual_client_secret
     ```

3. **Configure Spotify App:**
   - In your Spotify app settings, add this redirect URI:
     `http://localhost:3000/callback`

4. **Run the Application:**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm install -g nodemon
   npm run dev
   ```

5. **Test the App:**
   - Open http://localhost:3000 in your browser
   - Click "Login with Spotify"
   - Authorize the app
   - You should receive an access token

## Available Endpoints

- `GET /` - Home page with login link
- `GET /login` - Redirects to Spotify authorization
- `GET /callback` - Handles Spotify callback and returns tokens
- `GET /me` - Get user profile (requires Authorization header with "Bearer TOKEN")

## Usage Example

After getting an access token, you can test the `/me` endpoint:

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:3000/me
```

## Cleint ID From SPOTIFY DEVELOPER PANNEL
ID: ad73a8688935473aa42405f374f9c504
CLIENT SECRET: 0d45297e14a04a83af84c17b976ad36e