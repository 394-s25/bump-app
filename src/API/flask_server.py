import os

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# Update CORS to include both your development and production URLs
CORS(app, origins=["https://bump-8dc73.web.app", "http://127.0.0.1:5173"])

# Spotify API credentials
CLIENT_ID = "4f8f98b0dd534355bee6085dbcaf284f"
# For production, use environment variables instead of hardcoding secrets
CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET', "2117ebbb02c143b48d3d683ce6dda012")

# Default redirect URI that can be overridden
DEFAULT_REDIRECT_URI = os.environ.get('DEFAULT_REDIRECT_URI', 'http://127.0.0.1:5173/')

@app.route('/spotify-auth', methods=['POST'])
def spotify_auth():
    # Get the authorization code from the request
    data = request.json
    code = data.get('code')
    # Use the redirect URI from the request or fall back to the default
    redirect_uri = data.get('redirect_uri', DEFAULT_REDIRECT_URI)
    
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
        return jsonify(token_data)
        
    except Exception as e:
        print(f"Error during token exchange: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Spotify auth server is running"})

if __name__ == '__main__':
    # Use PORT environment variable for Cloud Run
    port = int(os.environ.get('PORT', 5000))
    # Bind to 0.0.0.0 for Cloud Run
    app.run(debug=os.environ.get('DEBUG', 'True').lower() == 'true',
            host='0.0.0.0', port=port)