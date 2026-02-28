from flask import Blueprint, jsonify
from db import get_connection
from middleware import require_auth

portfolio_bp = Blueprint("portfolio", __name__)

@portfolio_bp.route("/<int:account_id>", methods=["GET"])
@require_auth
def get_portfolio(account_id):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT
                h.id,
                h.account_id,
                h.stock_symbol,
                h.quantity,
                h.average_price,
                s.name AS stock_name,
                s.current_price
            FROM holdings h
            JOIN stocks s ON h.stock_symbol = s.symbol
            WHERE h.account_id = %s
            ORDER BY h.stock_symbol
            """,
            (account_id,)
        )
        holdings = cur.fetchall()
        return jsonify([dict(h) for h in holdings])
    finally:
        conn.close()
