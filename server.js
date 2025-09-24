require('dotenv').config();
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Spotify API credentials
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 
    (NODE_ENV === 'production' ? 
     `https://${process.env.RENDER_EXTERNAL_HOSTNAME || process.env.RAILWAY_PUBLIC_DOMAIN}/callback` :
     'http://localhost:3000/callback');

// Validation for required environment variables
if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Missing required Spotify API credentials!');
    console.error('Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.');
    if (NODE_ENV === 'development') {
        console.error('Check your .env file or environment configuration.');
    }
}

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Health check endpoint (for deployment platforms)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
        redirectUri: REDIRECT_URI
    });
});

// Redirect to Spotify authorization
app.get('/login', (req, res) => {
    const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';
    const authURL = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
            state: generateRandomString(16),
            show_dialog: 'true' // Force consent screen to appear
        });
    
    res.redirect(authURL);
});

// Logout route - redirects to Spotify logout
app.get('/logout', (req, res) => {
    // Redirect to Spotify logout, then back to our app
    const spotifyLogoutURL = `https://accounts.spotify.com/en/logout?continue=${encodeURIComponent(REDIRECT_URI.replace('/callback', ''))}`;
    res.redirect(spotifyLogoutURL);
});

// Handle callback from Spotify
app.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    const state = req.query.state || null;

    if (state === null) {
        res.redirect('/#' + querystring.stringify({
            error: 'state_mismatch'
        }));
        return;
    }

    try {
        const response = await axios({
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            data: querystring.stringify({
                code: code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            }),
            headers: {
                'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token } = response.data;
        
        // Redirect back to home page with token in URL (for demo purposes)
        // In production, you'd want to handle tokens more securely
        res.redirect(`/?token=${access_token}`);

    } catch (error) {
        res.status(400).json({
            error: 'invalid_token',
            message: error.message
        });
    }
});

// Get user profile
app.get('/me', async (req, res) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ error: 'No authorization token provided' });
    }

    try {
        const response = await axios({
            method: 'GET',
            url: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': token
            }
        });

        res.json(response.data);
    } catch (error) {
        res.status(400).json({
            error: 'Failed to fetch user profile',
            message: error.message
        });
    }
});

// Utility function to generate random string
function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🔄 Redirect URI: ${REDIRECT_URI}`);
    if (NODE_ENV === 'development') {
        console.log(`🏠 Local URL: http://localhost:${PORT}`);
        console.log(`📝 Make sure to set your environment variables in .env file`);
    }
    console.log(`❤️ Health check available at /health`);
});