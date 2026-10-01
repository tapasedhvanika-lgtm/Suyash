'use strict';
const mongoose = require('mongoose');

class StockUpdater {
  static async createIssueTransactions(pickList, issuedTo) {
    const StockLedger = mongoose.model('StockLedger');
    const StockTransaction = mongoose.model('StockTransaction');
    const transactions = [];

    for (const item of pickList.items) {
      if (item.picked_qty <= 0) continue;

      const stockRecord = await StockLedger.findOne({
        item_id: item.component_item_id,
        warehouse_id: item.warehouse_id,
        batch_no: item.batch_no
      });

      if (stockRecord) {
        stockRecord.quantity -= item.picked_qty;
        stockRecord.reserved_qty = Math.max(0, (stockRecord.reserved_qty || 0) - item.picked_qty);
        stockRecord.total_value = stockRecord.quantity * stockRecord.unit_cost;
        await stockRecord.save();

        const transaction = new StockTransaction({
          txn_type: 'Material Issue',
          txn_date: new Date(),
          item_id: item.component_item_id,
          part_no: item.component_part_no,
          from_warehouse: item.warehouse_id,
          quantity: item.picked_qty,
          unit: 'Nos',
          unit_cost: item.unit_cost,
          total_value: item.picked_qty * item.unit_cost,
          batch_no: item.batch_no,
          ref_document_type: 'PickList',
          ref_document_id: pickList.picklist_id,
          ref_id: pickList._id,
          created_by: issuedTo
        });
        await transaction.save();
        transactions.push(transaction);
      }
    }
    
    return transactions;
  }
  
  static async createReceiptTransaction(wo, completedQty, unitCost) {
    const StockLedger = mongoose.model('StockLedger');
    const StockTransaction = mongoose.model('StockTransaction');
    
    const stockRecord = await StockLedger.findOneAndUpdate(
      { item_id: wo.item_id },
      { $inc: { quantity: completedQty }, $set: { last_updated: new Date(), unit_cost: unitCost } },
      { upsert: true, new: true }
    );
    
    const transaction = new StockTransaction({
      txn_type: 'Production Receipt',
      txn_date: new Date(),
      item_id: wo.item_id,
      part_no: wo.part_no,
      to_warehouse: null,
      quantity: completedQty,
      unit: 'Nos',
      unit_cost: unitCost,
      total_value: completedQty * unitCost,
      ref_document_type: 'WorkOrder',
      ref_document_id: wo.wo_number,
      ref_id: wo._id,
      created_by: wo.updated_by
    });
    await transaction.save();
    
    return { transaction_id: transaction._id };
  }
}

module.exports = StockUpdater;