const axios = require('axios');

class DispatchIntegrationService {
  constructor() {
    this.salesServiceUrl = process.env.SALES_SERVICE_URL || 'http://localhost:3000';
    this.inventoryServiceUrl = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3001';
    this.qcServiceUrl = process.env.QC_SERVICE_URL || 'http://localhost:3002';
    this.invoiceServiceUrl = process.env.INVOICE_SERVICE_URL || 'http://localhost:3003';
  }

  async updateSalesOrderDelivery(soId, soItemId, deliveredQty, token) {
    try {
      const response = await axios.put(
        `${this.salesServiceUrl}/api/sales-orders/${soId}/delivery-update`,
        { so_item_id: soItemId, delivered_qty: deliveredQty },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update SO delivery: ${error.response?.data?.error || error.message}`);
    }
  }

  async createStockTransaction(txnData, token) {
    try {
      const response = await axios.post(
        `${this.inventoryServiceUrl}/api/stock-transactions`,
        txnData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create stock transaction: ${error.response?.data?.error || error.message}`);
    }
  }

  async createNCR(ncrData, token) {
    try {
      const response = await axios.post(
        `${this.qcServiceUrl}/api/ncrs`,
        ncrData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create NCR: ${error.response?.data?.error || error.message}`);
    }
  }

  async triggerInvoiceCreation(dcId, token) {
    try {
      const response = await axios.post(
        `${this.invoiceServiceUrl}/api/invoices/trigger`,
        { dc_id: dcId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Invoice trigger failed:', error.message);
      return { success: false, message: 'Invoice trigger failed, manual creation required' };
    }
  }

  async checkPPAPApproval(itemId, customerId, token) {
    try {
      const response = await axios.get(
        `${this.qcServiceUrl}/api/ppap/check`,
        { 
          params: { item_id: itemId, customer_id: customerId },
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return { approved: false };
    }
  }

  async checkFGStock(itemId, warehouseId, requiredQty, token) {
    try {
      const response = await axios.get(
        `${this.inventoryServiceUrl}/api/stock-ledger`,
        {
          params: { item_id: itemId, warehouse_id: warehouseId },
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const stock = response.data.data.find(s => s.item_id === itemId);
      return { available: stock?.available_qty || 0, sufficient: (stock?.available_qty || 0) >= requiredQty };
    } catch (error) {
      return { available: 0, sufficient: false };
    }
  }
}

module.exports = new DispatchIntegrationService();