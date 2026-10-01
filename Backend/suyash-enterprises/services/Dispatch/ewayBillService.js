const axios = require('axios');

class EwayBillService {
  constructor() {
    this.gstBaseUrl = process.env.GST_EWB_API_URL || 'https://api.ewaybillgst.gov.in';
    this.gstUsername = process.env.GST_USERNAME;
    this.gstPassword = process.env.GST_PASSWORD;
    this.gstGstin = process.env.GST_GSTIN;
    this.authToken = null;
    this.tokenExpiry = null;
  }

  async authenticate() {
    if (this.authToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.authToken;
    }

    const authData = {
      username: this.gstUsername,
      password: this.gstPassword,
      gstin: this.gstGstin
    };

    try {
      const response = await axios.post(`${this.gstBaseUrl}/v1.04/auth`, authData, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      this.authToken = response.data.token;
      this.tokenExpiry = new Date(Date.now() + 5 * 60 * 1000);
      return this.authToken;
    } catch (error) {
      throw new Error(`GST Authentication failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async generateEwayBill(dcData) {
    const token = await this.authenticate();
    
    const payload = {
      supplyType: 'O',
      subSupplyType: 1,
      docType: 'CHL',
      docNo: dcData.dc_number,
      docDate: new Date(dcData.dc_date).toISOString().split('T')[0],
      fromGstin: dcData.company_gstin,
      fromTrdName: dcData.company_name,
      fromAddr1: dcData.company_address.line1,
      fromAddr2: dcData.company_address.line2 || '',
      fromPlace: dcData.company_address.city,
      fromPincode: dcData.company_address.pincode,
      fromStateCode: dcData.company_address.state_code,
      toGstin: dcData.customer_gstin || 'URP',
      toTrdName: dcData.customer_name,
      toAddr1: dcData.ship_to.line1,
      toAddr2: dcData.ship_to.line2 || '',
      toPlace: dcData.ship_to.city,
      toPincode: dcData.ship_to.pincode,
      toStateCode: dcData.ship_to.state_code,
      totalValue: dcData.total_value,
      itemList: dcData.items.map(item => ({
        productName: item.part_name,
        productDesc: item.part_name,
        hsnCode: item.hsn_code,
        quantity: item.dispatch_qty,
        unitPrice: item.unit_price,
        taxableAmount: item.taxable_value,
        cgstRate: dcData.gst_type === 'CGST/SGST' ? 9 : 0,
        sgstRate: dcData.gst_type === 'CGST/SGST' ? 9 : 0,
        igstRate: dcData.gst_type === 'IGST' ? 18 : 0,
        cessRate: 0
      })),
      transporterId: dcData.transport?.transporter_id_ewb || '',
      transporterName: dcData.transport?.transporter_name || '',
      vehicleNo: dcData.transport?.vehicle_no || '',
      distance: dcData.distance || 0
    };

    try {
      const response = await axios.post(`${this.gstBaseUrl}/v1.04/ewaybill`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'gstin': this.gstGstin
        }
      });

      return {
        success: true,
        ewbNo: response.data.ewbNo,
        ewbDate: response.data.ewbDate,
        validUpto: response.data.validUpto,
        qrCode: response.data.qrCode
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async updatePartB(ewbNumber, vehicleNo, transporterId, transporterName) {
    const token = await this.authenticate();
    
    const payload = {
      ewbNo: ewbNumber,
      vehicleNo: vehicleNo,
      transporterId: transporterId || '',
      transporterName: transporterName || ''
    };

    try {
      const response = await axios.post(`${this.gstBaseUrl}/v1.04/ewaybill/partb`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'gstin': this.gstGstin
        }
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }
}

module.exports = new EwayBillService();