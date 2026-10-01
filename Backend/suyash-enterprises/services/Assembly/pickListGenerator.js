'use strict';
const mongoose = require('mongoose');
const ComponentPickList = require('../../models/Assembly/ComponentPickList');

class PickListGenerator {
  static async generate(wo, bom, plannedQty, userId) {
    try {
      const pickListItems = [];
      
      for (const component of bom.components) {
        if (component.is_phantom) continue;
        
        const scrapMultiplier = 1 + ((component.scrap_percent || 0) / 100);
        const requiredQty = (component.quantity_per || 0) * plannedQty * scrapMultiplier;
        
        pickListItems.push({
          bom_line_id: component._id,
          component_item_id: component.component_item_id,
          component_part_no: component.component_part_no,
          component_description: component.component_desc || component.component_description || '',
          component_type: component.is_subcontract ? 'Bought-Out' : (component.component_type || 'Raw Material'),
          bom_qty_per: component.quantity_per || 0,
          required_qty: Math.ceil(requiredQty),
          picked_qty: 0,
          shortage_qty: Math.ceil(requiredQty),
          warehouse_id: null,
          bin_id: '',
          batch_no: '',
          serial_no: '',
          unit_cost: 0,
          total_cost: 0,
          is_substitute: false,
          substitute_reason: '',
          original_part_no: '',
          pick_status: 'Pending',
          remarks: component.remarks || ''
        });
      }
      
      const pickList = new ComponentPickList({
        wo_id: wo._id,
        wo_number: wo.wo_number,
        assembly_qty: plannedQty,
        items: pickListItems,
        status: 'Generated',
        created_by: userId
      });
      
      await pickList.save();
      return pickList;
    } catch (error) {
      console.error('PickListGenerator.generate error:', error);
      throw error;
    }
  }
}

module.exports = PickListGenerator;