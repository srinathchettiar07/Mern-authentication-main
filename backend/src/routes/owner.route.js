// routes/owner.routes.js
import express from 'express';
import {
    // Dashboard
    getDashboardData,
    getTrendsData,
    getInsightsData,
    getChartData,
    
    // Products
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    bulkDeleteProducts,
    
    // Suppliers
    getSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    
    // Orders
    getOrders,
    getOrder,
    updateOrderStatus,
    deleteOrder,
    
    // Expenses
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    
    // Categories
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Reports
    generateSalesReport,
    generateInventoryReport
} from '../controllers/owner.js';

const router = express.Router();

// ==================== DASHBOARD ROUTES ====================
router.get('/dashboard', getDashboardData);
router.get('/trends', getTrendsData);
router.get('/insights', getInsightsData);
router.get('/charts', getChartData);

// ==================== PRODUCT ROUTES ====================
router.get('/products', getProducts);
router.get('/products/:id', getProduct);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/stock', updateStock);
router.post('/products/bulk-delete', bulkDeleteProducts);

// ==================== SUPPLIER ROUTES ====================
router.get('/suppliers', getSuppliers);
router.get('/suppliers/:id', getSupplier);
router.post('/suppliers', createSupplier);
router.put('/suppliers/:id', updateSupplier);
router.delete('/suppliers/:id', deleteSupplier);

// ==================== ORDER ROUTES ====================
router.get('/orders', getOrders);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

// ==================== EXPENSE ROUTES ====================
router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);

// ==================== CATEGORY ROUTES ====================
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// ==================== REPORT ROUTES ====================
router.get('/reports/sales', generateSalesReport);
router.get('/reports/inventory', generateInventoryReport);

export default router;