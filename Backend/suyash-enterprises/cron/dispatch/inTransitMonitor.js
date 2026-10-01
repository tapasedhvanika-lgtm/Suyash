// cron/dispatch/inTransitMonitor.js
const cron = require('node-cron');
const DeliveryChallan = require('../../models/Dispatch/DeliveryChallan');  // Fixed path - added one more ../

// Run every hour to check overdue deliveries
const startInTransitMonitor = () => {
  // Check if cron is available
  if (!cron || typeof cron.schedule !== 'function') {
    console.log('[CRON] node-cron not available, in-transit monitoring disabled');
    return;
  }

  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running in-transit monitoring...');
    
    try {
      const overdueDCs = await DeliveryChallan.find({
        status: 'Dispatched',
        'pod.expected_delivery_date': { $lt: new Date() },
        'pod.pod_received': false
      }).populate('customer_id', 'customer_name email');

      for (const dc of overdueDCs) {
        console.log(`[ALERT] DC ${dc.dc_number} is overdue. Expected: ${dc.pod.expected_delivery_date}`);
        // Send email/notification logic here
      }

      // Check e-Way Bill expiring in next 4 hours
      const fourHoursFromNow = new Date(Date.now() + 4 * 60 * 60 * 1000);
      
      const expiringEWBs = await DeliveryChallan.find({
        status: 'Dispatched',
        'eway_bill.eway_bill_required': true,
        'eway_bill.eway_bill_validity_date': { $lte: fourHoursFromNow, $gt: new Date() },
        'eway_bill.eway_bill_status': 'Generated'
      });

      for (const dc of expiringEWBs) {
        console.log(`[ALERT] e-Way Bill for DC ${dc.dc_number} expires at ${dc.eway_bill.eway_bill_validity_date}`);
      }

    } catch (error) {
      console.error('[CRON] In-transit monitoring failed:', error);
    }
  });

  // Run every 15 minutes for urgent e-Way Bill expiry
  cron.schedule('*/15 * * * *', async () => {
    console.log('[CRON] Running e-Way Bill expiry check...');
    
    try {
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      
      const criticalEWBs = await DeliveryChallan.find({
        status: 'Dispatched',
        'eway_bill.eway_bill_required': true,
        'eway_bill.eway_bill_validity_date': { $lte: oneHourFromNow, $gt: new Date() },
        'eway_bill.eway_bill_status': 'Generated'
      });

      for (const dc of criticalEWBs) {
        console.log(`[CRITICAL] e-Way Bill for DC ${dc.dc_number} expires in < 1 hour at ${dc.eway_bill.eway_bill_validity_date}`);
      }
    } catch (error) {
      console.error('[CRON] e-Way Bill expiry check failed:', error);
    }
  });

  console.log('[CRON] In-transit monitoring scheduled — runs every hour');
};

module.exports = { startInTransitMonitor };