import os
from urllib.parse import urlencode

import requests
import spotipy
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from spotipy.oauth2 import SpotifyClientCredentials, SpotifyOAuth

# Set up Flask
app = Flask(__name__, static_folder='../client/build', static_url_path='/')
CORS(app)

# Set your Spotify API credentials
CLIENT_ID = "4f8f98b0dd534355bee6085dbcaf284f"
CLIENT_SECRET = "2117ebbb02c143b48d3d683ce6dda012"
REDIRECT_URI = "http://127.0.0.1:5173/"  # Update this to your actual redirect URI

# Initialize Spotipy for client credentials flow (searching)
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
            "preview_url": track['preview_url'],
            "spotify_url": track['external_urls']['spotify'],
            "spotify_uri": track['uri']  # Include the Spotify URI in search results
        }
        songs.append(song_data)
    return jsonify({"results": songs})

# New endpoint to get the Spotify authorization URL
@app.route('/spotify-auth-url')
def spotify_auth_url():
    scopes = [
        'streaming',
        'user-read-email',
        'user-read-private',
        'user-modify-playback-state',
        'user-read-playback-state'
    ]
    
    # Build the authorization URL
    auth_url = "https://accounts.spotify.com/authorize"
    params = {
        'client_id': CLIENT_ID,
        'response_type': 'code',
        'redirect_uri': REDIRECT_URI,
        'scope': ' '.join(scopes)
    }
    
    full_auth_url = f"{auth_url}?{urlencode(params)}"
    
    return jsonify({'auth_url': full_auth_url})

# New endpoint to exchange code for token
@app.route('/spotify-auth', methods=['POST'])
def spotify_auth():
    code = request.json.get('code')
    if not code:
        return jsonify({"error": "No authorization code provided"}), 400
    
    # Exchange the code for an access token
    token_url = "https://accounts.spotify.com/api/token"
    payload = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,  # Make sure this matches what's in SpotifyLogin.jsx
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }
    
    try:
        print("Exchanging code for token...")
        response = requests.post(token_url, data=payload)
        
        if response.status_code != 200:
            print(f"Token exchange failed: {response.status_code}, {response.text}")
            return jsonify({"error": "Failed to fetch token"}), 400
        
        token_data = response.json()
        print("Token exchange successful")
        
        # Return the token data to the client
        return jsonify({
            'access_token': token_data['access_token'],
            'expires_in': token_data['expires_in']
        })
    except Exception as e:
        print(f"Exception during token exchange: {str(e)}")
        return jsonify({"error": str(e)}), 500
    

# New endpoint to refresh a token
@app.route('/refresh-token', methods=['POST'])
def refresh_token():
    refresh_token = request.json.get('refresh_token')
    if not refresh_token:
        return jsonify({"error": "No refresh token provided"}), 400
    
    # Use refresh token to get a new access token
    token_url = "https://accounts.spotify.com/api/token"
    payload = {
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }
    
    response = requests.post(token_url, data=payload)
    
    if response.status_code != 200:
        return jsonify({"error": "Failed to refresh token"}), 400
    
    token_data = response.json()
    
    return jsonify({
        'access_token': token_data['access_token'],
        'expires_in': token_data['expires_in']
    })

# Serve static files from your React build folder
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)