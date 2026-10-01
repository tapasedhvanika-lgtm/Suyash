'use strict';

class AssemblyCostCalculator {
  static async calculateCosting(wo, pickList) {
    const actualRmCost = pickList?.items?.reduce((sum, item) => sum + (item.total_cost || 0), 0) || 0;
    const actualProcessCost = wo.labour_bookings?.reduce((sum, lb) => sum + (lb.total_labour_cost || 0), 0) || 0;
    const actualOverhead = actualProcessCost * 0.3;
    const actualTotalCost = actualRmCost + actualProcessCost + actualOverhead;
    const actualUnitCost = wo.completed_qty > 0 ? actualTotalCost / wo.completed_qty : 0;
    
    return {
      actual_rm_cost: actualRmCost,
      actual_process_cost: actualProcessCost,
      actual_overhead: actualOverhead,
      actual_total_cost: actualTotalCost,
      actual_unit_cost: actualUnitCost
    };
  }
}

module.exports = AssemblyCostCalculator;