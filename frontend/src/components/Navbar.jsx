import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, LayoutDashboard, Briefcase, TrendingUp, History, Wallet } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Portfolio', path: '/portfolio', icon: <Briefcase size={18} /> },
        { name: 'Trade', path: '/trade', icon: <TrendingUp size={18} /> },
        { name: 'Orders', path: '/orders', icon: <History size={18} /> },
    ];

    if (!user) return null;

    return (
        <nav className="bg-surface border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/dashboard" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                                    S
                                </div>
                                <span className="font-bold text-xl text-gray-900 tracking-tight">StockTrade</span>
                            </Link>
                        </div>

                        <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors ${isActive
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                            }`}
                                    >
                                        <span className="mr-2">{link.icon}</span>
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                                <Wallet size={16} className="text-gray-400" />
                                <span>{user.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className="sm:hidden border-t border-gray-200 bg-gray-50">
                <div className="flex justify-around items-center h-14">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <span className="mb-1">{link.icon}</span>
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
