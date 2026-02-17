// controllers/owner.controller.js
import Order from "../models/Orders.js";
import Product from "../models/products.js";
import Supplier from "../models/Supplier.js";
import Transaction from "../models/Transaction.js";
import Expense from "../models/Expense.js";
import User from "../models/User.model.js";
import Category from "../models/Category.js";

// ==================== DASHBOARD & ANALYTICS ====================

// Get main dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const [
            totalProducts,
            totalSuppliers,
            totalOrders,
            totalExpenses,
            totalTransactions,
            totalUsers,
            totalRevenue,
            pendingOrders,
            lowStockProducts,
            recentOrders
        ] = await Promise.all([
            Product.countDocuments(),
            Supplier.countDocuments(),
            Order.countDocuments(),
            Expense.countDocuments(),
            Transaction.countDocuments(),
            User.countDocuments({ role: 'user' }),
            Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
            Order.countDocuments({ status: 'pending' }),
            Product.countDocuments({ stock: { $lt: 10 } }),
            Order.find().sort({ createdAt: -1 }).limit(5)
        ]);

        // Get monthly revenue for chart
        const monthlyRevenue = await Order.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                // Summary stats
                totalProducts,
                totalSuppliers,
                totalOrders,
                totalExpenses,
                totalTransactions,
                totalUsers,
                totalRevenue: totalRevenue[0]?.total || 0,
                pendingOrders,
                lowStockProducts,
                
                // Metadata
                businessName: "Your Business Name",
                lastUpdated: new Date(),
                notificationCount: pendingOrders + lowStockProducts,
                
                // Period options
                availablePeriods: [
                    { value: "week", label: "This Week" },
                    { value: "month", label: "This Month" },
                    { value: "quarter", label: "This Quarter" },
                    { value: "year", label: "This Year" }
                ],
                
                // Recent data
                recentOrders: recentOrders.map(o => ({
                    id: o._id,
                    orderNumber: o.orderNumber || `ORD-${o._id.toString().slice(-6)}`,
                    customer: o.customerName || 'Guest',
                    amount: o.totalAmount,
                    status: o.status,
                    date: o.createdAt
                })),
                
                // Chart data
                monthlyRevenue
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching dashboard data" 
        });
    }
};

// Get trends with percentage changes
export const getTrendsData = async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        
        const days = {
            week: 7,
            month: 30,
            quarter: 90,
            year: 365
        }[period] || 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - days);

        // Get current period data
        const current = await getPeriodData(startDate);
        const previous = await getPeriodData(previousStartDate, startDate);

        const calculateTrend = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Number(((current - previous) / previous * 100).toFixed(1));
        };

        res.status(200).json({
            success: true,
            data: {
                products: calculateTrend(current.products, previous.products),
                suppliers: calculateTrend(current.suppliers, previous.suppliers),
                orders: calculateTrend(current.orders, previous.orders),
                expenses: calculateTrend(current.expenses, previous.expenses),
                transactions: calculateTrend(current.transactions, previous.transactions),
                revenue: calculateTrend(current.revenue, previous.revenue),
                users: calculateTrend(current.users, previous.users)
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching trends data" 
        });
    }
};

// Helper for trends data
async function getPeriodData(startDate, endDate = new Date()) {
    const query = endDate ? 
        { createdAt: { $gte: startDate, $lt: endDate } } : 
        { createdAt: { $gte: startDate } };

    const [
        products,
        suppliers,
        orders,
        expenses,
        transactions,
        users,
        revenue
    ] = await Promise.all([
        Product.countDocuments(query),
        Supplier.countDocuments(query),
        Order.countDocuments(query),
        Expense.countDocuments({ date: query.createdAt }),
        Transaction.countDocuments({ date: query.createdAt }),
        User.countDocuments({ ...query, role: 'user' }),
        Order.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ])
    ]);

    return {
        products,
        suppliers,
        orders,
        expenses,
        transactions,
        users,
        revenue: revenue[0]?.total || 0
    };
}

// Get AI insights
export const getInsightsData = async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        // Get top selling category
        const topCategory = await Order.aggregate([
            { $unwind: "$items" },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.category",
                    count: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category'
                }
            }
        ]);

        // Get inventory insights
        const lowStock = await Product.countDocuments({ stock: { $lt: 10 } });
        const outOfStock = await Product.countDocuments({ stock: 0 });
        const totalStock = await Product.aggregate([
            { $group: { _id: null, total: { $sum: "$stock" } } }
        ]);

        // Get sales forecast (simplified - use actual ML in production)
        const lastMonthRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                revenue: {
                    trend: 23.5,
                    comparison: `vs last ${period}`,
                    forecast: lastMonthRevenue[0]?.total * 1.15 || 0
                },
                topCategory: {
                    name: topCategory[0]?.category[0]?.name || 'Electronics',
                    percentage: Math.round((topCategory[0]?.revenue || 0) / (totalStock[0]?.total || 1) * 100),
                    revenue: topCategory[0]?.revenue || 0
                },
                inventory: {
                    lowStock,
                    outOfStock,
                    health: lowStock > 10 ? 'Critical' : lowStock > 5 ? 'Warning' : 'Good',
                    totalValue: totalStock[0]?.total || 0
                },
                recommendation: generateAIRecommendation({ lowStock, outOfStock })
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching insights" 
        });
    }
};

// Generate AI recommendation
function generateAIRecommendation(insights) {
    if (insights.lowStock > 10) {
        return "⚠️ Urgent: Multiple products running low on stock. Consider bulk reorder immediately.";
    } else if (insights.lowStock > 5) {
        return "📈 Demand increasing: Increase inventory for trending products to meet demand.";
    } else if (insights.outOfStock > 0) {
        return "🔄 Restock needed: Some products are out of stock. Review your supply chain.";
    } else {
        return "✅ Inventory levels are healthy. Focus on marketing top performers.";
    }
}

// Get chart data
export const getChartData = async (req, res) => {
    try {
        const { type = 'sales', period = 'month' } = req.query;
        
        const days = {
            week: 7,
            month: 30,
            quarter: 90,
            year: 365
        }[period] || 30;

        const groupFormat = {
            week: { $dayOfWeek: "$createdAt" },
            month: { $dayOfMonth: "$createdAt" },
            quarter: { $month: "$createdAt" },
            year: { $month: "$createdAt" }
        }[period] || { $dayOfMonth: "$createdAt" };

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        let data;
        if (type === 'sales') {
            data = await Order.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: groupFormat,
                        value: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
        } else if (type === 'orders') {
            data = await Order.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: groupFormat,
                        value: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
        }

        res.status(200).json({
            success: true,
            data: data.map(item => ({
                name: item._id.toString(),
                value: item.value
            }))
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching chart data" 
        });
    }
};

// ==================== PRODUCT MANAGEMENT ====================

// Get all products with pagination
export const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category, sortBy = 'createdAt', order = 'desc' } = req.query;
        
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) query.category = category;

        const products = await Product.find(query)
            .populate('category', 'name')
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching products" 
        });
    }
};

// Get single product
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching product" 
        });
    }
};

// Create product
export const createProduct = async (req, res) => {
    try {
        const { name, price, stock, category, description, sku, images } = req.body;

        // Check if SKU already exists
        const existingProduct = await Product.findOne({ sku });
        if (existingProduct) {
            return res.status(400).json({ 
                success: false, 
                message: "Product with this SKU already exists" 
            });
        }

        const product = await Product.create({
            name,
            price,
            stock,
            category,
            description,
            sku,
            images: images || []
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error creating product" 
        });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const { name, price, stock, category, description, images } = req.body;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                price,
                stock,
                category,
                description,
                images
            },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating product" 
        });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting product" 
        });
    }
};

// Update stock
export const updateStock = async (req, res) => {
    try {
        const { stock } = req.body;
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { stock },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Stock updated successfully",
            data: product
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating stock" 
        });
    }
};

// Bulk delete products
export const bulkDeleteProducts = async (req, res) => {
    try {
        const { ids } = req.body;
        
        await Product.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            success: true,
            message: `${ids.length} products deleted successfully`
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting products" 
        });
    }
};

// ==================== SUPPLIER MANAGEMENT ====================

// Get all suppliers
export const getSuppliers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, sortBy = 'createdAt', order = 'desc' } = req.query;
        
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } }
            ];
        }

        const suppliers = await Supplier.find(query)
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Supplier.countDocuments(query);

        res.status(200).json({
            success: true,
            data: suppliers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching suppliers" 
        });
    }
};

// Get single supplier
export const getSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        
        if (!supplier) {
            return res.status(404).json({ 
                success: false, 
                message: "Supplier not found" 
            });
        }

        res.status(200).json({
            success: true,
            data: supplier
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching supplier" 
        });
    }
};

// Create supplier
export const createSupplier = async (req, res) => {
    try {
        const { name, email, phone, company, address, products, paymentTerms } = req.body;

        // Check if email already exists
        const existingSupplier = await Supplier.findOne({ email });
        if (existingSupplier) {
            return res.status(400).json({ 
                success: false, 
                message: "Supplier with this email already exists" 
            });
        }

        const supplier = await Supplier.create({
            name,
            email,
            phone,
            company,
            address,
            products: products || [],
            paymentTerms
        });

        res.status(201).json({
            success: true,
            message: "Supplier created successfully",
            data: supplier
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error creating supplier" 
        });
    }
};

// Update supplier
export const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!supplier) {
            return res.status(404).json({ 
                success: false, 
                message: "Supplier not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Supplier updated successfully",
            data: supplier
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating supplier" 
        });
    }
};

// Delete supplier
export const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);

        if (!supplier) {
            return res.status(404).json({ 
                success: false, 
                message: "Supplier not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Supplier deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting supplier" 
        });
    }
};

// ==================== ORDER MANAGEMENT ====================

// Get all orders
export const getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search, sortBy = 'createdAt', order = 'desc' } = req.query;
        
        const query = {};
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(query);

        // Get order statistics
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    total: { $sum: "$totalAmount" }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: orders,
            stats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching orders" 
        });
    }
};

// Get single order
export const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found" 
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching order" 
        });
    }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating order status" 
        });
    }
};

// Delete order
export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Order deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting order" 
        });
    }
};

// ==================== EXPENSE MANAGEMENT ====================

// Get all expenses
export const getExpenses = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, startDate, endDate } = req.query;
        
        const query = {};
        if (category) query.category = category;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const expenses = await Expense.find(query)
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Expense.countDocuments(query);
        
        // Get total expenses amount
        const totalAmount = await Expense.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        res.status(200).json({
            success: true,
            data: expenses,
            summary: {
                total: totalAmount[0]?.total || 0,
                count: total
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching expenses" 
        });
    }
};

// Create expense
export const createExpense = async (req, res) => {
    try {
        const { description, amount, category, date, paymentMethod, notes } = req.body;

        const expense = await Expense.create({
            description,
            amount,
            category,
            date: date || new Date(),
            paymentMethod,
            notes
        });

        res.status(201).json({
            success: true,
            message: "Expense created successfully",
            data: expense
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error creating expense" 
        });
    }
};

// Update expense
export const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!expense) {
            return res.status(404).json({ 
                success: false, 
                message: "Expense not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Expense updated successfully",
            data: expense
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating expense" 
        });
    }
};

// Delete expense
export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);

        if (!expense) {
            return res.status(404).json({ 
                success: false, 
                message: "Expense not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Expense deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting expense" 
        });
    }
};

// ==================== CATEGORY MANAGEMENT ====================

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'products'
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    productCount: { $size: '$products' },
                    totalValue: { $sum: '$products.price' }
                }
            },
            { $sort: { name: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching categories" 
        });
    }
};

// Create category
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ 
                success: false, 
                message: "Category already exists" 
            });
        }

        const category = await Category.create({ name, description });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error creating category" 
        });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ 
                success: false, 
                message: "Category not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating category" 
        });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        // Check if category has products
        const products = await Product.countDocuments({ category: req.params.id });
        if (products > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot delete category with associated products" 
            });
        }

        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ 
                success: false, 
                message: "Category not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting category" 
        });
    }
};

// ==================== REPORT GENERATION ====================

// Generate sales report
export const generateSalesReport = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const match = {};
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }

        const groupFormat = {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            year: { $dateToString: { format: "%Y", date: "$createdAt" } }
        }[groupBy] || { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };

        const salesData = await Order.aggregate([
            { $match: match },
            {
                $group: {
                    _id: groupFormat,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    averageOrderValue: { $avg: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const summary = await Order.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    averageOrderValue: { $avg: "$totalAmount" },
                    maxOrderValue: { $max: "$totalAmount" },
                    minOrderValue: { $min: "$totalAmount" }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: salesData,
            summary: summary[0] || {
                totalOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error generating sales report" 
        });
    }
};

// Generate inventory report
export const generateInventoryReport = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: 1,
                    sku: 1,
                    price: 1,
                    stock: 1,
                    category: '$categoryInfo.name',
                    value: { $multiply: ['$price', '$stock'] }
                }
            },
            { $sort: { stock: 1 } }
        ]);

        const summary = {
            totalProducts: products.length,
            totalValue: products.reduce((sum, p) => sum + p.value, 0),
            lowStock: products.filter(p => p.stock < 10).length,
            outOfStock: products.filter(p => p.stock === 0).length,
            categories: {}
        };

        products.forEach(p => {
            if (!summary.categories[p.category]) {
                summary.categories[p.category] = {
                    count: 0,
                    value: 0
                };
            }
            summary.categories[p.category].count++;
            summary.categories[p.category].value += p.value;
        });

        res.status(200).json({
            success: true,
            data: products,
            summary
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error generating inventory report" 
        });
    }
};