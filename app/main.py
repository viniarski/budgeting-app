import re
import os
import bcrypt
from flask import Flask, jsonify, session, request
from flask_cors import CORS
from dotenv import load_dotenv
import sqlite3


app = Flask(__name__)
CORS(app,
    origins=["http://localhost:3000"]
    supports_credentials=True
)

@app.route("/login")
def login():


@app.route("/api/session/set")


if __name__ == ("__main__"):
    app.run(port="5000")