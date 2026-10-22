import React, { useState, useRef } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, Typography, Grid, Divider, MenuItem 
} from '@mui/material';
import { Print as PrintIcon, Close as CloseIcon } from '@mui/icons-material';

const COLORS = { primary: '#063C3F', text: '#151C26', border: '#E3E8EF' };

const PrintPRMSlip = ({ open, onClose, prmData }) => {
  const [toUser, setToUser] = useState('');
  const [department, setDepartment] = useState('');
  const printRef = useRef();

  // Agar PRM data nahi hai toh kuch mat dikhao
  if (!prmData) return null;

  const handlePrint = () => {
    const printContent = printRef.current;
    const WindowPrt = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    
    WindowPrt.document.write(`
      <html>
        <head>
          <title>Material Issue Slip - ${prmData.refNo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .header h2 { margin: 0; text-transform: uppercase; }
            .info-grid { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-col p { margin: 5px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 13px; }
            th { background-color: #f2f2f2; }
            .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
            .signatures div { border-top: 1px solid #000; width: 150px; text-align: center; padding-top: 5px; font-size: 14px; font-weight: bold;}
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.print();
    WindowPrt.close();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: COLORS.primary, color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Generate Material Issue Slip</Typography>
        <CloseIcon onClick={onClose} sx={{ cursor: 'pointer' }} />
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {/* Input Fields for TO and Dept */}
        <Grid container spacing={2} sx={{ mb: 3, bgcolor: '#f8fcfb', p: 2, borderRadius: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth size="small" label="TO (Username / Person)" 
              value={toUser} onChange={(e) => setToUser(e.target.value)} 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth size="small" label="Dept (Department)" 
              value={department} onChange={(e) => setDepartment(e.target.value)} 
            />
          </Grid>
        </Grid>

        {/* Printable Area */}
        <div ref={printRef}>
          <div className="header">
            <h2>SUYASH ENTERPRISES</h2>
            <h3 style={{ margin: '5px 0' }}>MATERIAL ISSUE SLIP</h3>
          </div>

          <div className="info-grid">
            <div className="info-col">
              <p><strong>Date:</strong> {new Date(prmData.date).toLocaleDateString()}</p>
              <p><strong>Ref No:</strong> {prmData.refNo || 'Auto-Generated'}</p>
              <p><strong>Invoice No:</strong> {prmData.invoiceNo}</p>
            </div>
            <div className="info-col">
              <p><strong>TO:</strong> {toUser || '____________________'}</p>
              <p><strong>Dept:</strong> {department || '____________________'}</p>
              <p><strong>Party Name:</strong> {prmData.partyName}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Material Name</th>
                <th>Material Code</th>
                <th>Quantity</th>
                <th>RM Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{prmData.materialName}</td>
                <td>{prmData.materialCode}</td>
                <td>{prmData.quantity}</td>
                <td>{prmData.rmType || 'Existing'}</td>
              </tr>
            </tbody>
          </table>

          <div className="signatures">
            <div>Issued By</div>
            <div>Received By (TO)</div>
          </div>
        </div>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handlePrint} variant="contained" startIcon={<PrintIcon />} sx={{ bgcolor: COLORS.primary }}>
          Print Slip
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintPRMSlip;