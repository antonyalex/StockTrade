import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getOrders, getUserAccount } from '../api/services';
import toast from 'react-hot-toast';
import { History, CheckCircle, Clock, Search } from 'lucide-react';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterSymbol, setFilterSymbol] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const accountRes = await getUserAccount(user.id);
                const res = await getOrders(accountRes.data.id);
                setOrders(res.data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchOrders();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <History className="text-primary" />
                        Order Book
                    </h1>
                    <p className="text-gray-500 mt-1">View your recent transactions and order history</p>
                </div>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={filterSymbol}
                        onChange={(e) => setFilterSymbol(e.target.value.toUpperCase())}
                        placeholder="Filter by symbol"
                        className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
            </div>

            <div className="bg-surface shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Instrument
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Qty.
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Total Value
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders
                                    .filter(o => !filterSymbol || o.stockSymbol.includes(filterSymbol))
                                    .map((order) => {
                                    const orderDate = new Date(order.date);
                                    const formattedTime = orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                                    const formattedDate = orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                                    const totalValue = order.quantity * order.executedPrice;

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">{formattedTime}</div>
                                                <div className="text-xs text-gray-500">{formattedDate}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-semibold text-gray-900">{order.stockSymbol}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.type === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                    {order.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 font-medium">
                                                {order.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                                                ₹{order.executedPrice.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                                                ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
                                                    <CheckCircle size={16} /> Complete
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
                        <Clock size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                        <p className="mt-1">You haven't placed any orders. View the Trade tab to begin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
