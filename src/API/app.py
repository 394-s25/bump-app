# app.py

import os
from urllib.parse import urlencode

import requests
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# ─── Flask Setup ───────────────────────────────────────────────────────────────
app = Flask(__name__,
            static_folder='../client/build',
            static_url_path='/')
CORS(app, origins=[
    "https://bump-8dc73.web.app",
    "http://127.0.0.1:5173",
    "http://localhost:5173"
])

# ─── Spotify Credentials ───────────────────────────────────────────────────────
CLIENT_ID     = os.getenv('SPOTIFY_CLIENT_ID',     "4f8f98b0dd534355bee6085dbcaf284f")
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET', "2117ebbb02c143b48d3d683ce6dda012")
REDIRECT_URI  = os.getenv('REDIRECT_URI',          "https://bump-app-416502417253.us-central1.run.app/")

# ─── Spotipy Client Credentials (for search) ──────────────────────────────────
auth_manager = SpotifyClientCredentials(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET
)
sp = spotipy.Spotify(auth_manager=auth_manager)

# ─── /search ──────────────────────────────────────────────────────────────────
@app.route('/search')
def search():
    q     = request.args.get('q', '')
    limit = int(request.args.get('limit', 10))
    if not q:
        return jsonify(error="Missing query parameter"), 400

    results = sp.search(q=q, type='track', limit=limit)
    tracks  = results['tracks']['items']

    songs = [{
        "name":        t['name'],
        "artist":      t['artists'][0]['name'],
        "album":       t['album']['name'],
        "cover":       (t['album']['images'][0]['url']
                        if t['album']['images'] else None),
        "preview_url": t['preview_url'],
        "spotify_url": t['external_urls']['spotify'],
        "spotify_uri": t['uri']
    } for t in tracks]

    return jsonify(results=songs)

# ─── /spotify-auth-url ────────────────────────────────────────────────────────
@app.route('/spotify-auth-url')
def spotify_auth_url():
    scopes = [
        'streaming',
        'user-read-email',
        'user-read-private',
        'user-modify-playback-state',
        'user-read-playback-state'
    ]
    redirect_uri = request.args.get('redirect_uri', REDIRECT_URI)
    params = {
        'client_id':     CLIENT_ID,
        'response_type': 'code',
        'redirect_uri':  redirect_uri,
        'state':         'spotify_auth_callback',
        'scope':         ' '.join(scopes),
        'show_dialog':   'true'
    }
    url = f"https://accounts.spotify.com/authorize?{urlencode(params)}"
    return jsonify(auth_url=url)

# ─── /spotify-auth  (exchange code for token) ────────────────────────────────
@app.route('/spotify-auth', methods=['POST'])
def spotify_auth_exchange():
    data = request.get_json(silent=True) or {}
    code = data.get('code')
    redirect_uri = data.get('redirect_uri', REDIRECT_URI)
    if not code:
        return jsonify(error="No authorization code provided"), 400

    token_url = "https://accounts.spotify.com/api/token"
    payload = {
        'grant_type':    'authorization_code',
        'code':          code,
        'redirect_uri':  redirect_uri,
        'client_id':     CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }

    resp = requests.post(token_url, data=payload)
    if resp.status_code != 200:
        return jsonify(error=f"Token exchange failed: {resp.text}"), 400

    return jsonify(resp.json())

# ─── /refresh-token ─────────────────────────────────────────────────────────
@app.route('/refresh-token', methods=['POST'])
def refresh_token():
    data = request.get_json(silent=True) or {}
    refresh = data.get('refresh_token')
    if not refresh:
        return jsonify(error="No refresh token provided"), 400

    token_url = "https://accounts.spotify.com/api/token"
    payload = {
        'grant_type':    'refresh_token',
        'refresh_token': refresh,
        'client_id':     CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }

    resp = requests.post(token_url, data=payload)
    if resp.status_code != 200:
        return jsonify(error="Failed to refresh token"), 400

    tok = resp.json()
    return jsonify(access_token=tok['access_token'],
                   expires_in=tok['expires_in'])

# ─── /health ─────────────────────────────────────────────────────────────────
@app.route('/health')
def health():
    return jsonify(status="healthy",
                   message="Spotify API server is running",
                   version="1.0")

# ─── Serve React Static Build ────────────────────────────────────────────────
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    full = os.path.join(app.static_folder, path)
    if path and os.path.exists(full):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# ─── Entrypoint ───────────────────────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
