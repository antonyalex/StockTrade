const StatCard = ({ title, value, icon, isCurrency = true, trend = null }) => {
    const formattedValue = isCurrency
        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)
        : value;

    return (
        <div className="bg-surface overflow-hidden rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0 p-3 rounded-lg bg-indigo-50 text-primary">
                        {icon}
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {title}
                            </dt>
                            <dd className="flex items-baseline">
                                <div className="text-2xl font-bold text-gray-900 mt-1">
                                    {formattedValue}
                                </div>
                                {trend && (
                                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {trend >= 0 ? '+' : ''}{trend}%
                                    </div>
                                )}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
