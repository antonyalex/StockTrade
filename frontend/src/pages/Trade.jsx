import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getStocks, getUserAccount, getPortfolio, placeOrder } from '../api/services';
import toast from 'react-hot-toast';
import { TrendingUp, TrendingDown, Info, Wallet } from 'lucide-react';

const Trade = () => {
    const { user } = useAuth();
    const [stocks, setStocks] = useState([]);
    const [account, setAccount] = useState(null);
    const [portfolio, setPortfolio] = useState([]);

    const [selectedStock, setSelectedStock] = useState('');
    const [quantity, setQuantity] = useState('');
    const [type, setType] = useState('BUY'); // BUY or SELL

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stocksRes, accRes, ptRes] = await Promise.all([
                    getStocks(),
                    getUserAccount(user.id),
                    getPortfolio(user.id)
                ]);

                setStocks(stocksRes.data);
                setAccount(accRes.data);
                setPortfolio(ptRes.data);

                if (stocksRes.data.length > 0) {
                    setSelectedStock(stocksRes.data[0].symbol);
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load trade data');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    const activeStock = stocks.find(s => s.symbol === selectedStock) || null;
    const holding = portfolio.find(p => p.stockSymbol === selectedStock);
    const maxSellQty = holding ? holding.quantity : 0;

    const totalCost = activeStock && quantity ? parseFloat(activeStock.currentPrice) * parseInt(quantity) : 0;

    const handleOrder = async (e) => {
        e.preventDefault();
        const qty = parseInt(quantity);

        if (!qty || qty <= 0) {
            toast.error('Quantity must be greater than 0');
            return;
        }

        if (type === 'SELL' && qty > maxSellQty) {
            toast.error(`You only hold ${maxSellQty} shares of ${selectedStock}`);
            return;
        }

        if (type === 'BUY' && totalCost > account.balance) {
            toast.error('Insufficient funds');
            return;
        }

        setSubmitting(true);

        try {
            // Simulate API call using our mock logic translated to UI side for dummy purpose
            await new Promise(resolve => setTimeout(resolve, 800));

            await placeOrder({
                accountId: user.id,
                stockSymbol: selectedStock,
                type,
                quantity: qty
            });

            toast.success(`${type} order placed successfully for ${qty} ${selectedStock}`);

            // refresh account limits
            const [accRes, ptRes] = await Promise.all([
                getUserAccount(user.id),
                getPortfolio(user.id)
            ]);
            setAccount(accRes.data);
            setPortfolio(ptRes.data);
            setQuantity('');

        } catch (error) {
            toast.error(error.message || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8 items-center flex gap-2">
                <TrendingUp className="text-primary" />
                Trade Terminal
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Trading Panel */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-surface rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">Place Order</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Wallet size={16} />
                                Available Margin: <span className="font-bold text-gray-900">₹{account?.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <form onSubmit={handleOrder} className="p-6">
                            {/* Type Toggle */}
                            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                                <button
                                    type="button"
                                    onClick={() => setType('BUY')}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${type === 'BUY'
                                        ? 'bg-success text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    BUY
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('SELL')}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${type === 'SELL'
                                        ? 'bg-danger text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    SELL
                                </button>
                            </div>

                            {/* Stock Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Instrument</label>
                                <select
                                    value={selectedStock}
                                    onChange={(e) => setSelectedStock(e.target.value)}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-4 py-2 bg-white border outline-none"
                                >
                                    {stocks.map(s => (
                                        <option key={s.symbol} value={s.symbol}>
                                            {s.symbol} - {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Layout for Qty and Price */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Qty. <span className="text-gray-400 font-normal ml-1">(Holding: {maxSellQty})</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary px-4 py-2 border outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={activeStock ? `₹${activeStock.currentPrice.toFixed(2)}` : ''}
                                        className="w-full bg-gray-50 border-gray-300 rounded-lg shadow-sm px-4 py-2 border text-gray-500 cursor-not-allowed"
                                    />
                                    <span className="text-xs text-primary mt-1 block px-1">Market Order</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-6 flex justify-between items-center bg-gray-50 -mx-6 px-6 py-4">
                                <span className="text-gray-600 font-medium text-sm">Required Margin</span>
                                <span className="text-xl font-bold text-gray-900">₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !quantity || parseInt(quantity) <= 0}
                                className={`w-full py-3 rounded-lg text-white font-bold text-lg shadow-sm focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center
                  ${type === 'BUY' ? 'bg-success hover:bg-emerald-600' : 'bg-danger hover:bg-red-600'}
                `}
                            >
                                {submitting ? (
                                    <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <span>{type} {selectedStock}</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Market Depth / Info Panel */}
                <div className="space-y-6">
                    {activeStock && (
                        <div className="bg-surface rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 text-center bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-900">{activeStock.symbol}</h2>
                                <p className="text-sm text-gray-500">{activeStock.name}</p>
                            </div>
                            <div className="p-6 flex flex-col items-center">
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Last Traded Price</span>
                                <div className="text-4xl font-bold text-gray-900 my-2">₹{activeStock.currentPrice.toFixed(2)}</div>
                                <div className="flex items-center text-sm font-medium text-success gap-1">
                                    <TrendingUp size={16} />
                                    +₹{(activeStock.currentPrice * 0.015).toFixed(2)} (+1.5%)
                                </div>
                            </div>
                            <div className="bg-blue-50 text-blue-800 p-4 flex gap-3 text-sm border-t border-blue-100 m-2 rounded">
                                <Info size={20} className="shrink-0 text-blue-500" />
                                <p>Prices are simulated. Actual market values may vary rapidly based on exchange constraints.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Trade;
