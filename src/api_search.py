from flask import Flask, request, jsonify
from flask_cors import CORS
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

app = Flask(__name__)
CORS(app)

# Initialize Spotipy with client credentials
auth_manager = SpotifyClientCredentials(client_id="fa760dbe0bbe42c1852ca7991ca84619", client_secret="032f29f45f6f4946b97ec21317870c6c")
sp = spotipy.Spotify(auth_manager=auth_manager)

@app.route('/search')
def search():
    query = request.args.get('q', '')
    limit = int(request.args.get('limit', 10))

    if not query:
        return jsonify({"error": "Missing query parameter"}), 400

    # Use the Spotify search API
    results = sp.search(q=query, type='track', limit=limit)
    tracks = results['tracks']['items']

    # Build simplified response
    songs = []
    for track in tracks:
        song_data = {
            "name": track['name'],
            "artist": track['artists'][0]['name'],
            "album": track['album']['name'],
            "cover": track['album']['images'][0]['url'] if track['album']['images'] else None,
            "preview_url": track['preview_url'],  # 30s audio clip
            "spotify_url": track['external_urls']['spotify']
        }
        songs.append(song_data)

    return jsonify({"results": songs})

if __name__ == '__main__':
    app.run(debug=True)
