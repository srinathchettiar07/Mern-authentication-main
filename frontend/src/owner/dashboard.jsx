import { useEffect, useState, useMemo, useCallback } from "react";
import { axiosInstance } from "../lib/axios.js";
import Sidebar from "../components/sidebar.jsx";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";
import { 
  Package, 
  Truck, 
  ShoppingBag, 
  CreditCard, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Bell,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Download,
  RefreshCw,
  ChevronRight
} from "lucide-react";

// Color palette
const COLORS = {
  orange: "#f97316",
  green: "#10b981",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  pink: "#ec4899",
  teal: "#14b8a6",
  red: "#ef4444",
  yellow: "#f59e0b"
};

const StatCard = ({ title, value, icon: Icon, trend, color, prefix = "", suffix = "" }) => {
  const isPositive = trend > 0;
  
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color: color }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full ${
            isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-semibold text-gray-800">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </h3>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState({});
  const [insights, setInsights] = useState({});
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [chartType, setChartType] = useState("pie");
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [dashboardRes, trendsRes, insightsRes, chartRes] = await Promise.all([
        axiosInstance.get("/owner/dashboard"),
        axiosInstance.get(`/owner/trends?period=${selectedPeriod}`),
        axiosInstance.get(`/owner/insights?period=${selectedPeriod}`),
        axiosInstance.get(`/owner/charts?type=sales&period=${selectedPeriod}`)
      ]);

      setData(dashboardRes.data.data);
      setTrends(trendsRes.data.data);
      setInsights(insightsRes.data.data);
      setChartData(chartRes.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const stats = useMemo(() => [
    { title: "Products", value: data?.totalProducts || 0, icon: Package, trend: trends?.products, color: COLORS.orange },
    { title: "Suppliers", value: data?.totalSuppliers || 0, icon: Truck, trend: trends?.suppliers, color: COLORS.green },
    { title: "Orders", value: data?.totalOrders || 0, icon: ShoppingBag, trend: trends?.orders, color: COLORS.blue },
    { title: "Users", value: data?.totalUsers || 0, icon: Users, trend: 8.2, color: COLORS.purple },
    { title: "Revenue", value: data?.totalRevenue || 0, icon: DollarSign, trend: trends?.revenue, prefix: "$", color: COLORS.pink },
    { title: "Expenses", value: data?.totalExpenses || 0, icon: CreditCard, trend: trends?.expenses, prefix: "$", color: COLORS.teal },
    { title: "Transactions", value: data?.totalTransactions || 0, icon: TrendingUp, trend: trends?.transactions, color: COLORS.yellow },
    { title: "Pending", value: data?.pendingOrders || 0, icon: Clock, trend: -5, color: COLORS.red }
  ], [data, trends]);

  const pieData = useMemo(() => data ? [
    { name: "Products", value: data.totalProducts, color: COLORS.orange },
    { name: "Suppliers", value: data.totalSuppliers, color: COLORS.green },
    { name: "Orders", value: data.totalOrders, color: COLORS.blue },
    { name: "Users", value: data.totalUsers || 150, color: COLORS.purple },
    { name: "Expenses", value: data.totalExpenses, color: COLORS.pink },
    { name: "Transactions", value: data.totalTransactions, color: COLORS.teal }
  ] : [], [data]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64">
          <div className="p-6 lg:p-8">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-64 bg-gray-100 rounded mb-6"></div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 p-6 lg:p-8">
          <div className="bg-white rounded-xl p-8 text-center border border-red-100">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 font-medium mb-2">Failed to load dashboard</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button 
              onClick={fetchAllData}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-0 md:ml-64">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-semibold text-gray-800">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchAllData}
                disabled={refreshing}
                className="p-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button className="relative p-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <Bell className="w-4 h-4 text-gray-600" />
                {data?.notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {data.notificationCount}
                  </span>
                )}
              </button>
              
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:border-gray-400"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              
              <button className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-gray-700">Analytics Overview</h2>
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5">
                  <button 
                    onClick={() => setChartType("pie")}
                    className={`p-1.5 rounded-md transition-colors ${chartType === "pie" ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <PieChartIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setChartType("bar")}
                    className={`p-1.5 rounded-md transition-colors ${chartType === "bar" ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setChartType("line")}
                    className={`p-1.5 rounded-md transition-colors ${chartType === "line" ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "pie" ? (
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={2}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  ) : chartType === "bar" ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="value" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke={COLORS.pink} strokeWidth={2} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100">
                {pieData.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h2 className="font-medium">AI Insights</h2>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Revenue Trend</p>
                  <p className="text-xl font-semibold">↑ {insights?.revenue?.trend || 23.5}%</p>
                  <p className="text-xs text-gray-400 mt-1">vs last {selectedPeriod}</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Top Category</p>
                  <p className="text-sm font-medium mb-2">{insights?.topCategory?.name || 'Electronics'}</p>
                  <div className="w-full h-1.5 bg-white/20 rounded-full">
                    <div 
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${insights?.topCategory?.percentage || 75}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Recommendation</p>
                  <p className="text-sm">{insights?.recommendation || 'Inventory levels are healthy'}</p>
                </div>
              </div>
              
              <button className="w-full mt-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center gap-1">
                Details <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-gray-700">Recent Orders</h2>
              <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-2">
              {data?.recentOrders?.map((order, i) => (
                <div key={order.id || i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <ShoppingBag className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Order #{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{order.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">${order.amount}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'completed' ? 'bg-green-50 text-green-600' : 
                      order.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {order.status || 'Processing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;