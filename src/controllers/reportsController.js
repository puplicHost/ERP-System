const Order = require('../models/Order');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, warehouseId } = req.query;
    
    const matchQuery = { status: 'delivered' };
    
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    if (warehouseId) {
      matchQuery.assignedWarehouse = warehouseId;
    }

    const orders = await Order.find(matchQuery)
      .populate('customer', 'firstName lastName email')
      .populate('assignedWarehouse', 'code name')
      .sort({ createdAt: -1 });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Sales by product
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productName]) {
          productSales[item.productName] = {
            productName: item.productName,
            productSku: item.productSku,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productName].quantity += item.quantity;
        productSales[item.productName].revenue += item.totalPrice;
      });
    });

    res.success({
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        dateRange: { startDate, endDate }
      },
      orders,
      productSales: Object.values(productSales)
    });
  } catch (error) {
    next(error);
  }
};

const getStockReport = async (req, res, next) => {
  try {
    const { warehouseId, lowStockOnly } = req.query;

    const matchQuery = {};
    if (warehouseId) matchQuery.warehouse = warehouseId;

    const inventory = await Inventory.find(matchQuery)
      .populate('product', 'sku name minStockLevel reorderPoint')
      .populate('warehouse', 'code name')
      .sort({ quantity: 1 });

    const totalProducts = inventory.length;
    const totalQuantity = inventory.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalReserved = inventory.reduce((sum, inv) => sum + inv.reservedQuantity, 0);
    const totalAvailable = inventory.reduce((sum, inv) => sum + inv.availableQuantity, 0);

    let lowStockItems = [];
    if (lowStockOnly === 'true') {
      lowStockItems = inventory.filter(inv => {
        return inv.quantity <= inv.product.minStockLevel || inv.quantity <= inv.product.reorderPoint;
      });
    }

    // Stock by warehouse
    const warehouseStock = {};
    inventory.forEach(inv => {
      const whCode = inv.warehouse.code;
      if (!warehouseStock[whCode]) {
        warehouseStock[whCode] = {
          warehouseCode: whCode,
          warehouseName: inv.warehouse.name,
          totalQuantity: 0,
          totalAvailable: 0,
          productCount: 0
        };
      }
      warehouseStock[whCode].totalQuantity += inv.quantity;
      warehouseStock[whCode].totalAvailable += inv.availableQuantity;
      warehouseStock[whCode].productCount += 1;
    });

    res.success({
      summary: {
        totalProducts,
        totalQuantity,
        totalReserved,
        totalAvailable
      },
      inventory: lowStockOnly === 'true' ? lowStockItems : inventory,
      warehouseStock: Object.values(warehouseStock)
    });
  } catch (error) {
    next(error);
  }
};

const getProfitReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = { status: 'delivered' };
    
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(matchQuery).populate('items.product');

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    const productProfits = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const revenue = item.totalPrice;
        const cost = item.product.costPrice * item.quantity;
        const profit = revenue - cost;

        totalRevenue += revenue;
        totalCost += cost;
        totalProfit += profit;

        if (!productProfits[item.productName]) {
          productProfits[item.productName] = {
            productName: item.productName,
            productSku: item.productSku,
            quantity: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
            profitMargin: 0
          };
        }
        productProfits[item.productName].quantity += item.quantity;
        productProfits[item.productName].revenue += revenue;
        productProfits[item.productName].cost += cost;
        productProfits[item.productName].profit += profit;
      });
    });

    // Calculate profit margins
    Object.values(productProfits).forEach(prod => {
      prod.profitMargin = prod.revenue > 0 ? (prod.profit / prod.revenue) * 100 : 0;
    });

    const overallProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    res.success({
      summary: {
        totalRevenue,
        totalCost,
        totalProfit,
        overallProfitMargin,
        dateRange: { startDate, endDate }
      },
      productProfits: Object.values(productProfits)
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Order stats
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    // Revenue stats
    const monthRevenue = await Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const yearRevenue = await Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Product stats
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Inventory.aggregate([
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $match: { $expr: { $lte: ['$quantity', '$product.minStockLevel'] } } },
      { $count: 'count' }
    ]);

    // Payment stats
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const completedPayments = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.success({
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        delivered: deliveredOrders
      },
      revenue: {
        thisMonth: monthRevenue[0]?.total || 0,
        thisYear: yearRevenue[0]?.total || 0
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts[0]?.count || 0
      },
      payments: {
        pending: pendingPayments,
        thisMonthCollected: completedPayments[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalesReport,
  getStockReport,
  getProfitReport,
  getDashboardStats
};
