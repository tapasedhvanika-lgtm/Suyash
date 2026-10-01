// controllers/Dispatch/deliveryScheduleController.js
const DeliverySchedule = require('../../models/Dispatch/DeliverySchedule');

exports.createDeliverySchedule = async (req, res) => {
  try {
    const schedule = new DeliverySchedule({
      ...req.body,
      created_by: req.user._id
    });
    await schedule.save();
    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listDeliverySchedules = async (req, res) => {
  try {
    const schedules = await DeliverySchedule.find()
      .populate({
        path: 'customer_id',
        select: 'customer_name'  // Only fetch the customer name field
      })
      .sort({ dispatch_date: 1 });

    // Transform the response to include customer_name at the root level
    const transformedSchedules = schedules.map(schedule => {
      const scheduleObj = schedule.toObject();
      // Extract customer_name from populated field and add it to root
      if (scheduleObj.customer_id && typeof scheduleObj.customer_id === 'object') {
        scheduleObj.customer_name = scheduleObj.customer_id.customer_name;
        // Keep the original customer_id as a string ID if needed
        scheduleObj.customer_id = scheduleObj.customer_id._id;
      } else {
        scheduleObj.customer_name = null;
      }
      return scheduleObj;
    });

    res.json({ success: true, data: transformedSchedules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.confirmDeliverySchedule = async (req, res) => {
  try {
    const schedule = await DeliverySchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    schedule.status = 'Confirmed';
    schedule.confirmed_by = req.user._id;
    await schedule.save();
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.bulkDeleteDeliverySchedules = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Delivery Schedule IDs'
      });
    }

    const results = [];
    let deletedCount = 0;
    let failedCount = 0;

    for (const id of ids) {
      try {
        const schedule = await DeliverySchedule.findById(id);

        if (!schedule) {
          results.push({
            id,
            success: false,
            message: 'Delivery Schedule not found'
          });
          failedCount++;
          continue;
        }

        await DeliverySchedule.findByIdAndDelete(id);

        results.push({
          id,
          success: true,
          message: 'Delivery Schedule deleted successfully'
        });

        deletedCount++;
      } catch (error) {
        results.push({
          id,
          success: false,
          message: error.message
        });
        failedCount++;
      }
    }

    return res.status(200).json({
      success: deletedCount > 0,
      message: `${deletedCount} Delivery Schedule(s) deleted successfully, ${failedCount} failed`,
      deletedCount,
      failedCount,
      results
    });

  } catch (error) {
    console.error('Bulk delete Delivery Schedule error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete Delivery Schedules'
    });
  }
};