const express = require('express');
const router = express.Router();
const dailyAttendanceController = require('../../controllers/HR/dailyAttendanceController');

// सर्वांना ॲटेंडन्स बघता येईल आणि एक्सपोर्ट करता येईल
router.get('/', dailyAttendanceController.getAllAttendance);
router.get('/export', dailyAttendanceController.downloadExcel);

// फक्त Admin/HR लाच ॲटेंडन्स बदलता येईल (सध्या टेस्टिंगसाठी मिडलवेअर काढून ठेवलंय)
router.post('/add', dailyAttendanceController.addAttendance);
router.put('/update/:id', dailyAttendanceController.updateAttendance);
router.delete('/delete/:id', dailyAttendanceController.deleteAttendance);

module.exports = router;