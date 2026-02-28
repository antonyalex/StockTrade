
import api from './axios';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginUser = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res;
};

export const registerUser = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res;
};

// ─── Accounts ────────────────────────────────────────────────────────────────

export const getUserAccount = async (userId) => {
    const res = await api.get(`/accounts/${userId}`);
    return res;
};

export const addFunds = async (accountId, amount) => {
    const res = await api.post(`/accounts/${accountId}/funds`, { amount });
    return res;
};

// ─── Stocks ──────────────────────────────────────────────────────────────────

export const getStocks = async () => {
    const res = await api.get('/stocks/');
    // Normalise: backend returns current_price, pages expect currentPrice
    return {
        ...res,
        data: res.data.map(s => ({
            symbol: s.symbol,
            name: s.name,
            currentPrice: parseFloat(s.current_price)
        }))
    };
};

export const getStockBySymbol = async (symbol) => {
    const res = await api.get(`/stocks/${symbol}`);
    return {
        ...res,
        data: {
            symbol: res.data.symbol,
            name: res.data.name,
            currentPrice: parseFloat(res.data.current_price)
        }
    };
};

// ─── Portfolio ───────────────────────────────────────────────────────────────

export const getPortfolio = async (accountId) => {
    const res = await api.get(`/portfolio/${accountId}`);
    // Normalise snake_case → camelCase
    return {
        ...res,
        data: res.data.map(h => ({
            id: h.id,
            accountId: h.account_id,
            stockSymbol: h.stock_symbol,
            stockName: h.stock_name,
            quantity: h.quantity,
            averagePrice: parseFloat(h.average_price),
            currentPrice: parseFloat(h.current_price)
        }))
    };
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export const getOrders = async (accountId) => {
    const res = await api.get(`/orders/${accountId}`);
    return {
        ...res,
        data: res.data.map(o => ({
            id: o.id,
            accountId: o.account_id,
            stockSymbol: o.stock_symbol,
            type: o.type,
            quantity: o.quantity,
            executedPrice: parseFloat(o.executed_price),
            status: o.status,
            date: o.created_at
        }))
    };
};

export const placeOrder = async (orderData) => {
    const res = await api.post('/orders/', {
        accountId:   orderData.accountId,
        stockSymbol: orderData.stockSymbol,
        type:        orderData.type,
        quantity:    orderData.quantity
    });
    return {
        ...res,
        data: {
            id:            res.data.id,
            accountId:     res.data.account_id,
            stockSymbol:   res.data.stock_symbol,
            type:          res.data.type,
            quantity:      res.data.quantity,
            executedPrice: parseFloat(res.data.executed_price),
            status:        res.data.status,
            date:          res.data.created_at
        }
    };
};
