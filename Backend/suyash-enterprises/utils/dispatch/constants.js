module.exports = {
  DC_STATUS: {
    PLANNED: 'Planned',
    PACKING_IN_PROGRESS: 'Packing In Progress',
    PACKED: 'Packed',
    DISPATCHED: 'Dispatched',
    IN_TRANSIT: 'In Transit',
    DELIVERED: 'Delivered',
    PARTIALLY_DELIVERED: 'Partially Delivered',
    REJECTED_BY_CUSTOMER: 'Rejected by Customer',
    RETURNED: 'Returned',
    CANCELLED: 'Cancelled'
  },

  DC_TYPE: {
    SUPPLY_OF_GOODS: 'Supply of Goods',
    DELIVERY_FOR_APPROVAL: 'Delivery for Approval',
    JOB_WORK_OUTWARD: 'Job Work Outward',
    SALES_RETURN: 'Sales Return',
    EXHIBITION: 'Exhibition',
    EXPORT: 'Export'
  },

  RETURN_REASON: {
    QUALITY_REJECTION: 'Quality Rejection',
    WRONG_PART: 'Wrong Part',
    SHORT_QUANTITY: 'Short Quantity',
    DAMAGE_IN_TRANSIT: 'Damage in Transit',
    OVER_DELIVERY: 'Over Delivery',
    CUSTOMER_ORDER_CHANGE: 'Customer Order Change',
    OTHER: 'Other'
  },

  EWAY_BILL_STATUS: {
    NOT_REQUIRED: 'Not Required',
    PENDING: 'Pending',
    GENERATED: 'Generated',
    EXTENDED: 'Extended',
    CANCELLED: 'Cancelled',
    VERIFIED: 'Verified'
  },

  EWAY_BILL_THRESHOLD: {
    VALUE: 50000,  // Rs 50,000
    DISTANCE: 50   // 50 km
  }
};