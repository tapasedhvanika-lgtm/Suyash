// const mongoose = require('mongoose');

// const materialIssueSchema = new mongoose.Schema({
//   date: { type: Date, default: Date.now, required: true },
//   quantity: { type: Number, required: true },
//   // Ye PurchaseRawMaterial model se link hoga
//   rmMaterial: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRawMaterial', required: true },
//   issuedTo: { type: String, required: true }, // "To" in your notes
//   department: { type: String, required: true }, // "Dept" in your notes
//   refNumber: { type: String, unique: true } 
// }, { timestamps: true });

// module.exports = mongoose.model('MaterialIssue', materialIssueSchema);


const mongoose = require('mongoose');

const materialIssueSchema = new mongoose.Schema({
  // Aapke purane fields
  date: { 
    type: Date, 
    default: Date.now, 
    required: true 
  },
  // Ye PurchaseRawMaterial model se link hoga
  rmMaterial: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PurchaseRawMaterial', 
    required: false // Optional kar diya hai, kyunki ho sakta hai manual issue ho bina PRM ke
  },
  issuedTo: { 
    type: String, 
    required: true 
  }, 
  department: { 
    type: String, 
    required: true 
  }, 
  refNumber: { 
    type: String, 
    unique: true 
  },

  // ====== NAYE FIELDS (Frontend AddMIV.jsx ko support karne ke liye) ======
  
  // Work Order Link (Agar work order ke against issue ho raha hai)
  wo_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WorkOrder' 
  },
  
  // Jinhe issue kiya ja raha hai (Employees/Users)
  issued_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  received_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  authorised_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  remarks: { 
    type: String, 
    default: '' 
  },

  // Multiple Materials Issue karne ke liye Items ka Array
  items: [
    {
      item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      part_no: { type: String },
      item_description: { type: String },
      issued_qty: { type: Number, required: true },
      unit: { type: String, required: true },
      warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
      bin_id: { type: String },
      batch_no: { type: String },
      heat_no: { type: String },
      unit_cost: { type: Number, default: 0 }
    }
  ],

  // MIV ka status track karne ke liye
  status: { 
    type: String, 
    enum: ['Draft', 'Issued', 'Cancelled'], 
    default: 'Draft' 
  }
  
}, { timestamps: true });

module.exports = mongoose.model('MaterialIssue', materialIssueSchema);