import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getPortfolio } from '../api/services';
import toast from 'react-hot-toast';
import { Briefcase, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Portfolio = () => {
    const { user } = useAuth();
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const res = await getPortfolio(user.id);

                // Add random dummy variance to simulate current price for UI logic
                const enrichedPortfolio = res.data.map(item => {
                    const currentPrice = item.averagePrice * (1 + (Math.random() * 0.1 - 0.05));
                    return {
                        ...item,
                        currentPrice,
                        holdingValue: item.quantity * currentPrice
                    };
                });

                setPortfolio(enrichedPortfolio);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load portfolio');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchPortfolio();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const totalValue = portfolio.reduce((acc, curr) => acc + curr.holdingValue, 0);
    const totalInvestment = portfolio.reduce((acc, curr) => acc + (curr.quantity * curr.averagePrice), 0);
    const totalReturn = totalValue - totalInvestment;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Briefcase className="text-primary" />
                        Your Portfolio
                    </h1>
                    <p className="text-gray-500 mt-1">Manage all your holdings in one place</p>
                </div>
            </div>

            <div className="bg-surface rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    <div className="p-6">
                        <p className="text-sm font-medium text-gray-500">Total Investment</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">₹{totalInvestment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-6">
                        <p className="text-sm font-medium text-gray-500">Current Value</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-6">
                        <p className="text-sm font-medium text-gray-500">Total Return</p>
                        <div className="flex items-baseline gap-2 mt-2">
                            <p className={`text-3xl font-bold ${totalReturn >= 0 ? 'text-success' : 'text-danger'}`}>
                                {totalReturn >= 0 ? '+' : '-'}₹{Math.abs(totalReturn).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <span className={`flex items-center text-sm font-semibold ${totalReturn >= 0 ? 'text-success' : 'text-danger'}`}>
                                {totalReturn >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                {totalInvestment > 0 ? ((Math.abs(totalReturn) / totalInvestment) * 100).toFixed(2) : '0.00'}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-surface shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                {portfolio.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Instrument
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Qty.
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Avg. cost
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        LTP
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Cur. value
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        P&L
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {portfolio.map((item) => {
                                    const pnl = (item.currentPrice - item.averagePrice) * item.quantity;
                                    const pnlPercent = ((item.currentPrice - item.averagePrice) / item.averagePrice) * 100;

                                    return (
                                        <tr key={item.stockSymbol} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-semibold text-gray-900">{item.stockSymbol}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                                                {item.averagePrice.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <span className={item.currentPrice >= item.averagePrice ? 'text-success' : 'text-danger'}>
                                                    {item.currentPrice.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 font-medium">
                                                {item.holdingValue.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                                                <span className={pnl >= 0 ? 'text-success' : 'text-danger'}>
                                                    {pnl >= 0 ? '+' : '-'}{Math.abs(pnl).toFixed(2)} <span className="text-xs">({Math.abs(pnlPercent).toFixed(2)}%)</span>
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center text-gray-500 flex flex-col items-center">
                        <Briefcase size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Your portfolio is empty</h3>
                        <p className="mt-1">Add funds and start trading to build your portfolio.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Portfolio;
