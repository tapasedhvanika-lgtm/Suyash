module.exports = {
  modules: [

    // ─────────────────────────────────────────────────────────────────────────
    // DASHBOARD
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'DASHBOARD',
      page: 'Dashboard',
      category: 'Dashboard',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'PRINT', 'APPROVE', 'REJECT']
    },

    // ─────────────────────────────────────────────────────────────────────────
    // USER / ROLE MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'USERS',
      page: 'Users',
      category: 'Administration',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'PRINT', 'APPROVE', 'REJECT']
    },
    {
      key: 'ROLES',
      page: 'Roles',
      category: 'Administration',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'PRINT', 'APPROVE', 'REJECT']
    },

    // ─────────────────────────────────────────────────────────────────────────
    // QUOTATION MASTER
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'COMPANY_MASTER',
      page: 'Organization / Company',
      category: 'Quotation Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'PRINT']
    },
    {
      key: 'CUSTOMER_MASTER',
      page: 'Customer Master',
      category: 'Quotation Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'PRINT']
    },
    {
      key: 'LEAD_MASTER',
      page: 'Lead Master',
      category: 'Quotation Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'PRINT', 'APPROVE', 'REJECT']
    },
    {
      key: 'SUPPLIER_MASTER',
      page: 'Supplier',
      category: 'Quotation Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'PRINT']
    },
    {
      key: 'TAX_MASTER',
      page: 'Tax Configuration / Tax Rule',
      category: 'Quotation Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE']
    },
    {
      key: 'TERMS_CONDITIONS_MASTER',
      page: 'Terms And Conditions',
      category: 'Quotation Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE']
    },
    {
      key: 'ITEM_MASTER',
      page: 'Product / Item Catalog',
      category: 'Quotation Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'PRINT']
    },
    {
      key: 'PROCESS_MASTER',
      page: 'Manufacturing Process',
      category: 'Quotation Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE']
    },
    {
      key: 'DIMENSION_MASTER',
      page: 'Product Specifications',
      category: 'Quotation Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE']
    },
    {
      key: 'MATERIAL_MASTER',
      page: 'Material Catalog',
      category: 'Quotation Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT']
    },
    {
      key: 'RAW_MATERIAL_MASTER',
      page: 'Raw Material',
      category: 'Quotation Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT']
    },
    {
      key: 'QUOTATION_MASTER',
      page: 'Quotation',
      category: 'Quotation Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE', 'REJECT']
    },
    {
      key: 'COSTING_MASTER',
      page: 'Costing Master',
      category: 'Quotation Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'OPERATION_MASTER',
      page: 'Operation Master',
      category: 'Quotation Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE']
    },
    {
      key: 'PROCESS_DETAILS_MASTER',
      page: 'Process Details Master',
      category: 'Quotation Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'COMPANY_FINANCIAL_MASTER',
      page: 'Company Financial Master',
      category: 'Quotation Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE']
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PROCUREMENT MASTER
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'GRN_MASTER',
      page: 'GRN Master',
      category: 'Procurement Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE', 'REJECT']
    },
    {
      key: 'PURCHASE_ORDER_MASTER',
      page: 'Purchase Order Master',
      category: 'Procurement Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE', 'REJECT']
    },
    {
      key: 'PURCHASE_REQUISITION_MASTER',
      page: 'Purchase Requisition Master',
      category: 'Procurement Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE', 'REJECT']
    },
    {
      key: 'RFQ_MASTER',
      page: 'RFQ Master',
      category: 'Procurement Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE', 'REJECT']
    },
    {
      key: 'PURCHASE_INVOICE_MASTER',
      page: 'Purchase Invoice Master',
      category: 'Procurement Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE', 'REJECT']
    },
    {
      key: 'VENDOR_PAYMENTS',
      page: 'Vendor Payments',
      category: 'Procurement Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE', 'REJECT']
    },

    // ─────────────────────────────────────────────────────────────────────────
    // HR MASTER
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'DEPARTMENT_MASTER',
      page: 'Department Master',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE']
    },
    {
      key: 'DESIGNATION_MASTER',
      page: 'Designation Master',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE']
    },
    {
      key: 'EMPLOYEE_MASTER',
      page: 'Employee Registry',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'PRINT']
    },
    {
      key: 'LEAVE_TYPE_MASTER',
      page: 'Leave Policies',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE']
    },
    {
      key: 'SHIFT_MASTER',
      page: 'Shift Master',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE']
    },
    {
      key: 'ACCIDENT_MASTER',
      page: 'Accident Reporting',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'REQUISITION_MASTER',
      page: 'Hiring Requests',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT']
    },
    {
      key: 'JOB_OPENING_MASTER',
      page: 'Career Opportunities',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'CANDIDATE_MASTER',
      page: 'Candidate Master',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'PRINT']
    },
    {
      key: 'INTERVIEW_MASTER',
      page: 'Interview Scheduling',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT']
    },
    {
      key: 'SELECTED_CANDIDATES_MASTER',
      page: 'Selected Candidate',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'SALARY_MASTER',
      page: 'Salary Master',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE']
    },
    {
      key: 'PIECE_RATE_MASTER',
      page: 'Piece Rate Master',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE']
    },
    {
      key: 'REGULARIZATION_MASTER',
      page: 'Attendance Regularization',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT']
    },
    {
      key: 'EMPLOYEE_LEAVE_MASTER',
      page: 'Employee Leave Records',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'ADMIN_LEAVE_MASTER',
      page: 'Leave Administration',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT']
    },
    {
      key: 'PRODUCTION_MASTER',
      page: 'Production Master',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'TERMINATION_MASTER',
      page: 'Termination Master',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT']
    },
    {
      key: 'EMPLOYEE_BEHAVIOR_MASTER',
      page: 'Behavior Monitoring',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'MEDICLAIM_MASTER',
      page: 'Mediclaim Master',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'TRAINING_RECORD_MASTER',
      page: 'Training Record Master',
      category: 'HR Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'LEAVE_APPROVAL',
      page: 'Leave Approval',
      category: 'HR Master',
      actions: ['VIEW', 'APPROVE', 'REJECT']
    },

    // ─────────────────────────────────────────────────────────────────────────
    // BOM MASTER
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'BOM_MASTER',
      page: 'BOM Master',
      category: 'BOM Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'BOM_MASTER',
      page: 'MRP Master',
      category: 'BOM Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'BOM_MASTER',
      page: 'Routing Master',
      category: 'BOM Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'BOM_MASTER',
      page: 'Machine Master',
      category: 'BOM Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'BOM_MASTER',
      page: 'OEE Master',
      category: 'BOM Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SALES ORDER MASTER
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'SALES_ORDER_MASTER',
      page: 'Sales Order Master',
      category: 'Sales Order Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE', 'REJECT']
    },
    {
      key: 'ORDER_BOOK',
      page: 'Order Book',
      category: 'Sales Order Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE', 'REJECT']
    },
    {
      key: 'SO_REVISION',
      page: 'SO Revision',
      category: 'Sales Order Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE', 'REJECT']
    },
    {
      key: 'SO_SUMMARY',
      page: 'SO Summary',
      category: 'Sales Order Master',
      actions: ['VIEW', 'EXPORT', 'PRINT']
    },
    {
      key: 'SO_PENDING_DELIVERY',
      page: 'SO Pending Delivery',
      category: 'Sales Order Master',
      actions: ['VIEW', 'EXPORT', 'PRINT', 'UPDATE']
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PRODUCTION MASTER
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'WORK_ORDERS',
      page: 'Work Orders Master',
      category: 'Production Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE', 'REJECT']
    },
    {
      key: 'ASSEMBLY_LINES',
      page: 'Assembly Lines',
      category: 'Production Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'PRODUCTION_SCHEDULE',
      page: 'Production Schedule',
      category: 'Production Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE']
    },
    {
      key: 'PRODUCTION_CONFLICT',
      page: 'Production Conflict',
      category: 'Production Master',
      actions: ['VIEW', 'EXPORT', 'PRINT', 'APPROVE', 'REJECT']
    },
    {
      key: 'TOOL_MASTER',
      page: 'Tool Master',
      category: 'Production Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },

    // ─────────────────────────────────────────────────────────────────────────
    // INVENTORY MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'INVENTORY_MANAGEMENT',
      page: 'Warehouse Master',
      category: 'Inventory Management',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'PRINT']
    },
    {
      key: 'INVENTORY_MANAGEMENT',
      page: 'Stock Ledger',
      category: 'Inventory Management',
      actions: ['VIEW', 'EXPORT', 'PRINT']
    },
    {
      key: 'INVENTORY_MANAGEMENT',
      page: 'MIV Master (Material Issue Voucher)',
      category: 'Inventory Management',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE']
    },
    {
      key: 'INVENTORY_MANAGEMENT',
      page: 'MRV Master (Material Receipt Voucher)',
      category: 'Inventory Management',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE']
    },
    {
      key: 'INVENTORY_MANAGEMENT',
      page: 'PSV Master (Physical Stock Verification)',
      category: 'Inventory Management',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE']
    },

    // ─────────────────────────────────────────────────────────────────────────
    // DISPATCH MASTER
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'DISPATCH_MASTER',
      page: 'Delivery Challan',
      category: 'Dispatch Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE']
    },
    {
      key: 'DELIVERY_SCHEDULE',
      page: 'Delivery Schedule',
      category: 'Dispatch Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE']
    },
    {
      key: 'CUSTOMER_RETURNS',
      page: 'Customer Returns',
      category: 'Dispatch Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE', 'REJECT']
    },

    // ─────────────────────────────────────────────────────────────────────────
    // INSPECTION MASTER
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'GAUGE_MASTER',
      page: 'Gauge Master',
      category: 'Inspection Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'INSPECTION_PLAN_MASTER',
      page: 'Inspection Plan',
      category: 'Inspection Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE']
    },
    {
      key: 'INSPECTION_RECORD_MASTER',
      page: 'Inspection Record',
      category: 'Inspection Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE']
    },
    {
      key: 'DEFECT_CODE_MASTER',
      page: 'Defect Code Master',
      category: 'Inspection Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT']
    },
    {
      key: 'NCR_MASTER',
      page: 'NCR (Non-Conformance Report)',
      category: 'Inspection Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE', 'REJECT']
    },
    {
      key: 'NCR_TREND_ANALYSIS',
      page: 'NCR Trend Analysis',
      category: 'Inspection Master',
      actions: ['VIEW', 'EXPORT', 'PRINT']
    },
    {
      key: 'CAPA_MASTER',
      page: 'CAPA (Corrective Action Preventive Action)',
      category: 'Inspection Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE']
    },
    {
      key: 'QUALITY_CERTIFICATE_MASTER',
      page: 'Quality Certificate',
      category: 'Inspection Master',
      actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PRINT', 'APPROVE']
    },

    // ─────────────────────────────────────────────────────────────────────────
    // REPORTS MASTER
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'INVOICE_REPORT',
      page: 'Invoice Report',
      category: 'Reports Master',
      actions: ['VIEW', 'EXPORT', 'PRINT']
    },
    {
      key: 'PAYMENT_RECEIPT',
      page: 'Payment Receipt',
      category: 'Reports Master',
      actions: ['VIEW', 'EXPORT', 'PRINT']
    },
    {
      key: 'CUSTOMER_ADVANCE',
      page: 'Customer Advance',
      category: 'Reports Master',
      actions: ['VIEW', 'EXPORT', 'PRINT']
    },
    {
      key: 'AR_AGING',
      page: 'AR Aging',
      category: 'Reports Master',
      actions: ['VIEW', 'EXPORT', 'PRINT']
    },
    {
      key: 'TDS_RECONCILIATION',
      page: 'TDS Reconciliation',
      category: 'Reports Master',
      actions: ['VIEW', 'EXPORT', 'PRINT']
    },
    {
      key: 'CREDIT_NOTE',
      page: 'Credit Note',
      category: 'Reports Master',
      actions: ['VIEW', 'EXPORT', 'PRINT']
    },
    {
      key: 'GSTR1_DATA',
      page: 'GSTR-1 Data',
      category: 'Reports Master',
      actions: ['VIEW', 'EXPORT', 'PRINT']
    },
    {
      key: 'GSTR3B_DATA',
      page: 'GSTR-3B Data',
      category: 'Reports Master',
      actions: ['VIEW', 'EXPORT', 'PRINT']
    },
    {
      key: 'MONTHLY_REVENUE_REPORT',
      page: 'Monthly Revenue Report',
      category: 'Reports Master',
      actions: ['VIEW', 'EXPORT', 'PRINT']
    },

    // ─────────────────────────────────────────────────────────────────────────
    // LEGACY REPORTS (keep for backward compatibility)
    // ─────────────────────────────────────────────────────────────────────────
    {
      key: 'REPORTS',
      page: 'Recruitment Report',
      category: 'Reports',
      actions: ['VIEW', 'EXPORT', 'PRINT']
    },
    {
      key: 'REPORTS',
      page: 'Employee Report',
      category: 'Reports',
      actions: ['VIEW', 'EXPORT', 'PRINT']
    },
    {
      key: 'REPORTS',
      page: 'Interview Report',
      category: 'Reports',
      actions: ['VIEW', 'EXPORT', 'PRINT']
    }
  ]
};
