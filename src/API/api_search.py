import os
from urllib.parse import urlencode

import requests
import spotipy
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from spotipy.oauth2 import SpotifyClientCredentials

# Set up Flask
app = Flask(__name__, static_folder='../client/build', static_url_path='/')
CORS(app, origins=["https://bump-8dc73.web.app", "http://127.0.0.1:5173", "http://localhost:5173"])

# Get environment variables or use defaults for local dev
CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID', "4f8f98b0dd534355bee6085dbcaf284f")
CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET', "2117ebbb02c143b48d3d683ce6dda012")

# Use environment variable for production or default for local dev
REDIRECT_URI = os.environ.get('REDIRECT_URI', "http://127.0.0.1:5173/")

# Initialize Spotipy for client credentials flow (searching)
auth_manager = SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
sp = spotipy.Spotify(auth_manager=auth_manager)

@app.route('/search')
def search():
    """Search for songs via Spotify API"""
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

@app.route('/spotify-auth-url')
def spotify_auth_url():
    """Return the Spotify authorization URL"""
    scopes = [
        'streaming',
        'user-read-email',
        'user-read-private',
        'user-modify-playback-state',
        'user-read-playback-state'
    ]
    
    # Get redirect_uri from query parameter, or use default
    redirect_uri = request.args.get('redirect_uri', REDIRECT_URI)
    
    # Build the authorization URL
    auth_url = "https://accounts.spotify.com/authorize"
    params = {
        'client_id': CLIENT_ID,
        'response_type': 'code',
        'redirect_uri': redirect_uri,
        'state': 'spotify_auth_callback',
        'scope': ' '.join(scopes),
        'show_dialog': 'true'
    }
    
    full_auth_url = f"{auth_url}?{urlencode(params)}"
    
    return jsonify({'auth_url': full_auth_url})

@app.route('/spotify-auth', methods=['POST'])
def spotify_auth():
    """Exchange authorization code for Spotify access token"""
    # Get the authorization code from the request
    data = request.json
    code = data.get('code')
    redirect_uri = data.get('redirect_uri', REDIRECT_URI)
    
    if not code:
        return jsonify({"error": "No authorization code provided"}), 400
    
    # Exchange the code for an access token
    token_url = "https://accounts.spotify.com/api/token"
    payload = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }
    
    try:
        print(f"Exchanging code for token with redirect_uri: {redirect_uri}")
        response = requests.post(token_url, data=payload)
        
        # Check if the token request was successful
        if response.status_code != 200:
            print(f"Token exchange failed: {response.status_code}")
            print(f"Response: {response.text}")
            return jsonify({"error": f"Failed to fetch token: {response.text}"}), 400
        
        # Return the token data to the client
        token_data = response.json()
        print("Token exchange successful")
        
        return jsonify({
            'access_token': token_data['access_token'],
            'expires_in': token_data['expires_in'],
            'refresh_token': token_data.get('refresh_token')  # Include refresh token if available
        })
        
    except Exception as e:
        print(f"Error during token exchange: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/refresh-token', methods=['POST'])
def refresh_token():
    """Refresh an expired Spotify access token"""
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

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Cloud Run"""
    return jsonify({
        "status": "healthy", 
        "message": "Spotify API server is running",
        "version": "1.0"
    })

# Serve React app in production - only needed if Flask serves the frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # Use PORT environment variable if available (for Cloud Run)
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=os.environ.get('DEBUG', 'True').lower() == 'true',
            host="0.0.0.0", port=port)