import os

import spotipy
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from spotipy.oauth2 import SpotifyClientCredentials

# Set up Flask to serve static files from the React build folder.
# Adjust the static_folder path as necessary to point to your React build directory.
app = Flask(__name__, static_folder='../client/build', static_url_path='/')
CORS(app)

# Set your Spotify API credentials here (or load from environment variables)
CLIENT_ID = "fa760dbe0bbe42c1852ca7991ca84619"
CLIENT_SECRET = "032f29f45f6f4946b97ec21317870c6c"

# Initialize Spotipy using client credentials flow
auth_manager = SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
sp = spotipy.Spotify(auth_manager=auth_manager)

@app.route('/search')
def search():
    query = request.args.get('q', '')
    limit = int(request.args.get('limit', 10))
    if not query:
        return jsonify({"error": "Missing query parameter"}), 400
    results = sp.search(q=query, type='track', limit=limit)
    tracks = results['tracks']['items']
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

# Serve static files from your React build folder for all other routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)  # The server will run on http://127.0.0.1:5000 by default