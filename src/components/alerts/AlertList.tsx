import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Badge,
  Table,
  Modal,
  Pagination,
} from '../ui';
import { AlertResponse } from '../../types';
import { alertAPI } from '../../services/api';
import { getErrorMessage } from '../../services/errorUtils';
import { Bell, Check, Trash2 } from 'lucide-react';

const AlertList: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState<number | null>(null);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await alertAPI.getAll(page);
      if (response.data && response.data.data) {
        setAlerts(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      }
      setError(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch alerts'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleMarkAsRead = async (alertId: number) => {
    setMarkingAsRead(alertId);
    try {
      await alertAPI.markAsRead(alertId);
      setAlerts(
        alerts.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)),
      );
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to mark as read'));
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllAsRead(true);
    try {
      await alertAPI.markAllAsRead();
      setAlerts(alerts.map((a) => ({ ...a, isRead: true })));
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to mark all as read'));
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setAlertToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteAlert = async () => {
    if (alertToDelete === null) return;
    setDeleting(true);
    try {
      await alertAPI.delete(alertToDelete);
      setAlerts(alerts.filter((a) => a.id !== alertToDelete));
      setOpenDeleteDialog(false);
      setAlertToDelete(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to delete alert'));
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  if (loading && alerts.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Alerts
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your notifications and alerts
          </p>
        </div>
        {alerts.some((a) => !a.isRead) && (
          <Button
            onClick={handleMarkAllAsRead}
            leftIcon={<Check className="w-4 h-4" />}
            disabled={markingAllAsRead}
          >
            {markingAllAsRead ? 'Marking...' : 'Mark All as Read'}
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 text-danger-600 dark:text-danger-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Alerts Table */}
      <Table.Container>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeadCell>Type</Table.HeadCell>
              <Table.HeadCell>Message</Table.HeadCell>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell align="center">Actions</Table.HeadCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {alerts.length === 0 ? (
              <Table.Row hoverable={false}>
                <Table.BodyCell colSpan={5}>
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No alerts found</p>
                    <p className="text-sm mt-1">You're all caught up!</p>
                  </div>
                </Table.BodyCell>
              </Table.Row>
            ) : (
              alerts.map((alert) => (
                <Table.Row
                  key={alert.id}
                  className={!alert.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}
                >
                  <Table.BodyCell>
                    <Badge variant={
                      alert.type.includes('Error') ? 'danger' :
                      alert.type.includes('Warning') ? 'warning' :
                      alert.type.includes('Success') ? 'success' : 'primary'
                    }>
                      {alert.type}
                    </Badge>
                  </Table.BodyCell>
                  <Table.BodyCell className="font-medium">
                    {alert.message}
                  </Table.BodyCell>
                  <Table.BodyCell className="text-gray-500 dark:text-gray-400 text-sm">
                    {formatDate(alert.createdAt)}
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Badge variant={alert.isRead ? 'neutral' : 'primary'}>
                      {alert.isRead ? 'Read' : 'Unread'}
                    </Badge>
                  </Table.BodyCell>
                  <Table.BodyCell align="center">
                    <div className="flex items-center justify-center gap-1">
                      {!alert.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          disabled={markingAsRead === alert.id}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors duration-150 disabled:opacity-50"
                          aria-label="Mark as read"
                        >
                          {markingAsRead === alert.id ? (
                            <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(alert.id)}
                        className="p-2 text-gray-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-lg transition-colors duration-150"
                        aria-label="Delete alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Table.BodyCell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </Table.Container>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={openDeleteDialog}
        onClose={() => !deleting && setOpenDeleteDialog(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this alert? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpenDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeleteAlert} loading={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AlertList;