// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   Stack,
//   Alert,
//   MenuItem,
//   Grid,
//   CircularProgress,
//   Stepper,
//   Step,
//   StepLabel,
//   Box,
//   Typography,
//   styled,
//   StepConnector,
//   Divider,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Chip,
//   IconButton,
//   Tooltip,
//   InputAdornment
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   ExpandMore as ExpandMoreIcon,
//   Info as InfoIcon,
//   Close as CloseIcon,
//   Edit as EditIcon,
//   Calculate as CalculateIcon
// } from '@mui/icons-material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import AddEmployees from '../employeemaster/AddEmployees';

// // Color constants matching other components
// const COLORS = {
//   primary: '#063C3F',
//   primaryLight: '#E8F0F1',
//   primaryDark: '#05292B',
//   text: {
//     primary: '#151C26',
//     secondary: '#4B5568',
//     tertiary: '#94A3B8',
//     light: '#FFFFFF',
//     lightMuted: 'rgba(255, 255, 255, 0.9)'
//   },
//   background: {
//     white: '#FFFFFF',
//     light: '#F8FFFC',
//     hover: '#F0FDF9',
//     tableHeader: '#063C3F'
//   },
//   border: '#E3E8EF',
//   status: {
//     success: '#9FE2BF',
//     warning: '#FEF3C7',
//     error: '#FEE2E2',
//     info: '#E0F2FE'
//   },
//   chips: {
//     active: '#9FE2BF',
//     inactive: '#F1F5F9',
//     suspended: '#FEF3C7',
//     locked: '#FEE2E2'
//   }
// };

// // Custom Stepper Styling
// const ColorConnector = styled(StepConnector)(({ theme }) => ({
//   "& .MuiStepConnector-line": {
//     height: 4,
//     border: 0,
//     backgroundColor: "#e0e0e0",
//     borderRadius: 10,
//   },
//   "&.Mui-active .MuiStepConnector-line": {
//     background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
//   },
//   "&.Mui-completed .MuiStepConnector-line": {
//     background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
//   },
// }));

// const steps = ["Employee & Period", "Earnings & Reimbursements", "Deductions & Payment"];

// // Number Format Helper
// const formatCurrency = (amount) => {
//   if (!amount) return '0';
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0
//   }).format(amount);
// };

// const AddSalary = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [employees, setEmployees] = useState([]);
//   const [employeeLoading, setEmployeeLoading] = useState(false);
//   const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);

//   const [formData, setFormData] = useState({
//     // Employee & Period
//     employee: "",
//     month: "",
//     year: "",
//     date: null,
//     employmentType: "Monthly",

//     // Earnings
//     basic: "",
//     hra: "",
//     conveyance: "",
//     medical: "",
//     special: "",
//     da: "",
//     arrears: "",
//     overtime: "",
//     performanceBonus: "",
//     attendanceBonus: "",
//     shiftAllowance: "",
//     productionIncentive: "",
//     otherAllowances: "",

//     // Reimbursements
//     travel: "",
//     food: "",
//     telephone: "",
//     fuel: "",
//     medicalReimbursement: "",
//     education: "",
//     lta: "",
//     uniform: "",
//     newspaper: "",
//     other: "",

//     // Deductions
//     pf: "",
//     esi: "",
//     professionalTax: "",
//     tds: "",
//     loanRecovery: "",
//     advanceRecovery: "",
//     labourWelfare: "",
//     otherDeductions: "",

//     // Calculation Rules
//     hraPercentage: 50,
//     pfPercentage: 12,
//     esiPercentage: 0.75,
//     overtimeMultiplier: 1.5,

//     // Working Days
//     workingDays: 26,
//     paidDays: 26,
//     leaveDays: 0,
//     lopDays: 0,

//     // Overtime & Bonus
//     overtimeHours: "",
//     overtimeRate: "",
//     incentives: "",
//     advanceDeductions: "",

//     // Payment
//     paymentMode: "BANK_TRANSFER",
//     remarks: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [expandedSections, setExpandedSections] = useState({
//     earnings: true,
//     reimbursements: false,
//     deductions: false,
//   });

//   const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);

//   useEffect(() => {
//     if (open) {
//       fetchEmployees();
//       resetForm();
//     }
//   }, [open]);

//   const fetchEmployees = async () => {
//     try {
//       setEmployeeLoading(true);
//       const token = localStorage.getItem("token");
//       const response = await axios.get(`${BASE_URL}/api/employees`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (response.data.success) {
//         setEmployees(response.data.data || []);
//       }
//     } catch (error) {
//       console.error("Error fetching employees:", error);
//     } finally {
//       setEmployeeLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       employee: "",
//       month: "",
//       year: "",
//       date: null,
//       employmentType: "Monthly",
//       basic: "",
//       hra: "",
//       conveyance: "",
//       medical: "",
//       special: "",
//       da: "",
//       arrears: "",
//       overtime: "",
//       performanceBonus: "",
//       attendanceBonus: "",
//       shiftAllowance: "",
//       productionIncentive: "",
//       otherAllowances: "",
//       travel: "",
//       food: "",
//       telephone: "",
//       fuel: "",
//       medicalReimbursement: "",
//       education: "",
//       lta: "",
//       uniform: "",
//       newspaper: "",
//       other: "",
//       pf: "",
//       esi: "",
//       professionalTax: "",
//       tds: "",
//       loanRecovery: "",
//       advanceRecovery: "",
//       labourWelfare: "",
//       otherDeductions: "",
//       hraPercentage: 50,
//       pfPercentage: 12,
//       esiPercentage: 0.75,
//       overtimeMultiplier: 1.5,
//       workingDays: 26,
//       paidDays: 26,
//       leaveDays: 0,
//       lopDays: 0,
//       overtimeHours: "",
//       overtimeRate: "",
//       incentives: "",
//       advanceDeductions: "",
//       paymentMode: "BANK_TRANSFER",
//       remarks: "",
//     });
//     setSelectedEmployeeDetails(null);
//     setError("");
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleNumberChange = (e) => {
//     const { name, value } = e.target;
//     if (value === "" || /^\d*\.?\d*$/.test(value)) {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleEmployeeChange = async (e) => {
//     const employeeId = e.target.value;
//     setFormData((prev) => ({ ...prev, employee: employeeId }));

//     if (!employeeId) return;

//     try {
//       setEmployeeLoading(true);
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         `${BASE_URL}/api/employees/${employeeId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         const emp = response.data.data;
//         setSelectedEmployeeDetails(emp);

//         const autoFillData = {
//           basic: emp.BasicSalary || "",
//           employmentType: emp.EmploymentType || "Monthly",
//           hra: emp.HRA || "",
//           conveyance: emp.ConveyanceAllowance || "",
//           medical: emp.MedicalAllowance || "",
//           special: emp.SpecialAllowance || "",
//           pf: emp.PFNumber ? "Auto-calculated based on salary" : "",
//           esi: emp.ESINumber ? "Auto-calculated based on salary" : "",
//           overtimeMultiplier: emp.OvertimeRateMultiplier || 1.5,
//           workingDays: emp.EmploymentType === "Monthly" ? 26 :
//             emp.EmploymentType === "Hourly" ? 30 : 26,
//           paidDays: emp.EmploymentType === "Monthly" ? 26 :
//             emp.EmploymentType === "Hourly" ? 30 : 26,
//         };

//         setFormData((prev) => ({
//           ...prev,
//           ...autoFillData
//         }));

//         setError("");
//       }
//     } catch (error) {
//       console.error("Error fetching employee details:", error);
//       setError("Failed to fetch employee details");
//     } finally {
//       setEmployeeLoading(false);
//     }
//   };

//   const handleNext = () => setActiveStep((prev) => prev + 1);
//   const handleBack = () => setActiveStep((prev) => prev - 1);

//   const handleSectionToggle = (section) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };

//   const calculateTotalEarnings = () => {
//     const earnings = [
//       formData.basic,
//       formData.hra,
//       formData.conveyance,
//       formData.medical,
//       formData.special,
//       formData.da,
//       formData.arrears,
//       formData.overtime,
//       formData.performanceBonus,
//       formData.attendanceBonus,
//       formData.shiftAllowance,
//       formData.productionIncentive,
//       formData.otherAllowances
//     ];
//     return earnings.reduce((sum, val) => sum + (Number(val) || 0), 0);
//   };

//   const calculateTotalDeductions = () => {
//     const deductions = [
//       formData.pf,
//       formData.esi,
//       formData.professionalTax,
//       formData.tds,
//       formData.loanRecovery,
//       formData.advanceRecovery,
//       formData.labourWelfare,
//       formData.otherDeductions
//     ];
//     return deductions.reduce((sum, val) => sum + (Number(val) || 0), 0);
//   };

//   const calculateNetPay = () => {
//     return calculateTotalEarnings() - calculateTotalDeductions();
//   };

//   const validateStep = () => {
//     switch (activeStep) {
//       case 0:
//         if (!formData.employee) {
//           setError("Please select an employee");
//           return false;
//         }
//         if (!formData.month || !formData.year) {
//           setError("Please select month and year");
//           return false;
//         }
//         if (!formData.basic) {
//           setError("Basic salary is required");
//           return false;
//         }
//         return true;

//       case 1:
//       case 2:
//         return true;

//       default:
//         return true;
//     }
//   };

//   const handleNextStep = () => {
//     if (validateStep()) {
//       setError("");
//       handleNext();
//     }
//   };

//   const handleSubmit = async () => {
//     if (!formData.employee) return setError("Employee is required");
//     if (!formData.month || !formData.year)
//       return setError("Month and Year are required");
//     if (!formData.basic) return setError("Basic salary is required");

//     setLoading(true);
//     setError("");

//     const payload = {
//       employee: formData.employee,
//       payrollPeriod: {
//         month: Number(formData.month),
//         year: Number(formData.year),
//       },
//       employmentType: formData.employmentType,
//       earnings: {
//         basic: Number(formData.basic) || 0,
//         hra: Number(formData.hra) || 0,
//         conveyance: Number(formData.conveyance) || 0,
//         medical: Number(formData.medical) || 0,
//         special: Number(formData.special) || 0,
//         da: Number(formData.da) || 0,
//         arrears: Number(formData.arrears) || 0,
//         overtime: Number(formData.overtime) || 0,
//         performanceBonus: Number(formData.performanceBonus) || 0,
//         attendanceBonus: Number(formData.attendanceBonus) || 0,
//         shiftAllowance: Number(formData.shiftAllowance) || 0,
//         productionIncentive: Number(formData.productionIncentive) || 0,
//         otherAllowances: Number(formData.otherAllowances) || 0,
//       },
//       reimbursements: {
//         travel: Number(formData.travel) || 0,
//         food: Number(formData.food) || 0,
//         telephone: Number(formData.telephone) || 0,
//         fuel: Number(formData.fuel) || 0,
//         medicalReimbursement: Number(formData.medicalReimbursement) || 0,
//         education: Number(formData.education) || 0,
//         lta: Number(formData.lta) || 0,
//         uniform: Number(formData.uniform) || 0,
//         newspaper: Number(formData.newspaper) || 0,
//         other: Number(formData.other) || 0,
//       },
//       deductions: {
//         pf: Number(formData.pf) || 0,
//         esi: Number(formData.esi) || 0,
//         professionalTax: Number(formData.professionalTax) || 0,
//         tds: Number(formData.tds) || 0,
//         loanRecovery: Number(formData.loanRecovery) || 0,
//         advanceRecovery: Number(formData.advanceRecovery) || 0,
//         labourWelfare: Number(formData.labourWelfare) || 0,
//         otherDeductions: Number(formData.otherDeductions) || 0,
//       },
//       calculationRules: {
//         hraPercentage: Number(formData.hraPercentage) || 50,
//         pfPercentage: Number(formData.pfPercentage) || 12,
//         esiPercentage: Number(formData.esiPercentage) || 0.75,
//         overtimeMultiplier: Number(formData.overtimeMultiplier) || 1.5,
//       },
//       workingDays: Number(formData.workingDays) || 26,
//       paidDays: Number(formData.paidDays) || 26,
//       leaveDays: Number(formData.leaveDays) || 0,
//       lopDays: Number(formData.lopDays) || 0,
//       overtimeHours: Number(formData.overtimeHours) || 0,
//       overtimeRate: Number(formData.overtimeRate) || 0,
//       incentives: Number(formData.incentives) || 0,
//       advanceDeductions: Number(formData.advanceDeductions) || 0,
//       paymentMode: formData.paymentMode,
//       remarks: formData.remarks,
//     };

//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.post(`${BASE_URL}/api/salaries`, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.data.success) {
//         onAdd(response.data.data);
//         onClose();
//         resetForm();
//         setActiveStep(0);
//       }
//     } catch (error) {
//       setError(error.response?.data?.message || "Failed to create salary.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const inputStyle = {
//     '& .MuiOutlinedInput-root': {
//       borderRadius: 1.5,
//       fontSize: '0.75rem',
//       '&:hover fieldset': {
//         borderColor: COLORS.primary,
//       },
//       '&.Mui-focused fieldset': {
//         borderColor: COLORS.primary,
//         borderWidth: 1
//       }
//     },
//     '& .MuiInputBase-input': {
//       py: 1,
//       px: 1.5,
//       fontSize: '0.75rem',
//       color: COLORS.text.primary,
//       '&::placeholder': {
//         color: COLORS.text.tertiary,
//         fontSize: '0.75rem'
//       }
//     }
//   };

//   const labelStyle = {
//     fontSize: '0.7rem',
//     fontWeight: 600,
//     color: COLORS.text.secondary,
//     letterSpacing: '0.5px',
//     mb: 0.5
//   };

//   // Handle employee added from modal
//   const handleEmployeeAdded = (newEmployee) => {
//     // Add the new employee to the employees list
//     setEmployees(prev => [...prev, newEmployee]);
//     // Automatically select the newly added employee
//     setFormData(prev => ({ ...prev, employee: newEmployee._id }));
//     setSelectedEmployeeDetails(newEmployee);

//     // Auto-fill employee details
//     const autoFillData = {
//       basic: newEmployee.BasicSalary || "",
//       employmentType: newEmployee.EmploymentType || "Monthly",
//       hra: newEmployee.HRA || "",
//       conveyance: newEmployee.ConveyanceAllowance || "",
//       medical: newEmployee.MedicalAllowance || "",
//       special: newEmployee.SpecialAllowance || "",
//       pf: newEmployee.PFNumber ? "Auto-calculated based on salary" : "",
//       esi: newEmployee.ESINumber ? "Auto-calculated based on salary" : "",
//       overtimeMultiplier: newEmployee.OvertimeRateMultiplier || 1.5,
//       workingDays: newEmployee.EmploymentType === "Monthly" ? 26 :
//         newEmployee.EmploymentType === "Hourly" ? 30 : 26,
//       paidDays: newEmployee.EmploymentType === "Monthly" ? 26 :
//         newEmployee.EmploymentType === "Hourly" ? 30 : 26,
//     };

//     setFormData(prev => ({
//       ...prev,
//       ...autoFillData
//     }));

//     // Clear any employee-related error
//     if (error && error.includes('Employee')) {
//       setError('');
//     }
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="md"
//       fullWidth
//       PaperProps={{
//         sx: {
//           borderRadius: 5,
//           boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
//           border: `1px solid ${COLORS.border}`,
//           overflow: 'hidden'
//         }
//       }}
//     >
//       <DialogTitle sx={{
//         borderBottom: `1px solid ${COLORS.border}`,
//         py: 1.5,
//         px: 2.5,
//         bgcolor: COLORS.background.white,
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center'
//       }}>
//         <Typography
//           sx={{
//             fontSize: '1.2rem',
//             fontWeight: 700,
//             color: COLORS.text.primary
//           }}
//         >
//           Add Salary
//         </Typography>
//         {selectedEmployeeDetails && (
//           <Chip
//             label={`${selectedEmployeeDetails.FirstName} ${selectedEmployeeDetails.LastName}`}
//             size="small"
//             sx={{
//               bgcolor: COLORS.primaryLight,
//               color: COLORS.primaryDark,
//               fontWeight: 500,
//               fontSize: '0.7rem',
//               height: 28
//             }}
//           />
//         )}
//       </DialogTitle>

//       <DialogContent sx={{ p: 2.5 }}>
//         {/* Stepper */}
//         <Stepper
//           activeStep={activeStep}
//           alternativeLabel
//           connector={<ColorConnector />}
//           sx={{ mb: 4, mt: 1 }}
//         >
//           {steps.map((label) => (
//             <Step key={label}>
//               <StepLabel>
//                 <Typography fontWeight={500} fontSize="0.75rem">
//                   {label}
//                 </Typography>
//               </StepLabel>
//             </Step>
//           ))}
//         </Stepper>

//         {/* Summary Bar */}
//         {selectedEmployeeDetails && activeStep > 0 && (
//           <Box
//             sx={{
//               mb: 3,
//               p: 2,
//               bgcolor: COLORS.primaryLight,
//               borderRadius: 2,
//               border: `1px solid ${COLORS.primary}`,
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center"
//             }}
//           >
//             <Box>
//               <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                 Employee Summary
//               </Typography>
//               <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.text.primary }}>
//                 {selectedEmployeeDetails.FirstName} {selectedEmployeeDetails.LastName} - {selectedEmployeeDetails.EmployeeID}
//               </Typography>
//               <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                 {selectedEmployeeDetails.DepartmentID?.DepartmentName} - {selectedEmployeeDetails.DesignationID?.DesignationName}
//               </Typography>
//             </Box>
//             <Box sx={{ textAlign: "right" }}>
//               <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
//                 Net Pay (Estimated)
//               </Typography>
//               <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.primary }}>
//                 {formatCurrency(calculateNetPay())}
//               </Typography>
//             </Box>
//           </Box>
//         )}

//         <Box sx={{ mt: 2 }}>
//           <Stack spacing={2.5}>
//             {/* STEP 1 - Employee & Period */}
//             {activeStep === 0 && (
//               <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
//                 {/* Employee Selection */}
//                 <Box sx={{ gridColumn: 'span 2' }}>
//   <Typography sx={labelStyle}>
//     EMPLOYEE <span style={{ color: '#EF4444' }}>*</span>
//   </Typography>
  
//   <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//     <Box sx={{ flex: 1 }}>
//       <TextField
//         select
//         name="employee"
//         value={formData.employee}
//         onChange={handleEmployeeChange}
//         fullWidth
//         size="small"
//         disabled={employeeLoading}
//         sx={inputStyle}
//       >
//         {employeeLoading ? (
//           <MenuItem disabled>
//             <CircularProgress size={16} /> Loading...
//           </MenuItem>
//         ) : (
//           employees.map((emp) => (
//             <MenuItem key={emp._id} value={emp._id} sx={{ fontSize: '0.75rem' }}>
//               <Box>
//                 <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
//                   {emp.FirstName} {emp.LastName}
//                 </Typography>
//                 <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                   {emp.EmployeeID} - {emp.DepartmentID?.DepartmentName}
//                 </Typography>
//               </Box>
//             </MenuItem>
//           ))
//         )}
//       </TextField>
//     </Box>
    
//     <Button
//       variant="outlined"
//       size="small"
//       onClick={() => setAddEmployeeOpen(true)}
//       disabled={employeeLoading}
//       startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
//       sx={{
//         height: 36,
//         minWidth: 'auto',
//         px: 1.5,
//         borderRadius: 1.5,
//         border: `1px solid ${COLORS.border}`,
//         color: COLORS.text.secondary,
//         fontSize: '0.7rem',
//         fontWeight: 500,
//         textTransform: 'none',
//         whiteSpace: 'nowrap',
//         '&:hover': {
//           borderColor: COLORS.primary,
//           bgcolor: `${COLORS.primary}10`,
//           color: COLORS.primary
//         }
//       }}
//     >
//       Add New
//     </Button>
//   </Box>
// </Box>

//                 {/* Month & Year Selection */}
//                 <Box sx={{ gridColumn: 'span 2' }}>
//                   <Typography sx={labelStyle}>
//                     MONTH & YEAR <span style={{ color: '#EF4444' }}>*</span>
//                   </Typography>
//                   <LocalizationProvider dateAdapter={AdapterDateFns}>
//                     <DatePicker
//                       views={["month", "year"]}
//                       value={formData.date}
//                       onChange={(newValue) => {
//                         if (newValue) {
//                           setFormData((prev) => ({
//                             ...prev,
//                             date: newValue,
//                             month: (newValue.getMonth() + 1).toString(),
//                             year: newValue.getFullYear().toString(),
//                           }));
//                         } else {
//                           setFormData((prev) => ({
//                             ...prev,
//                             date: null,
//                             month: "",
//                             year: "",
//                           }));
//                         }
//                       }}
//                       slotProps={{
//                         textField: {
//                           fullWidth: true,
//                           size: "small",
//                           sx: inputStyle
//                         }
//                       }}
//                     />
//                   </LocalizationProvider>
//                 </Box>

//                 {/* Employment Type */}
//                 <Box sx={{ gridColumn: 'span 2' }}>
//                   <Typography sx={labelStyle}>
//                     EMPLOYMENT TYPE
//                   </Typography>
//                   <TextField
//                     select
//                     name="employmentType"
//                     value={formData.employmentType}
//                     onChange={handleChange}
//                     fullWidth
//                     size="small"
//                     sx={inputStyle}
//                   >
//                     <MenuItem value="Monthly" sx={{ fontSize: '0.75rem' }}>Monthly</MenuItem>
//                     <MenuItem value="Hourly" sx={{ fontSize: '0.75rem' }}>Hourly</MenuItem>
//                     <MenuItem value="PieceRate" sx={{ fontSize: '0.75rem' }}>Piece Rate</MenuItem>
//                   </TextField>
//                 </Box>

//                 {/* Basic Salary */}
//                 <Box sx={{ gridColumn: 'span 1' }}>
//                   <Typography sx={labelStyle}>
//                     BASIC SALARY <span style={{ color: '#EF4444' }}>*</span>
//                   </Typography>
//                   <TextField
//                     name="basic"
//                     type="number"
//                     fullWidth
//                     size="small"
//                     value={formData.basic}
//                     onChange={handleNumberChange}
//                     sx={inputStyle}
//                     InputProps={{
//                       startAdornment: <InputAdornment position="start">₹</InputAdornment>,
//                     }}
//                   />
//                 </Box>

//                 {/* HRA */}
//                 <Box sx={{ gridColumn: 'span 1' }}>
//                   <Typography sx={labelStyle}>
//                     HRA
//                   </Typography>
//                   <TextField
//                     name="hra"
//                     type="number"
//                     fullWidth
//                     size="small"
//                     value={formData.hra}
//                     onChange={handleNumberChange}
//                     sx={inputStyle}
//                     InputProps={{
//                       startAdornment: <InputAdornment position="start">₹</InputAdornment>,
//                     }}
//                   />
//                 </Box>

//                 {/* Working Days Section */}
//                 <Box sx={{ gridColumn: 'span 2', mt: 1 }}>
//                   <Typography sx={{ ...labelStyle, color: COLORS.primary }}>
//                     WORKING DAYS DETAILS
//                   </Typography>
//                 </Box>

//                 <Box sx={{ gridColumn: 'span 1' }}>
//                   <Typography sx={labelStyle}>Working Days</Typography>
//                   <TextField
//                     name="workingDays"
//                     type="number"
//                     fullWidth
//                     size="small"
//                     value={formData.workingDays}
//                     onChange={handleNumberChange}
//                     sx={inputStyle}
//                   />
//                 </Box>
//                 <Box sx={{ gridColumn: 'span 1' }}>
//                   <Typography sx={labelStyle}>Paid Days</Typography>
//                   <TextField
//                     name="paidDays"
//                     type="number"
//                     fullWidth
//                     size="small"
//                     value={formData.paidDays}
//                     onChange={handleNumberChange}
//                     sx={inputStyle}
//                   />
//                 </Box>
//                 <Box sx={{ gridColumn: 'span 1' }}>
//                   <Typography sx={labelStyle}>Leave Days</Typography>
//                   <TextField
//                     name="leaveDays"
//                     type="number"
//                     fullWidth
//                     size="small"
//                     value={formData.leaveDays}
//                     onChange={handleNumberChange}
//                     sx={inputStyle}
//                   />
//                 </Box>
//                 <Box sx={{ gridColumn: 'span 1' }}>
//                   <Typography sx={labelStyle}>LOP Days</Typography>
//                   <TextField
//                     name="lopDays"
//                     type="number"
//                     fullWidth
//                     size="small"
//                     value={formData.lopDays}
//                     onChange={handleNumberChange}
//                     sx={inputStyle}
//                   />
//                 </Box>
//               </Box>
//             )}

//             {/* STEP 2 - Earnings & Reimbursements */}
//             {activeStep === 1 && (
//               <Box>
//                 {/* Earnings Section */}
//                 <Accordion
//                   expanded={expandedSections.earnings}
//                   onChange={() => handleSectionToggle('earnings')}
//                   sx={{
//                     mb: 2,
//                     borderRadius: 1.5,
//                     border: `1px solid ${COLORS.border}`,
//                     '&:before': { display: 'none' }
//                   }}
//                 >
//                   <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                     <Typography fontWeight={600} sx={{ fontSize: '0.8rem', color: COLORS.primary }}>
//                       Earnings Components
//                     </Typography>
//                   </AccordionSummary>
//                   <AccordionDetails>
//                     <Grid container spacing={2}>
//                       {[
//                         { label: "Basic Salary", name: "basic" },
//                         { label: "HRA", name: "hra" },
//                         { label: "Conveyance", name: "conveyance" },
//                         { label: "Medical Allowance", name: "medical" },
//                         { label: "Special Allowance", name: "special" },
//                         { label: "Dearness Allowance", name: "da" },
//                         { label: "Arrears", name: "arrears" },
//                         { label: "Overtime", name: "overtime" },
//                         { label: "Performance Bonus", name: "performanceBonus" },
//                         { label: "Attendance Bonus", name: "attendanceBonus" },
//                         { label: "Shift Allowance", name: "shiftAllowance" },
//                         { label: "Production Incentive", name: "productionIncentive" },
//                         { label: "Other Allowances", name: "otherAllowances" }
//                       ].map((field) => (
//                         <Grid item xs={12} sm={6} md={4} key={field.name}>
//                           <Typography sx={labelStyle}>{field.label}</Typography>
//                           <TextField
//                             name={field.name}
//                             type="number"
//                             fullWidth
//                             size="small"
//                             value={formData[field.name]}
//                             onChange={handleNumberChange}
//                             sx={inputStyle}
//                             InputProps={{
//                               startAdornment: <InputAdornment position="start">₹</InputAdornment>,
//                             }}
//                           />
//                         </Grid>
//                       ))}
//                     </Grid>

//                     <Box sx={{ mt: 2, p: 2, bgcolor: COLORS.primaryLight, borderRadius: 1.5 }}>
//                       <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>
//                         Total Earnings: {formatCurrency(calculateTotalEarnings())}
//                       </Typography>
//                     </Box>
//                   </AccordionDetails>
//                 </Accordion>

//                 {/* Reimbursements Section */}
//                 <Accordion
//                   expanded={expandedSections.reimbursements}
//                   onChange={() => handleSectionToggle('reimbursements')}
//                   sx={{
//                     borderRadius: 1.5,
//                     border: `1px solid ${COLORS.border}`,
//                     '&:before': { display: 'none' }
//                   }}
//                 >
//                   <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                     <Typography fontWeight={600} sx={{ fontSize: '0.8rem', color: COLORS.primary }}>
//                       Reimbursements
//                     </Typography>
//                   </AccordionSummary>
//                   <AccordionDetails>
//                     <Grid container spacing={2}>
//                       {[
//                         { label: "Travel", name: "travel" },
//                         { label: "Food", name: "food" },
//                         { label: "Telephone", name: "telephone" },
//                         { label: "Fuel", name: "fuel" },
//                         { label: "Medical", name: "medicalReimbursement" },
//                         { label: "Education", name: "education" },
//                         { label: "LTA", name: "lta" },
//                         { label: "Uniform", name: "uniform" },
//                         { label: "Newspaper", name: "newspaper" },
//                         { label: "Other", name: "other" }
//                       ].map((field) => (
//                         <Grid item xs={12} sm={6} md={4} key={field.name}>
//                           <Typography sx={labelStyle}>{field.label}</Typography>
//                           <TextField
//                             name={field.name}
//                             type="number"
//                             fullWidth
//                             size="small"
//                             value={formData[field.name]}
//                             onChange={handleNumberChange}
//                             sx={inputStyle}
//                             InputProps={{
//                               startAdornment: <InputAdornment position="start">₹</InputAdornment>,
//                             }}
//                           />
//                         </Grid>
//                       ))}
//                     </Grid>
//                   </AccordionDetails>
//                 </Accordion>
//               </Box>
//             )}

//             {/* STEP 3 - Deductions & Payment */}
//             {activeStep === 2 && (
//               <Box>
//                 {/* Deductions Section */}
//                 <Accordion
//                   expanded={expandedSections.deductions}
//                   onChange={() => handleSectionToggle('deductions')}
//                   sx={{
//                     mb: 2,
//                     borderRadius: 1.5,
//                     border: `1px solid ${COLORS.border}`,
//                     '&:before': { display: 'none' }
//                   }}
//                 >
//                   <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                     <Typography fontWeight={600} sx={{ fontSize: '0.8rem', color: COLORS.primary }}>
//                       Deductions
//                     </Typography>
//                   </AccordionSummary>
//                   <AccordionDetails>
//                     <Grid container spacing={2}>
//                       {[
//                         { label: "PF", name: "pf" },
//                         { label: "ESI", name: "esi" },
//                         { label: "Professional Tax", name: "professionalTax" },
//                         { label: "TDS", name: "tds" },
//                         { label: "Loan Recovery", name: "loanRecovery" },
//                         { label: "Advance Recovery", name: "advanceRecovery" },
//                         { label: "Labour Welfare", name: "labourWelfare" },
//                         { label: "Other Deductions", name: "otherDeductions" }
//                       ].map((field) => (
//                         <Grid item xs={12} sm={6} md={4} key={field.name}>
//                           <Typography sx={labelStyle}>{field.label}</Typography>
//                           <TextField
//                             name={field.name}
//                             type="number"
//                             fullWidth
//                             size="small"
//                             value={formData[field.name]}
//                             onChange={handleNumberChange}
//                             sx={inputStyle}
//                             InputProps={{
//                               startAdornment: <InputAdornment position="start">₹</InputAdornment>,
//                             }}
//                           />
//                         </Grid>
//                       ))}
//                     </Grid>

//                     <Box sx={{ mt: 2, p: 2, bgcolor: COLORS.primaryLight, borderRadius: 1.5 }}>
//                       <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>
//                         Total Deductions: {formatCurrency(calculateTotalDeductions())}
//                       </Typography>
//                     </Box>
//                   </AccordionDetails>
//                 </Accordion>

//                 {/* Calculation Rules */}
//                 <Typography sx={{ ...labelStyle, color: COLORS.primary, mt: 2, mb: 1 }}>
//                   CALCULATION RULES
//                 </Typography>
//                 <Grid container spacing={2} sx={{ mb: 2 }}>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Typography sx={labelStyle}>HRA Percentage</Typography>
//                     <TextField
//                       name="hraPercentage"
//                       type="number"
//                       fullWidth
//                       size="small"
//                       value={formData.hraPercentage}
//                       onChange={handleNumberChange}
//                       sx={inputStyle}
//                       InputProps={{
//                         endAdornment: <InputAdornment position="end">%</InputAdornment>,
//                       }}
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Typography sx={labelStyle}>PF Percentage</Typography>
//                     <TextField
//                       name="pfPercentage"
//                       type="number"
//                       fullWidth
//                       size="small"
//                       value={formData.pfPercentage}
//                       onChange={handleNumberChange}
//                       sx={inputStyle}
//                       InputProps={{
//                         endAdornment: <InputAdornment position="end">%</InputAdornment>,
//                       }}
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Typography sx={labelStyle}>ESI Percentage</Typography>
//                     <TextField
//                       name="esiPercentage"
//                       type="number"
//                       fullWidth
//                       size="small"
//                       value={formData.esiPercentage}
//                       onChange={handleNumberChange}
//                       sx={inputStyle}
//                       InputProps={{
//                         endAdornment: <InputAdornment position="end">%</InputAdornment>,
//                       }}
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Typography sx={labelStyle}>Overtime Multiplier</Typography>
//                     <TextField
//                       name="overtimeMultiplier"
//                       type="number"
//                       fullWidth
//                       size="small"
//                       value={formData.overtimeMultiplier}
//                       onChange={handleNumberChange}
//                       sx={inputStyle}
//                     />
//                   </Grid>
//                 </Grid>

//                 {/* Overtime Details */}
//                 <Typography sx={{ ...labelStyle, color: COLORS.primary, mt: 1, mb: 1 }}>
//                   OVERTIME & ADDITIONAL DETAILS
//                 </Typography>
//                 <Grid container spacing={2} sx={{ mb: 2 }}>
//                   <Grid item xs={12} sm={6} md={4}>
//                     <Typography sx={labelStyle}>Overtime Hours</Typography>
//                     <TextField
//                       name="overtimeHours"
//                       type="number"
//                       fullWidth
//                       size="small"
//                       value={formData.overtimeHours}
//                       onChange={handleNumberChange}
//                       sx={inputStyle}
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={4}>
//                     <Typography sx={labelStyle}>Overtime Rate</Typography>
//                     <TextField
//                       name="overtimeRate"
//                       type="number"
//                       fullWidth
//                       size="small"
//                       value={formData.overtimeRate}
//                       onChange={handleNumberChange}
//                       sx={inputStyle}
//                       InputProps={{
//                         startAdornment: <InputAdornment position="start">₹</InputAdornment>,
//                       }}
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={4}>
//                     <Typography sx={labelStyle}>Incentives</Typography>
//                     <TextField
//                       name="incentives"
//                       type="number"
//                       fullWidth
//                       size="small"
//                       value={formData.incentives}
//                       onChange={handleNumberChange}
//                       sx={inputStyle}
//                       InputProps={{
//                         startAdornment: <InputAdornment position="start">₹</InputAdornment>,
//                       }}
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={4}>
//                     <Typography sx={labelStyle}>Advance Deductions</Typography>
//                     <TextField
//                       name="advanceDeductions"
//                       type="number"
//                       fullWidth
//                       size="small"
//                       value={formData.advanceDeductions}
//                       onChange={handleNumberChange}
//                       sx={inputStyle}
//                       InputProps={{
//                         startAdornment: <InputAdornment position="start">₹</InputAdornment>,
//                       }}
//                     />
//                   </Grid>
//                 </Grid>

//                 {/* Payment Details */}
//                 <Typography sx={{ ...labelStyle, color: COLORS.primary, mt: 1, mb: 1 }}>
//                   PAYMENT DETAILS
//                 </Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} sm={6}>
//                     <Typography sx={labelStyle}>Payment Mode</Typography>
//                     <TextField
//                       select
//                       name="paymentMode"
//                       fullWidth
//                       size="small"
//                       value={formData.paymentMode}
//                       onChange={handleChange}
//                       sx={inputStyle}
//                     >
//                       <MenuItem value="BANK_TRANSFER" sx={{ fontSize: '0.75rem' }}>Bank Transfer</MenuItem>
//                       <MenuItem value="CASH" sx={{ fontSize: '0.75rem' }}>Cash</MenuItem>
//                       <MenuItem value="CHEQUE" sx={{ fontSize: '0.75rem' }}>Cheque</MenuItem>
//                       <MenuItem value="ONLINE" sx={{ fontSize: '0.75rem' }}>Online</MenuItem>
//                     </TextField>
//                   </Grid>
//                   <Grid item xs={12}>
//                     <Typography sx={labelStyle}>Remarks</Typography>
//                     <TextField
//                       name="remarks"
//                       fullWidth
//                       size="small"
//                       multiline
//                       rows={2}
//                       value={formData.remarks}
//                       onChange={handleChange}
//                       sx={inputStyle}
//                       placeholder="Additional notes or comments..."
//                     />
//                   </Grid>
//                 </Grid>

//                 {/* Net Pay Summary */}
//                 <Box sx={{ mt: 3, p: 2, bgcolor: COLORS.primaryLight, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
//                   <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                     Net Pay Summary
//                   </Typography>
//                   <Grid container spacing={2}>
//                     <Grid item xs={4}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Total Earnings</Typography>
//                       <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.text.primary }}>
//                         {formatCurrency(calculateTotalEarnings())}
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={4}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Total Deductions</Typography>
//                       <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.text.primary }}>
//                         {formatCurrency(calculateTotalDeductions())}
//                       </Typography>
//                     </Grid>
//                     <Grid item xs={4}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Net Pay</Typography>
//                       <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.primary }}>
//                         {formatCurrency(calculateNetPay())}
//                       </Typography>
//                     </Grid>
//                   </Grid>
//                 </Box>
//               </Box>
//             )}

//             {error && (
//               <Alert
//                 severity="error"
//                 sx={{
//                   borderRadius: 1.5,
//                   '& .MuiAlert-icon': {
//                     fontSize: '1.25rem',
//                     alignItems: 'center'
//                   },
//                   fontSize: '0.75rem',
//                   py: 0.5
//                 }}
//               >
//                 {error}
//               </Alert>
//             )}
//           </Stack>
//         </Box>
//       </DialogContent>

//       <DialogActions sx={{
//         px: 2.5,
//         py: 1.5,
//         borderTop: `1px solid ${COLORS.border}`,
//         bgcolor: COLORS.background.white,
//         display: 'flex',
//         justifyContent: 'space-between',
//         gap: 1
//       }}>
//         <Button
//           onClick={onClose}
//           disabled={loading}
//           sx={{
//             height: 32,
//             px: 2,
//             borderRadius: 1.5,
//             border: `1px solid ${COLORS.border}`,
//             color: COLORS.text.secondary,
//             fontSize: '0.7rem',
//             fontWeight: 500,
//             textTransform: 'none',
//             '&:hover': {
//               borderColor: COLORS.primary,
//               bgcolor: `${COLORS.primary}10`
//             }
//           }}
//         >
//           Cancel
//         </Button>
//         <Box sx={{ display: 'flex', gap: 1 }}>
//           {activeStep > 0 && (
//             <Button
//               onClick={handleBack}
//               disabled={loading}
//               sx={{
//                 height: 32,
//                 px: 2,
//                 borderRadius: 1.5,
//                 border: `1px solid ${COLORS.border}`,
//                 color: COLORS.text.secondary,
//                 fontSize: '0.7rem',
//                 fontWeight: 500,
//                 textTransform: 'none',
//                 '&:hover': {
//                   borderColor: COLORS.primary,
//                   bgcolor: `${COLORS.primary}10`
//                 }
//               }}
//             >
//               Back
//             </Button>
//           )}

//           {activeStep < steps.length - 1 ? (
//             <Button
//               variant="contained"
//               onClick={handleNextStep}
//               disabled={loading}
//               sx={{
//                 height: 32,
//                 px: 2,
//                 borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem',
//                 fontWeight: 500,
//                 textTransform: 'none',
//                 boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
//                 '&:hover': {
//                   bgcolor: COLORS.primaryDark,
//                 }
//               }}
//             >
//               Next
//             </Button>
//           ) : (
//             <Button
//               variant="contained"
//               onClick={handleSubmit}
//               disabled={loading}
//               startIcon={loading ? null : <AddIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32,
//                 px: 2,
//                 borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem',
//                 fontWeight: 500,
//                 textTransform: 'none',
//                 boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
//                 '&:hover': {
//                   bgcolor: COLORS.primaryDark,
//                 },
//                 '&:disabled': {
//                   bgcolor: COLORS.border,
//                   color: COLORS.text.tertiary
//                 }
//               }}
//             >
//               {loading ? <CircularProgress size={20} sx={{ color: COLORS.text.light }} /> : 'Add Salary'}
//             </Button>
//           )}
//         </Box>
//       </DialogActions>
//       {/* Add Employee Modal */}
//       <AddEmployees
//         open={addEmployeeOpen}
//         onClose={() => setAddEmployeeOpen(false)}
//         onAdd={handleEmployeeAdded}
//       />
//     </Dialog>
//   );
// };

// export default AddSalary;


import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  MenuItem,
  Grid,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  styled,
  StepConnector,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  FormControl,
  Select,
  Autocomplete,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Calculate as CalculateIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// Color constants matching other components
const COLORS = {
  primary: '#063C3F',
  primaryLight: '#E8F0F1',
  primaryDark: '#05292B',
  text: {
    primary: '#151C26',
    secondary: '#4B5568',
    tertiary: '#94A3B8',
    light: '#FFFFFF',
    lightMuted: 'rgba(255, 255, 255, 0.9)'
  },
  background: {
    white: '#FFFFFF',
    light: '#F8FFFC',
    hover: '#F0FDF9',
    tableHeader: '#063C3F'
  },
  border: '#E3E8EF',
  status: {
    success: '#9FE2BF',
    warning: '#FEF3C7',
    error: '#FEE2E2',
    info: '#E0F2FE'
  },
  chips: {
    active: '#9FE2BF',
    inactive: '#F1F5F9',
    suspended: '#FEF3C7',
    locked: '#FEE2E2'
  }
};

// Custom Stepper Styling
const ColorConnector = styled(StepConnector)(({ theme }) => ({
  "& .MuiStepConnector-line": {
    height: 4,
    border: 0,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
  },
  "&.Mui-active .MuiStepConnector-line": {
    background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
  },
  "&.Mui-completed .MuiStepConnector-line": {
    background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
  },
}));

const steps = ["Employee & Period", "Earnings & Reimbursements", "Deductions & Payment"];

// Number Format Helper
const formatCurrency = (amount) => {
  if (!amount) return '0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Custom styled Paper for dropdowns
const CustomPaper = styled(Paper)({
  maxHeight: 200,
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none'
  },
  scrollbarWidth: 'none',
  '-ms-overflow-style': 'none'
});

// Validation helper functions
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const cleanPhone = phone.replace(/[\s\-]/g, '').replace(/^\+91/, '');
  const phoneRegex = /^[6-9]\d{9}$/;
  return cleanPhone === '' || phoneRegex.test(cleanPhone);
};

const validatePAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return pan === '' || panRegex.test(pan);
};

const validateAadhar = (aadhar) => {
  const aadharRegex = /^\d{12}$/;
  return aadhar === '' || aadharRegex.test(aadhar);
};

const validateIFSC = (ifsc) => {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifsc === '' || ifscRegex.test(ifsc);
};

const validateAccountNumber = (accNo) => {
  const accountRegex = /^\d{9,18}$/;
  return accNo === '' || accountRegex.test(accNo);
};

const validatePIN = (pin) => {
  const pinRegex = /^\d{6}$/;
  return pin === '' || pinRegex.test(pin);
};

const validatePFNumber = (pf) => {
  const pfRegex = /^[A-Z]{2}\/\d{5}\/\d{7}$/;
  return pf === '' || pfRegex.test(pf);
};

const validateUAN = (uan) => {
  const uanRegex = /^\d{12}$/;
  return uan === '' || uanRegex.test(uan);
};

const validateESINumber = (esi) => {
  const esiRegex = /^\d{17}$/;
  return esi === '' || esiRegex.test(esi);
};

const validateName = (name) => {
  const nameRegex = /^[A-Za-z\s.'-]+$/;
  return name === '' || nameRegex.test(name);
};

const validateAddress = (address) => {
  const addressRegex = /^[A-Za-z0-9\s,.#\-/]+$/;
  return address === '' || addressRegex.test(address);
};

const validateBankName = (bankName) => {
  const bankNameRegex = /^[A-Za-z\s.'&-]+$/;
  return bankName === '' || bankNameRegex.test(bankName);
};

const validateBranchName = (branch) => {
  const branchRegex = /^[A-Za-z0-9\s.-]+$/;
  return branch === '' || branchRegex.test(branch);
};

const validateWorkStation = (station) => {
  const stationRegex = /^[A-Za-z0-9\s-]+$/;
  return station === '' || stationRegex.test(station);
};

const validateRelationship = (relationship) => {
  const relationshipRegex = /^[A-Za-z\s]+$/;
  return relationship === '' || relationshipRegex.test(relationship);
};

const AddSalary = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);

  const [formData, setFormData] = useState({
    // Employee & Period
    employee: "",
    month: "",
    year: "",
    date: null,
    employmentType: "Monthly",

    // Earnings
    basic: "",
    hra: "",
    conveyance: "",
    medical: "",
    special: "",
    da: "",
    arrears: "",
    overtime: "",
    performanceBonus: "",
    attendanceBonus: "",
    shiftAllowance: "",
    productionIncentive: "",
    otherAllowances: "",

    // Reimbursements
    travel: "",
    food: "",
    telephone: "",
    fuel: "",
    medicalReimbursement: "",
    education: "",
    lta: "",
    uniform: "",
    newspaper: "",
    other: "",

    // Deductions
    pf: "",
    esi: "",
    professionalTax: "",
    tds: "",
    loanRecovery: "",
    advanceRecovery: "",
    labourWelfare: "",
    otherDeductions: "",

    // Calculation Rules
    hraPercentage: 50,
    pfPercentage: 12,
    esiPercentage: 0.75,
    overtimeMultiplier: 1.5,

    // Working Days
    workingDays: 26,
    paidDays: 26,
    leaveDays: 0,
    lopDays: 0,

    // Overtime & Bonus
    overtimeHours: "",
    overtimeRate: "",
    incentives: "",
    advanceDeductions: "",

    // Payment
    paymentMode: "BANK_TRANSFER",
    remarks: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    earnings: true,
    reimbursements: false,
    deductions: false,
  });

  // Add Employee form states
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [activeEmployeeStep, setActiveEmployeeStep] = useState(0);
  const [newEmployeeData, setNewEmployeeData] = useState({
    // Personal Info
    FirstName: '',
    LastName: '',
    Gender: 'M',
    DateOfBirth: '',
    Email: '',
    Phone: '',
    Address: '',

    // Employment
    DepartmentID: '',
    DesignationID: '',
    DateOfJoining: '',
    EmploymentStatus: 'active',
    EmploymentType: 'Monthly',
    PayStructureType: 'Fixed',
    ContractCompany: '',

    // Pay & Work
    BasicSalary: '',
    HourlyRate: '',
    OvertimeRateMultiplier: '1.5',
    SkillLevel: '',
    WorkStation: '',
    LineNumber: '',
    PAN: '',
    AadharNumber: '',
    PFNumber: '',
    UAN: '',
    ESINumber: '',

    // Bank & Emergency
    BankAccountNumber: '',
    BankAccountHolderName: '',
    BankName: '',
    BankBranch: '',
    BankIfscCode: '',
    BankAccountType: 'Savings',
    EmergencyContactName: '',
    EmergencyContactRelationship: '',
    EmergencyContactPhone: '',
    EmergencyContactAddress: '',
    EmergencyContactPIN: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [addEmployeeLoading, setAddEmployeeLoading] = useState(false);
  const [addEmployeeError, setAddEmployeeError] = useState("");
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Employee form options
  const genderOptions = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'O', label: 'Other' }
  ];

  const employmentStatusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'resigned', label: 'Resigned' },
    { value: 'terminated', label: 'Terminated' },
    { value: 'retired', label: 'Retired' }
  ];

  const employmentTypeOptions = [
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Hourly', label: 'Hourly' },
    { value: 'PieceRate', label: 'Piece Rate' },
    { value: 'contract-based', label: 'Contract-Based' }
  ];

  const contractCompanyOptions = [
    { value: 'DISTIL', label: 'DISTIL' },
    { value: 'AARADHYA', label: 'AARADHYA' },
    { value: 'MAHI', label: 'MAHI' }
  ];

  const payStructureOptions = [
    { value: 'Fixed', label: 'Fixed' },
    { value: 'Variable', label: 'Variable' },
    { value: 'Commission', label: 'Commission' },
    { value: 'PieceRate', label: 'Piece Rate' }
  ];

  const skillLevelOptions = [
    { value: 'Unskilled', label: 'Unskilled' },
    { value: 'Semi-Skilled', label: 'Semi-Skilled' },
    { value: 'Skilled', label: 'Skilled' },
    { value: 'Highly Skilled', label: 'Highly Skilled' }
  ];

  const accountTypeOptions = [
    { value: 'Savings', label: 'Savings' },
    { value: 'Current', label: 'Current' },
    { value: 'Salary', label: 'Salary' }
  ];

  const employeeSteps = ['Personal Info', 'Employment', 'Pay & Work', 'Bank & Emergency'];

  useEffect(() => {
    if (open) {
      fetchEmployees();
      fetchDropdownData();
      resetForm();
    }
  }, [open]);

  const fetchEmployees = async () => {
    try {
      setEmployeeLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setEmployees(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setEmployeeLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('token');

      const deptResponse = await axios.get(`${BASE_URL}/api/departments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const desigResponse = await axios.get(`${BASE_URL}/api/designations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (deptResponse.data.success) {
        setDepartments(deptResponse.data.data || []);
      }

      if (desigResponse.data.success) {
        setDesignations(desigResponse.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employee: "",
      month: "",
      year: "",
      date: null,
      employmentType: "Monthly",
      basic: "",
      hra: "",
      conveyance: "",
      medical: "",
      special: "",
      da: "",
      arrears: "",
      overtime: "",
      performanceBonus: "",
      attendanceBonus: "",
      shiftAllowance: "",
      productionIncentive: "",
      otherAllowances: "",
      travel: "",
      food: "",
      telephone: "",
      fuel: "",
      medicalReimbursement: "",
      education: "",
      lta: "",
      uniform: "",
      newspaper: "",
      other: "",
      pf: "",
      esi: "",
      professionalTax: "",
      tds: "",
      loanRecovery: "",
      advanceRecovery: "",
      labourWelfare: "",
      otherDeductions: "",
      hraPercentage: 50,
      pfPercentage: 12,
      esiPercentage: 0.75,
      overtimeMultiplier: 1.5,
      workingDays: 26,
      paidDays: 26,
      leaveDays: 0,
      lopDays: 0,
      overtimeHours: "",
      overtimeRate: "",
      incentives: "",
      advanceDeductions: "",
      paymentMode: "BANK_TRANSFER",
      remarks: "",
    });
    setSelectedEmployeeDetails(null);
    setError("");
    setShowAddEmployeeForm(false);
    setActiveEmployeeStep(0);
    setNewEmployeeData({
      FirstName: '',
      LastName: '',
      Gender: 'M',
      DateOfBirth: '',
      Email: '',
      Phone: '',
      Address: '',
      DepartmentID: '',
      DesignationID: '',
      DateOfJoining: '',
      EmploymentStatus: 'active',
      EmploymentType: 'Monthly',
      PayStructureType: 'Fixed',
      ContractCompany: '',
      BasicSalary: '',
      HourlyRate: '',
      OvertimeRateMultiplier: '1.5',
      SkillLevel: '',
      WorkStation: '',
      LineNumber: '',
      PAN: '',
      AadharNumber: '',
      PFNumber: '',
      UAN: '',
      ESINumber: '',
      BankAccountNumber: '',
      BankAccountHolderName: '',
      BankName: '',
      BankBranch: '',
      BankIfscCode: '',
      BankAccountType: 'Savings',
      EmergencyContactName: '',
      EmergencyContactRelationship: '',
      EmergencyContactPhone: '',
      EmergencyContactAddress: '',
      EmergencyContactPIN: ''
    });
    setFieldErrors({});
    setTouched({});
    setAddEmployeeError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEmployeeChange = async (e) => {
    const employeeId = e.target.value;
    setFormData((prev) => ({ ...prev, employee: employeeId }));

    if (!employeeId) return;

    try {
      setEmployeeLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/employees/${employeeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const emp = response.data.data;
        setSelectedEmployeeDetails(emp);

        const autoFillData = {
          basic: emp.BasicSalary || "",
          employmentType: emp.EmploymentType || "Monthly",
          hra: emp.HRA || "",
          conveyance: emp.ConveyanceAllowance || "",
          medical: emp.MedicalAllowance || "",
          special: emp.SpecialAllowance || "",
          pf: emp.PFNumber ? "Auto-calculated based on salary" : "",
          esi: emp.ESINumber ? "Auto-calculated based on salary" : "",
          overtimeMultiplier: emp.OvertimeRateMultiplier || 1.5,
          workingDays: emp.EmploymentType === "Monthly" ? 26 :
            emp.EmploymentType === "Hourly" ? 30 : 26,
          paidDays: emp.EmploymentType === "Monthly" ? 26 :
            emp.EmploymentType === "Hourly" ? 30 : 26,
        };

        setFormData((prev) => ({
          ...prev,
          ...autoFillData
        }));

        setError("");
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      setError("Failed to fetch employee details");
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const calculateTotalEarnings = () => {
    const earnings = [
      formData.basic,
      formData.hra,
      formData.conveyance,
      formData.medical,
      formData.special,
      formData.da,
      formData.arrears,
      formData.overtime,
      formData.performanceBonus,
      formData.attendanceBonus,
      formData.shiftAllowance,
      formData.productionIncentive,
      formData.otherAllowances
    ];
    return earnings.reduce((sum, val) => sum + (Number(val) || 0), 0);
  };

  const calculateTotalDeductions = () => {
    const deductions = [
      formData.pf,
      formData.esi,
      formData.professionalTax,
      formData.tds,
      formData.loanRecovery,
      formData.advanceRecovery,
      formData.labourWelfare,
      formData.otherDeductions
    ];
    return deductions.reduce((sum, val) => sum + (Number(val) || 0), 0);
  };

  const calculateNetPay = () => {
    return calculateTotalEarnings() - calculateTotalDeductions();
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!formData.employee) {
          setError("Please select an employee");
          return false;
        }
        if (!formData.month || !formData.year) {
          setError("Please select month and year");
          return false;
        }
        if (!formData.basic) {
          setError("Basic salary is required");
          return false;
        }
        return true;

      case 1:
      case 2:
        return true;

      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setError("");
      handleNext();
    }
  };

  // Employee form validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'FirstName':
      case 'LastName':
      case 'BankAccountHolderName':
      case 'EmergencyContactName':
        if (value && !validateName(value)) {
          return 'Only letters, spaces, dots, and hyphens allowed';
        }
        break;

      case 'Email':
        if (value && !validateEmail(value)) {
          return 'Please enter a valid email address';
        }
        break;

      case 'Phone':
      case 'EmergencyContactPhone':
        if (value && !validatePhone(value)) {
          return 'Please enter a valid 10-digit mobile number starting with 6-9';
        }
        break;

      case 'Address':
      case 'EmergencyContactAddress':
        if (value && !validateAddress(value)) {
          return 'Address contains invalid characters';
        }
        break;

      case 'WorkStation':
      case 'LineNumber':
        if (value && !validateWorkStation(value)) {
          return 'Only letters, numbers, spaces, and hyphens allowed';
        }
        break;

      case 'PAN':
        if (value && !validatePAN(value)) {
          return 'PAN must be in format: ABCDE1234F';
        }
        break;

      case 'AadharNumber':
        if (value && !validateAadhar(value)) {
          return 'Aadhar number must be 12 digits';
        }
        break;

      case 'PFNumber':
        if (value && !validatePFNumber(value)) {
          return 'PF number must be in format: XX/12345/1234567';
        }
        break;

      case 'UAN':
        if (value && !validateUAN(value)) {
          return 'UAN must be 12 digits';
        }
        break;

      case 'ESINumber':
        if (value && !validateESINumber(value)) {
          return 'ESI number must be 17 digits';
        }
        break;

      case 'BankAccountNumber':
        if (value && !validateAccountNumber(value)) {
          return 'Account number must be 9-18 digits';
        }
        break;

      case 'BankName':
        if (value && !validateBankName(value)) {
          return 'Only letters, spaces, dots, and hyphens allowed';
        }
        break;

      case 'BankBranch':
        if (value && !validateBranchName(value)) {
          return 'Only letters, numbers, spaces, dots, and hyphens allowed';
        }
        break;

      case 'BankIfscCode':
        if (value && !validateIFSC(value)) {
          return 'IFSC code must be in format: ABCD0123456';
        }
        break;

      case 'EmergencyContactRelationship':
        if (value && !validateRelationship(value)) {
          return 'Only letters and spaces allowed';
        }
        break;

      case 'EmergencyContactPIN':
        if (value && !validatePIN(value)) {
          return 'PIN code must be 6 digits';
        }
        break;

      case 'ContractCompany':
        if (newEmployeeData.EmploymentType === 'contract-based' && !value) {
          return 'Contract company is required for contract-based employees';
        }
        break;

      default:
        return '';
    }
    return '';
  };

  const handleEmployeeFormChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Apply field-specific formatting
    switch (name) {
      case 'FirstName':
      case 'LastName':
      case 'BankAccountHolderName':
      case 'EmergencyContactName':
      case 'EmergencyContactRelationship':
        processedValue = value.replace(/[^A-Za-z\s.'-]/g, '');
        break;

      case 'BankName':
        processedValue = value.replace(/[^A-Za-z\s.'&-]/g, '');
        break;

      case 'Address':
      case 'EmergencyContactAddress':
        processedValue = value.replace(/[^A-Za-z0-9\s,.#\-/]/g, '');
        break;

      case 'WorkStation':
      case 'LineNumber':
        processedValue = value.replace(/[^A-Za-z0-9\s-]/g, '');
        break;

      case 'BankBranch':
        processedValue = value.replace(/[^A-Za-z0-9\s.-]/g, '');
        break;

      case 'Phone':
      case 'EmergencyContactPhone':
      case 'BankAccountNumber':
      case 'AadharNumber':
      case 'UAN':
      case 'ESINumber':
      case 'EmergencyContactPIN':
        processedValue = value.replace(/\D/g, '');
        break;

      case 'PAN':
      case 'BankIfscCode':
        processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        break;

      case 'PFNumber':
        processedValue = value.toUpperCase().replace(/[^A-Z0-9/]/g, '');
        break;

      default:
        processedValue = value;
    }

    setNewEmployeeData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    if (touched[name] || value) {
      const errorMessage = validateField(name, processedValue);
      setFieldErrors(prev => ({
        ...prev,
        [name]: errorMessage
      }));
    }
  };

  const handleEmployeeBlur = (e) => {
    const { name, value } = e.target;

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const errorMessage = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
  };

  const handleEmploymentTypeChange = (e) => {
    const employmentType = e.target.value;
    let defaultPayStructure = 'Fixed';

    if (employmentType === 'PieceRate') {
      defaultPayStructure = 'PieceRate';
    }

    setNewEmployeeData(prev => ({
      ...prev,
      EmploymentType: employmentType,
      PayStructureType: defaultPayStructure
    }));
  };

  const validateEmployeeStep = (step) => {
    const errors = {};
    let isValid = true;

    switch (step) {
      case 0:
        if (!newEmployeeData.FirstName?.trim()) {
          errors.FirstName = 'First name is required';
          isValid = false;
        } else {
          const nameError = validateField('FirstName', newEmployeeData.FirstName);
          if (nameError) {
            errors.FirstName = nameError;
            isValid = false;
          }
        }

        if (!newEmployeeData.LastName?.trim()) {
          errors.LastName = 'Last name is required';
          isValid = false;
        } else {
          const nameError = validateField('LastName', newEmployeeData.LastName);
          if (nameError) {
            errors.LastName = nameError;
            isValid = false;
          }
        }

        if (!newEmployeeData.Email?.trim()) {
          errors.Email = 'Email is required';
          isValid = false;
        } else {
          const emailError = validateField('Email', newEmployeeData.Email);
          if (emailError) {
            errors.Email = emailError;
            isValid = false;
          }
        }

        if (newEmployeeData.Phone) {
          const phoneError = validateField('Phone', newEmployeeData.Phone);
          if (phoneError) {
            errors.Phone = phoneError;
            isValid = false;
          }
        }

        if (newEmployeeData.Address) {
          const addressError = validateField('Address', newEmployeeData.Address);
          if (addressError) {
            errors.Address = addressError;
            isValid = false;
          }
        }
        break;

      case 1:
        if (!newEmployeeData.DepartmentID) {
          errors.DepartmentID = 'Department is required';
          isValid = false;
        }
        if (!newEmployeeData.DesignationID) {
          errors.DesignationID = 'Designation is required';
          isValid = false;
        }
        if (!newEmployeeData.DateOfJoining) {
          errors.DateOfJoining = 'Date of joining is required';
          isValid = false;
        }
        if (newEmployeeData.EmploymentType === 'contract-based' && !newEmployeeData.ContractCompany) {
          errors.ContractCompany = 'Contract company is required';
          isValid = false;
        }
        break;

      case 2:
        if ((newEmployeeData.EmploymentType === 'Monthly' || newEmployeeData.EmploymentType === 'contract-based') && !newEmployeeData.BasicSalary) {
          errors.BasicSalary = 'Basic salary is required';
          isValid = false;
        }
        if (newEmployeeData.EmploymentType === 'Hourly' && !newEmployeeData.HourlyRate) {
          errors.HourlyRate = 'Hourly rate is required for hourly employees';
          isValid = false;
        }

        const taxFields = ['PAN', 'AadharNumber', 'PFNumber', 'UAN', 'ESINumber', 'WorkStation', 'LineNumber'];
        taxFields.forEach(field => {
          if (newEmployeeData[field]) {
            const error = validateField(field, newEmployeeData[field]);
            if (error) {
              errors[field] = error;
              isValid = false;
            }
          }
        });
        break;

      case 3:
        const bankFields = ['BankAccountNumber', 'BankAccountHolderName', 'BankName', 'BankBranch', 'BankIfscCode'];
        const hasAnyBankDetail = bankFields.some(field => newEmployeeData[field]);

        if (hasAnyBankDetail) {
          bankFields.forEach(field => {
            if (!newEmployeeData[field]) {
              errors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required when providing bank details`;
              isValid = false;
            } else {
              const error = validateField(field, newEmployeeData[field]);
              if (error) {
                errors[field] = error;
                isValid = false;
              }
            }
          });
        }

        const emergencyFields = ['EmergencyContactName', 'EmergencyContactRelationship', 'EmergencyContactPhone', 'EmergencyContactAddress', 'EmergencyContactPIN'];
        const hasAnyEmergencyDetail = emergencyFields.some(field => newEmployeeData[field]);

        if (hasAnyEmergencyDetail) {
          emergencyFields.forEach(field => {
            if (!newEmployeeData[field]) {
              errors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required when providing emergency contact`;
              isValid = false;
            } else {
              const error = validateField(field, newEmployeeData[field]);
              if (error) {
                errors[field] = error;
                isValid = false;
              }
            }
          });
        }
        break;
    }

    setFieldErrors(errors);
    if (!isValid) {
      setAddEmployeeError('Please fix the errors in this section');
    }
    return isValid;
  };

  const handleEmployeeNext = () => {
    if (validateEmployeeStep(activeEmployeeStep)) {
      setAddEmployeeError('');
      setActiveEmployeeStep(prev => prev + 1);
    }
  };

  const handleEmployeeBack = () => {
    setAddEmployeeError('');
    setActiveEmployeeStep(prev => prev - 1);
  };

  // Handle Add Employee submission
  const handleAddEmployeeSubmit = async () => {
    // Validate all steps
    let allValid = true;
    for (let i = 0; i < 4; i++) {
      if (!validateEmployeeStep(i)) {
        allValid = false;
        setActiveEmployeeStep(i);
        break;
      }
    }

    if (!allValid) {
      setAddEmployeeError('Please fix all validation errors');
      return;
    }

    setAddEmployeeLoading(true);
    setAddEmployeeError('');

    try {
      const token = localStorage.getItem('token');

      const payload = {
        FirstName: newEmployeeData.FirstName,
        LastName: newEmployeeData.LastName,
        Gender: newEmployeeData.Gender,
        DateOfBirth: newEmployeeData.DateOfBirth || undefined,
        Email: newEmployeeData.Email,
        Phone: newEmployeeData.Phone || undefined,
        Address: newEmployeeData.Address || undefined,
        DepartmentID: newEmployeeData.DepartmentID,
        DesignationID: newEmployeeData.DesignationID,
        DateOfJoining: newEmployeeData.DateOfJoining,
        EmploymentStatus: newEmployeeData.EmploymentStatus,
        EmploymentType: newEmployeeData.EmploymentType,
        PayStructureType: newEmployeeData.PayStructureType,
        ContractCompany: newEmployeeData.ContractCompany || undefined,
        BasicSalary: (newEmployeeData.EmploymentType === 'Monthly' || newEmployeeData.EmploymentType === 'contract-based') ? Number(newEmployeeData.BasicSalary || 0) : 0,
        HourlyRate: newEmployeeData.EmploymentType === 'Hourly' ? Number(newEmployeeData.HourlyRate || 0) : 0,
        OvertimeRateMultiplier: Number(newEmployeeData.OvertimeRateMultiplier || 1.5),
        SkillLevel: newEmployeeData.SkillLevel || undefined,
        WorkStation: newEmployeeData.WorkStation || undefined,
        LineNumber: newEmployeeData.LineNumber || undefined,
        PAN: newEmployeeData.PAN || undefined,
        AadharNumber: newEmployeeData.AadharNumber || undefined,
        PFNumber: newEmployeeData.PFNumber || undefined,
        UAN: newEmployeeData.UAN || undefined,
        ESINumber: newEmployeeData.ESINumber || undefined
      };

      // Add BankDetails if any field is provided
      if (newEmployeeData.BankAccountNumber || newEmployeeData.BankAccountHolderName ||
        newEmployeeData.BankName || newEmployeeData.BankBranch || newEmployeeData.BankIfscCode) {
        payload.BankDetails = {
          accountNumber: newEmployeeData.BankAccountNumber,
          accountHolderName: newEmployeeData.BankAccountHolderName,
          bankName: newEmployeeData.BankName,
          branch: newEmployeeData.BankBranch,
          ifscCode: newEmployeeData.BankIfscCode,
          accountType: newEmployeeData.BankAccountType
        };
      }

      // Add EmergencyContact if any field is provided
      if (newEmployeeData.EmergencyContactName || newEmployeeData.EmergencyContactRelationship ||
        newEmployeeData.EmergencyContactPhone || newEmployeeData.EmergencyContactAddress || newEmployeeData.EmergencyContactPIN) {
        payload.EmergencyContact = {
          name: newEmployeeData.EmergencyContactName,
          relationship: newEmployeeData.EmergencyContactRelationship,
          phone: newEmployeeData.EmergencyContactPhone,
          address: newEmployeeData.EmergencyContactAddress,
          pinCode: newEmployeeData.EmergencyContactPIN
        };
      }

      // Remove undefined values
      Object.keys(payload).forEach(key =>
        payload[key] === undefined && delete payload[key]
      );

      const response = await axios.post(
        `${BASE_URL}/api/employees`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const newEmployee = response.data.data;
        // Add to employees list
        setEmployees(prev => [...prev, newEmployee]);
        // Select the new employee
        setFormData(prev => ({ ...prev, employee: newEmployee._id }));
        setSelectedEmployeeDetails(newEmployee);

        // Auto-fill employee details
        const autoFillData = {
          basic: newEmployee.BasicSalary || "",
          employmentType: newEmployee.EmploymentType || "Monthly",
          hra: newEmployee.HRA || "",
          conveyance: newEmployee.ConveyanceAllowance || "",
          medical: newEmployee.MedicalAllowance || "",
          special: newEmployee.SpecialAllowance || "",
          pf: newEmployee.PFNumber ? "Auto-calculated based on salary" : "",
          esi: newEmployee.ESINumber ? "Auto-calculated based on salary" : "",
          overtimeMultiplier: newEmployee.OvertimeRateMultiplier || 1.5,
          workingDays: newEmployee.EmploymentType === "Monthly" ? 26 :
            newEmployee.EmploymentType === "Hourly" ? 30 : 26,
          paidDays: newEmployee.EmploymentType === "Monthly" ? 26 :
            newEmployee.EmploymentType === "Hourly" ? 30 : 26,
        };

        setFormData(prev => ({
          ...prev,
          ...autoFillData
        }));

        // Hide add employee form
        setShowAddEmployeeForm(false);
        // Reset new employee form
        setNewEmployeeData({
          FirstName: '',
          LastName: '',
          Gender: 'M',
          DateOfBirth: '',
          Email: '',
          Phone: '',
          Address: '',
          DepartmentID: '',
          DesignationID: '',
          DateOfJoining: '',
          EmploymentStatus: 'active',
          EmploymentType: 'Monthly',
          PayStructureType: 'Fixed',
          ContractCompany: '',
          BasicSalary: '',
          HourlyRate: '',
          OvertimeRateMultiplier: '1.5',
          SkillLevel: '',
          WorkStation: '',
          LineNumber: '',
          PAN: '',
          AadharNumber: '',
          PFNumber: '',
          UAN: '',
          ESINumber: '',
          BankAccountNumber: '',
          BankAccountHolderName: '',
          BankName: '',
          BankBranch: '',
          BankIfscCode: '',
          BankAccountType: 'Savings',
          EmergencyContactName: '',
          EmergencyContactRelationship: '',
          EmergencyContactPhone: '',
          EmergencyContactAddress: '',
          EmergencyContactPIN: ''
        });
        setActiveEmployeeStep(0);
        setFieldErrors({});
        setTouched({});
        setAddEmployeeError('');
      }
    } catch (error) {
      setAddEmployeeError(error.response?.data?.message || "Failed to add employee.");
    } finally {
      setAddEmployeeLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.employee) return setError("Employee is required");
    if (!formData.month || !formData.year)
      return setError("Month and Year are required");
    if (!formData.basic) return setError("Basic salary is required");

    setLoading(true);
    setError("");

    const payload = {
      employee: formData.employee,
      payrollPeriod: {
        month: Number(formData.month),
        year: Number(formData.year),
      },
      employmentType: formData.employmentType,
      earnings: {
        basic: Number(formData.basic) || 0,
        hra: Number(formData.hra) || 0,
        conveyance: Number(formData.conveyance) || 0,
        medical: Number(formData.medical) || 0,
        special: Number(formData.special) || 0,
        da: Number(formData.da) || 0,
        arrears: Number(formData.arrears) || 0,
        overtime: Number(formData.overtime) || 0,
        performanceBonus: Number(formData.performanceBonus) || 0,
        attendanceBonus: Number(formData.attendanceBonus) || 0,
        shiftAllowance: Number(formData.shiftAllowance) || 0,
        productionIncentive: Number(formData.productionIncentive) || 0,
        otherAllowances: Number(formData.otherAllowances) || 0,
      },
      reimbursements: {
        travel: Number(formData.travel) || 0,
        food: Number(formData.food) || 0,
        telephone: Number(formData.telephone) || 0,
        fuel: Number(formData.fuel) || 0,
        medicalReimbursement: Number(formData.medicalReimbursement) || 0,
        education: Number(formData.education) || 0,
        lta: Number(formData.lta) || 0,
        uniform: Number(formData.uniform) || 0,
        newspaper: Number(formData.newspaper) || 0,
        other: Number(formData.other) || 0,
      },
      deductions: {
        pf: Number(formData.pf) || 0,
        esi: Number(formData.esi) || 0,
        professionalTax: Number(formData.professionalTax) || 0,
        tds: Number(formData.tds) || 0,
        loanRecovery: Number(formData.loanRecovery) || 0,
        advanceRecovery: Number(formData.advanceRecovery) || 0,
        labourWelfare: Number(formData.labourWelfare) || 0,
        otherDeductions: Number(formData.otherDeductions) || 0,
      },
      calculationRules: {
        hraPercentage: Number(formData.hraPercentage) || 50,
        pfPercentage: Number(formData.pfPercentage) || 12,
        esiPercentage: Number(formData.esiPercentage) || 0.75,
        overtimeMultiplier: Number(formData.overtimeMultiplier) || 1.5,
      },
      workingDays: Number(formData.workingDays) || 26,
      paidDays: Number(formData.paidDays) || 26,
      leaveDays: Number(formData.leaveDays) || 0,
      lopDays: Number(formData.lopDays) || 0,
      overtimeHours: Number(formData.overtimeHours) || 0,
      overtimeRate: Number(formData.overtimeRate) || 0,
      incentives: Number(formData.incentives) || 0,
      advanceDeductions: Number(formData.advanceDeductions) || 0,
      paymentMode: formData.paymentMode,
      remarks: formData.remarks,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${BASE_URL}/api/salaries`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        onAdd(response.data.data);
        onClose();
        resetForm();
        setActiveStep(0);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create salary.");
    } finally {
      setLoading(false);
    }
  };

  // Employee form render functions
  const renderEmployeeStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>FIRST NAME <span style={{ color: '#EF4444' }}>*</span></Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="FirstName"
                  value={newEmployeeData.FirstName}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="e.g., John"
                  error={!!fieldErrors.FirstName}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Letters, spaces, dots, and hyphens only
                </Typography>
                {fieldErrors.FirstName && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.FirstName}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>LAST NAME <span style={{ color: '#EF4444' }}>*</span></Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="LastName"
                  value={newEmployeeData.LastName}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="e.g., Doe"
                  error={!!fieldErrors.LastName}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Letters, spaces, dots, and hyphens only
                </Typography>
                {fieldErrors.LastName && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.LastName}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>GENDER</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="Gender"
                    value={newEmployeeData.Gender}
                    onChange={handleEmployeeFormChange}
                    disabled={addEmployeeLoading || loadingData}
                    sx={selectStyles}
                  >
                    {genderOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>DATE OF BIRTH</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="DateOfBirth"
                  type="date"
                  value={newEmployeeData.DateOfBirth}
                  onChange={handleEmployeeFormChange}
                  disabled={addEmployeeLoading || loadingData}
                  InputLabelProps={{ shrink: true }}
                  sx={inputStyle}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>EMAIL <span style={{ color: '#EF4444' }}>*</span></Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="Email"
                  type="email"
                  value={newEmployeeData.Email}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="john.doe@company.com"
                  error={!!fieldErrors.Email}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  e.g., john.doe@company.com
                </Typography>
                {fieldErrors.Email && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.Email}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>PHONE</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="Phone"
                  value={newEmployeeData.Phone}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="9876543210"
                  error={!!fieldErrors.Phone}
                  inputProps={{ maxLength: 10 }}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  10-digit mobile number starting with 6-9
                </Typography>
                {fieldErrors.Phone && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.Phone}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>ADDRESS</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="Address"
                  value={newEmployeeData.Address}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  multiline
                  rows={2}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="Enter complete address"
                  error={!!fieldErrors.Address}
                  sx={inputStyle}
                />
                {fieldErrors.Address && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.Address}</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>DEPARTMENT <span style={{ color: '#EF4444' }}>*</span></Typography>
                <Autocomplete
                  options={departments}
                  getOptionLabel={(option) => option?.DepartmentName || ''}
                  value={departments.find(dept => dept._id === newEmployeeData.DepartmentID) || null}
                  onChange={(event, newValue) => {
                    setNewEmployeeData(prev => ({
                      ...prev,
                      DepartmentID: newValue?._id || ''
                    }));
                  }}
                  loading={loadingData}
                  disabled={addEmployeeLoading || loadingData}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Select department"
                      error={!!fieldErrors.DepartmentID}
                      sx={inputStyle}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  PaperComponent={CustomPaper}
                  noOptionsText="No departments found"
                />
                {fieldErrors.DepartmentID && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.DepartmentID}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>DESIGNATION <span style={{ color: '#EF4444' }}>*</span></Typography>
                <Autocomplete
                  options={designations}
                  getOptionLabel={(option) => option?.DesignationName || ''}
                  value={designations.find(desig => desig._id === newEmployeeData.DesignationID) || null}
                  onChange={(event, newValue) => {
                    setNewEmployeeData(prev => ({
                      ...prev,
                      DesignationID: newValue?._id || ''
                    }));
                  }}
                  loading={loadingData}
                  disabled={addEmployeeLoading || loadingData}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Select designation"
                      error={!!fieldErrors.DesignationID}
                      sx={inputStyle}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  PaperComponent={CustomPaper}
                  noOptionsText="No designations found"
                />
                {fieldErrors.DesignationID && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.DesignationID}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>DATE OF JOINING <span style={{ color: '#EF4444' }}>*</span></Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="DateOfJoining"
                  type="date"
                  value={newEmployeeData.DateOfJoining}
                  onChange={handleEmployeeFormChange}
                  disabled={addEmployeeLoading || loadingData}
                  InputLabelProps={{ shrink: true }}
                  error={!!fieldErrors.DateOfJoining}
                  sx={inputStyle}
                />
                {fieldErrors.DateOfJoining && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.DateOfJoining}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>EMPLOYMENT TYPE <span style={{ color: '#EF4444' }}>*</span></Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="EmploymentType"
                    value={newEmployeeData.EmploymentType}
                    onChange={handleEmploymentTypeChange}
                    disabled={addEmployeeLoading || loadingData}
                    sx={selectStyles}
                  >
                    {employmentTypeOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {newEmployeeData.EmploymentType === 'contract-based' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={labelStyle}>CONTRACT COMPANY <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      name="ContractCompany"
                      value={newEmployeeData.ContractCompany}
                      onChange={handleEmployeeFormChange}
                      onBlur={handleEmployeeBlur}
                      disabled={addEmployeeLoading || loadingData}
                      error={!!fieldErrors.ContractCompany}
                      sx={selectStyles}
                    >
                      <MenuItem value="">Select Contract Company</MenuItem>
                      {contractCompanyOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {fieldErrors.ContractCompany && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.ContractCompany}</Typography>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>PAY STRUCTURE TYPE</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="PayStructureType"
                    value={newEmployeeData.PayStructureType}
                    onChange={handleEmployeeFormChange}
                    disabled={addEmployeeLoading || loadingData}
                    sx={selectStyles}
                  >
                    {payStructureOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {(newEmployeeData.EmploymentType === 'Monthly' || newEmployeeData.EmploymentType === 'contract-based') && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={labelStyle}>BASIC SALARY <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="BasicSalary"
                    type="number"
                    value={newEmployeeData.BasicSalary}
                    onChange={handleEmployeeFormChange}
                    disabled={addEmployeeLoading || loadingData}
                    placeholder="e.g., 25000"
                    error={!!fieldErrors.BasicSalary}
                    inputProps={{ min: 0 }}
                    sx={inputStyle}
                  />
                  {fieldErrors.BasicSalary && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.BasicSalary}</Typography>
                  )}
                </Box>
              </Grid>
            )}

            {newEmployeeData.EmploymentType === 'Hourly' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={labelStyle}>HOURLY RATE <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="HourlyRate"
                    type="number"
                    value={newEmployeeData.HourlyRate}
                    onChange={handleEmployeeFormChange}
                    disabled={addEmployeeLoading || loadingData}
                    placeholder="e.g., 150"
                    error={!!fieldErrors.HourlyRate}
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={inputStyle}
                  />
                  {fieldErrors.HourlyRate && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.HourlyRate}</Typography>
                  )}
                </Box>
              </Grid>
            )}

            {newEmployeeData.EmploymentType !== 'PieceRate' && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>OVERTIME MULTIPLIER</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      name="OvertimeRateMultiplier"
                      type="number"
                      value={newEmployeeData.OvertimeRateMultiplier}
                      onChange={handleEmployeeFormChange}
                      disabled={addEmployeeLoading || loadingData}
                      inputProps={{ step: 0.25, min: 1, max: 3 }}
                      sx={inputStyle}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>SKILL LEVEL</Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        name="SkillLevel"
                        value={newEmployeeData.SkillLevel}
                        onChange={handleEmployeeFormChange}
                        disabled={addEmployeeLoading || loadingData}
                        sx={selectStyles}
                      >
                        <MenuItem value="">None</MenuItem>
                        {skillLevelOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
              </>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>WORK STATION</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="WorkStation"
                  value={newEmployeeData.WorkStation}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="e.g., Station A"
                  error={!!fieldErrors.WorkStation}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Letters, numbers, spaces, and hyphens only
                </Typography>
                {fieldErrors.WorkStation && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.WorkStation}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>LINE NUMBER</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="LineNumber"
                  value={newEmployeeData.LineNumber}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="e.g., Line 1"
                  error={!!fieldErrors.LineNumber}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Letters, numbers, spaces, and hyphens only
                </Typography>
                {fieldErrors.LineNumber && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.LineNumber}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Typography sx={{ ...labelStyle, color: COLORS.primary, mb: 1 }}>
                Tax & Identification (Optional)
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>PAN</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="PAN"
                  value={newEmployeeData.PAN}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="ABCDE1234F"
                  error={!!fieldErrors.PAN}
                  inputProps={{ maxLength: 10 }}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  5 letters + 4 numbers + 1 letter
                </Typography>
                {fieldErrors.PAN && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.PAN}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>AADHAR NUMBER</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="AadharNumber"
                  value={newEmployeeData.AadharNumber}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="123456789012"
                  error={!!fieldErrors.AadharNumber}
                  inputProps={{ maxLength: 12 }}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  12 digits
                </Typography>
                {fieldErrors.AadharNumber && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.AadharNumber}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>PF NUMBER</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="PFNumber"
                  value={newEmployeeData.PFNumber}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="AB/12345/1234567"
                  error={!!fieldErrors.PFNumber}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Format: XX/12345/1234567
                </Typography>
                {fieldErrors.PFNumber && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.PFNumber}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>UAN</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="UAN"
                  value={newEmployeeData.UAN}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="123456789012"
                  error={!!fieldErrors.UAN}
                  inputProps={{ maxLength: 12 }}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  12 digits
                </Typography>
                {fieldErrors.UAN && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.UAN}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>ESI NUMBER</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="ESINumber"
                  value={newEmployeeData.ESINumber}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="12345678901234567"
                  error={!!fieldErrors.ESINumber}
                  inputProps={{ maxLength: 17 }}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  17 digits
                </Typography>
                {fieldErrors.ESINumber && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.ESINumber}</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ ...labelStyle, color: COLORS.primary, mb: 1 }}>
                Bank Details
                <Typography component="span" sx={{ fontSize: '0.65rem', ml: 1, color: COLORS.text.tertiary, fontWeight: 'normal' }}>
                  (All fields optional, but if provided, all are required)
                </Typography>
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>ACCOUNT NUMBER</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="BankAccountNumber"
                  value={newEmployeeData.BankAccountNumber}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="123456789"
                  error={!!fieldErrors.BankAccountNumber}
                  inputProps={{ maxLength: 18 }}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  9-18 digits only
                </Typography>
                {fieldErrors.BankAccountNumber && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.BankAccountNumber}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>ACCOUNT HOLDER NAME</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="BankAccountHolderName"
                  value={newEmployeeData.BankAccountHolderName}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="John Doe"
                  error={!!fieldErrors.BankAccountHolderName}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Letters, spaces, dots, and hyphens only
                </Typography>
                {fieldErrors.BankAccountHolderName && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.BankAccountHolderName}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>BANK NAME</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="BankName"
                  value={newEmployeeData.BankName}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="State Bank of India"
                  error={!!fieldErrors.BankName}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Letters, spaces, dots, and hyphens only
                </Typography>
                {fieldErrors.BankName && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.BankName}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>BRANCH</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="BankBranch"
                  value={newEmployeeData.BankBranch}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="Main Branch"
                  error={!!fieldErrors.BankBranch}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Letters, numbers, spaces, dots, and hyphens only
                </Typography>
                {fieldErrors.BankBranch && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.BankBranch}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>IFSC CODE</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="BankIfscCode"
                  value={newEmployeeData.BankIfscCode}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="SBIN0123456"
                  error={!!fieldErrors.BankIfscCode}
                  inputProps={{ maxLength: 11 }}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  4 letters + 0 + 6 alphanumeric
                </Typography>
                {fieldErrors.BankIfscCode && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.BankIfscCode}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>ACCOUNT TYPE</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="BankAccountType"
                    value={newEmployeeData.BankAccountType}
                    onChange={handleEmployeeFormChange}
                    disabled={addEmployeeLoading || loadingData}
                    sx={selectStyles}
                  >
                    {accountTypeOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Typography sx={{ ...labelStyle, color: COLORS.primary, mb: 1 }}>
                Emergency Contact
                <Typography component="span" sx={{ fontSize: '0.65rem', ml: 1, color: COLORS.text.tertiary, fontWeight: 'normal' }}>
                  (All fields optional, but if provided, all are required)
                </Typography>
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>CONTACT NAME</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="EmergencyContactName"
                  value={newEmployeeData.EmergencyContactName}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="Jane Doe"
                  error={!!fieldErrors.EmergencyContactName}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Letters, spaces, dots, and hyphens only
                </Typography>
                {fieldErrors.EmergencyContactName && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.EmergencyContactName}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>RELATIONSHIP</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="EmergencyContactRelationship"
                  value={newEmployeeData.EmergencyContactRelationship}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="Spouse"
                  error={!!fieldErrors.EmergencyContactRelationship}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Letters and spaces only
                </Typography>
                {fieldErrors.EmergencyContactRelationship && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.EmergencyContactRelationship}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>PHONE</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="EmergencyContactPhone"
                  value={newEmployeeData.EmergencyContactPhone}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="9876543210"
                  error={!!fieldErrors.EmergencyContactPhone}
                  inputProps={{ maxLength: 10 }}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  10-digit mobile number starting with 6-9
                </Typography>
                {fieldErrors.EmergencyContactPhone && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.EmergencyContactPhone}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>PIN CODE</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="EmergencyContactPIN"
                  value={newEmployeeData.EmergencyContactPIN}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="400001"
                  error={!!fieldErrors.EmergencyContactPIN}
                  inputProps={{ maxLength: 6 }}
                  sx={inputStyle}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  6 digits
                </Typography>
                {fieldErrors.EmergencyContactPIN && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.EmergencyContactPIN}</Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={labelStyle}>ADDRESS</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="EmergencyContactAddress"
                  value={newEmployeeData.EmergencyContactAddress}
                  onChange={handleEmployeeFormChange}
                  onBlur={handleEmployeeBlur}
                  multiline
                  rows={2}
                  disabled={addEmployeeLoading || loadingData}
                  placeholder="Enter complete address"
                  error={!!fieldErrors.EmergencyContactAddress}
                  sx={inputStyle}
                />
                {fieldErrors.EmergencyContactAddress && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.EmergencyContactAddress}</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      fontSize: '0.75rem',
      '&:hover fieldset': {
        borderColor: COLORS.primary,
      },
      '&.Mui-focused fieldset': {
        borderColor: COLORS.primary,
        borderWidth: 1
      },
      '&.Mui-error fieldset': {
        borderColor: '#EF4444'
      }
    },
    '& .MuiInputBase-input': {
      py: 1,
      px: 1.5,
      fontSize: '0.75rem',
      color: COLORS.text.primary,
      '&::placeholder': {
        color: COLORS.text.tertiary,
        fontSize: '0.75rem'
      }
    },
    '& input[type=number]': {
      MozAppearance: 'textfield'
    },
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0
    }
  };

  const labelStyle = {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: COLORS.text.secondary,
    letterSpacing: '0.5px',
    mb: 0.5
  };

  const selectStyles = {
    borderRadius: 1.5,
    fontSize: '0.75rem',
    '& .MuiSelect-select': {
      py: 1,
      fontSize: '0.75rem'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: COLORS.primary
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: COLORS.primary,
      borderWidth: 1
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          border: `1px solid ${COLORS.border}`,
          overflow: 'hidden',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: `1px solid ${COLORS.border}`,
        py: 1.5,
        px: 2.5,
        bgcolor: COLORS.background.white,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography
          sx={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: COLORS.text.primary
          }}
        >
          Add Salary
        </Typography>
        {selectedEmployeeDetails && (
          <Chip
            label={`${selectedEmployeeDetails.FirstName} ${selectedEmployeeDetails.LastName}`}
            size="small"
            sx={{
              bgcolor: COLORS.primaryLight,
              color: COLORS.primaryDark,
              fontWeight: 500,
              fontSize: '0.7rem',
              height: 28
            }}
          />
        )}
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, overflowY: 'auto' }}>
        {/* Stepper */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<ColorConnector />}
          sx={{ mb: 4, mt: 1 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography fontWeight={500} fontSize="0.75rem">
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Summary Bar */}
        {selectedEmployeeDetails && activeStep > 0 && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: COLORS.primaryLight,
              borderRadius: 2,
              border: `1px solid ${COLORS.primary}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                Employee Summary
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.text.primary }}>
                {selectedEmployeeDetails.FirstName} {selectedEmployeeDetails.LastName} - {selectedEmployeeDetails.EmployeeID}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                {selectedEmployeeDetails.DepartmentID?.DepartmentName} - {selectedEmployeeDetails.DesignationID?.DesignationName}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
                Net Pay (Estimated)
              </Typography>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.primary }}>
                {formatCurrency(calculateNetPay())}
              </Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Stack spacing={2.5}>
            {/* STEP 1 - Employee & Period */}
            {activeStep === 0 && (
              <Box>
                {/* Employee Selection Section */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box sx={{ gridColumn: 'span 2' }}>
                    <Typography sx={labelStyle}>
                      EMPLOYEE <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <TextField
                          select
                          name="employee"
                          value={formData.employee}
                          onChange={handleEmployeeChange}
                          fullWidth
                          size="small"
                          disabled={employeeLoading}
                          sx={inputStyle}
                        >
                          {employeeLoading ? (
                            <MenuItem disabled>
                              <CircularProgress size={16} /> Loading...
                            </MenuItem>
                          ) : (
                            employees.map((emp) => (
                              <MenuItem key={emp._id} value={emp._id} sx={{ fontSize: '0.75rem' }}>
                                <Box>
                                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                    {emp.FirstName} {emp.LastName}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                                    {emp.EmployeeID} - {emp.DepartmentID?.DepartmentName}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))
                          )}
                        </TextField>
                      </Box>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowAddEmployeeForm(!showAddEmployeeForm)}
                        disabled={employeeLoading}
                        startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
                        sx={{
                          height: 36,
                          minWidth: 'auto',
                          px: 1.5,
                          borderRadius: 1.5,
                          border: `1px solid ${COLORS.border}`,
                          color: COLORS.text.secondary,
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          '&:hover': {
                            borderColor: COLORS.primary,
                            bgcolor: `${COLORS.primary}10`,
                            color: COLORS.primary
                          }
                        }}
                      >
                        {showAddEmployeeForm ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>
                  </Box>

                  {/* Add Employee Form - Shown above Month & Year */}
                  {showAddEmployeeForm && (
                    <Box sx={{ gridColumn: 'span 2', mt: 1, p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
                          Add New Employee
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setShowAddEmployeeForm(false);
                            setAddEmployeeError("");
                            setActiveEmployeeStep(0);
                          }}
                          sx={{
                            color: COLORS.text.tertiary,
                            '&:hover': { color: COLORS.primary }
                          }}
                        >
                          <CloseIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Box>

                      {/* Employee Stepper */}
                      <Stepper
                        activeStep={activeEmployeeStep}
                        sx={{ mb: 3 }}
                      >
                        {employeeSteps.map((label) => (
                          <Step key={label}>
                            <StepLabel>
                              <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
                                {label}
                              </Typography>
                            </StepLabel>
                          </Step>
                        ))}
                      </Stepper>

                      {renderEmployeeStepContent(activeEmployeeStep)}

                      {addEmployeeError && (
                        <Alert
                          severity="error"
                          sx={{
                            mt: 2,
                            borderRadius: 1.5,
                            fontSize: '0.75rem',
                            py: 0.5
                          }}
                        >
                          {addEmployeeError}
                        </Alert>
                      )}

                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                          onClick={handleEmployeeBack}
                          disabled={activeEmployeeStep === 0 || addEmployeeLoading}
                          size="small"
                          startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
                          sx={{
                            height: 32,
                            px: 2,
                            borderRadius: 1.5,
                            border: `1px solid ${COLORS.border}`,
                            color: COLORS.text.secondary,
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            textTransform: 'none',
                            '&:hover': {
                              borderColor: COLORS.primary,
                              bgcolor: `${COLORS.primary}10`
                            }
                          }}
                        >
                          Back
                        </Button>
                        <Box>
                          <Button
                            onClick={() => {
                              setShowAddEmployeeForm(false);
                              setAddEmployeeError("");
                              setActiveEmployeeStep(0);
                            }}
                            disabled={addEmployeeLoading}
                            size="small"
                            sx={{
                              height: 32,
                              px: 2,
                              mr: 1,
                              borderRadius: 1.5,
                              border: `1px solid ${COLORS.border}`,
                              color: COLORS.text.secondary,
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              textTransform: 'none',
                              '&:hover': {
                                borderColor: COLORS.primary,
                                bgcolor: `${COLORS.primary}10`
                              }
                            }}
                          >
                            Cancel
                          </Button>
                          {activeEmployeeStep === employeeSteps.length - 1 ? (
                            <Button
                              variant="contained"
                              onClick={handleAddEmployeeSubmit}
                              disabled={addEmployeeLoading}
                              size="small"
                              startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                              sx={{
                                height: 32,
                                px: 2,
                                borderRadius: 1.5,
                                bgcolor: COLORS.primary,
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                textTransform: 'none',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                '&:hover': {
                                  bgcolor: COLORS.primaryDark,
                                }
                              }}
                            >
                              {addEmployeeLoading ? 'Adding...' : 'Add Employee'}
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              onClick={handleEmployeeNext}
                              disabled={addEmployeeLoading}
                              size="small"
                              endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
                              sx={{
                                height: 32,
                                px: 2,
                                borderRadius: 1.5,
                                bgcolor: COLORS.primary,
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                textTransform: 'none',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                '&:hover': {
                                  bgcolor: COLORS.primaryDark,
                                }
                              }}
                            >
                              Next
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Month & Year Selection */}
                  <Box sx={{ gridColumn: 'span 2' }}>
                    <Typography sx={labelStyle}>
                      MONTH & YEAR <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        views={["month", "year"]}
                        value={formData.date}
                        onChange={(newValue) => {
                          if (newValue) {
                            setFormData((prev) => ({
                              ...prev,
                              date: newValue,
                              month: (newValue.getMonth() + 1).toString(),
                              year: newValue.getFullYear().toString(),
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              date: null,
                              month: "",
                              year: "",
                            }));
                          }
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            sx: inputStyle
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Box>

                  {/* Employment Type */}
                  <Box sx={{ gridColumn: 'span 2' }}>
                    <Typography sx={labelStyle}>
                      EMPLOYMENT TYPE
                    </Typography>
                    <TextField
                      select
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      sx={inputStyle}
                    >
                      <MenuItem value="Monthly" sx={{ fontSize: '0.75rem' }}>Monthly</MenuItem>
                      <MenuItem value="Hourly" sx={{ fontSize: '0.75rem' }}>Hourly</MenuItem>
                      <MenuItem value="PieceRate" sx={{ fontSize: '0.75rem' }}>Piece Rate</MenuItem>
                    </TextField>
                  </Box>

                  {/* Basic Salary */}
                  <Box sx={{ gridColumn: 'span 1' }}>
                    <Typography sx={labelStyle}>
                      BASIC SALARY <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      name="basic"
                      type="number"
                      fullWidth
                      size="small"
                      value={formData.basic}
                      onChange={handleNumberChange}
                      sx={inputStyle}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Box>

                  {/* HRA */}
                  <Box sx={{ gridColumn: 'span 1' }}>
                    <Typography sx={labelStyle}>
                      HRA
                    </Typography>
                    <TextField
                      name="hra"
                      type="number"
                      fullWidth
                      size="small"
                      value={formData.hra}
                      onChange={handleNumberChange}
                      sx={inputStyle}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Box>

                  {/* Working Days Section */}
                  <Box sx={{ gridColumn: 'span 2', mt: 1 }}>
                    <Typography sx={{ ...labelStyle, color: COLORS.primary }}>
                      WORKING DAYS DETAILS
                    </Typography>
                  </Box>

                  <Box sx={{ gridColumn: 'span 1' }}>
                    <Typography sx={labelStyle}>Working Days</Typography>
                    <TextField
                      name="workingDays"
                      type="number"
                      fullWidth
                      size="small"
                      value={formData.workingDays}
                      onChange={handleNumberChange}
                      sx={inputStyle}
                    />
                  </Box>
                  <Box sx={{ gridColumn: 'span 1' }}>
                    <Typography sx={labelStyle}>Paid Days</Typography>
                    <TextField
                      name="paidDays"
                      type="number"
                      fullWidth
                      size="small"
                      value={formData.paidDays}
                      onChange={handleNumberChange}
                      sx={inputStyle}
                    />
                  </Box>
                  <Box sx={{ gridColumn: 'span 1' }}>
                    <Typography sx={labelStyle}>Leave Days</Typography>
                    <TextField
                      name="leaveDays"
                      type="number"
                      fullWidth
                      size="small"
                      value={formData.leaveDays}
                      onChange={handleNumberChange}
                      sx={inputStyle}
                    />
                  </Box>
                  <Box sx={{ gridColumn: 'span 1' }}>
                    <Typography sx={labelStyle}>LOP Days</Typography>
                    <TextField
                      name="lopDays"
                      type="number"
                      fullWidth
                      size="small"
                      value={formData.lopDays}
                      onChange={handleNumberChange}
                      sx={inputStyle}
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {/* STEP 2 - Earnings & Reimbursements */}
            {activeStep === 1 && (
              <Box>
                {/* Earnings Section */}
                <Accordion
                  expanded={expandedSections.earnings}
                  onChange={() => handleSectionToggle('earnings')}
                  sx={{
                    mb: 2,
                    borderRadius: 1.5,
                    border: `1px solid ${COLORS.border}`,
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600} sx={{ fontSize: '0.8rem', color: COLORS.primary }}>
                      Earnings Components
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {[
                        { label: "Basic Salary", name: "basic" },
                        { label: "HRA", name: "hra" },
                        { label: "Conveyance", name: "conveyance" },
                        { label: "Medical Allowance", name: "medical" },
                        { label: "Special Allowance", name: "special" },
                        { label: "Dearness Allowance", name: "da" },
                        { label: "Arrears", name: "arrears" },
                        { label: "Overtime", name: "overtime" },
                        { label: "Performance Bonus", name: "performanceBonus" },
                        { label: "Attendance Bonus", name: "attendanceBonus" },
                        { label: "Shift Allowance", name: "shiftAllowance" },
                        { label: "Production Incentive", name: "productionIncentive" },
                        { label: "Other Allowances", name: "otherAllowances" }
                      ].map((field) => (
                        <Grid item xs={12} sm={6} md={4} key={field.name}>
                          <Typography sx={labelStyle}>{field.label}</Typography>
                          <TextField
                            name={field.name}
                            type="number"
                            fullWidth
                            size="small"
                            value={formData[field.name]}
                            onChange={handleNumberChange}
                            sx={inputStyle}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>

                    <Box sx={{ mt: 2, p: 2, bgcolor: COLORS.primaryLight, borderRadius: 1.5 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>
                        Total Earnings: {formatCurrency(calculateTotalEarnings())}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* Reimbursements Section */}
                <Accordion
                  expanded={expandedSections.reimbursements}
                  onChange={() => handleSectionToggle('reimbursements')}
                  sx={{
                    borderRadius: 1.5,
                    border: `1px solid ${COLORS.border}`,
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600} sx={{ fontSize: '0.8rem', color: COLORS.primary }}>
                      Reimbursements
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {[
                        { label: "Travel", name: "travel" },
                        { label: "Food", name: "food" },
                        { label: "Telephone", name: "telephone" },
                        { label: "Fuel", name: "fuel" },
                        { label: "Medical", name: "medicalReimbursement" },
                        { label: "Education", name: "education" },
                        { label: "LTA", name: "lta" },
                        { label: "Uniform", name: "uniform" },
                        { label: "Newspaper", name: "newspaper" },
                        { label: "Other", name: "other" }
                      ].map((field) => (
                        <Grid item xs={12} sm={6} md={4} key={field.name}>
                          <Typography sx={labelStyle}>{field.label}</Typography>
                          <TextField
                            name={field.name}
                            type="number"
                            fullWidth
                            size="small"
                            value={formData[field.name]}
                            onChange={handleNumberChange}
                            sx={inputStyle}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}

            {/* STEP 3 - Deductions & Payment */}
            {activeStep === 2 && (
              <Box>
                {/* Deductions Section */}
                <Accordion
                  expanded={expandedSections.deductions}
                  onChange={() => handleSectionToggle('deductions')}
                  sx={{
                    mb: 2,
                    borderRadius: 1.5,
                    border: `1px solid ${COLORS.border}`,
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600} sx={{ fontSize: '0.8rem', color: COLORS.primary }}>
                      Deductions
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {[
                        { label: "PF", name: "pf" },
                        { label: "ESI", name: "esi" },
                        { label: "Professional Tax", name: "professionalTax" },
                        { label: "TDS", name: "tds" },
                        { label: "Loan Recovery", name: "loanRecovery" },
                        { label: "Advance Recovery", name: "advanceRecovery" },
                        { label: "Labour Welfare", name: "labourWelfare" },
                        { label: "Other Deductions", name: "otherDeductions" }
                      ].map((field) => (
                        <Grid item xs={12} sm={6} md={4} key={field.name}>
                          <Typography sx={labelStyle}>{field.label}</Typography>
                          <TextField
                            name={field.name}
                            type="number"
                            fullWidth
                            size="small"
                            value={formData[field.name]}
                            onChange={handleNumberChange}
                            sx={inputStyle}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>

                    <Box sx={{ mt: 2, p: 2, bgcolor: COLORS.primaryLight, borderRadius: 1.5 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>
                        Total Deductions: {formatCurrency(calculateTotalDeductions())}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* Calculation Rules */}
                <Typography sx={{ ...labelStyle, color: COLORS.primary, mt: 2, mb: 1 }}>
                  CALCULATION RULES
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography sx={labelStyle}>HRA Percentage</Typography>
                    <TextField
                      name="hraPercentage"
                      type="number"
                      fullWidth
                      size="small"
                      value={formData.hraPercentage}
                      onChange={handleNumberChange}
                      sx={inputStyle}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography sx={labelStyle}>PF Percentage</Typography>
                    <TextField
                      name="pfPercentage"
                      type="number"
                      fullWidth
                      size="small"
                      value={formData.pfPercentage}
                      onChange={handleNumberChange}
                      sx={inputStyle}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography sx={labelStyle}>ESI Percentage</Typography>
                    <TextField
                      name="esiPercentage"
                      type="number"
                      fullWidth
                      size="small"
                      value={formData.esiPercentage}
                      onChange={handleNumberChange}
                      sx={inputStyle}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography sx={labelStyle}>Overtime Multiplier</Typography>
                    <TextField
                      name="overtimeMultiplier"
                      type="number"
                      fullWidth
                      size="small"
                      value={formData.overtimeMultiplier}
                      onChange={handleNumberChange}
                      sx={inputStyle}
                    />
                  </Grid>
                </Grid>

                {/* Overtime Details */}
                <Typography sx={{ ...labelStyle, color: COLORS.primary, mt: 1, mb: 1 }}>
                  OVERTIME & ADDITIONAL DETAILS
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography sx={labelStyle}>Overtime Hours</Typography>
                    <TextField
                      name="overtimeHours"
                      type="number"
                      fullWidth
                      size="small"
                      value={formData.overtimeHours}
                      onChange={handleNumberChange}
                      sx={inputStyle}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography sx={labelStyle}>Overtime Rate</Typography>
                    <TextField
                      name="overtimeRate"
                      type="number"
                      fullWidth
                      size="small"
                      value={formData.overtimeRate}
                      onChange={handleNumberChange}
                      sx={inputStyle}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography sx={labelStyle}>Incentives</Typography>
                    <TextField
                      name="incentives"
                      type="number"
                      fullWidth
                      size="small"
                      value={formData.incentives}
                      onChange={handleNumberChange}
                      sx={inputStyle}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography sx={labelStyle}>Advance Deductions</Typography>
                    <TextField
                      name="advanceDeductions"
                      type="number"
                      fullWidth
                      size="small"
                      value={formData.advanceDeductions}
                      onChange={handleNumberChange}
                      sx={inputStyle}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Payment Details */}
                <Typography sx={{ ...labelStyle, color: COLORS.primary, mt: 1, mb: 1 }}>
                  PAYMENT DETAILS
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={labelStyle}>Payment Mode</Typography>
                    <TextField
                      select
                      name="paymentMode"
                      fullWidth
                      size="small"
                      value={formData.paymentMode}
                      onChange={handleChange}
                      sx={inputStyle}
                    >
                      <MenuItem value="BANK_TRANSFER" sx={{ fontSize: '0.75rem' }}>Bank Transfer</MenuItem>
                      <MenuItem value="CASH" sx={{ fontSize: '0.75rem' }}>Cash</MenuItem>
                      <MenuItem value="CHEQUE" sx={{ fontSize: '0.75rem' }}>Cheque</MenuItem>
                      <MenuItem value="ONLINE" sx={{ fontSize: '0.75rem' }}>Online</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography sx={labelStyle}>Remarks</Typography>
                    <TextField
                      name="remarks"
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      value={formData.remarks}
                      onChange={handleChange}
                      sx={inputStyle}
                      placeholder="Additional notes or comments..."
                    />
                  </Grid>
                </Grid>

                {/* Net Pay Summary */}
                <Box sx={{ mt: 3, p: 2, bgcolor: COLORS.primaryLight, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                    Net Pay Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Total Earnings</Typography>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.text.primary }}>
                        {formatCurrency(calculateTotalEarnings())}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Total Deductions</Typography>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.text.primary }}>
                        {formatCurrency(calculateTotalDeductions())}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Net Pay</Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.primary }}>
                        {formatCurrency(calculateNetPay())}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}

            {error && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 1.5,
                  '& .MuiAlert-icon': {
                    fontSize: '1.25rem',
                    alignItems: 'center'
                  },
                  fontSize: '0.75rem',
                  py: 0.5
                }}
              >
                {error}
              </Alert>
            )}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{
        px: 2.5,
        py: 1.5,
        borderTop: `1px solid ${COLORS.border}`,
        bgcolor: COLORS.background.white,
        display: 'flex',
        justifyContent: 'space-between',
        gap: 1
      }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            height: 32,
            px: 2,
            borderRadius: 1.5,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text.secondary,
            fontSize: '0.7rem',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              borderColor: COLORS.primary,
              bgcolor: `${COLORS.primary}10`
            }
          }}
        >
          Cancel
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep > 0 && (
            <Button
              onClick={handleBack}
              disabled={loading}
              sx={{
                height: 32,
                px: 2,
                borderRadius: 1.5,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text.secondary,
                fontSize: '0.7rem',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  borderColor: COLORS.primary,
                  bgcolor: `${COLORS.primary}10`
                }
              }}
            >
              Back
            </Button>
          )}

          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNextStep}
              disabled={loading}
              sx={{
                height: 32,
                px: 2,
                borderRadius: 1.5,
                bgcolor: COLORS.primary,
                fontSize: '0.7rem',
                fontWeight: 500,
                textTransform: 'none',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  bgcolor: COLORS.primaryDark,
                }
              }}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? null : <AddIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                height: 32,
                px: 2,
                borderRadius: 1.5,
                bgcolor: COLORS.primary,
                fontSize: '0.7rem',
                fontWeight: 500,
                textTransform: 'none',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  bgcolor: COLORS.primaryDark,
                },
                '&:disabled': {
                  bgcolor: COLORS.border,
                  color: COLORS.text.tertiary
                }
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: COLORS.text.light }} /> : 'Add Salary'}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddSalary;