import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Snackbar,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { Account, AccountRequest, AccountTypeDisplayNames } from '../../types/account';
import { accountAPI } from '../../services/api';
import { useCurrency } from '../../contexts/CurrencyContext';

interface AccountFormData extends AccountRequest {
  id?: number;
}

const AccountList: React.FC = () => {
  const { formatAmount, selectedCurrency } = useCurrency();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    accountType: 'SAVINGS',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    openingBalance: 0,
    description: '',
  });

  const fetchAccounts = async () => {
    try {
      const response = await accountAPI.getAll();
      if (response.data.success) {
        setAccounts(response.data.data.content || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleOpenDialog = (account?: Account) => {
    if (account) {
      setSelectedAccount(account);
      setFormData({
        id: account.id,
        name: account.name,
        accountType: account.accountType,
        bankName: account.bankName || '',
        accountNumber: account.accountNumber || '',
        ifscCode: account.ifscCode || '',
        openingBalance: account.openingBalance,
        description: account.description || '',
      });
    } else {
      setSelectedAccount(null);
      setFormData({
        name: '',
        accountType: 'SAVINGS',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        openingBalance: 0,
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAccount(null);
    setFormData({
      name: '',
      accountType: 'SAVINGS',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      openingBalance: 0,
      description: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: unknown } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'openingBalance' ? parseFloat(value as string) || 0 : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedAccount) {
        await accountAPI.update(selectedAccount.id, formData);
        setSnackbar({ open: true, message: 'Account updated successfully', severity: 'success' });
      } else {
        await accountAPI.create(formData);
        setSnackbar({ open: true, message: 'Account created successfully', severity: 'success' });
      }
      handleCloseDialog();
      fetchAccounts();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving account', severity: 'error' });
    }
  };

  const handleDeleteClick = (account: Account) => {
    setSelectedAccount(account);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAccount) return;
    try {
      await accountAPI.delete(selectedAccount.id);
      setSnackbar({ open: true, message: 'Account deleted successfully', severity: 'success' });
      setOpenDeleteDialog(false);
      setSelectedAccount(null);
      fetchAccounts();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error deleting account', severity: 'error' });
    }
  };

  const formatCurrency = (amount: number) => {
    return formatAmount(amount);
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  };

  if (loading) {
    return <Typography>Loading accounts...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Accounts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Total Balance ({selectedCurrency.code}): {formatCurrency(getTotalBalance())}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Account
        </Button>
      </Box>

      {accounts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <AccountBalanceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No accounts yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add your first account to start tracking your finances
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {/* Summary Cards */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Accounts
                </Typography>
                <Typography variant="h4">
                  {accounts.filter(a => a.isActive).length}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Balance
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(getTotalBalance())}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Account Types
                </Typography>
                <Typography variant="h4">
                  {new Set(accounts.map(a => a.accountType)).size}
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          {/* Accounts Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Account Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Bank</TableCell>
                  <TableCell>Account Number</TableCell>
                  <TableCell align="right">Opening Balance</TableCell>
                  <TableCell align="right">Current Balance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {account.name}
                      </Typography>
                      {account.description && (
                        <Typography variant="caption" color="text.secondary">
                          {account.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={AccountTypeDisplayNames[account.accountType]}
                        size="small"
                        color={account.accountType === 'CASH' ? 'default' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>{account.bankName || '-'}</TableCell>
                    <TableCell>{account.accountNumber || '-'}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(account.openingBalance)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(account.currentBalance)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={account.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={account.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(account)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(account)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAccount ? 'Edit Account' : 'Add New Account'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Account Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth required sx={{ flex: 1 }}>
                <InputLabel>Account Type</InputLabel>
                <Select
                  name="accountType"
                  value={formData.accountType}
                  label="Account Type"
                  onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: unknown } })}
                >
                  {Object.entries(AccountTypeDisplayNames).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Opening Balance"
                name="openingBalance"
                type="number"
                value={formData.openingBalance}
                onChange={handleInputChange}
                sx={{ flex: 1 }}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Stack>
            <TextField
              fullWidth
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Account Number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                sx={{ flex: 1 }}
              />
              <TextField
                fullWidth
                label="IFSC Code"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleInputChange}
                sx={{ flex: 1 }}
              />
            </Stack>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.name}>
            {selectedAccount ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the account "{selectedAccount?.name}"?
            This will mark the account as inactive.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountList;