from flask import Flask
from flask_cors import CORS  # Import CORS
from routes import routes  # Assuming your routes are in routes.py

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.register_blueprint(routes)

if __name__ == "__main__":
    app.run(debug=True)
