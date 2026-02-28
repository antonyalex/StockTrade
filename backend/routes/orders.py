from flask import Blueprint, request, jsonify
from db import get_connection
from middleware import require_auth

orders_bp = Blueprint("orders", __name__)

@orders_bp.route("/<int:account_id>", methods=["GET"])
@require_auth
def get_orders(account_id):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, account_id, stock_symbol, type, quantity, executed_price, status, created_at
            FROM orders
            WHERE account_id = %s
            ORDER BY created_at DESC
            """,
            (account_id,)
        )
        orders = cur.fetchall()
        return jsonify([dict(o) for o in orders])
    finally:
        conn.close()


@orders_bp.route("/", methods=["POST"])
@require_auth
def place_order():
    data = request.get_json()
    account_id   = data.get("accountId")
    stock_symbol = data.get("stockSymbol", "").upper()
    order_type   = data.get("type", "").upper()
    quantity     = int(data.get("quantity", 0))

    if not all([account_id, stock_symbol, order_type, quantity]):
        return jsonify({"error": "accountId, stockSymbol, type and quantity are required"}), 400
    if order_type not in ("BUY", "SELL"):
        return jsonify({"error": "type must be BUY or SELL"}), 400
    if quantity <= 0:
        return jsonify({"error": "quantity must be positive"}), 400

    conn = get_connection()
    try:
        cur = conn.cursor()

        # Lock the account row for the duration of the transaction
        cur.execute("BEGIN")
        cur.execute(
            "SELECT id, balance FROM accounts WHERE id = %s FOR UPDATE",
            (account_id,)
        )
        account = cur.fetchone()
        if not account:
            conn.rollback()
            return jsonify({"error": "Account not found"}), 404

        # Get current stock price
        cur.execute(
            "SELECT symbol, current_price FROM stocks WHERE symbol = %s",
            (stock_symbol,)
        )
        stock = cur.fetchone()
        if not stock:
            conn.rollback()
            return jsonify({"error": "Stock not found"}), 404

        current_price = float(stock["current_price"])
        total_cost    = current_price * quantity

        if order_type == "BUY":
            # Check sufficient balance
            if float(account["balance"]) < total_cost:
                conn.rollback()
                return jsonify({"error": "Insufficient balance"}), 400

            # Deduct balance
            cur.execute(
                "UPDATE accounts SET balance = balance - %s WHERE id = %s",
                (total_cost, account_id)
            )

            # Upsert holdings — weighted average price on top-up
            cur.execute(
                """
                INSERT INTO holdings (account_id, stock_symbol, quantity, average_price)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (account_id, stock_symbol) DO UPDATE SET
                    average_price = (
                        (holdings.average_price * holdings.quantity + %s * %s)
                        / (holdings.quantity + %s)
                    ),
                    quantity = holdings.quantity + %s
                """,
                (account_id, stock_symbol, quantity, current_price,
                 current_price, quantity, quantity,
                 quantity)
            )

        else:  # SELL
            # Check sufficient holdings
            cur.execute(
                "SELECT quantity FROM holdings WHERE account_id = %s AND stock_symbol = %s FOR UPDATE",
                (account_id, stock_symbol)
            )
            holding = cur.fetchone()
            if not holding or holding["quantity"] < quantity:
                conn.rollback()
                return jsonify({"error": "Insufficient holdings"}), 400

            # Credit balance
            cur.execute(
                "UPDATE accounts SET balance = balance + %s WHERE id = %s",
                (total_cost, account_id)
            )

            if holding["quantity"] == quantity:
                # Sell entire position — remove the holding row
                cur.execute(
                    "DELETE FROM holdings WHERE account_id = %s AND stock_symbol = %s",
                    (account_id, stock_symbol)
                )
            else:
                # Partial sell — decrement quantity (average_price stays the same)
                cur.execute(
                    "UPDATE holdings SET quantity = quantity - %s WHERE account_id = %s AND stock_symbol = %s",
                    (quantity, account_id, stock_symbol)
                )

        # Record the order
        cur.execute(
            """
            INSERT INTO orders (account_id, stock_symbol, type, quantity, executed_price, status)
            VALUES (%s, %s, %s, %s, %s, 'COMPLETE')
            RETURNING id, account_id, stock_symbol, type, quantity, executed_price, status, created_at
            """,
            (account_id, stock_symbol, order_type, quantity, current_price)
        )
        order = cur.fetchone()
        conn.commit()

        return jsonify(dict(order)), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
