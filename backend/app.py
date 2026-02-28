from flask import Flask
from flask_cors import CORS

from routes.auth import auth_bp
from routes.accounts import accounts_bp
from routes.stocks import stocks_bp
from routes.portfolio import portfolio_bp
from routes.orders import orders_bp

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.register_blueprint(auth_bp,      url_prefix="/api/auth")
app.register_blueprint(accounts_bp,  url_prefix="/api/accounts")
app.register_blueprint(stocks_bp,    url_prefix="/api/stocks")
app.register_blueprint(portfolio_bp, url_prefix="/api/portfolio")
app.register_blueprint(orders_bp,    url_prefix="/api/orders")

@app.route("/")
def index():
    return {"status": "StockTrade API is running"}

if __name__ == "__main__":
    app.run(port=8000, debug=True)
