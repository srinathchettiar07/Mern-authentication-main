// seeder.js
import bcrypt from "bcrypt";
import mongoose from "mongoose";

// Import all models
import User from "../models/User.model.js";
import Category from "../models/Category.js";
import Supplier from "../models/Supplier.js";
import Product from "../models/Products.js";
import SupplierOrder from "../models/Orders.js";
import Transaction from "../models/Transaction.js";
import Expense from "../models/Expense.js";

export const seedDatabase = async () => {
  try {
    console.log("\n🌱 Starting database seeding...\n");

    // Clear existing data in correct order (respect foreign key constraints)
    await Expense.deleteMany({});
    await Transaction.deleteMany({});
    await SupplierOrder.deleteMany({});
    await Product.deleteMany({});
    await Supplier.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    
    console.log("✅ Database cleared successfully");

    // Seed Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const users = await User.insertMany([
      {
        fullname: "John Owner",
        email: "owner@restaurant.com",
        password: hashedPassword,
        role: "owner",
        isVerified: true,
        profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
      },
    //   {
    //     fullname: "Sarah Manager",
    //     email: "manager@restaurant.com",
    //     password: hashedPassword,
    //     role: "manager",
    //     isVerified: true,
    //     profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
    //   },
      {
        fullname: "Mike Staff",
        email: "staff@restaurant.com",
        password: hashedPassword,
        role: "staff",
        isVerified: true,
        profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
      },
      {
        fullname: "Emma Staff",
        email: "emma@restaurant.com",
        password: hashedPassword,
        role: "staff",
        isVerified: true,
        profilePic: "https://randomuser.me/api/portraits/women/4.jpg",
      },
    ]);
    console.log(`✅ ${users.length} users seeded`);

    // Make sure we have all users
    

    // Seed Categories
    const categories = await Category.insertMany([
      { name: "Beverages", description: "Soft drinks, juices, and other drinks", isActive: true },
      { name: "Snacks", description: "Quick bites and finger foods", isActive: true },
      { name: "Main Course", description: "Lunch and dinner items", isActive: true },
      { name: "Desserts", description: "Sweet treats and desserts", isActive: true },
      { name: "Raw Materials", description: "Cooking ingredients", isActive: true },
    ]);
    console.log(`✅ ${categories.length} categories seeded`);

    // Seed Suppliers
    const suppliers = await Supplier.insertMany([
      {
        name: "Fresh Farms Inc.",
        email: "contact@freshfarms.com",
        phone: "+1234567890",
        address: "123 Farm Road, Agricultural District",
        isActive: true,
      },
      {
        name: "Beverage Distributors Ltd.",
        email: "orders@beveragedist.com",
        phone: "+1234567891",
        address: "456 Industrial Ave, City Center",
        isActive: true,
      },
      {
        name: "Quality Meats Co.",
        email: "sales@qualitymeats.com",
        phone: "+1234567892",
        address: "789 Butcher Street, Meat District",
        isActive: true,
      },
      {
        name: "Global Spices",
        email: "info@globalspices.com",
        phone: "+1234567893",
        address: "321 Spice Market, Downtown",
        isActive: true,
      },
    ]);
    console.log(`✅ ${suppliers.length} suppliers seeded`);

    // Seed Products
    const products = await Product.insertMany([
      // Beverages
      {
        name: "Cola (500ml)",
        category: categories[0]._id,
        unit: "pcs",
        costPrice: 0.5,
        sellingPrice: 1.5,
        quantity: 100,
        minStock: 20,
        supplierId: suppliers[1]._id,
        status: "ACTIVE",
      },
      {
        name: "Orange Juice (1L)",
        category: categories[0]._id,
        unit: "litre",
        costPrice: 1.2,
        sellingPrice: 3.0,
        quantity: 50,
        minStock: 10,
        supplierId: suppliers[1]._id,
        status: "ACTIVE",
      },
      {
        name: "Potato Chips",
        category: categories[1]._id,
        unit: "pcs",
        costPrice: 0.8,
        sellingPrice: 2.0,
        quantity: 200,
        minStock: 50,
        supplierId: suppliers[1]._id,
        status: "ACTIVE",
      },
      {
        name: "Chicken Breast",
        category: categories[2]._id,
        unit: "kg",
        costPrice: 5.0,
        sellingPrice: 8.5,
        quantity: 30,
        minStock: 10,
        supplierId: suppliers[2]._id,
        status: "ACTIVE",
      },
      {
        name: "Rice (5kg)",
        category: categories[2]._id,
        unit: "kg",
        costPrice: 3.0,
        sellingPrice: 5.0,
        quantity: 100,
        minStock: 25,
        supplierId: suppliers[0]._id,
        status: "ACTIVE",
      },
      {
        name: "Mixed Spices",
        category: categories[4]._id,
        unit: "kg",
        costPrice: 4.0,
        sellingPrice: 7.0,
        quantity: 15,
        minStock: 5,
        supplierId: suppliers[3]._id,
        status: "ACTIVE",
      },
    ]);
    console.log(`✅ ${products.length} products seeded`);

    // Seed Supplier Orders
    const orders = await SupplierOrder.insertMany([
      {
        supplier: suppliers[0]._id,
        products: [
          {
            product: products[4]._id,
            quantityOrdered: 20,
            costPrice: 3.0,
          },
        ],
        orderStatus: "DELIVERED",
        deliveredAt: new Date("2024-01-10"),
        totalOrderCost: 60,
        createdBy: users[0]._id,
        remarks: "Monthly rice order",
      },
      {
        supplier: suppliers[1]._id,
        products: [
          {
            product: products[0]._id,
            quantityOrdered: 50,
            costPrice: 0.5,
          },
          {
            product: products[1]._id,
            quantityOrdered: 30,
            costPrice: 1.2,
          },
        ],
        orderStatus: "DELIVERED",
        deliveredAt: new Date("2024-01-15"),
        totalOrderCost: 61,
        createdBy: users[1]._id,
        remarks: "Beverages restock",
      },
      {
        supplier: suppliers[2]._id,
        products: [
          {
            product: products[3]._id,
            quantityOrdered: 15,
            costPrice: 5.0,
          },
        ],
        orderStatus: "INCOMING",
        expectedDeliveryDate: new Date("2024-02-01"),
        totalOrderCost: 75,
        createdBy: users[1]._id,
        remarks: "Fresh chicken order",
      },
    ]);
    console.log(`✅ ${orders.length} supplier orders seeded`);

    // Seed Transactions
    const transactions = await Transaction.insertMany([
      {
        transactionType: "PURCHASE",
        referenceType: "SupplierOrder",
        referenceId: orders[0]._id,
        amount: 60,
        paymentMode: "BANK_TRANSFER",
        paymentStatus: "PAID",
        transactionDate: new Date("2024-01-10"),
        recordedBy: users[0]._id,
        notes: "Payment for rice order",
      },
      {
        transactionType: "PURCHASE",
        referenceType: "SupplierOrder",
        referenceId: orders[1]._id,
        amount: 61,
        paymentMode: "CASH",
        paymentStatus: "PAID",
        transactionDate: new Date("2024-01-15"),
        recordedBy: users[1]._id,
        notes: "Payment for beverages",
      },
      {
        transactionType: "SALE",
        referenceType: "Sale",
        referenceId: new mongoose.Types.ObjectId(),
        amount: 45.50,
        paymentMode: "UPI",
        paymentStatus: "PAID",
        transactionDate: new Date("2024-01-20"),
        recordedBy: users[2]._id,
        notes: "Table 5 order",
      },
      // {
      //   transactionType: "SALE",
      //   referenceType: "Sale",
      //   referenceId: new mongoose.Types.ObjectId(),
      //   amount: 32.75,
      //   paymentMode: "CARD",
      //   paymentStatus: "PAID",
      //   transactionDate: new Date("2024-01-21"),
      //   recordedBy: users[3]._id,
      //   notes: "Takeaway order",
      // },
    ]);
    console.log(`✅ ${transactions.length} transactions seeded`);

    // Seed Expenses
    await Expense.insertMany([
      {
        expenseType: "Rent",
        category: "FIXED",
        amount: 2000,
        paymentMode: "BANK_TRANSFER",
        expenseDate: new Date("2024-01-01"),
        paidTo: "Landlord Properties LLC",
        recordedBy: users[0]._id,
        notes: "January rent",
      },
      {
        expenseType: "Salary",
        category: "FIXED",
        amount: 3000,
        paymentMode: "BANK_TRANSFER",
        expenseDate: new Date("2024-01-05"),
        paidTo: "Staff Salaries",
        recordedBy: users[0]._id,
        notes: "January salaries",
      },
      {
        expenseType: "Electricity",
        category: "OPERATIONAL",
        amount: 350,
        paymentMode: "UPI",
        expenseDate: new Date("2024-01-15"),
        paidTo: "Power Grid Corp",
        referenceTransaction: transactions[0]._id,
        recordedBy: users[1]._id,
        notes: "Monthly electricity bill",
      },
      {
        expenseType: "Internet",
        category: "OPERATIONAL",
        amount: 50,
        paymentMode: "CARD",
        expenseDate: new Date("2024-01-15"),
        paidTo: "ISP Provider",
        recordedBy: users[1]._id,
        notes: "Internet service",
      },
      {
        expenseType: "Cleaning Supplies",
        category: "VARIABLE",
        amount: 75,
        paymentMode: "CASH",
        expenseDate: new Date("2024-01-20"),
        paidTo: "CleanCo Supplies",
        recordedBy: users[2]._id,
        notes: "Monthly cleaning supplies",
      },
    ]);
    console.log(`✅ 5 expenses seeded`);

    // Summary
    console.log("\n📊 Seeding Summary:");
    console.log(`- Users: ${users.length}`);
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Suppliers: ${suppliers.length}`);
    console.log(`- Products: ${products.length}`);
    console.log(`- Supplier Orders: ${orders.length}`);
    console.log(`- Transactions: ${transactions.length}`);
    console.log(`- Expenses: 5`);
    
    console.log("\n✅✅✅ Database seeding completed successfully! ✅✅✅\n");

    return {
      users,
      categories,
      suppliers,
      products,
      orders,
      transactions
    };

  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    throw error;
  }
};