import os

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Spotify API credentials
CLIENT_ID = "4f8f98b0dd534355bee6085dbcaf284f"
CLIENT_SECRET = "2117ebbb02c143b48d3d683ce6dda012"  # Make sure to keep this secure in production

@app.route('/spotify-auth', methods=['POST'])
def spotify_auth():
    # Get the authorization code from the request
    data = request.json
    code = data.get('code')
    redirect_uri = data.get('redirect_uri', 'http://127.0.0.1:5173/')
    
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
    return jsonify({"status": "healthy", "message": "Local auth server is running"})

if __name__ == '__main__':
    # Run the Flask app on port 5000
    print("Starting local auth server on http://127.0.0.1:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)