import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserAccount, getPortfolio, addFunds } from '../api/services';
import StatCard from '../components/StatCard';
import { Wallet, PieChart, TrendingUp, AlertCircle, ArrowRight, History, PlusCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const [account, setAccount] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [renderError, setRenderError] = useState(null);
    const [showFundsModal, setShowFundsModal] = useState(false);
    const [fundsAmount, setFundsAmount] = useState('');
    const [fundsLoading, setFundsLoading] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const accountRes = await getUserAccount(user.id);
                const account = accountRes.data;
                setAccount(account);

                const portfolioRes = await getPortfolio(account.id);
                const enrichedPortfolio = portfolioRes.data.map(item => ({
                    ...item,
                    holdingValue: item.quantity * item.currentPrice
                }));

                setPortfolio(enrichedPortfolio);

                const totalValue = enrichedPortfolio.reduce((acc, curr) => acc + curr.holdingValue, 0);
                setAccount(prev => ({ ...prev, portfolioValue: totalValue }));

            } catch (error) {
                console.error("Dashboard Data Fetch Error:", error);
                setRenderError(error.message);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const handleAddFunds = async (e) => {
        e.preventDefault();
        const amount = parseFloat(fundsAmount);
        if (!amount || amount <= 0) {
            toast.error('Enter a valid amount');
            return;
        }
        setFundsLoading(true);
        try {
            const res = await addFunds(account.id, amount);
            setAccount(prev => ({ ...prev, balance: res.data.balance }));
            toast.success(`₹${amount.toLocaleString('en-IN')} added successfully`);
            setShowFundsModal(false);
            setFundsAmount('');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add funds');
        } finally {
            setFundsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (renderError) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-red-500">
                <h2>Dashboard Error: {renderError}</h2>
            </div>
        );
    }

    const totalInvestment = portfolio.reduce((acc, curr) => acc + (curr.quantity * curr.averagePrice), 0);
    const totalValue = account?.portfolioValue || 0;
    const totalReturn = totalValue - totalInvestment;
    const returnPercentage = totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;

    return (
        <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Hello, {user.name}</h1>
                <p className="text-gray-500 mt-1">Here is the overview of your account.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Account Balance"
                    value={account?.balance || 0}
                    icon={<Wallet size={24} />}
                />
                <StatCard
                    title="Portfolio Value"
                    value={totalValue}
                    icon={<PieChart size={24} />}
                />
                <StatCard
                    title="Total Returns"
                    value={totalReturn}
                    icon={<TrendingUp size={24} />}
                    trend={returnPercentage.toFixed(2)}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Links Card */}
                <div className="bg-surface rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                    </div>
                    <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Link to="/trade" className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors text-primary font-medium group text-center">
                            <TrendingUp size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                            Trade Now
                        </Link>
                        <Link to="/portfolio" className="flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors text-emerald-700 font-medium group text-center">
                            <PieChart size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                            View Portfolio
                        </Link>
                        <Link to="/orders" className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-purple-700 font-medium group text-center">
                            <History size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                            Order History
                        </Link>
                        <button onClick={() => setShowFundsModal(true)} className="flex flex-col items-center justify-center p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors text-amber-700 font-medium group text-center w-full">
                            <PlusCircle size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                            Add Funds
                        </button>
                    </div>
                </div>

                {/* Portfolio Snapshot */}
                <div className="bg-surface rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Top Holdings</h3>
                        <Link to="/portfolio" className="text-sm font-medium text-primary hover:text-blue-700 flex items-center gap-1">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="flex-1 p-0">
                        {portfolio.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {portfolio.slice(0, 3).map((item) => (
                                    <li key={item.stockSymbol} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-900">{item.stockSymbol}</p>
                                            <p className="text-sm text-gray-500">{item.quantity} shares Avg: ₹{item.averagePrice.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">₹{item.holdingValue.toFixed(2)}</p>
                                            {item.currentPrice > item.averagePrice ? (
                                                <span className="text-xs font-medium text-success">
                                                    +₹{((item.currentPrice - item.averagePrice) * item.quantity).toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-medium text-danger">
                                                    -₹{((item.averagePrice - item.currentPrice) * item.quantity).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                <AlertCircle size={32} className="mb-2 text-gray-300" />
                                <p>No holdings found.</p>
                                <Link to="/trade" className="mt-2 text-primary font-medium">Start trading your first stock</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

            {/* Add Funds Modal */}
            {showFundsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-bold text-gray-900">Add Funds</h2>
                            <button onClick={() => setShowFundsModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Current balance: <span className="font-semibold text-gray-800">₹{account?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </p>
                        <form onSubmit={handleAddFunds} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="any"
                                    required
                                    value={fundsAmount}
                                    onChange={(e) => setFundsAmount(e.target.value)}
                                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g. 10000"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={fundsLoading}
                                className="w-full py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {fundsLoading ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : 'Add Funds'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;
