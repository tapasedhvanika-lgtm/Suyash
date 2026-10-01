const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

// Load env vars
dotenv.config();

let cron;
try {
  cron = require('node-cron');
  console.log('✓ node-cron loaded successfully');
} catch (err) {
  console.warn('⚠️ node-cron not installed, scheduled jobs will be disabled');
  cron = { schedule: () => console.log('Cron jobs disabled') };
}

// Import calibration cron (AFTER cron is defined)
const { updateCalibrationStatus } = require('./jobs/calibrationCron');

const connectDB = require('./config/database');
const { setupSwagger } = require('./config/swagger');

// Connect to database
connectDB();

// Import route files
const shiftRoutes = require('./routes/HR/shiftRoutes');
const regularizationRoutes = require('./routes/HR/regularizationRoutes');
const holidayRoutes = require('./routes/HR/holidayRoutes');
const safetyRoutes = require('./routes/HR/safetyRoutes');
const productionRoutes = require('./routes/CRM/productionRoutes');
const authRoutes = require('./routes/user_settings/authRoutes');
const employeeRoutes = require('./routes/HR/employeeRoutes');
const roleRoutes = require('./routes/user_settings/roleRoutes');
const departmentRoutes = require('./routes/HR/departmentRoutes');
const designationRoutes = require('./routes/HR/designationRoutes');
const leaveTypeRoutes = require('./routes/HR/leaveTypeRoutes');
const leaveRoutes = require('./routes/HR/leaveRoutes');
const companyRoutes = require('./routes/user_settings/companyRoutes');
const costingRoutes = require('./routes/CRM/costingRoutes');
const customerRoutes = require('./routes/CRM/customerRoutes');
const dimensionWeightRoutes = require('./routes/CRM/dimensionWeightRoutes');
const itemRoutes = require('./routes/CRM/itemRoutes');
const processRoutes = require('./routes/CRM/processRoutes');
const quotationRoutes = require('./routes/CRM/quotationRoutes');
const rawMaterialRoutes = require('./routes/CRM/rawMaterialRoutes');
const taxRoutes = require('./routes/CRM/taxRoutes');
const termsConditionRoutes = require('./routes/CRM/termsConditionRoutes');
const materialRoutes = require('./routes/CRM/materialRoutes');
const salaryRoutes = require('./routes/HR/salaryRoutes');
const userRoutes = require('./routes/user_settings/userRoutes');
const requisitionRoutes = require('./routes/HR/requisitionRoutes');
const notificationRoutes = require('./routes/HR/notificationRoutes');
const jobRoutes = require('./routes/HR/jobRoutes');
const candidateRoutes = require('./routes/HR/candidateRoutes');
const interviewRoutes = require('./routes/HR/interviewRoutes');
const offerRoutes = require('./routes/HR/offerRoutes');
const documentRoutes = require('./routes/HR/documentRoutes');
const bgvRoutes = require('./routes/HR/bgvRoutes');
const mediclaimRoutes = require('./routes/HR/mediclaimRoutes');
const incrementRoutes = require('./routes/CRM/incrementRoutes');
const onboardingRoutes = require('./routes/HR/onboardingRoutes');
const pieceRateMasterRoutes = require('./routes/CRM/pieceRateMasterRoutes');
const terminationRoutes = require('./routes/HR/terminationRoutes');
const appointmentLetterRoutes = require('./routes/HR/appointmentLetterRoutes');
const employeeBehaviorRoutes = require('./routes/HR/employeeBehaviorRoutes');
const processDetailRoutes = require('./routes/CRM/processDetailRoutes');
const companyFinancialRoutes = require('./routes/user_settings/companyFinancialRoutes');
const vendorRoutes = require('./routes/CRM/vendorRoutes');
const employeeHistoryRoutes = require('./routes/HR/employeeHistoryRoutes');
const templateRoutes = require('./routes/CRM/templateRoutes');
const leadRoutes = require('./routes/CRM/leadRoutes');
const leadNotificationRoutes = require('./routes/CRM/leadnotificationroutes');
const purchaseRequisitionRoutes = require('./routes/Procurement/purchaseRequisitionRoutes');
const rfqRoutes = require('./routes/Procurement/rfqRoutes');
const purchaseOrderRoutes = require('./routes/Procurement/purchaseOrderRoutes');
const grnRoutes = require('./routes/Procurement/grnRoutes');
const purchaseInvoiceRoutes = require('./routes/Procurement/purchaseInvoiceRoutes');
const vendorPaymentRoutes = require('./routes/Procurement/vendorPaymentRoutes');

// Phase 04 BOM Routes
const routingRoutes = require('./routes/BOM/routingRoutes');
const machineRoutes = require('./routes/BOM/machineRoutes');
const processMasterRoutes = require('./routes/BOM/processMasterRoutes');
const bomRoutes = require('./routes/BOM/bomRoutes');
const bomCostRoutes = require('./routes/BOM/bomCostRoutes');
const bomRevisionRoutes = require('./routes/BOM/bomRevisionRoutes');

// Other Module Routes
const trainingRoutes = require("./routes/HR/trainingRoutes");
const salesOrderRoutes = require('./routes/CRM/salesOrderRoutes');
const invoiceRoutes = require('./routes/CRM/invoiceRoutes.js')
const warehouseRoutes = require('./routes/Inventory/WarehouseRoutesNew');
const materialIssueRoutes = require('./routes/Inventory/materialIssueRoutes');
const materialReturnRoutes = require('./routes/Inventory/materialReturnRoutes');
const physicalVerificationRoutes = require('./routes/Inventory/psvRoutes');
const stockRoutes = require('./routes/Inventory/stockRoutes');
const mrpRoutes = require('./routes/Production/mrpRoutes');
const workOrderRoutes = require('./routes/Production/workOrderRoutes');
const productionScheduleRoutes = require('./routes/Production/productionScheduleRoutes');
const oeeRoutes = require('./routes/Production/oeeRoutes');
const toolMasterRoutes = require('./routes/Masters/toolMasterRoutes');
const assemblyRoutes = require('./routes/Assembly/assemblyRoutes');
const assemblyLineMaster = require('./routes/Assembly/assemblyLineRoutes');
const dispatchRoutes = require('./routes/Dispatch/index');

const agencyRoutes = require('./routes/HR/agencyRoutes');


// Quality Routes
const ncrRoutes = require('./routes/Quality/ncrRoutes');
const capaRoutes = require('./routes/Quality/capaRoutes');
const certificateRoutes = require('./routes/Quality/certificateRoutes');
const defectCodeRoutes = require('./routes/Quality/defectCodeRoutes');
const gaugeRoutes = require('./routes/Quality/gauges');
const inspectionPlanRoutes = require('./routes/Quality/inspectionPlans');
const inspectionRecordRoutes = require('./routes/Quality/inspectionRecords');

// Import in-transit monitor
require('./cron/dispatch/inTransitMonitor');

const app = express();

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup Swagger
setupSwagger(app);

// =============================================================
// MOUNT ALL ROUTES
// =============================================================

app.use('/api/contract-agencies', agencyRoutes);

// Auth & User Management
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/company-financial', companyFinancialRoutes);

// HR Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/leavetypes', leaveTypeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/regularization', regularizationRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/safety/accidents', safetyRoutes);
app.use('/api/requisitions', requisitionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/bgv', bgvRoutes);
app.use('/api/mediclaim', mediclaimRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/terminations', terminationRoutes);
app.use('/api/appointment-letter', appointmentLetterRoutes);
app.use('/api/employee-behavior', employeeBehaviorRoutes);
app.use('/api/employee-history', employeeHistoryRoutes);
app.use("/api/trainings", trainingRoutes);

// CRM Routes
app.use('/api/costings', costingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dimension-weights', dimensionWeightRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/processes', processRoutes);
app.use('/api/process-details', processDetailRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/taxes', taxRoutes);
app.use('/api/terms-conditions', termsConditionRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/increment', incrementRoutes);
app.use('/api/piece-rate-master', pieceRateMasterRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/lead-notifications', leadNotificationRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api/invoices',invoiceRoutes);

// Procurement Routes
app.use('/api/purchase-requisitions', purchaseRequisitionRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/grns', grnRoutes);
app.use('/api/purchase-invoices', purchaseInvoiceRoutes);
app.use('/api/vendor-payments', vendorPaymentRoutes);

// =============================================================
// PHASE 04 - BOM & ROUTING ROUTES (CORRECT ORDER)
// =============================================================
// IMPORTANT: Put specific routes BEFORE generic :id routes
app.use('/api/boms', bomRoutes);                    // Base BOM routes
app.use('/api/boms', bomCostRoutes);                // BOM cost routes
app.use('/api/boms/:id/revisions', bomRevisionRoutes);            // BOM revision routes (handles /:id/revisions, /:id/compare, etc.)
app.use('/api/routings', routingRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/process-master', processMasterRoutes);

// Inventory Routes
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/miv', materialIssueRoutes);
app.use('/api/mrv', materialReturnRoutes);
app.use('/api/physical-verifications', physicalVerificationRoutes);
app.use('/api', stockRoutes);

// Production Routes
app.use('/api/mrp', mrpRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/production-schedule', productionScheduleRoutes);
app.use('/api', oeeRoutes);

// Masters
app.use('/api/tool-master', toolMasterRoutes);

// Assembly Routes
app.use('/api/assembly-lines', assemblyLineMaster);
app.use('/api/assembly', assemblyRoutes);

// Dispatch Routes
app.use('/api', dispatchRoutes);

// =============================================================
// QUALITY ROUTES
// =============================================================
app.use('/api/ncrs', ncrRoutes);
app.use('/api/capas', capaRoutes);
app.use('/api', certificateRoutes);
app.use('/api', defectCodeRoutes);
app.use('/api/gauges', gaugeRoutes);
app.use('/api/inspection-plans', inspectionPlanRoutes);
app.use('/api/inspection-records', inspectionRecordRoutes);

// =============================================================
// DEFAULT ROUTES
// =============================================================

// Default route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MECH·ERP Manufacturing System API',
    version: '2.0.0',
    documentation: {
      swagger: `${req.protocol}://${req.get('host')}/api-docs`,
    },
    modules: {
      auth: '/api/auth',
      crm: '/api/customers, /api/leads, /api/quotations, /api/sales-orders',
      procurement: '/api/purchase-requisitions, /api/rfqs, /api/purchase-orders, /api/grns',
      production: '/api/mrp, /api/work-orders, /api/production-schedule',
      inventory: '/api/warehouses, /api/miv, /api/stock-ledger',
      quality: '/api/inspection-plans, /api/ncrs, /api/gauges',
      bom: '/api/boms',
      hr: '/api/employees, /api/leaves, /api/trainings'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    server_ip: req.ip,
    client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  });
});

// =============================================================
// CRON JOBS
// =============================================================
if (cron && typeof cron.schedule === 'function') {
  try {
    // 1. Overdue Follow-up Notifications — daily at 8:00 AM IST
    cron.schedule('0 8 * * *', async () => {
      console.log('[CRON] Running overdue follow-up job:', new Date().toISOString());
      try {
        const { Lead } = require('./models/CRM/Lead');
        const Notification = require('./models/Notification');
        const overdueLeads = await Lead.find({
          is_active: true,
          next_follow_up_date: { $lt: new Date() },
          status: { $nin: ['Won', 'Lost', 'Junk'] },
        }).select('_id lead_id company_name assigned_to next_follow_up_date');
        
        if (!overdueLeads.length) {
          console.log('[CRON] No overdue leads found');
          return;
        }
        
        const notifications = overdueLeads.map(lead => ({
          type: 'OVERDUE_FOLLOWUP',
          title: 'Follow-up Overdue',
          message: `Follow-up overdue for ${lead.company_name} (${lead.lead_id})`,
          lead_id: lead._id,
          assigned_to: lead.assigned_to,
          is_read: false,
          due_date: lead.next_follow_up_date,
        }));
        await Notification.insertMany(notifications);
        console.log(`[CRON] ✓ Created ${notifications.length} overdue follow-up notifications`);
      } catch (err) {
        console.error('[CRON] Overdue follow-up job failed:', err.message);
      }
    }, { timezone: 'Asia/Kolkata' });

    // 2. Gauge Calibration Status Update - daily at 1:00 AM
    cron.schedule('0 1 * * *', async () => {
      console.log('[CRON] Running gauge calibration status update:', new Date().toISOString());
      try {
        await updateCalibrationStatus();
        console.log('[CRON] Gauge calibration status updated successfully');
      } catch (err) {
        console.error('[CRON] Gauge calibration update failed:', err.message);
      }
    }, { timezone: 'Asia/Kolkata' });

    // 3. Interview Reminders — every hour
    cron.schedule('0 * * * *', async () => {
      console.log('[CRON] Running interview reminders:', new Date().toISOString());
      try {
        const { sendInterviewReminders } = require('./services/notificationService');
        await sendInterviewReminders();
      } catch (err) {
        console.error('[CRON] Interview reminders failed:', err.message);
      }
    });

    // 4. Retry failed job postings — every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      console.log('[CRON] Running failed job postings retry:', new Date().toISOString());
      try {
        const { retryFailedJobPostings } = require('./services/jobBoardService');
        await retryFailedJobPostings();
      } catch (err) {
        console.error('[CRON] Job postings retry failed:', err.message);
      }
    });

    // 5. Policy renewal check — daily at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('[CRON] Running policy renewal check:', new Date().toISOString());
      try {
        const { autoRenewPolicies } = require('./services/policyRenewalService');
        const result = await autoRenewPolicies();
        console.log('[CRON] Policy renewal summary:', result);
      } catch (err) {
        console.error('[CRON] Policy renewal failed:', err.message);
      }
    });

    // 6. Policy renewal reminders — daily at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('[CRON] Sending policy renewal reminders:', new Date().toISOString());
      try {
        const { sendRenewalReminders } = require('./services/policyRenewalService');
        await sendRenewalReminders();
        console.log('[CRON] Renewal reminders sent successfully');
      } catch (err) {
        console.error('[CRON] Renewal reminders failed:', err.message);
      }
    });

    // 7. Termination status update — every minute
    cron.schedule('* * * * *', async () => {
      const now = new Date();
      // Only log every hour to avoid spam
      if (now.getMinutes() === 0) {
        console.log('[CRON] Running termination check:', now.toISOString());
      }
      try {
        const Termination = require('./models/HR/Termination');
        const Employee = require('./models/HR/Employee');
        
        const startOfDayUTC = new Date(Date.UTC(
          now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
          0, 0, 0, 0
        ));
        const endOfDayUTC = new Date(Date.UTC(
          now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
          23, 59, 59, 999
        ));
        
        const terminationsToProcess = await Termination.find({
          status: 'approved',
          lastWorkingDay: { $gte: startOfDayUTC, $lte: endOfDayUTC },
        }).populate('employeeId');
        
        for (const termination of terminationsToProcess) {
          const employee = termination.employeeId;
          if (employee) {
            const expectedStatus = termination.terminationType === 'termination' ? 'terminated' : 'resigned';
            if (employee.EmploymentStatus !== expectedStatus) {
              employee.EmploymentStatus = expectedStatus;
              await employee.save();
              termination.updatedAt = new Date();
              await termination.save();
              console.log(`[CRON] Updated employee ${employee.EmployeeID} to ${expectedStatus}`);
            }
          }
        }
      } catch (err) {
        console.error('[CRON] Termination check failed:', err.message);
      }
    });

    console.log('✅ Cron jobs scheduled successfully');

  } catch (err) {
    console.warn('⚠️ Could not schedule cron jobs:', err.message);
  }
} else {
  console.log('⚠️ Cron jobs disabled');
}

// =============================================================
// 404 Handler
// =============================================================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
  });
});

// =============================================================
// Global Error Handler
// =============================================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// =============================================================
// START SERVER
// =============================================================
const PORT = process.env.PORT || 5009;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  const address = server.address();
  const host = address.address === '::' ? 'localhost' : address.address;
  const port = address.port;

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    MECH·ERP MANUFACTURING SYSTEM              ║');
  console.log('║                         PHASE 04 COMPLETE                     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`\n🚀 Server running on http://${host}:${port}`);
  console.log(`📚 Swagger Docs: http://localhost:${port}/api-docs`);
  console.log(`❤️  Health Check: http://localhost:${port}/health`);
  console.log(`\n📦 MODULES:`);
  console.log(`   ├── BOM:        /api/boms`);
  console.log(`   ├── Routing:    /api/routings`);
  console.log(`   ├── Machines:   /api/machines`);
  console.log(`   ├── Process:    /api/process-master`);
  console.log(`   ├── MRP:        /api/mrp`);
  console.log(`   ├── Work Orders:/api/work-orders`);
  console.log(`   └── Quality:    /api/inspection-plans, /api/ncrs, /api/gauges`);
  console.log(`\n📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI ? 'Connected ✅' : 'Not configured ⚠️'}`);
  console.log('\n=================================\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  server.close(() => process.exit(1));
});

module.exports = server;