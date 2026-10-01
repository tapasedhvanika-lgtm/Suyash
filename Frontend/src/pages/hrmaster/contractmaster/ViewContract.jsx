// import React from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Typography,
//   Grid,
//   Stack,
//   Divider,
//   Chip
// } from '@mui/material';
// import { Visibility as ViewIcon } from '@mui/icons-material';

// const COLORS = {
//   primary: '#063C3F',
//   text: { primary: '#151C26', secondary: '#4B5568' },
//   border: '#E3E8EF',
//   background: { white: '#FFFFFF', light: '#F8FFFC' }
// };

// const ViewContract = ({ open, onClose, contract, onEdit }) => {
//   if (!contract) return null;
//   const statusLabel = contract.IsActive ? 'Active' : 'Inactive';

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle sx={{ bgcolor: COLORS.background.light, borderBottom: `1px solid ${COLORS.border}` }}>
//         <Stack direction="row" alignItems="center" justifyContent="space-between">
//           <Stack direction="row" alignItems="center" spacing={1}>
//             <ViewIcon sx={{ color: COLORS.primary }} />
//             <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
//               Agency Details
//             </Typography>
//           </Stack>
//           <Button onClick={onClose} size="small" sx={{ textTransform: 'none' }}>
//             Close
//           </Button>
//         </Stack>
//       </DialogTitle>
//       <DialogContent sx={{ p: 3, bgcolor: COLORS.background.white }}>
//         <Stack spacing={2}>
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={6}>
//               <Typography variant="subtitle2" color={COLORS.text.secondary}>Agency Code</Typography>
//               <Typography variant="body1" color={COLORS.text.primary}>{contract.AgencyCode || '-'}</Typography>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <Typography variant="subtitle2" color={COLORS.text.secondary}>Agency Name</Typography>
//               <Typography variant="body1" color={COLORS.text.primary}>{contract.AgencyName || '-'}</Typography>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <Typography variant="subtitle2" color={COLORS.text.secondary}>Contact Person</Typography>
//               <Typography variant="body1" color={COLORS.text.primary}>{contract.ContactPerson || '-'}</Typography>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <Typography variant="subtitle2" color={COLORS.text.secondary}>Contact Phone</Typography>
//               <Typography variant="body1" color={COLORS.text.primary}>{contract.ContactPhone || '-'}</Typography>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <Typography variant="subtitle2" color={COLORS.text.secondary}>Contact Email</Typography>
//               <Typography variant="body1" color={COLORS.text.primary}>{contract.ContactEmail || '-'}</Typography>
//             </Grid>
//             <Grid item xs={12}>
//               <Typography variant="subtitle2" color={COLORS.text.secondary}>Address</Typography>
//               <Typography variant="body1" color={COLORS.text.primary}>{contract.Address || '-'}</Typography>
//             </Grid>
//             <Grid item xs={12}>
//               <Typography variant="subtitle2" color={COLORS.text.secondary}>Notes</Typography>
//               <Typography variant="body1" color={COLORS.text.primary}>{contract.Notes || '-'}</Typography>
//             </Grid>
//           </Grid>
//           <Divider />
//           <Stack direction="row" spacing={1} alignItems="center">
//             <Typography variant="subtitle2" color={COLORS.text.secondary}>Status</Typography>
//             <Chip label={statusLabel} size="small" sx={{ bgcolor: contract.IsActive ? '#D1FAE5' : '#F3F4F6', color: contract.IsActive ? '#166534' : '#4B5563' }} />
//           </Stack>
//         </Stack>
//       </DialogContent>
//       <DialogActions sx={{ p: 2.5, bgcolor: COLORS.background.white }}>
//         <Button onClick={() => onEdit(contract)} variant="contained" color="primary" sx={{ textTransform: 'none' }}>
//           Edit
//         </Button>
//         <Button onClick={onClose} sx={{ textTransform: 'none' }}>
//           Close
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default ViewContract;


// import React from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Typography,
//   Grid,
//   Stack,
//   Divider,
//   Chip,
//   IconButton,
//   Paper
// } from '@mui/material';
// import { Close as CloseIcon, Edit as EditIcon, Business as BusinessIcon } from '@mui/icons-material';

// const COLORS = {
//   primary: '#063C3F',
//   primaryLight: '#E8F0F1',
//   text: { primary: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8' },
//   background: { white: '#FFFFFF', light: '#F8FFFC' },
//   border: '#E3E8EF'
// };

// const InfoRow = ({ label, value }) => (
//   <Grid item xs={12} sm={6}>
//     <Typography variant="caption" color={COLORS.text.secondary} sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
//       {label}
//     </Typography>
//     <Typography variant="body2" color={COLORS.text.primary} sx={{ fontSize: '0.75rem', fontWeight: 500, mt: 0.5 }}>
//       {value || '-'}
//     </Typography>
//   </Grid>
// );

// const ViewContract = ({ open, onClose, contract, onEdit }) => {
//   if (!contract) return null;
  
//   const statusLabel = contract.IsActive ? 'Active' : 'Inactive';
//   const statusColor = contract.IsActive ? '#166534' : '#4B5563';
//   const statusBg = contract.IsActive ? '#D1FAE5' : '#F3F4F6';

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//       <DialogTitle sx={{ bgcolor: COLORS.background.light, borderBottom: `1px solid ${COLORS.border}`, p: 2 }}>
//         <Stack direction="row" alignItems="center" justifyContent="space-between">
//           <Stack direction="row" alignItems="center" spacing={1}>
//             <BusinessIcon sx={{ color: COLORS.primary }} />
//             <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
//               Agency Details
//             </Typography>
//           </Stack>
//           <IconButton onClick={onClose} size="small">
//             <CloseIcon />
//           </IconButton>
//         </Stack>
//       </DialogTitle>
//       <DialogContent sx={{ p: 3, bgcolor: COLORS.background.white }}>
//         <Paper elevation={0} sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 2, mb: 3 }}>
//           <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
//             <Stack direction="row" spacing={2} alignItems="baseline">
//               <Typography variant="subtitle2" color={COLORS.text.secondary} sx={{ fontSize: '0.7rem' }}>
//                 Agency Code:
//               </Typography>
//               <Typography variant="body1" sx={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.primary }}>
//                 {contract.AgencyCode || '-'}
//               </Typography>
//             </Stack>
//             <Chip 
//               label={statusLabel} 
//               size="small" 
//               sx={{ 
//                 bgcolor: statusBg, 
//                 color: statusColor, 
//                 fontSize: '0.7rem', 
//                 fontWeight: 600,
//                 height: 24
//               }} 
//             />
//           </Stack>
//         </Paper>

//         <Grid container spacing={2}>
//           <InfoRow label="Agency Name" value={contract.AgencyName} />
//           <InfoRow label="Contact Person" value={contract.ContactPerson} />
//           <InfoRow label="Contact Phone" value={contract.ContactPhone} />
//           <InfoRow label="Contact Email" value={contract.ContactEmail} />
//           <Grid item xs={12}>
//             <Typography variant="caption" color={COLORS.text.secondary} sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
//               Address
//             </Typography>
//             <Typography variant="body2" color={COLORS.text.primary} sx={{ fontSize: '0.75rem', mt: 0.5 }}>
//               {contract.Address || '-'}
//             </Typography>
//           </Grid>
//           {contract.Notes && (
//             <Grid item xs={12}>
//               <Divider sx={{ my: 1 }} />
//               <Typography variant="caption" color={COLORS.text.secondary} sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
//                 Notes
//               </Typography>
//               <Typography variant="body2" color={COLORS.text.primary} sx={{ fontSize: '0.75rem', mt: 0.5, whiteSpace: 'pre-wrap' }}>
//                 {contract.Notes}
//               </Typography>
//             </Grid>
//           )}
//         </Grid>
//       </DialogContent>
//       <DialogActions sx={{ p: 2.5, bgcolor: COLORS.background.white, borderTop: `1px solid ${COLORS.border}` }}>
//         <Button onClick={onClose} sx={{ textTransform: 'none', color: COLORS.text.secondary }}>
//           Close
//         </Button>
//         <Button 
//           onClick={() => onEdit(contract)} 
//           variant="contained" 
//           startIcon={<EditIcon sx={{ fontSize: '0.9rem' }} />}
//           sx={{ 
//             textTransform: 'none', 
//             bgcolor: COLORS.primary,
//             '&:hover': { bgcolor: COLORS.primaryDark }
//           }}
//         >
//           Edit Agency
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default ViewContract;


import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Chip,
  Avatar,
  Box,
  Grid,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Email,
  Phone,
  Home,
  Business as BusinessIcon,
  Person,
  Badge,
  LocationOn,
  Info as InfoIcon,
  AccessTime,
  Description as NotesIcon,
  ContactPhone as ContactPhoneIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Color constants matching ViewEmployees
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
  border: '#E3E8EF'
};

const ViewContract = ({ open, onClose, contract, onEdit }) => {
  if (!contract) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAvatarInitials = (agencyName) => {
    if (!agencyName) return 'A';
    const words = agencyName.split(' ');
    if (words.length === 1) return agencyName.charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const renderInfoItem = (icon, label, value) => {
    const hasValue = value !== null && value !== undefined && value !== '';
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{ 
          color: hasValue ? COLORS.primary : COLORS.text.tertiary, 
          minWidth: 20,
          display: 'flex',
          alignItems: 'center',
          mt: 0.2
        }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ 
            fontSize: '0.65rem', 
            fontWeight: 500, 
            color: COLORS.text.tertiary,
            letterSpacing: '0.3px',
            mb: 0.3
          }}>
            {label}
          </Typography>
          <Typography sx={{ 
            fontSize: '0.8rem', 
            fontWeight: hasValue ? 500 : 400, 
            color: hasValue ? COLORS.text.primary : COLORS.text.tertiary,
            wordBreak: 'break-word',
            lineHeight: 1.4
          }}>
            {value || '-'}
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderSectionHeader = (icon, title) => (
    <Typography sx={{ 
      fontSize: '0.8rem', 
      fontWeight: 600, 
      color: COLORS.primary, 
      mb: 1.5,
      display: 'flex',
      alignItems: 'center',
      gap: 0.5
    }}>
      {icon}
      {title}
    </Typography>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
        <Stack direction="row" spacing={1} alignItems="center">
          <BusinessIcon sx={{ fontSize: '1.2rem', color: COLORS.primary }} />
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
            Agency Details
          </Typography>
        </Stack>

        {contract._id && (
          <Chip
            label={`ID: ${contract._id.slice(-6)}`}
            size="small"
            sx={{ 
              fontSize: '0.65rem',
              fontWeight: 500,
              height: 20,
              bgcolor: COLORS.background.light,
              color: COLORS.text.secondary,
              border: `1px solid ${COLORS.border}`,
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
        )}
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, bgcolor: COLORS.background.light, overflowY: 'auto' }}>
        <Stack spacing={2}>
          {/* Avatar + Basic Info */}
          <Paper sx={{ 
            p: 2, 
            bgcolor: COLORS.background.white, 
            borderRadius: 1.5, 
            border: `1px solid ${COLORS.border}`,
            boxShadow: 'none'
          }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid size={{ xs: 12, sm: 'auto' }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    bgcolor: COLORS.primary,
                    color: COLORS.text.light
                  }}
                >
                  {getAvatarInitials(contract.AgencyName)}
                </Avatar>
              </Grid>

              <Grid size={{ xs: 12, sm: true }}>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: COLORS.text.primary, mb: 0.5 }}>
                  {contract.AgencyName || 'N/A'}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                  Code: {contract.AgencyCode || 'N/A'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 'auto' }}>
                <Chip
                  label="Contract Agency"
                  size="small"
                  sx={{ 
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    height: 20,
                    bgcolor: COLORS.primaryLight,
                    color: COLORS.primaryDark,
                    border: `1px solid ${COLORS.primary}`,
                    '& .MuiChip-label': {
                      px: 1
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Agency Information Section */}
          <Paper sx={{ 
            p: 2, 
            bgcolor: COLORS.background.white, 
            borderRadius: 1.5, 
            border: `1px solid ${COLORS.border}`,
            boxShadow: 'none'
          }}>
            {renderSectionHeader(<BusinessIcon sx={{ fontSize: '1rem' }} />, 'Agency Information')}
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderInfoItem(<Badge sx={{ fontSize: '1rem' }} />, 'Agency Code', contract.AgencyCode)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderInfoItem(<BusinessIcon sx={{ fontSize: '1rem' }} />, 'Agency Name', contract.AgencyName)}
              </Grid>
            </Grid>
          </Paper>

          {/* Contact Information Section */}
          <Paper sx={{ 
            p: 2, 
            bgcolor: COLORS.background.white, 
            borderRadius: 1.5, 
            border: `1px solid ${COLORS.border}`,
            boxShadow: 'none'
          }}>
            {renderSectionHeader(<ContactPhoneIcon sx={{ fontSize: '1rem' }} />, 'Contact Information')}
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderInfoItem(<Person sx={{ fontSize: '1rem' }} />, 'Contact Person', contract.ContactPerson)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderInfoItem(<Phone sx={{ fontSize: '1rem' }} />, 'Contact Phone', contract.ContactPhone)}
              </Grid>
              <Grid size={{ xs: 12 }}>
                {renderInfoItem(<Email sx={{ fontSize: '1rem' }} />, 'Contact Email', contract.ContactEmail)}
              </Grid>
            </Grid>
          </Paper>

          {/* Address Section */}
          {(contract.Address || contract.Notes) && (
            <Paper sx={{ 
              p: 2, 
              bgcolor: COLORS.background.white, 
              borderRadius: 1.5, 
              border: `1px solid ${COLORS.border}`,
              boxShadow: 'none'
            }}>
              {contract.Address && (
                <>
                  {renderSectionHeader(<LocationOn sx={{ fontSize: '1rem' }} />, 'Address')}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      {renderInfoItem(<Home sx={{ fontSize: '1rem' }} />, 'Complete Address', contract.Address)}
                    </Grid>
                  </Grid>
                </>
              )}

              {contract.Notes && (
                <>
                  {contract.Address && <Box sx={{ mb: 2 }} />}
                  {renderSectionHeader(<NotesIcon sx={{ fontSize: '1rem' }} />, 'Additional Notes')}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      {renderInfoItem(<NotesIcon sx={{ fontSize: '1rem' }} />, 'Notes', contract.Notes)}
                    </Grid>
                  </Grid>
                </>
              )}
            </Paper>
          )}

          {/* System Info */}
          <Paper sx={{ 
            p: 2, 
            bgcolor: COLORS.background.white, 
            borderRadius: 1.5, 
            border: `1px solid ${COLORS.border}`,
            boxShadow: 'none'
          }}>
            <Grid container spacing={2} alignItems="center">
              {contract.CreatedAt && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ fontSize: '0.9rem', color: COLORS.text.tertiary }} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                      Created: {formatDate(contract.CreatedAt)}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {contract.UpdatedAt && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ fontSize: '0.9rem', color: COLORS.text.tertiary }} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                      Updated: {formatDate(contract.UpdatedAt)}
                    </Typography>
                  </Box>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Tooltip title="Internal ID">
                  <Chip
                    label={`Internal ID: ${contract._id}`}
                    size="small"
                    icon={<InfoIcon sx={{ fontSize: '0.7rem' }} />}
                    sx={{ 
                      fontSize: '0.6rem',
                      fontWeight: 500,
                      height: 24,
                      bgcolor: COLORS.background.light,
                      color: COLORS.text.tertiary,
                      border: `1px solid ${COLORS.border}`,
                      '& .MuiChip-label': {
                        px: 1
                      },
                      '& .MuiChip-icon': {
                        ml: 0.5,
                        fontSize: '0.7rem'
                      }
                    }}
                  />
                </Tooltip>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{
        px: 2.5,
        py: 1.5,
        borderTop: `1px solid ${COLORS.border}`,
        bgcolor: COLORS.background.white,
        justifyContent: 'flex-end',
        gap: 1
      }}>
        <Button
          onClick={onClose}
          size="small"
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
          Close
        </Button>

        <Button
          variant="contained"
          onClick={() => onEdit(contract)}
          size="small"
          startIcon={<EditIcon sx={{ fontSize: '1rem' }} />}
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
          Edit Agency
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewContract;