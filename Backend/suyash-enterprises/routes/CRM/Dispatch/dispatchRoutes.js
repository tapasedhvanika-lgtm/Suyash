const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/pod/' });

const deliveryChallanController = require('../../controllers/Dispatch/deliveryChallanController');
const deliveryScheduleController = require('../../controllers/Dispatch/deliveryScheduleController');
const packingListController = require('../../controllers/Dispatch/packingListController');
const customerReturnController = require('../../controllers/Dispatch/customerReturnController');

const { authenticate } = require('../../middleware/auth');
const { validateDC } = require('../../middleware/Dispatch/validateDC');
const { ppapGate } = require('../../middleware/Dispatch/ppapGate');

// All routes require authentication
// router.use(authenticate);

// ==================== DELIVERY SCHEDULE ====================
router.post('/delivery-schedules', deliveryScheduleController.createDeliverySchedule);
router.get('/delivery-schedules', deliveryScheduleController.listDeliverySchedules);
router.put('/delivery-schedules/:id/confirm', deliveryScheduleController.confirmDeliverySchedule);

// ==================== DELIVERY CHALLAN ====================
router.post('/delivery-challans', validateDC, ppapGate, deliveryChallanController.createDeliveryChallan);
router.get('/delivery-challans', deliveryChallanController.listDeliveryChallans);
router.get('/delivery-challans/pending-dispatch', deliveryChallanController.getPendingDispatch);
router.get('/delivery-challans/:id', deliveryChallanController.getDeliveryChallan);
router.post('/delivery-challans/:id/generate-ewb', deliveryChallanController.generateEwayBill);
router.put('/delivery-challans/:id/dispatch', deliveryChallanController.dispatchChallan);
router.put('/delivery-challans/:id/pod', upload.single('pod_document'), deliveryChallanController.recordPOD);
router.put('/delivery-challans/:id/customer-rejection', deliveryChallanController.customerRejection);

// ==================== PACKING LIST ====================
router.post('/packing-lists', packingListController.createPackingList);
router.put('/packing-lists/:id', packingListController.updatePackingList);
router.get('/packing-lists/dc/:dcId', packingListController.getPackingListByDC);

// ==================== CUSTOMER RETURNS ====================
router.post('/customer-returns', customerReturnController.initiateReturn);
router.get('/customer-returns', customerReturnController.listReturns);
router.put('/customer-returns/:id/receive', customerReturnController.receiveReturn);
router.put('/customer-returns/:id/inspect', customerReturnController.inspectReturn);

module.exports = router;