from flask import Blueprint, request, jsonify
from db import get_connection
from middleware import require_auth

accounts_bp = Blueprint("accounts", __name__)

@accounts_bp.route("/<int:user_id>", methods=["GET"])
@require_auth
def get_account(user_id):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM accounts WHERE user_id = %s",
            (user_id,)
        )
        account = cur.fetchone()
        if not account:
            return jsonify({"error": "Account not found"}), 404
        return jsonify(dict(account))
    finally:
        conn.close()


@accounts_bp.route("/<int:account_id>/funds", methods=["POST"])
@require_auth
def add_funds(account_id):
    data = request.get_json()
    amount = data.get("amount")

    if not amount or float(amount) <= 0:
        return jsonify({"error": "Amount must be positive"}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE accounts SET balance = balance + %s WHERE id = %s RETURNING id, balance",
            (amount, account_id)
        )
        account = cur.fetchone()
        if not account:
            return jsonify({"error": "Account not found"}), 404
        conn.commit()
        return jsonify({"id": account["id"], "balance": float(account["balance"]), "message": "Funds added successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
