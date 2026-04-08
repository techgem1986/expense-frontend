import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Wallet } from 'lucide-react';
import { Card, Button, Badge, Table, Modal, Input, Select, Pagination } from '../ui';
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
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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
      const response = await accountAPI.getAll(page, 20, 'createdAt,desc');
      if (response.data.success) {
        setAccounts(response.data.data.content || []);
        setTotalPages(response.data.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [page]);

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

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: unknown } },
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'openingBalance' ? parseFloat(value as string) || 0 : value,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (selectedAccount) {
        await accountAPI.update(selectedAccount.id, formData);
        setSnackbar({ open: true, message: 'Account updated successfully', type: 'success' });
      } else {
        await accountAPI.create(formData);
        setSnackbar({ open: true, message: 'Account created successfully', type: 'success' });
      }
      handleCloseDialog();
      fetchAccounts();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error saving account',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (account: Account) => {
    setSelectedAccount(account);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAccount) return;
    setDeleting(true);
    try {
      await accountAPI.delete(selectedAccount.id);
      setSnackbar({ open: true, message: 'Account deleted successfully', type: 'success' });
      setOpenDeleteDialog(false);
      setSelectedAccount(null);
      fetchAccounts();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error deleting account',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return formatAmount(amount);
  };

  const getTotalBalance = () => {
    // Only include active accounts in the total balance calculation
    return accounts
      .filter((account) => account.isActive)
      .reduce((sum, account) => sum + account.currentBalance, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Total Balance ({selectedCurrency.code}):{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(getTotalBalance())}
            </span>
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} leftIcon={<Plus className="w-4 h-4" />}>
          Add Account
        </Button>
      </div>

      {snackbar.open && (
        <div
          className={`px-4 py-3 rounded-lg ${
            snackbar.type === 'success'
              ? 'bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-400 border border-success-200 dark:border-success-800'
              : 'bg-danger-50 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400 border border-danger-200 dark:border-danger-800'
          }`}
        >
          {snackbar.message}
        </div>
      )}

      {accounts.length === 0 ? (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No accounts yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
              Add your first account to start tracking your finances
            </p>
            <Button onClick={() => handleOpenDialog()} leftIcon={<Plus className="w-4 h-4" />}>
              Add Account
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {accounts.filter((a) => a.isActive).length}
              </p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(getTotalBalance())}
              </p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Types</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {new Set(accounts.map((a) => a.accountType)).size}
              </p>
            </Card>
          </div>

          {/* Accounts Table */}
          <Table.Container>
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.HeadCell>Account Name</Table.HeadCell>
                  <Table.HeadCell>Type</Table.HeadCell>
                  <Table.HeadCell>Bank</Table.HeadCell>
                  <Table.HeadCell>Account Number</Table.HeadCell>
                  <Table.HeadCell align="right">Opening Balance</Table.HeadCell>
                  <Table.HeadCell align="right">Current Balance</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell align="right">Actions</Table.HeadCell>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {accounts.map((account) => (
                  <Table.Row key={account.id}>
                    <Table.BodyCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                        {account.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {account.description}
                          </p>
                        )}
                      </div>
                    </Table.BodyCell>
                    <Table.BodyCell>
                      <Badge variant="primary">
                        {AccountTypeDisplayNames[account.accountType]}
                      </Badge>
                    </Table.BodyCell>
                    <Table.BodyCell className="text-gray-500 dark:text-gray-400">
                      {account.bankName || '-'}
                    </Table.BodyCell>
                    <Table.BodyCell className="text-gray-500 dark:text-gray-400">
                      {account.accountNumber || '-'}
                    </Table.BodyCell>
                    <Table.BodyCell align="right" className="text-gray-500 dark:text-gray-400">
                      {formatCurrency(account.openingBalance)}
                    </Table.BodyCell>
                    <Table.BodyCell
                      align="right"
                      className="font-bold text-gray-900 dark:text-white"
                    >
                      {formatCurrency(account.currentBalance)}
                    </Table.BodyCell>
                    <Table.BodyCell>
                      <Badge variant={account.isActive ? 'success' : 'neutral'}>
                        {account.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Table.BodyCell>
                    <Table.BodyCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenDialog(account)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors duration-150"
                          aria-label="Edit account"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(account)}
                          className="p-2 text-gray-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-lg transition-colors duration-150"
                          aria-label="Delete account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Table.BodyCell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
           </Table.Container>

           {/* Pagination */}
           <Pagination
             currentPage={page}
             totalPages={totalPages}
             onPageChange={setPage}
           />
         </>
       )}

      {/* Add/Edit Account Modal */}
      <Modal
        isOpen={openDialog}
        onClose={() => !submitting && handleCloseDialog()}
        title={selectedAccount ? 'Edit Account' : 'Add New Account'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Account Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Main Checking"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Account Type"
              name="accountType"
              value={formData.accountType}
              onChange={handleInputChange}
              options={Object.entries(AccountTypeDisplayNames).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <Input
              label="Opening Balance"
              name="openingBalance"
              type="number"
              value={formData.openingBalance}
              onChange={handleInputChange}
              placeholder="0.00"
            />
          </div>

          <Input
            label="Bank Name"
            name="bankName"
            value={formData.bankName}
            onChange={handleInputChange}
            placeholder="e.g., Chase Bank"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Account Number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              placeholder="****1234"
            />
            <Input
              label="IFSC Code"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleInputChange}
              placeholder="CHAS0001234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              placeholder="Optional notes about this account"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name || submitting}>
              {submitting ? 'Saving...' : (selectedAccount ? 'Update' : 'Create')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={openDeleteDialog}
        onClose={() => !deleting && setOpenDeleteDialog(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete the account "{selectedAccount?.name}"? This will mark
            the account as inactive.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpenDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} loading={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountList;
