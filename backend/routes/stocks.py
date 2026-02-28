from flask import Blueprint, jsonify
from db import get_connection
from middleware import require_auth

stocks_bp = Blueprint("stocks", __name__)

@stocks_bp.route("/", methods=["GET"])
@require_auth
def get_stocks():
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT symbol, name, current_price FROM stocks ORDER BY symbol")
        stocks = cur.fetchall()
        return jsonify([dict(s) for s in stocks])
    finally:
        conn.close()


@stocks_bp.route("/<string:symbol>", methods=["GET"])
@require_auth
def get_stock(symbol):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT symbol, name, current_price FROM stocks WHERE symbol = %s",
            (symbol.upper(),)
        )
        stock = cur.fetchone()
        if not stock:
            return jsonify({"error": "Stock not found"}), 404
        return jsonify(dict(stock))
    finally:
        conn.close()
