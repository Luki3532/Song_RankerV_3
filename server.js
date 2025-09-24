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

// Ranking page
app.get('/rank.html', (req, res) => {
    res.sendFile(__dirname + '/public/rank.html');
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
    const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-library-read';
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

// Get user playlists
app.get('/playlists', async (req, res) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ error: 'No authorization token provided' });
    }

    try {
        const response = await axios({
            method: 'GET',
            url: 'https://api.spotify.com/v1/me/playlists?limit=50',
            headers: {
                'Authorization': token
            }
        });

        res.json(response.data);
    } catch (error) {
        res.status(400).json({
            error: 'Failed to fetch playlists',
            message: error.message
        });
    }
});

// Get playlist tracks
app.get('/playlist/:id/tracks', async (req, res) => {
    const token = req.headers.authorization;
    const playlistId = req.params.id;
    
    if (!token) {
        return res.status(401).json({ error: 'No authorization token provided' });
    }

    try {
        const response = await axios({
            method: 'GET',
            url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
            headers: {
                'Authorization': token
            }
        });

        res.json(response.data);
    } catch (error) {
        res.status(400).json({
            error: 'Failed to fetch playlist tracks',
            message: error.message
        });
    }
});

// Enhanced playlist tracks endpoint that fetches full track details
app.get('/playlist/:id/tracks-enhanced', async (req, res) => {
    const token = req.headers.authorization;
    const playlistId = req.params.id;
    
    if (!token) {
        return res.status(401).json({ error: 'No authorization token provided' });
    }

    try {
        // First get the playlist tracks
        const playlistResponse = await axios({
            method: 'GET',
            url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
            headers: {
                'Authorization': token
            }
        });

        const playlistTracks = playlistResponse.data.items.filter(item => item.track && item.track.id);
        const trackIds = playlistTracks.map(item => item.track.id).slice(0, 50); // Limit to 50 tracks
        
        if (trackIds.length === 0) {
            return res.json({ items: [] });
        }

        // Fetch full track details in batch (up to 50 tracks per request)
        const tracksResponse = await axios({
            method: 'GET',
            url: `https://api.spotify.com/v1/tracks?ids=${trackIds.join(',')}`,
            headers: {
                'Authorization': token
            }
        });

        // Format response to match playlist tracks structure
        const enhancedItems = tracksResponse.data.tracks.map(track => ({
            track: track
        }));

        res.json({ items: enhancedItems });
    } catch (error) {
        res.status(400).json({
            error: 'Failed to fetch enhanced playlist tracks',
            message: error.message
        });
    }
});

// Search-based approach to get tracks with preview URLs (more reliable)
app.get('/playlist/:id/tracks-with-previews', async (req, res) => {
    const token = req.headers.authorization;
    const playlistId = req.params.id;
    
    if (!token) {
        return res.status(401).json({ error: 'No authorization token provided' });
    }

    try {
        // First get the playlist tracks
        const playlistResponse = await axios({
            method: 'GET',
            url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
            headers: {
                'Authorization': token
            }
        });

        const playlistTracks = playlistResponse.data.items.filter(item => item.track && item.track.name);
        
        if (playlistTracks.length === 0) {
            return res.json({ items: [] });
        }

        // For each track, search for it to get complete data with preview URLs
        const enhancedTracks = await Promise.all(
            playlistTracks.slice(0, 20).map(async (item) => { // Limit to 20 tracks to avoid rate limits
                try {
                    const searchQuery = `${item.track.name} artist:${item.track.artists[0].name}`;
                    const searchResponse = await axios({
                        method: 'GET',
                        url: 'https://api.spotify.com/v1/search',
                        headers: {
                            'Authorization': token
                        },
                        params: {
                            q: searchQuery,
                            type: 'track',
                            limit: 1
                        }
                    });

                    if (searchResponse.data.tracks.items.length > 0) {
                        const searchTrack = searchResponse.data.tracks.items[0];
                        // Return the search result track which should have preview_url
                        return {
                            track: {
                                ...item.track,
                                preview_url: searchTrack.preview_url
                            }
                        };
                    }
                    
                    return item; // Return original if search fails
                } catch (searchError) {
                    console.log('Search failed for track:', item.track.name);
                    return item; // Return original if search fails
                }
            })
        );

        res.json({ items: enhancedTracks });
    } catch (error) {
        res.status(400).json({
            error: 'Failed to fetch tracks with previews',
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