

// Users
export const loginUser = async (email) => {
    // Mock login logic since we don't have a real backend
    const defaultUser = {
        id: 1,
        name: "Demo User",
        email: "user@zerodha.com"
    };

    if (email === "user@zerodha.com") {
        return { data: { user: defaultUser, token: "mock-jwt-token-123" } };
    }

    throw new Error("Invalid credentials. Try user@zerodha.com");
};

export const getUserAccount = async (userId) => {
    // Mock user account details
    return {
        data: {
            id: 1,
            userId,
            balance: 250000.0,
            portfolioValue: 105000.0
        }
    };
};

export const addFunds = async (accountId, amount) => {
    return {
        data: {
            id: accountId,
            balance: 250000.0 + parseFloat(amount),
            message: "Funds added successfully"
        }
    };
};

// Stocks
export const getStocks = async () => {
    return {
        data: [
            { symbol: 'RELIANCE', name: 'Reliance Industries', currentPrice: 2850.50 },
            { symbol: 'TCS', name: 'Tata Consultancy Services', currentPrice: 3950.00 },
            { symbol: 'HDFCBANK', name: 'HDFC Bank', currentPrice: 1420.75 },
            { symbol: 'INFY', name: 'Infosys', currentPrice: 1680.20 },
            { symbol: 'ITC', name: 'ITC Limited', currentPrice: 420.60 }
        ]
    };
};

export const getStockBySymbol = async (symbol) => {
    const stocks = await getStocks();
    const stock = stocks.data.find(s => s.symbol === symbol);
    if (stock) return { data: stock };
    throw new Error('Stock not found');
};

// Portfolio
export const getPortfolio = async (/* accountId */) => {
    return {
        data: [
            { stockSymbol: 'RELIANCE', quantity: 10, averagePrice: 2700.00 },
            { stockSymbol: 'TCS', quantity: 5, averagePrice: 3800.00 },
            { stockSymbol: 'HDFCBANK', quantity: 20, averagePrice: 1500.00 }
        ]
    };
};

// Orders
export const getOrders = async (/* accountId */) => {
    return {
        data: [
            { id: 101, accountId: 1, stockSymbol: 'RELIANCE', type: 'BUY', quantity: 10, executedPrice: 2700.00, date: new Date(Date.now() - 86400000).toISOString() },
            { id: 102, accountId: 1, stockSymbol: 'TCS', type: 'BUY', quantity: 5, executedPrice: 3800.00, date: new Date(Date.now() - 172800000).toISOString() }
        ]
    };
};

export const placeOrder = async (orderData) => {
    const { accountId, stockSymbol, type, quantity } = orderData;
    const stock = await getStockBySymbol(stockSymbol);

    return {
        data: {
            id: Math.floor(Math.random() * 10000) + 1000,
            accountId,
            stockSymbol,
            type,
            quantity: parseInt(quantity),
            executedPrice: stock.data.currentPrice,
            date: new Date().toISOString()
        }
    };
};
