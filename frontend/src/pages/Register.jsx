import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { TrendingUp, UserPlus } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await register(name, email, password);

        if (result.success) {
            toast.success('Account created! Welcome to StockTrade.');
            navigate('/dashboard');
        } else {
            toast.error(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-base flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white font-bold shadow-lg">
                        <TrendingUp size={32} />
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Start managing your stock portfolio today
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-surface py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                                    placeholder="Alex Johnson"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <UserPlus size={18} />
                                        Create account
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-blue-700">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
