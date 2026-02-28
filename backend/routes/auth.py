import os
import jwt
import hashlib
from flask import Blueprint, request, jsonify
from db import get_connection

auth_bp = Blueprint("auth", __name__)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, name, email, password_hash FROM users WHERE email = %s",
            (email,)
        )
        user = cur.fetchone()

        if not user or user["password_hash"] != hash_password(password):
            return jsonify({"error": "Invalid email or password"}), 401

        token = jwt.encode(
            {"user_id": user["id"], "email": user["email"]},
            os.environ["JWT_SECRET"],
            algorithm="HS256"
        )

        return jsonify({
            "user": {"id": user["id"], "name": user["name"], "email": user["email"]},
            "token": token
        })
    finally:
        conn.close()


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required"}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()
        # Create user
        cur.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s) RETURNING id, name, email",
            (name, email, hash_password(password))
        )
        user = cur.fetchone()

        # Create linked account with 0 balance
        cur.execute(
            "INSERT INTO accounts (user_id, balance) VALUES (%s, 0) RETURNING id",
            (user["id"],)
        )

        conn.commit()

        token = jwt.encode(
            {"user_id": user["id"], "email": user["email"]},
            os.environ["JWT_SECRET"],
            algorithm="HS256"
        )

        return jsonify({
            "user": {"id": user["id"], "name": user["name"], "email": user["email"]},
            "token": token
        }), 201
    except Exception as e:
        conn.rollback()
        if "unique" in str(e).lower():
            return jsonify({"error": "Email already registered"}), 409
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
