const Inventory = require('../models/Inventory');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');

const adjustInventory = async (req, res, next) => {
  try {
    const { productId, warehouseId, quantity, reason, type } = req.body;

    // Validate product and warehouse exist
    const product = await Product.findById(productId);
    const warehouse = await Warehouse.findById(warehouseId);

    if (!product) return res.error('Product not found', 404);
    if (!warehouse) return res.error('Warehouse not found', 404);

    // Find or create inventory record
    let inventory = await Inventory.findOne({ product: productId, warehouse: warehouseId });
    const previousQuantity = inventory ? inventory.quantity : 0;

    if (inventory) {
      inventory.quantity += quantity;
      if (inventory.quantity < 0) {
        return res.error('Insufficient stock', 400);
      }
      inventory.lastMovement = new Date();
      await inventory.save();
    } else {
      if (quantity < 0) {
        return res.error('Cannot create inventory with negative quantity', 400);
      }
      inventory = await Inventory.create({
        product: productId,
        warehouse: warehouseId,
        quantity,
        lastMovement: new Date()
      });
    }

    // Create stock movement record
    await StockMovement.create({
      product: productId,
      warehouse: warehouseId,
      type: type || (quantity > 0 ? 'in' : 'out'),
      quantity,
      reason: reason || 'Manual adjustment',
      performedBy: req.userId,
      previousQuantity,
      newQuantity: inventory.quantity
    });

    res.success({
      inventory,
      movement: {
        type: type || (quantity > 0 ? 'in' : 'out'),
        quantity,
        previousQuantity,
        newQuantity: inventory.quantity
      }
    }, 'Inventory adjusted successfully');
  } catch (error) {
    next(error);
  }
};

const getLowStock = async (req, res, next) => {
  try {
    const { warehouseId } = req.query;
    const query = {};

    if (warehouseId) query.warehouse = warehouseId;

    const lowStock = await Inventory.find(query)
      .populate('product', 'sku name minStockLevel reorderPoint')
      .populate('warehouse', 'code name')
      .sort({ quantity: 1 });

    const alerts = lowStock.filter(inv => {
      return inv.quantity <= inv.product.minStockLevel || inv.quantity <= inv.product.reorderPoint;
    });

    res.success({ alerts });
  } catch (error) {
    next(error);
  }
};

const transferStock = async (req, res, next) => {
  try {
    const { productId, fromWarehouseId, toWarehouseId, quantity, reason } = req.body;

    // Validate
    const product = await Product.findById(productId);
    const fromWarehouse = await Warehouse.findById(fromWarehouseId);
    const toWarehouse = await Warehouse.findById(toWarehouseId);

    if (!product) return res.error('Product not found', 404);
    if (!fromWarehouse) return res.error('Source warehouse not found', 404);
    if (!toWarehouse) return res.error('Destination warehouse not found', 404);
    if (fromWarehouseId === toWarehouseId) {
      return res.error('Source and destination warehouses cannot be the same', 400);
    }

    // Check source inventory
    const sourceInventory = await Inventory.findOne({ 
      product: productId, 
      warehouse: fromWarehouseId 
    });

    if (!sourceInventory || sourceInventory.quantity < quantity) {
      return res.error('Insufficient stock in source warehouse', 400);
    }

    // Deduct from source
    sourceInventory.quantity -= quantity;
    sourceInventory.lastMovement = new Date();
    await sourceInventory.save();

    // Add to destination
    let destInventory = await Inventory.findOne({ 
      product: productId, 
      warehouse: toWarehouseId 
    });

    if (destInventory) {
      destInventory.quantity += quantity;
      destInventory.lastMovement = new Date();
      await destInventory.save();
    } else {
      destInventory = await Inventory.create({
        product: productId,
        warehouse: toWarehouseId,
        quantity,
        lastMovement: new Date()
      });
    }

    // Create movement records
    await StockMovement.create({
      product: productId,
      warehouse: fromWarehouseId,
      type: 'transfer',
      quantity: -quantity,
      reason: reason || `Transfer to ${toWarehouse.code}`,
      performedBy: req.userId,
      previousQuantity: sourceInventory.quantity + quantity,
      newQuantity: sourceInventory.quantity
    });

    await StockMovement.create({
      product: productId,
      warehouse: toWarehouseId,
      type: 'transfer',
      quantity,
      reason: reason || `Transfer from ${fromWarehouse.code}`,
      performedBy: req.userId,
      previousQuantity: destInventory.quantity - quantity,
      newQuantity: destInventory.quantity
    });

    res.success({
      sourceInventory,
      destinationInventory: destInventory
    }, 'Stock transferred successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adjustInventory,
  getLowStock,
  transferStock
};
