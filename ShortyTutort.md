# How to get song preview: 
{
  "tracks": {
    "items": [
      {
        "name": "Song Title",
        "preview_url": "https://p.scdn.co/mp3-preview/abcdef12345.mp3",
        "artists": [{ "name": "Artist Name" }],
        "album": { "name": "Album Name" }
      }
    ]
  }
}
OR
"preview_url": "https://p.scdn.co/mp3-preview/abcdef12345.mp3"
OR
app.get("/search", async (req, res) => {
  const { q } = req.query;
  try {
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      params: { q, type: "track", limit: 5 },
    });

    const tracks = response.data.tracks.items.map(track => ({
      name: track.name,
      artist: track.artists.map(a => a.name).join(", "),
      preview_url: track.preview_url,
    }));

    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

OR
function TrackPreview({ track }) {
  return (
    <div>
      <p>{track.name} – {track.artist}</p>
      {track.preview_url ? (
        <audio controls src={track.preview_url}></audio>
      ) : (
        <p>No preview available</p>
      )}
    </div>
  );
}
