'use strict';
const mongoose = require('mongoose');
const SubAssemblyRegister = require('../../models/Assembly/SubAssemblyRegister');

class SubAssemblyChecker {
  static async checkDependencies(parentWoId) {
    const dependencies = await SubAssemblyRegister.find({ parent_wo_id: parentWoId });
    
    for (const dep of dependencies) {
      const stock = await mongoose.model('StockLedger').aggregate([
        { $match: { item_id: dep.child_item_id } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);
      
      dep.available_qty = stock[0]?.total || 0;
      dep.shortage_qty = Math.max(0, dep.required_qty - dep.available_qty);
      dep.dependency_met = dep.available_qty >= dep.required_qty;
      await dep.save();
    }
    
    return {
      all_dependencies_met: dependencies.every(d => d.dependency_met),
      dependencies: dependencies,
      shortages: dependencies.filter(d => !d.dependency_met),
      total_shortage_items: dependencies.filter(d => !d.dependency_met).length
    };
  }
}

module.exports = SubAssemblyChecker;